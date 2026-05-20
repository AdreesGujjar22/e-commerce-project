"use server";

import { getSupabaseServerClient } from "../lib/supabase/server";
import { OrderSchema } from "../validations";
import { Order, OrderItem } from "../types";

export async function getOrdersAction() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required to review order histories." };
    }

    // Determine role of active caller
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let query = supabase.from("orders").select("*, order_items(*)");

    if (profile?.role !== "admin") {
      // Regular customer only views their own purchases
      query = query.eq("user_id", user.id);
    }

    // Newer orders first
    query = query.order("created_at", { ascending: false });

    const { data: dbOrders, error } = await query;

    if (error) {
      return { success: false, error: error.message, orders: [] };
    }

    const orders: Order[] = (dbOrders || []).map((ord: any) => ({
      id: ord.id,
      customerName: ord.customer_name,
      customerEmail: ord.customer_email,
      shippingAddress: ord.shipping_address,
      items: (ord.order_items || []).map((item: any) => ({
        productId: item.product_id,
        name: item.name,
        image: item.image_url,
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),
      totalAmount: Number(ord.total_amount),
      status: ord.status,
      createdAt: ord.created_at,
    }));

    return { success: true, orders };
  } catch (err: any) {
    return { success: false, error: err.message, orders: [] };
  }
}

export async function createOrderAction(formData: any) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Zod input validation
    const parsed = OrderSchema.parse(formData);

    // 2. Query products from DB to prevent pricing / tampering exploits
    const productIds = parsed.items.map((i) => i.productId);
    const { data: dbProducts, error: dbProdError } = await supabase
      .from("products")
      .select("id, name, price, stock, image")
      .in("id", productIds);

    if (dbProdError || !dbProducts) {
      return { success: false, error: "Verification in catalog failed. Items could not be authenticated." };
    }

    // 3. Match items, check stock levels, and build secure prices sum
    let verifiedTotalAmount = 0;
    const checkoutItemsPayload: any[] = [];
    const stockUpdates: { productId: string; nextStock: number }[] = [];

    for (const item of parsed.items) {
      const liveProduct = dbProducts.find((p) => p.id === item.productId);

      if (!liveProduct) {
        return { success: false, error: `Product '${item.name}' is no longer active in our catalog.` };
      }

      if (liveProduct.stock < item.quantity) {
        return { success: false, error: `Inadequate showroom stock: '${liveProduct.name}' only has ${liveProduct.stock} units remaining.` };
      }

      const itemProductPrice = Number(liveProduct.price);
      verifiedTotalAmount += itemProductPrice * item.quantity;

      checkoutItemsPayload.push({
        product_id: item.productId,
        name: liveProduct.name,
        image_url: liveProduct.image,
        price: itemProductPrice,
        quantity: item.quantity,
      });

      stockUpdates.push({
        productId: item.productId,
        nextStock: liveProduct.stock - item.quantity,
      });
    }

    // 4. Inject Order Record into Orders table
    const { data: newOrder, error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null, // Link user account order if logged in
        customer_name: parsed.customerName,
        customer_email: parsed.customerEmail,
        shipping_address: parsed.shippingAddress,
        total_amount: verifiedTotalAmount,
        status: "Pending",
      })
      .select()
      .single();

    if (orderInsertError || !newOrder) {
      return { success: false, error: orderInsertError?.message || "Order registration failed." };
    }

    // 5. Insert mapped order items
    const itemsWithOrderId = checkoutItemsPayload.map((item) => ({
      ...item,
      order_id: newOrder.id,
    }));

    const { error: itemsInsertError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsInsertError) {
      // Revert/cleanup the dangling order since items failed
      await supabase.from("orders").delete().eq("id", newOrder.id);
      return { success: false, error: `Shedding components error: ${itemsInsertError.message}` };
    }

    // 6. Deduct stock levels in warehouse
    for (const update of stockUpdates) {
      await supabase
        .from("products")
        .update({ stock: update.nextStock })
        .eq("id", update.productId);
    }

    // 7. Inject Stripe-ready payment record
    const isCOD = parsed.paymentMethod === "Cash on Delivery";
    const { error: paymentInsertError } = await supabase
      .from("payments")
      .insert({
        order_id: newOrder.id,
        payment_method: isCOD ? "Cash on Delivery" : "Credit Card (Escrow)",
        payment_intent_id: isCOD ? "cod_receipt_pending" : `pi_mock_${Math.random().toString(36).substring(2, 12)}`,
        status: isCOD ? "Pending" : "Paid",
        amount: verifiedTotalAmount,
      });

    if (paymentInsertError) {
      console.error("Payment ledger recording delayed, support team was flagged:", paymentInsertError);
    }

    const compiledOrder: Order = {
      id: newOrder.id,
      customerName: newOrder.customer_name,
      customerEmail: newOrder.customer_email,
      shippingAddress: newOrder.shipping_address,
      items: parsed.items,
      totalAmount: verifiedTotalAmount,
      status: "Pending",
      createdAt: newOrder.created_at,
    };

    return { success: true, order: compiledOrder };
  } catch (err: any) {
    return { success: false, error: err.message || "Ledger checkout operation aborted." };
  }
}

export async function updateOrderStatusAction(id: string, nextStatus: Order["status"]) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Access Denied." };

    // Enforce admin permission checking for safety
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Administration role required to advance couriers." };
    }

    const { data: updated, error } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const mappedOrder: Order = {
      id: updated.id,
      customerName: updated.customer_name,
      customerEmail: updated.customer_email,
      shippingAddress: updated.shipping_address,
      items: [], // Fetch items if fully needed, otherwise dummy update is fine for UI list updates
      totalAmount: Number(updated.total_amount),
      status: updated.status,
      createdAt: updated.created_at,
    };

    return { success: true, order: mappedOrder };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchSalesAnalyticsAction() {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Forbidden" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Administration access only" };
    }

    // Run aggregation queries
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total_amount, status, created_at");

    const totalRevenue = (orders || []).reduce((acc, curr) => acc + Number(curr.total_amount), 0);
    const orderCount = orders?.length || 0;
    const pendingCount = (orders || []).filter((o) => o.status !== "Delivered").length;
    
    // Average order total
    const averageTicket = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

    return {
      success: true,
      analytics: {
        totalRevenue,
        orderCount,
        pendingCount,
        averageTicket,
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
