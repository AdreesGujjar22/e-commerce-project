import { Product, Order, ChatMessage } from "../types";
import {
  getProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "../actions/product.actions";
import {
  getOrdersAction,
  createOrderAction,
  updateOrderStatusAction,
} from "../actions/order.actions";

export const apiService = {
  // Products
  async getProducts(): Promise<Product[]> {
    const res = await getProductsAction();
    if (!res.success) throw new Error(res.error || "Failed to fetch products");
    return res.products || [];
  },

  async createProduct(productData: any): Promise<Product> {
    const res = await createProductAction(productData);
    if (!res.success || !res.product) {
      throw new Error(res.error || "Failed to create product");
    }
    return res.product;
  },

  async updateProduct(id: string, productData: any): Promise<Product> {
    const res = await updateProductAction(id, productData);
    if (!res.success || !res.product) {
      throw new Error(res.error || "Failed to update product");
    }
    return res.product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const res = await deleteProductAction(id);
    if (!res.success) throw new Error(res.error || "Failed to delete product");
    return true;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await getOrdersAction();
    if (!res.success) throw new Error(res.error || "Failed to fetch orders");
    return res.orders || [];
  },

  async createOrder(orderPayload: any): Promise<Order> {
    const res = await createOrderAction(orderPayload);
    if (!res.success || !res.order) {
      throw new Error(res.error || "Failed to place order");
    }
    return res.order;
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order> {
    const res = await updateOrderStatusAction(id, status);
    if (!res.success || !res.order) {
      throw new Error(res.error || "Failed to update order status");
    }
    return res.order;
  },

  // Aura Concierge Chat Integration
  async sendMessageToConcierge(messages: ChatMessage[]): Promise<string> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error("Chat assistant communication error");
    const data = await res.json();
    return data.content;
  },
};
