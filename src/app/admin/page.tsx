"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { Product, Order } from "../../types";
import { useStore } from "../../store";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import {
  getUsersListAction,
  getAllReviewsAction,
  adminDeleteReviewAction,
  getCouponsAction,
  createCouponAction,
  toggleCouponActiveAction,
} from "../../actions/admin.actions";
import {
  getProductsAction,
} from "../../actions/product.actions";
import {
  fetchSalesAnalyticsAction,
} from "../../actions/order.actions";
import {
  Settings2,
  TrendingUp,
  ShoppingBag,
  Clock,
  PlusCircle,
  Trash2,
  RefreshCw,
  PackageOpen,
  ClipboardList,
  BarChart3,
  Users,
  MessageSquare,
  Ticket,
  CheckCircle,
  Truck,
  Eye,
  X,
  Plus,
  Loader,
  AlertTriangle,
  Flame,
  Check,
  ShieldAlert
} from "lucide-react";

export default function AdminPage() {
  const { triggerNotification } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    totalRevenue: 0,
    orderCount: 0,
    pendingCount: 0,
    averageTicket: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "customers" | "reviews" | "coupons" | "analytics">("orders");

  // Product Creation States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesigner, setNewDesigner] = useState("");
  const [newCategory, setNewCategory] = useState<any>("apparel");
  const [newPrice, setNewPrice] = useState<number>(350);
  const [newImage, setNewImage] = useState("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80");
  const [newStock, setNewStock] = useState<number>(10);
  const [newDesc, setNewDesc] = useState("");
  const [newLongDesc, setNewLongDesc] = useState("");
  const [newDetails, setNewDetails] = useState("");

  // Coupon Creation States
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(15);

  const loadData = async () => {
    setIsLoading(true);
    try {
      getProductsAction().then((res) => {
        if (res.success) setProducts(res.products || []);
      });

      apiService.getOrders().then((ordList) => {
        setOrders(ordList);
      });

      getUsersListAction().then((res) => {
        if (res.success) setCustomers(res.profiles || []);
      });

      getAllReviewsAction().then((res) => {
        if (res.success) setReviews(res.reviews || []);
      });

      getCouponsAction().then((res) => {
        if (res.success) setCoupons(res.coupons || []);
      });

      fetchSalesAnalyticsAction().then((res) => {
        if (res.success && res.analytics) {
          setAnalytics(res.analytics);
        }
      });
    } catch (err) {
      console.error(err);
      triggerNotification("Error reading administrative databanks.");
    } finally {
      // Small timeout for visual grace
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleUpdateOrderStatus = async (id: string, currentStatus: Order["status"]) => {
    const statuses: Order["status"][] = ["Pending", "Processing", "Shipped", "Delivered"];
    const curIdx = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(curIdx + 1) % statuses.length];

    try {
      const updated = await apiService.updateOrderStatus(id, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o)));
      triggerNotification(`Order #${id.slice(-5)} advanced to status ${nextStatus}.`);
      loadData(); // Sync aggregates
    } catch (error) {
      console.error(error);
      triggerNotification("Status reconciliation unsuccessful.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you certain you wish to archive this creative curation?")) return;

    try {
      const success = await apiService.deleteProduct(id);
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        triggerNotification("Artifact archived successfully.");
      }
    } catch (error) {
      console.error(error);
      triggerNotification("Archival pipeline failed.");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDesigner) return;

    setIsLoading(true);

    try {
      const payload = {
        name: newName,
        designer: newDesigner,
        category: newCategory,
        price: Number(newPrice),
        image: newImage,
        description: newDesc || "Bespoke high-end craft curation.",
        longDescription: newLongDesc || newDesc,
        details: newDetails
          ? newDetails.split(",").map((t) => t.trim())
          : ["Custom limited luxury edition", "Includes certificate of authenticity"],
        stock: Number(newStock),
        featured: true,
      };

      const freshProduct = await apiService.createProduct(payload);
      setProducts((prev) => [freshProduct, ...prev]);
      setIsAddModalOpen(false);

      // Reset
      setNewName("");
      setNewDesigner("");
      setNewDesc("");
      setNewLongDesc("");
      setNewDetails("");

      triggerNotification(`Artifact ${freshProduct.name} cataloged successfully.`);
      loadData();
    } catch (error: any) {
      console.error(error);
      triggerNotification(error.message || "Error submitting artifact metadata.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    try {
      const res = await createCouponAction(newCouponCode, newCouponDiscount);
      if (res.success && res.coupon) {
        setCoupons((prev) => [res.coupon, ...prev]);
        setNewCouponCode("");
        triggerNotification(`Coupon ${res.coupon.code} active now.`);
      } else {
        triggerNotification(res.error || "Cannot generate coupon.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCoupon = async (id: string, currentStatus: boolean) => {
    try {
      const res = await toggleCouponActiveAction(id, !currentStatus);
      if (res.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: !currentStatus } : c))
        );
        triggerNotification("Coupon availability status modified.");
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to moderate/delete this review?")) return;

    try {
      const res = await adminDeleteReviewAction(id);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        triggerNotification("Patron review moderate deleted.");
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      
      {/* 1. Header Portion with Refresh button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gold-200 pb-8 mb-10 gap-4 text-left">
        <div>
          <span className="font-display text-[8px] uppercase tracking-[0.3em] text-[#666] font-extrabold block mb-1">
            restricted access console
          </span>
          <h1 className="font-display text-2.5xl md:text-4.5xl uppercase tracking-tight text-neutral-950 font-black flex items-center">
            <Settings2 className="h-7 w-7 text-gold-500 mr-3" />
            ATELIER ADMIN <span className="font-serif italic text-gold-600 font-light ml-2">Center</span>
          </h1>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center px-4.5 py-2.5 rounded-full border border-gold-200 bg-white hover:border-gold-300 font-display text-[9px] uppercase tracking-wider text-neutral-700 transition-all focus:outline-none"
        >
          <RefreshCw className="h-3 w-3 mr-2 text-gold-500" />
          <span>refresh databanks</span>
        </button>
      </div>

      {/* 2. Brand Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6.5 mb-12">
        <div className="bg-white border border-gold-150 rounded-2xl p-6 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-display text-[9px] uppercase tracking-widest text-[#666] font-bold">TOTAL REGISTERED REVENUE</span>
            <TrendingUp className="h-4.5 w-4.5 text-gold-500" />
          </div>
          <p className="font-serif italic text-2xl font-black text-neutral-950 mt-4">${analytics.totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-teal-600 font-sans mt-0.5 block">Vouchsafed vaults total</span>
        </div>

        <div className="bg-white border border-gold-150 rounded-2xl p-6 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-display text-[9px] uppercase tracking-widest text-[#666] font-bold">ACTIVE ORDER COURIERS</span>
            <ClipboardList className="h-4.5 w-4.5 text-gold-500" />
          </div>
          <p className="font-serif italic text-2xl font-black text-neutral-950 mt-4">{analytics.orderCount}</p>
          <span className="text-[10px] text-neutral-400 font-sans mt-0.5 block">Historical receipts</span>
        </div>

        <div className="bg-white border border-gold-150 rounded-2xl p-6 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-display text-[9px] uppercase tracking-widest text-[#666] font-bold">Fulfillment Pipeline</span>
            <Clock className="h-4.5 w-4.5 text-gold-500" />
          </div>
          <p className="font-serif italic text-2xl font-black text-neutral-950 mt-4">{analytics.pendingCount}</p>
          <span className="text-[10px] text-red-500 font-display uppercase tracking-widest font-black mt-0.5 block">needs dispatch</span>
        </div>

        <div className="bg-white border border-gold-150 rounded-2xl p-6 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-display text-[9px] uppercase tracking-widest text-[#666] font-bold">AVERAGE CART TICKETS</span>
            <ShoppingBag className="h-4.5 w-4.5 text-gold-500" />
          </div>
          <p className="font-serif italic text-2xl font-black text-neutral-950 mt-4">${analytics.averageTicket.toLocaleString()}</p>
          <span className="text-[10px] text-teal-600 font-sans mt-0.5 block">Prestige curations density</span>
        </div>
      </div>

      {/* 3. Tab Selectors bar */}
      <div className="flex items-center space-x-1.5 border-b border-gold-150 mb-8 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("orders")}
          className={`font-display text-[9.5px] uppercase font-black tracking-widest px-5 py-3.5 border-b-2 transition-all -mb-0.5 flex items-center whitespace-nowrap ${
            activeTab === "orders" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <ClipboardList className="h-4 w-4 mr-1.5" />
          Order Fulfillment
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`font-display text-[9.5px] uppercase font-black tracking-widest px-5 py-3.5 border-b-2 transition-all -mb-0.5 flex items-center whitespace-nowrap ${
            activeTab === "products" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <PackageOpen className="h-4 w-4 mr-1.5" />
          Catalog Curations
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`font-display text-[9.5px] uppercase font-black tracking-widest px-5 py-3.5 border-b-2 transition-all -mb-0.5 flex items-center whitespace-nowrap ${
            activeTab === "customers" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <Users className="h-4 w-4 mr-1.5" />
          Customer Directory
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`font-display text-[9.5px] uppercase font-black tracking-widest px-5 py-3.5 border-b-2 transition-all -mb-0.5 flex items-center whitespace-nowrap ${
            activeTab === "reviews" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reviews Moderation
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`font-display text-[9.5px] uppercase font-black tracking-widest px-5 py-3.5 border-b-2 transition-all -mb-0.5 flex items-center whitespace-nowrap ${
            activeTab === "coupons" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <Ticket className="h-4 w-4 mr-1.5" />
          Privilege Coupons
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`font-display text-[9.5px] uppercase font-black tracking-widest px-5 py-3.5 border-b-2 transition-all -mb-0.5 flex items-center whitespace-nowrap ${
            activeTab === "analytics" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-400 hover:text-neutral-700"
          }`}
        >
          <BarChart3 className="h-4 w-4 mr-1.5" />
          Advanced Analytics
        </button>
      </div>

      {/* 4. Tab content switcher */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Loader className="h-8 w-8 text-gold-500 animate-spin mb-4" />
          <p className="font-sans text-xs text-neutral-400">Consulting secure boutique database registers...</p>
        </div>
      ) : activeTab === "orders" ? (
        
        /* 4.1 Order view panel */
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-gold-200 rounded-2xl bg-[#faf9f6]">
              <ClipboardList className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
              <p className="font-sans text-xs text-neutral-400">Our ledger lists no physical client receipts currently.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gold-150 rounded-2xl bg-white shadow-sm text-left">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#faf9f6]/95 border-b border-gold-150">
                    <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">ID</th>
                    <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">RECIPIENT & ADDRESS</th>
                    <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">PURCHASE SUMMARY</th>
                    <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">NET TOTAL</th>
                    <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">FULFILLMENT</th>
                    <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">LEDGER CONTROLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/40 transition-colors">
                      <td className="p-5 font-mono text-[10px] font-bold text-neutral-800">#{o.id.slice(-5).toUpperCase()}</td>
                      <td className="p-5 text-left">
                        <div className="block font-display text-[11px] uppercase font-bold text-neutral-900">{o.customerName}</div>
                        <span className="block text-[10px] text-neutral-400 font-sans mt-0.5">{o.customerEmail}</span>
                        <span className="block text-[10px] text-neutral-400 font-sans mt-1 truncate max-w-[180px]" title={o.shippingAddress}>
                          📍 {o.shippingAddress}
                        </span>
                      </td>
                      <td className="p-5 text-left">
                        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-2">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2.5 text-[10px] text-neutral-600">
                              <img src={item.image} className="w-6.5 h-8.5 rounded border border-gold-100 object-cover flex-shrink-0" />
                              <span className="truncate max-w-[125px] font-medium">{item.name}</span>
                              <span className="font-bold text-neutral-800">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-5 font-serif italic font-black text-neutral-900 text-sm">
                        ${o.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center text-[9px] tracking-widest font-display font-black uppercase px-2.5 py-1 rounded shadow-sm border ${
                          o.status === "Delivered" ? "bg-teal-50 text-teal-850 border-teal-200" :
                          o.status === "Shipped" ? "bg-blue-50 text-blue-800 border-blue-200" :
                          o.status === "Processing" ? "bg-purple-50 text-purple-850 border-purple-200" :
                          "bg-gold-50 text-gold-900 border-gold-200"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, o.status)}
                          className="inline-flex items-center font-display text-[9.5px] uppercase tracking-widest font-black text-neutral-900 border-b border-neutral-950 pb-0.5 hover:text-gold-650 hover:border-gold-550 transition-colors focus:outline-none"
                        >
                          advance step →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeTab === "products" ? (
        
        /* 4.2 Product view panel */
        <div className="space-y-6">
          <div className="flex justify-between items-center text-left">
            <h3 className="font-display text-xs uppercase tracking-widest text-[#151515] font-black">
              MASTER CATALOG PRESTIGE ELEMENTS ({products.length})
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center bg-neutral-950 hover:bg-neutral-800 text-gold-300 font-display text-[9px] uppercase font-bold tracking-widest px-5 py-3 rounded-full shadow-sm transition-all focus:outline-none active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 text-gold-400" />
              <span>curate new artifact</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-gold-150 rounded-2xl bg-white shadow-sm text-left">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#faf9f6]/95 border-b border-gold-150">
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">IMAGE & DESIGNER</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">PRODUCT IDENTITY</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">CATEGORY</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">PRICE</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">SHOWROOM STOCK</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="p-5 flex items-center space-x-4">
                      <img src={p.image} className="w-11 h-14 object-cover border border-gold-100 rounded-lg flex-shrink-0" />
                      <div className="text-left font-sans">
                        <span className="block font-display text-[9px] uppercase tracking-widest text-gold-600 font-bold">{p.designer}</span>
                        <span className="block text-[10px] font-mono text-neutral-400 mt-0.5">ID: {p.id.slice(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="p-5 text-left font-display text-[11px] uppercase font-bold text-neutral-950 max-w-[200px] truncate" title={p.name}>
                      {p.name}
                    </td>
                    <td className="p-5 uppercase">
                      <Badge variant="gold">{p.category}</Badge>
                    </td>
                    <td className="p-5 font-serif italic font-black text-neutral-900 text-sm">
                      ${p.price.toLocaleString()}
                    </td>
                    <td className="p-5">
                      <span className={`font-mono text-xs font-bold ${p.stock <= 3 ? "text-red-650" : "text-neutral-700"}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-neutral-400 hover:text-red-650 transition-colors p-1"
                        title="Archive product curation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "customers" ? (
        
        /* 4.3 Customer Directory panel */
        <div className="space-y-6">
          <h3 className="font-display text-xs uppercase tracking-widest text-[#151515] font-black">
            REGISTERED PATRONS DIRECTORY ({customers.length})
          </h3>

          <div className="overflow-x-auto border border-gold-150 rounded-2xl bg-white shadow-sm text-left">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#faf9f6]/95 border-b border-gold-150">
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">UUID ID</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">FULL NOBLE NAME</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">ATELIER TIER / ROLE</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">REGISTERED TIMESTAMP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="p-5 font-mono text-[10px] text-neutral-400">{c.id}</td>
                    <td className="p-5 font-display text-[11px] uppercase font-bold text-neutral-950">
                      {c.full_name || "Maison Guest Patron"}
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center text-[9px] tracking-widest font-display font-black uppercase px-2 py-0.5 rounded ${
                        c.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-neutral-100 text-neutral-700"
                      }`}>
                        {c.role || "customer"}
                      </span>
                    </td>
                    <td className="p-5 font-sans text-xs text-neutral-500">
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "reviews" ? (
        
        /* 4.4 Reviews moderation panel */
        <div className="space-y-6">
          <h3 className="font-display text-xs uppercase tracking-widest text-[#151515] font-black">
            CLIENT FEEDBACK MODERATION PIPELINE ({reviews.length})
          </h3>

          <div className="overflow-x-auto border border-gold-150 rounded-2xl bg-white shadow-sm text-left">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#faf9f6]/95 border-b border-gold-150">
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">ARTIFACT</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">PATRON DIALECTIC</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">STARS RATING</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">FEEDBACK TRANSCRIPT</th>
                  <th className="font-display text-[9px] uppercase tracking-widest text-[#555] p-5 font-black">MODERATION ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="p-5 font-display text-[10.5px] uppercase font-medium text-neutral-900 max-w-[160px] truncate">
                      {r.products?.name || "Unknown Artifact"}
                    </td>
                    <td className="p-5">
                      <span className="block font-display text-[10.5px] uppercase font-bold text-neutral-950">{r.author_name}</span>
                      <span className="block text-[9.5px] font-sans text-neutral-400 mt-0.5">ID: {r.user_id?.slice(0, 8) || "Guest"}</span>
                    </td>
                    <td className="p-5 font-serif italic text-gold-600 font-bold">
                      {r.rating} / 5 stars
                    </td>
                    <td className="p-5 font-sans text-[11px] text-neutral-500 max-w-xs leading-normal">
                      "{r.text}"
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="text-red-500 hover:text-red-750 transition-colors p-1.5 rounded-full hover:bg-red-50 focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "coupons" ? (
        
        /* 4.5 Privilege Coupons admin view */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Coupon creation form */}
          <form onSubmit={handleCreateCoupon} className="lg:col-span-4 bg-white border border-gold-150 p-6 rounded-2xl shadow-sm text-left space-y-4">
            <h4 className="font-display text-[10px] uppercase tracking-widest text-neutral-900 font-black border-b border-gold-100 pb-2 mb-4">
              PROVISION NEW VOUCHER
            </h4>
            
            <Input
              label="Promotional Code"
              placeholder="e.g. STEWARD15"
              required
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
            />

            <div>
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Discount Percentage (%)
              </label>
              <select
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                className="w-full bg-white text-neutral-900 font-sans text-xs px-3.5 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-450"
              >
                <option value={10}>10% off checkout total</option>
                <option value={15}>15% off checkout total</option>
                <option value={20}>20% off checkout total</option>
                <option value={30}>30% off checkout total</option>
                <option value={50}>50% off boutique limits</option>
              </select>
            </div>

            <Button type="submit" size="sm" className="w-full h-11">
              Publish Campaign Coupon
            </Button>
          </form>

          {/* List existing active coupons */}
          <div className="lg:col-span-8 space-y-4 text-left">
            <h4 className="font-display text-[10px] uppercase tracking-widest text-[#666] font-extrabold mb-4">
              ACTIVE LEDGER VOUCHERS LISTING ({coupons.length})
            </h4>

            <div className="border border-gold-150 rounded-2xl bg-white overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#faf9f6] border-b border-gold-150">
                    <th className="font-display text-[9px] uppercase tracking-widest text-neutral-600 p-4 font-black">CODE</th>
                    <th className="font-display text-[9px] uppercase tracking-widest text-neutral-600 p-4 font-black">DISCOUNT VALUE</th>
                    <th className="font-display text-[9px] uppercase tracking-widest text-neutral-600 p-4 font-black font-black">AVAILABILITY</th>
                    <th className="font-display text-[9px] uppercase tracking-widest text-neutral-600 p-4 font-black font-black">CONTROLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-100">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50/30 font-sans text-xs">
                      <td className="p-4 uppercase font-bold text-neutral-900 tracking-wider">
                        🎟️ {c.code}
                      </td>
                      <td className="p-4 font-serif italic font-bold">
                        {c.discount_percent}% off total
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-medium ${
                          c.active ? "bg-teal-50 text-teal-850" : "bg-neutral-100 text-neutral-400"
                        }`}>
                          {c.active ? "Active & Redeemable" : "Deactivated"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(c.id, c.active)}
                          className="font-display text-[9.5px] uppercase font-black tracking-widest hover:underline text-neutral-900"
                        >
                          {c.active ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        
        /* 4.6 Analytics Aggregations panels */
        <div className="space-y-8 text-left">
          <div className="bg-[#faf9f6] border border-gold-200 rounded-2xl p-6.5 text-left shadow-sm">
            <h4 className="font-display text-xs uppercase tracking-widest text-[#151515] font-black mb-4 flex items-center">
              <TrendingUp className="h-4.5 w-4.5 mr-2 text-gold-600 font-bold" />
              FINANCIAL AGGREGATES LEDGER REPORT
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6.5">
              <div className="p-5.5 bg-white border border-gold-100 rounded-xl rounded-xl">
                <span className="font-sans text-stone-500 text-xs">Gross Revenue Ledger Volume</span>
                <p className="font-serif italic text-3.5xl font-black text-neutral-950 mt-2">${analytics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-5.5 bg-white border border-gold-100 rounded-xl">
                <span className="font-sans text-stone-500 text-xs">Patron Conversion Invoices</span>
                <p className="font-serif italic text-3.5xl font-black text-neutral-950 mt-2">{analytics.orderCount} conversions</p>
              </div>
              <div className="p-5.5 bg-white border border-gold-100 rounded-xl">
                <span className="font-sans text-stone-500 text-xs">Steward Ticket averages value</span>
                <p className="font-serif italic text-3.5xl font-black text-neutral-950 mt-2">${analytics.averageTicket.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="border border-gold-150 rounded-2xl p-6.5 bg-white shadow-sm space-y-4">
              <h5 className="font-display text-[10px] uppercase tracking-widest font-black text-neutral-900">
                L'ÉTOILE PRESTIGE VISIBILITY LOG
              </h5>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-gold-100">
                  <span className="text-neutral-500">Database Connection:</span>
                  <span className="text-teal-600 font-bold uppercase text-[9.5px]">Online (PostgreSQL)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gold-100">
                  <span className="text-neutral-500">Current SSL Configuration:</span>
                  <span className="text-neutral-900 font-bold">Enabled (AES-256)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gold-100">
                  <span className="text-neutral-500">Total Catalog SKU Density:</span>
                  <span className="text-neutral-900 font-bold">{products.length} cataloged</span>
                </div>
              </div>
            </div>

            <div className="border border-gold-150 rounded-2xl p-6.5 bg-white shadow-sm flex flex-col justify-center text-center py-8">
              <ShieldAlert className="h-10 w-10 text-gold-500 mx-auto mb-3" />
              <h5 className="font-display text-[11.5px] uppercase tracking-widest font-black text-neutral-900">
                AUDIT LOG COMPLIANCE
              </h5>
              <p className="font-sans text-[11px] text-neutral-400 max-w-xs mx-auto leading-relaxed mt-2">
                All status modifications and product curation additions are digitally signed inside public profiles records using Row-Level-Security (RLS).
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 5. Custom creation item modal popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-neutral-950/75 backdrop-blur-subtle" />
          
          <div className="relative bg-[#faf9f6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gold-200 z-10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold-150 bg-neutral-950 text-white">
              <h3 className="font-display text-[10px] uppercase tracking-widest font-black text-gold-300 flex items-center">
                <PlusCircle className="h-4.5 w-4.5 mr-2" /> CREATE BRAND NEW CURATION ARTIFACT
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex-grow overflow-y-auto p-6 md:p-8 space-y-5 text-left">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Designer / Atelier Maison"
                  placeholder="e.g. Sora Ceramicist"
                  required
                  value={newDesigner}
                  onChange={(e) => setNewDesigner(e.target.value)}
                />
                <Input
                  label="Artifact Identity Title"
                  placeholder="e.g. Autumn Ochre Pitcher"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Catalog Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-white text-neutral-900 font-sans text-xs px-3.5 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-450"
                  >
                    <option value="apparel">Apparel & Outerwear</option>
                    <option value="decor">Geologic Home Accents</option>
                    <option value="watches">Fine Timekeepers</option>
                    <option value="fragrances">Prestige Fragrances</option>
                  </select>
                </div>
                <Input
                  label="Remitted Price ($)"
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                />
                <Input
                  label="Showroom Inventory count"
                  type="number"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                />
              </div>

              <Input
                label="Tactile Display Photo URL"
                required
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
              />

              <div className="text-left">
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
                  Micro catalog description snippet
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe your design accent in one line..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-445 text-left"
                />
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
                  Full Description Paragraph
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter details about construction, feel, and heritage origins..."
                  value={newLongDesc}
                  onChange={(e) => setNewLongDesc(e.target.value)}
                  className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-445 text-left"
                />
              </div>

              <Input
                label="Craft Specifications (Comma separated)"
                placeholder="e.g. Full-grain calf leather, Brass fixtures, Made in Florence"
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
              />

              <div className="pt-4 border-t border-gold-150 flex justify-end space-x-3">
                <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel Inquire
                </Button>
                <Button variant="primary" type="submit">
                  Publish Curated Artifact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
