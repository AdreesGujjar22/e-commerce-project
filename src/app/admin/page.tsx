"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { Product, Order } from "../../types";
import { useStore } from "../../store";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ImageUpload } from "../../components/ImageUpload";
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
  updateProductAction,
} from "../../actions/product.actions";
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "../../actions/category.actions";
import {
  fetchSalesAnalyticsAction,
} from "../../actions/order.actions";
import {
  getSettingsAction,
  updateSettingsAction,
} from "../../actions/settings.actions";
import {
  getHeroSlidesAction,
  addHeroSlideAction,
  updateHeroSlideAction,
  deleteHeroSlideAction,
  HeroSlide,
} from "../../actions/hero.actions";
import {
  Settings2,
  TrendingUp,
  ShoppingBag,
  PlusCircle,
  Trash2,
  Edit,
  Layers,
  Sparkles,
  ClipboardList,
  Users,
  MessageSquare,
  Ticket,
  X,
  Plus,
  Loader2,
  AlertTriangle,
  BadgeCheck,
  Phone,
  Mail,
  Facebook,
  Instagram,
  ShieldCheck,
} from "lucide-react";

export default function AdminPage() {
  const { triggerNotification } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "categories" | "customers" | "reviews" | "coupons" | "analytics" | "settings" | "hero">("orders");

  // Hero slide states
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSlide | null>(null);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroOpacity, setHeroOpacity] = useState<number>(35);

  // Product Creation & Editing States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newDesigner, setNewDesigner] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPrice, setNewPrice] = useState<number>(350);
  const [newStock, setNewStock] = useState<number>(10);
  const [newDesc, setNewDesc] = useState("");
  const [newLongDesc, setNewLongDesc] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newSeoTitle, setNewSeoTitle] = useState("");
  const [newSeoDescription, setNewSeoDescription] = useState("");

  // Category CRUD Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  
  const [catName, setCatName] = useState("");
  const [catBanner, setCatBanner] = useState<string[]>([]);
  const [catSeoTitle, setCatSeoTitle] = useState("");
  const [catSeoDescription, setCatSeoDescription] = useState("");

  // Coupon Creation States
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(15);

  // Settings states corresponding to editable store settings
  const [fbUrl, setFbUrl] = useState("");
  const [igUrl, setIgUrl] = useState("");
  const [ttUrl, setTtUrl] = useState("");
  const [waNum, setWaNum] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [privacyText, setPrivacyText] = useState("");
  const [termsText, setTermsText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [chatbotInstruction, setChatbotInstruction] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Delete Confirmation Modal States
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [deleteTargetType, setDeleteTargetType] = useState<"product" | "review" | "coupon" | "category">("product");
  const [deleteTargetTitle, setDeleteTargetTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Load dynamic categories
      const catRes = await getCategoriesAction();
      if (catRes.success) {
        setCategories(catRes.categories || []);
        if (catRes.categories && catRes.categories.length > 0) {
          setNewCategory(catRes.categories[0].id); // Auto-assign default selection
        }
      }

      // 2. Load products
      const pRes = await getProductsAction();
      if (pRes.success) {
        setProducts(pRes.products || []);
      }

      // 3. Load orders
      const oList = await apiService.getOrders();
      setOrders(oList);

      // 4. Load customers
      const cRes = await getUsersListAction();
      if (cRes.success) setCustomers(cRes.profiles || []);

      // 5. Load reviews
      const rRes = await getAllReviewsAction();
      if (rRes.success) setReviews(rRes.reviews || []);

      // 6. Load coupons
      const cpRes = await getCouponsAction();
      if (cpRes.success) setCoupons(cpRes.coupons || []);

      // 7. Load analytics
      const aRes = await fetchSalesAnalyticsAction();
      if (aRes.success && aRes.analytics) {
        setAnalytics(aRes.analytics);
      }

      // 8. Load store settings
      const sRes = await getSettingsAction();
      if (sRes.success && sRes.settings) {
        setFbUrl(sRes.settings.facebook_url);
        setIgUrl(sRes.settings.instagram_url);
        setTtUrl(sRes.settings.tiktok_url);
        setWaNum(sRes.settings.whatsapp_number);
        setYtUrl(sRes.settings.youtube_url);
        setPrivacyText(sRes.settings.privacy_policy);
        setTermsText(sRes.settings.terms_conditions);
        setContactEmail(sRes.settings.contact_email);
        setContactPhone(sRes.settings.contact_phone);
        setContactAddress(sRes.settings.contact_address);
        setChatbotInstruction(sRes.settings.chatbot_instruction || "");
      }

      // 9. Load hero slides
      const hRes = await getHeroSlidesAction();
      if (hRes.success) {
        setHeroSlides(hRes.slides || []);
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Could not sync dashboard values from backend.");
    } finally {
      setTimeout(() => setIsLoading(false), 450);
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
      triggerNotification(`Courier dispatch order status elevated to ${nextStatus}.`);
      
      setAnalytics((prev: any) => {
        let pendingAdjustment = 0;
        if (currentStatus === "Pending") pendingAdjustment = -1;
        if (nextStatus === "Pending") pendingAdjustment = 1;
        return {
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount + pendingAdjustment)
        };
      });
    } catch (error) {
      console.error(error);
      triggerNotification("Order dispatch update refused by database.");
    }
  };

  // Trigger Deletion Modal Popups
  const askDeleteProduct = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetType("product");
    setDeleteTargetTitle(name);
    setIsConfirmDeleteOpen(true);
  };

  const askDeleteCategory = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetType("category");
    setDeleteTargetTitle(name);
    setIsConfirmDeleteOpen(true);
  };

  const askDeleteReview = (id: string, author: string) => {
    setDeleteTargetId(id);
    setDeleteTargetType("review");
    setDeleteTargetTitle(author);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmedDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTargetType === "product") {
        const success = await apiService.deleteProduct(deleteTargetId);
        if (success) {
          setProducts((prev) => prev.filter((p) => p.id !== deleteTargetId));
          triggerNotification("Product and associated Cloudinary pictures deleted.");
        }
      } else if (deleteTargetType === "category") {
        const res = await deleteCategoryAction(deleteTargetId);
        if (res.success) {
          setCategories((prev) => prev.filter((c) => c.id !== deleteTargetId));
          triggerNotification("Category and Cloudinary banners deleted.");
        } else {
          throw new Error(res.error);
        }
      } else if (deleteTargetType === "review") {
        const res = await adminDeleteReviewAction(deleteTargetId);
        if (res.success) {
          setReviews((prev) => prev.filter((r) => r.id !== deleteTargetId));
          triggerNotification("Patron review moderated and deleted.");
        }
      }
      setIsConfirmDeleteOpen(false);
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || "Failed to finalize deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Hero Carousel Slide Handlers
  const handleEditHero = (slide: HeroSlide) => {
    setEditingHero(slide);
    setHeroTitle(slide.title);
    setHeroSubtitle(slide.subtitle);
    setHeroImages([slide.image]);
    setHeroOpacity(slide.overlay_opacity ?? 35);
  };

  const clearHeroForm = () => {
    setEditingHero(null);
    setHeroTitle("");
    setHeroSubtitle("");
    setHeroImages([]);
    setHeroOpacity(35);
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroImages || heroImages.length === 0) {
      triggerNotification("Slide background image is required.");
      return;
    }
    setIsSavingHero(true);
    try {
      if (editingHero) {
        // Update
        const res = await updateHeroSlideAction(editingHero.id, {
          title: heroTitle,
          subtitle: heroSubtitle,
          image: heroImages[0],
          overlay_opacity: Number(heroOpacity),
        });
        if (res.success) {
          setHeroSlides(res.slides || []);
          triggerNotification("Hero Slide updated successfully.");
          clearHeroForm();
        } else {
          throw new Error(res.error);
        }
      } else {
        // Add
        const res = await addHeroSlideAction({
          title: heroTitle,
          subtitle: heroSubtitle,
          image: heroImages[0],
          overlay_opacity: Number(heroOpacity),
        });
        if (res.success && res.slide) {
          setHeroSlides((prev) => [...prev, res.slide!]);
          triggerNotification("New Hero Slide appended successfully.");
          clearHeroForm();
        } else {
          throw new Error(res.error);
        }
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || "Failed to process hero slide.");
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleDeleteHero = async (id: string) => {
    if (!confirm("Are you sure you would like to delete this exhibition hero slide from the rotation?")) return;
    try {
      const res = await deleteHeroSlideAction(id);
      if (res.success) {
        setHeroSlides(res.slides || []);
        triggerNotification("Hero Slide deleted was moderated/removed.");
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      triggerNotification(err.message || "Failed to delete slide.");
    }
  };

  // Product Create vs Edit Submission
  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setNewName(p.name);
    setNewDesigner(p.designer);
    setNewCategory(p.category);
    setNewPrice(p.price);
    setNewStock(p.stock);
    setNewDesc(p.description);
    setNewLongDesc(p.longDescription);
    setNewDetails(p.details.join(", "));
    setNewImages(p.images || [p.image]);
    setNewSeoTitle(p.seoTitle || "");
    setNewSeoDescription(p.seoDescription || "");
    setIsAddModalOpen(true);
  };

  const offerCreateProduct = () => {
    setEditingProduct(null);
    setNewName("");
    setNewDesigner("");
    if (categories.length > 0) setNewCategory(categories[0].id);
    setNewPrice(350);
    setNewStock(10);
    setNewDesc("");
    setNewLongDesc("");
    setNewDetails("");
    setNewImages([]);
    setNewSeoTitle("");
    setNewSeoDescription("");
    setIsAddModalOpen(true);
  };

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newImages.length === 0) {
      triggerNotification("At least 1 product image must be uploaded via Cloudinary.");
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const payload = {
        name: newName,
        designer: newDesigner,
        category: newCategory,
        price: Number(newPrice),
        image: newImages[0], // primary
        images: newImages,   // list
        description: newDesc,
        longDescription: newLongDesc,
        details: newDetails.split(",").map((s) => s.trim()).filter(Boolean),
        stock: Number(newStock),
        featured: true,
        seoTitle: newSeoTitle,
        seoDescription: newSeoDescription,
      };

      if (editingProduct) {
        const updated = await apiService.updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
        triggerNotification(`Product SKU "${updated.name}" updated successfully.`);
      } else {
        const created = await apiService.createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        triggerNotification(`New Product SKU "${created.name}" created.`);
      }

      setIsAddModalOpen(false);
    } catch (err: any) {
      triggerNotification(err.message || "Invalid Product payload parameters.");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Category Create vs Edit operations
  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatBanner(cat.bannerUrl ? [cat.bannerUrl] : []);
    setCatSeoTitle(cat.seoTitle || "");
    setCatSeoDescription(cat.seoDescription || "");
    setIsCategoryModalOpen(true);
  };

  const offerCreateCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatBanner([]);
    setCatSeoTitle("");
    setCatSeoDescription("");
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      triggerNotification("Category Title name is required.");
      return;
    }

    setIsSavingCategory(true);
    try {
      const bannerUrlStr = catBanner.length > 0 ? catBanner[0] : "";
      
      if (editingCategory) {
        const res = await updateCategoryAction(
          editingCategory.id,
          catName,
          bannerUrlStr,
          catSeoTitle,
          catSeoDescription
        );
        if (res.success && res.category) {
          setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? res.category : c)));
          triggerNotification(`Category "${res.category.name}" updated successfully.`);
          setIsCategoryModalOpen(false);
        } else {
          throw new Error(res.error);
        }
      } else {
        const res = await createCategoryAction(
          catName,
          bannerUrlStr,
          catSeoTitle,
          catSeoDescription
        );
        if (res.success && res.category) {
          setCategories((prev) => [...prev, res.category]);
          triggerNotification(`Brand Catalog Category "${res.category.name}" curated.`);
          setIsCategoryModalOpen(false);
        } else {
          throw new Error(res.error);
        }
      }
    } catch (err: any) {
      triggerNotification(err.message || "Failed to register Category.");
    } finally {
      setIsSavingCategory(false);
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
        triggerNotification(`Brand promo voucher ${res.coupon.code} active now.`);
      } else {
        triggerNotification(res.error || "Coupon generation failed.");
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
        triggerNotification("Voucher status customized.");
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await updateSettingsAction({
        facebook_url: fbUrl,
        instagram_url: igUrl,
        tiktok_url: ttUrl,
        whatsapp_number: waNum,
        youtube_url: ytUrl,
        privacy_policy: privacyText,
        terms_conditions: termsText,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_address: contactAddress,
        chatbot_instruction: chatbotInstruction,
      });

      if (res.success) {
        triggerNotification("Store configurations and public pages saved.");
      } else {
        triggerNotification(res.error || "Database rejected settings update.");
      }
    } catch (err: any) {
      triggerNotification(err.message || "Failed saving settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="max-w-7xl min-w-full lg:mx-auto px-4 md:px-8 py-12 text-left bg-[#faf9f6]/40 min-h-screen">
      
      {/* 2-Column Responsive Sidebar Layout wrapper */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start w-full">
        
        {/* LEFT COMPONENT: STICKY NAVIGATION SIDEBAR */}
        <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-8 z-30">
          <div className="bg-white/85 backdrop-blur-sm border border-gold-200 p-6 rounded-2xl flex flex-col lg:min-h-[calc(100vh-140px)]">
            
            {/* Seller Deck Brand/Title Section */}
            <div className="border-b border-gold-250 pb-5 mb-5 hidden lg:block">
              <h1 className="font-display text-lg uppercase tracking-wider font-black text-neutral-950">
                ATELIER MAISON
              </h1>
              <span className="font-serif italic font-light text-gold-650 text-sm block mt-0.5">
                Seller Deck
              </span>
              <p className="font-sans text-[9px] text-[#666] leading-relaxed mt-2 uppercase tracking-widest font-semibold">
                Pakistani Retail Console
              </p>
            </div>

            {/* Sidebar Navigation - Horizontal wrap/scroll on mobile, vertical stack on desktop */}
            <div className="flex flex-row overflow-x-auto lg:overflow-x-visible lg:flex-col gap-2.5 pb-3 lg:pb-0 scrollbar-none snap-x select-none w-full">
              {[
                { id: "orders", label: "📋 Orders Queue" },
                { id: "products", label: "🛍️ Curated Products" },
                { id: "categories", label: "🗂️ Category Suite" },
                { id: "customers", label: "👥 Customer Base" },
                { id: "reviews", label: "💬 Patron Reviews" },
                { id: "coupons", label: "🎟️ Discount Vouchers" },
                { id: "analytics", label: "📈 Ledger Analytics" },
                { id: "settings", label: "⚙️ Store Settings" },
                { id: "hero", label: "✨ Hero Slides" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4.5 py-3 rounded-full lg:rounded-xl text-[11px] font-display font-extrabold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap lg:whitespace-normal text-left select-none flex-shrink-0 lg:flex-shrink ${
                    activeTab === tab.id
                      ? "bg-neutral-950 text-gold-300 shadow-md font-black scale-102 lg:scale-100"
                      : "border border-gold-150 bg-white hover:bg-neutral-50 hover:border-gold-300 text-neutral-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sidebar reload server/connection status */}
            <div className="mt-auto pt-6 border-t border-gold-200 hidden lg:block">
              <button
                onClick={loadData}
                className="w-full inline-flex items-center justify-center text-[10px] uppercase font-display font-black tracking-widest text-[#151515] border border-gold-250 bg-white/60 py-2.5 rounded-lg hover:bg-gold-50/20 active:scale-95 transition-all text-center cursor-pointer shadow-xs"
              >
                🔄 Reload Database
              </button>
            </div>

          </div>
        </aside>

        {/* RIGHT COMPONENT: ACTIVE PANEL CONTENT AREA */}
        <main className="flex-1 w-full">
          
          {/* Header block visible ONLY in mobile Viewports */}
          <div className="lg:hidden border-b border-gold-200 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-left">
            <div>
              <h1 className="font-display text-2xl uppercase tracking-wider font-black text-neutral-950">
                ATELIER MAISON <span className="font-serif italic font-light text-gold-650 text-sm">Seller Deck</span>
              </h1>
              <p className="font-sans text-[11px] text-[#666] leading-relaxed mt-1 font-medium uppercase tracking-widest">
                Pakistani Retail Console
              </p>
            </div>
            
            <button
              onClick={loadData}
              className="inline-flex items-center text-[10px] uppercase font-display font-black tracking-widest text-[#151515] border border-gold-250 bg-white/55 px-4.5 py-2.5 rounded-lg hover:bg-gold-50/20 active:scale-95 transition-all text-left cursor-pointer shadow-sm"
            >
              🔄 Reload Server
            </button>
          </div>

          <div>
            {isLoading ? (
              <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-gold-650" />
                <p className="font-display text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Syncing Ledger Caches...
                </p>
              </div>
            ) : activeTab === "orders" ? (
        
        /* Orders queue visual dashboard */
        <div className="space-y-6">
          <h3 className="font-display text-sm uppercase tracking-wider text-[#151515] font-black">
            CUSTOMER DISPATCH QUEUE ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div className="p-16 border border-gold-150 rounded-2xl bg-white text-center">
              <p className="font-sans text-xs italic text-[#777]">No client checkout converted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gold-150 rounded-2xl bg-white shadow-sm scrollbar-thin">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-[#faf9f6]/95 border-b border-gold-150">
                    <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">CHECKOUT ID</th>
                    <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">PATRON PROFILE</th>
                    <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">CURATED ELEMENTS</th>
                    <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">TOTAL INVOICED</th>
                    <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">COURIER DISPATCH</th>
                    <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">CONTROLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/40 transition-colors">
                      <td className="p-5 font-mono text-xs text-neutral-400">
                        {o.id.slice(0, 8)}...
                      </td>
                      <td className="p-5 text-left">
                        <span className="block font-display text-xs uppercase font-extrabold text-neutral-950">{o.customerName}</span>
                        <span className="block text-[11px] font-mono text-[#888] mt-0.5">{o.customerEmail}</span>
                        <span className="block text-[10px] font-sans text-neutral-600 italic mt-1 max-w-[200px] truncate" title={o.shippingAddress}>📍 {o.shippingAddress}</span>
                      </td>
                      <td className="p-5">
                        <div className="space-y-2 max-h-24 overflow-y-auto pr-2 scrollbar-thin">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-2.5 text-xs text-neutral-600">
                              <img src={item.image} className="w-6.5 h-8.5 rounded border border-gold-100 object-cover flex-shrink-0" />
                              <span className="truncate max-w-[125px] font-medium">{item.name}</span>
                              <span className="font-bold text-neutral-900">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-5 font-serif italic font-bold text-neutral-900 text-sm">
                        ${o.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center text-[10px] tracking-wider font-display font-extrabold uppercase px-2.5 py-1 rounded shadow-xs border ${
                          o.status === "Delivered" ? "bg-teal-50 text-teal-850 border-teal-200" :
                          o.status === "Shipped" ? "bg-blue-50 text-blue-800 border-blue-200" :
                          o.status === "Processing" ? "bg-purple-50 text-purple-850 border-purple-200" :
                          "bg-gold-50 text-gold-950 border-gold-200"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, o.status)}
                          className="inline-flex items-center font-display text-xs uppercase tracking-wider font-extrabold text-neutral-900 border-b border-neutral-950 pb-0.5 hover:text-gold-650 hover:border-gold-550 transition-colors focus:outline-none cursor-pointer"
                        >
                          advance status →
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
        
        /* Dynamic Catalog curation management */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-left gap-4">
            <h3 className="font-display text-sm uppercase tracking-wider text-[#151515] font-black">
              CURATED ARTISAN CATALOG ({products.length})
            </h3>
            <button
              onClick={offerCreateProduct}
              className="inline-flex items-center bg-neutral-950 hover:bg-neutral-850 text-gold-300 font-display text-xs uppercase font-bold tracking-widest px-5.5 py-3 rounded-full shadow-md transition-all focus:outline-none cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1.5 text-gold-400" />
              <span>curate new product</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-gold-150 rounded-2xl bg-white shadow-sm scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#faf9f6]/95 border-b border-gold-150">
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">IMAGE & DESIGNER</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">PRODUCT TITLES</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">CATEGORY</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">PRICE</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">STOCK LEVEL</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">ACTIONS</th>
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
                    <td className="p-5 text-left font-display text-xs uppercase font-extrabold text-neutral-950 max-w-[200px] truncate" title={p.name}>
                      {p.name}
                    </td>
                    <td className="p-5 uppercase">
                      <Badge variant="gold">{p.category}</Badge>
                    </td>
                    <td className="p-5 font-serif italic font-bold text-neutral-900 text-sm">
                      ${p.price.toLocaleString()}
                    </td>
                    <td className="p-5">
                      <span className={`font-mono text-xs font-bold ${p.stock <= 3 ? "text-red-650" : "text-neutral-700"}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-5 flex space-x-2.5 items-center mt-3">
                      <button
                        onClick={() => handleEditProduct(p)}
                        className="text-neutral-500 hover:text-gold-750 transition-colors p-2 hover:bg-gold-50/30 rounded-full cursor-pointer focus:outline-none"
                        title="Edit curated SKU"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => askDeleteProduct(p.id, p.name)}
                        className="text-neutral-400 hover:text-red-650 transition-colors p-2 hover:bg-red-50 rounded-full cursor-pointer focus:outline-none"
                        title="Delete product"
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
      ) : activeTab === "categories" ? (
        
        /* 4.2.1 Dynamic Categories section */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-left gap-4">
            <h3 className="font-display text-sm uppercase tracking-wider text-[#151515] font-black">
              DYNAMIC CATEGORIES DIRECTORY ({categories.length})
            </h3>
            <button
              onClick={offerCreateCategory}
              className="inline-flex items-center bg-neutral-950 hover:bg-neutral-850 text-gold-300 font-display text-xs uppercase font-bold tracking-widest px-5.5 py-3 rounded-full shadow-md transition-all focus:outline-none cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1.5 text-gold-400" />
              <span>curate category</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-gold-150 rounded-2xl bg-white shadow-sm scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#faf9f6]/95 border-b border-gold-150">
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">IMAGE BANNER</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">CATEGORY ID / SLUG</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">CATEGORY TITLE NAME</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">SEO TITLE META</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">SEO DESCRIPTION</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="p-5">
                      {c.bannerUrl ? (
                        <img src={c.bannerUrl} className="w-16 h-10 object-cover border border-gold-100 rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-[10px] text-neutral-400 font-medium">None</div>
                      )}
                    </td>
                    <td className="p-5 font-mono text-xs text-neutral-700 font-bold">
                      {c.id}
                    </td>
                    <td className="p-5 text-left font-display text-xs uppercase font-extrabold text-[#151515]">
                      {c.name}
                    </td>
                    <td className="p-5 font-sans text-xs text-neutral-600 font-semibold italic">
                      {c.seoTitle || <span className="text-neutral-300 font-normal">None configured</span>}
                    </td>
                    <td className="p-5 font-sans text-xs text-neutral-400 max-w-xs truncate" title={c.seoDescription}>
                      {c.seoDescription || "None"}
                    </td>
                    <td className="p-5 flex space-x-2.5 items-center mt-1">
                      <button
                        onClick={() => handleEditCategory(c)}
                        className="text-neutral-500 hover:text-gold-750 transition-colors p-2 hover:bg-gold-50/30 rounded-full cursor-pointer focus:outline-none"
                        title="Edit curated category"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => askDeleteCategory(c.id, c.name)}
                        className="text-neutral-400 hover:text-red-650 transition-colors p-2 hover:bg-red-50 rounded-full cursor-pointer focus:outline-none"
                        title="Delete category"
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
        
        /* Account registration base directory */
        <div className="space-y-6">
          <h3 className="font-display text-sm uppercase tracking-wider text-[#151515] font-black">
            REGISTERED ATELIER USERS BASE ({customers.length})
          </h3>

          <div className="overflow-x-auto border border-gold-150 rounded-2xl bg-white shadow-sm scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#faf9f6]/95 border-b border-gold-150">
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">USER IDENTIFIER</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">CUSTOMER FULL NAME</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">ACCOUNT PRIVILEGES</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">REGISTRY DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="p-5 font-mono text-xs text-neutral-400">{c.id}</td>
                    <td className="p-5 font-display text-xs uppercase font-extrabold text-neutral-950">
                      {c.full_name || "Guest Patron"}
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex items-center text-[10px] tracking-wider font-display font-extrabold uppercase px-2.5 py-0.5 rounded ${
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
        
        /* Reviews moderation panel */
        <div className="space-y-6">
          <h3 className="font-display text-sm uppercase tracking-wider text-[#151515] font-black">
            PATRON TESTIMONIAL MODERATION LOGS ({reviews.length})
          </h3>

          <div className="overflow-x-auto border border-gold-150 rounded-2xl bg-white shadow-sm scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#faf9f6]/95 border-b border-gold-150">
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">PRODUCT</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">AUTHOR</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">STARS</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">FEEDBACK TRANSCRIPT</th>
                  <th className="font-display text-xs uppercase tracking-wider text-[#555] p-5 font-extrabold">MODERATION ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-100">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/40 transition-colors">
                    <td className="p-5 font-display text-xs uppercase font-extrabold text-neutral-900 max-w-[170px] truncate">
                      {r.products?.name || "Unknown Product"}
                    </td>
                    <td className="p-5">
                      <span className="block font-display text-xs uppercase font-bold text-neutral-950">{r.author_name}</span>
                      <span className="block text-[11px] font-sans text-neutral-400 mt-0.5">ID: {r.user_id?.slice(0, 8) || "Guest"}</span>
                    </td>
                    <td className="p-5 font-bold text-gold-600 text-xs">
                      {r.rating} / 5 Stars
                    </td>
                    <td className="p-5 font-sans text-xs text-neutral-500 max-w-xs leading-relaxed">
                      "{r.text}"
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => askDeleteReview(r.id, r.author_name)}
                        className="text-red-500 hover:text-red-750 transition-colors p-1.5 rounded-full hover:bg-red-50 cursor-pointer focus:outline-none"
                        title="Delete customer feedback"
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
        
        /* Coupons voucher curation panel */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Coupon creation form */}
          <form onSubmit={handleCreateCoupon} className="lg:col-span-4 bg-white border border-gold-150 p-6 rounded-2xl shadow-sm text-left space-y-4">
            <h4 className="font-display text-[11px] uppercase tracking-wider text-neutral-900 font-bold border-b border-gold-100 pb-2 mb-4">
              CREATE DISCOUNT COUPON
            </h4>
            
            <Input
              label="Promotional Code"
              placeholder="e.g. SAVE20"
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
                <option value={10}>10% Off checkout</option>
                <option value={15}>15% Off checkout</option>
                <option value={20}>20% Off checkout</option>
                <option value={30}>30% Off checkout</option>
                <option value={50}>50% Off checkout</option>
              </select>
            </div>

            <Button type="submit" size="sm" className="w-full h-11 cursor-pointer">
              Publish Code Voucher
            </Button>
          </form>

          {/* List existing active coupons */}
          <div className="lg:col-span-8 space-y-4 text-left">
            <h4 className="font-display text-[11px] uppercase tracking-wider text-[#666] font-bold mb-4">
              ACTIVE VOUCHER CERTIFICATES ({coupons.length})
            </h4>

            <div className="border border-gold-150 rounded-2xl bg-white overflow-hidden shadow-sm scrollbar-thin overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[#faf9f6] border-b border-gold-150">
                    <th className="font-display text-[10px] uppercase tracking-wider text-neutral-600 p-4 font-bold">CODE</th>
                    <th className="font-display text-[10px] uppercase tracking-wider text-neutral-600 p-4 font-bold">PERCENTAGE</th>
                    <th className="font-display text-[10px] uppercase tracking-wider text-neutral-600 p-4 font-bold">REDEEMABLE STATE</th>
                    <th className="font-display text-[10px] uppercase tracking-wider text-neutral-600 p-4 font-bold">CONTROLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-100">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50/30 font-sans text-xs">
                      <td className="p-4 uppercase font-bold text-neutral-900 tracking-wider">
                        🎟️ {c.code}
                      </td>
                      <td className="p-4 font-serif italic font-bold text-[#8c6b30]">
                        {c.discount_percent}% off orders
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          c.active ? "bg-teal-50 text-teal-850" : "bg-neutral-100 text-neutral-400"
                        }`}>
                          {c.active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(c.id, c.active)}
                          className="font-display text-[10px] uppercase font-bold tracking-wider hover:underline text-neutral-900 cursor-pointer"
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
      ) : activeTab === "settings" ? (
        
        /* Editable store configurations */
        <form onSubmit={handleSaveSettings} className="space-y-8 text-left max-w-4xl">
          
          {/* Social settings segment */}
          <div className="bg-white border border-gold-150 p-6 md:p-8 rounded-2xl shadow-sm text-left space-y-6">
            <h4 className="font-display text-sm uppercase tracking-wide text-neutral-950 font-black border-b border-neutral-100 pb-3 flex items-center">
              <Facebook className="h-5 w-5 mr-2 text-blue-600 animate-pulse" />
              Social Media Links (Footer Profiles)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <Input
                label="Facebook Fanpage URL"
                placeholder="https://facebook.com/yourbrand"
                value={fbUrl}
                onChange={(e) => setFbUrl(e.target.value)}
              />
              <Input
                label="Instagram Creator URL"
                placeholder="https://instagram.com/yourbrand"
                value={igUrl}
                onChange={(e) => setIgUrl(e.target.value)}
              />
              <Input
                label="TikTok Profile Link"
                placeholder="https://tiktok.com/@yourbrand"
                value={ttUrl}
                onChange={(e) => setTtUrl(e.target.value)}
              />
              <Input
                label="WhatsApp Business Number"
                placeholder="+923001234567"
                value={waNum}
                onChange={(e) => setWaNum(e.target.value)}
              />
              <div className="md:col-span-2">
                <Input
                  label="YouTube Hub Channel URL"
                  placeholder="https://youtube.com/c/yourbrand"
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contact settings segment */}
          <div className="bg-white border border-gold-150 p-6 md:p-8 rounded-2xl shadow-sm text-left space-y-6">
            <h4 className="font-display text-sm uppercase tracking-wide text-neutral-950 font-black border-b border-neutral-100 pb-3 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-teal-650" />
              Store Helpline Contacts & Location
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <Input
                label="Support Contact Email"
                placeholder="support@maisonletoile.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
              <Input
                label="Helpline Phone"
                placeholder="+92 300 1234567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
              <div className="md:col-span-2 text-left">
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
                  Showroom Physical Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street Address, City, Pakistan"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  className="w-full bg-white text-neutral-950 font-sans text-xs px-4 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-450 text-left"
                />
              </div>
            </div>
          </div>

          {/* Policies editor segment */}
          <div className="bg-white border border-gold-150 p-6 md:p-8 rounded-2xl shadow-sm text-left space-y-6">
            <h4 className="font-display text-sm uppercase tracking-wide text-neutral-950 font-black border-b border-neutral-100 pb-3 flex items-center">
              <Mail className="h-4.5 w-4.5 mr-2 text-amber-600" />
              Privacy Policy and Shipping Terms Content
            </h4>

            <div className="space-y-5 text-left">
              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
                  Privacy Policy Core Extract (Customer Data Guarantee)
                </label>
                <textarea
                  rows={4}
                  value={privacyText}
                  onChange={(e) => setPrivacyText(e.target.value)}
                  className="w-full bg-white text-neutral-950 font-sans text-xs px-4 py-3.5 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-445 text-left"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
                  Terms and Conditions Core Extract (Exchange and Shipping rules)
                </label>
                <textarea
                  rows={4}
                  value={termsText}
                  onChange={(e) => setTermsText(e.target.value)}
                  className="w-full bg-white text-neutral-950 font-sans text-xs px-4 py-3.5 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-445 text-left"
                />
              </div>
            </div>
          </div>

          {/* Chatbot settings segment */}
          <div className="bg-white border border-gold-150 p-6 md:p-8 rounded-2xl shadow-sm text-left space-y-6">
            <h4 className="font-display text-sm uppercase tracking-wide text-neutral-950 font-black border-b border-neutral-100 pb-3 flex items-center">
              <Sparkles className="h-4.5 w-4.5 mr-2 text-violet-650 animate-pulse" />
              AI Chatbot Styling Concierge Instructions
            </h4>

            <div className="space-y-5 text-left">
              <div>
                <label className="block text-[10px] font-display font-semibold uppercase tracking-wide text-neutral-500 mb-1.5">
                  System Context & Directives for Aura (AI Assistant Instructions)
                </label>
                <p className="text-[10px] text-neutral-400 mb-2 font-mono leading-relaxed">
                  Provide custom instructions to control chatbot voice, store policies, brand narrative, and specific product focus keys.
                </p>
                <textarea
                  rows={6}
                  value={chatbotInstruction}
                  onChange={(e) => setChatbotInstruction(e.target.value)}
                  className="w-full bg-[#faf9f6] text-neutral-950 font-sans text-xs px-4 py-3.5 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-445 text-left leading-relaxed"
                  placeholder="e.g. You are Aura, the private AI Styling Concierge for Maison L'Étoile..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="lg" type="submit" isLoading={isSavingSettings} className="cursor-pointer bg-neutral-950 hover:bg-neutral-850">
              Save Store Configurations & Pages
            </Button>
          </div>
        </form>
      ) : activeTab === "hero" ? (
        
        /* Hero Carousel Management Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          
          {/* Create/Edit slide form */}
          <form onSubmit={handleSaveHero} className="lg:col-span-5 bg-white border border-gold-150 p-6 md:p-8 rounded-2xl shadow-sm text-left space-y-5">
            <h4 className="font-display text-[11px] uppercase tracking-wider text-neutral-900 font-bold border-b border-gold-100 pb-2 flex justify-between items-center">
              <span>{editingHero ? "EDIT HERO EXHIBITION SLIDE" : "CREATE HERO SLIDE"}</span>
              {editingHero && (
                <button 
                  type="button" 
                  onClick={clearHeroForm}
                  className="text-neutral-400 hover:text-neutral-950 text-[10px] uppercase font-bold tracking-wider"
                >
                  cancel edit
                </button>
              )}
            </h4>

            <Input
              label="Slide Display Heading (Title)"
              placeholder="e.g. L'ÉCORCE Silencieuse"
              required
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
            />

            <div className="text-left">
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Slide Narrative Subtitle
              </label>
              <textarea
                required
                rows={3}
                placeholder="Narrate slide details and context seamlessly..."
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-450 text-left font-medium"
              />
            </div>

            {/* Cloudinary single image upload */}
            <div className="border-t border-gold-150/40 pt-4">
              <ImageUpload
                images={heroImages}
                onChange={setHeroImages}
                maxImages={1}
                label="Exhibition Slide Background"
              />
            </div>

            <div>
              <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Overlay shadow Opacity (%)
              </label>
              <select
                value={heroOpacity}
                onChange={(e) => setHeroOpacity(Number(e.target.value))}
                className="w-full bg-white text-neutral-900 font-sans text-xs px-3.5 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-450"
              >
                <option value={10}>10% Overlay Opacity (Brighter)</option>
                <option value={20}>20% Overlay Opacity</option>
                <option value={30}>30% Overlay Opacity</option>
                <option value={35}>35% Overlay Opacity (Recommended)</option>
                <option value={40}>40% Overlay Opacity</option>
                <option value={50}>50% Overlay Opacity (Darker/Higher Contrast)</option>
                <option value={60}>60% Overlay Opacity</option>
              </select>
            </div>

            <Button type="submit" size="sm" className="w-full h-11 cursor-pointer bg-neutral-950 hover:bg-neutral-850 animate-fade-in" isLoading={isSavingHero}>
              {editingHero ? "Save Slide Changes" : "Append Slide to Exhibitions"}
            </Button>
          </form>

          {/* List existing hero slides in rotation */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <h4 className="font-display text-[11px] uppercase tracking-wider text-[#666] font-bold">
              SLIDES CURRENT ROTATION ({heroSlides.length})
            </h4>

            {heroSlides.length === 0 ? (
              <div className="p-8 border border-gold-150 rounded-2xl bg-white text-center text-stone-400 text-xs">
                No active hero slides inside the collection database.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {heroSlides.map((slide) => (
                  <div key={slide.id} className="bg-white border border-gold-150 rounded-2xl p-4.5 flex gap-4 shadow-sm items-center text-left">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gold-100 flex-shrink-0 bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0 space-y-1">
                      <h5 className="font-display font-black text-xs text-neutral-950 uppercase truncate">
                        {slide.title || "Untitled slide Title"}
                      </h5>
                      <p className="font-sans text-[10.5px] text-neutral-400 line-clamp-2 leading-relaxed font-semibold">
                        {slide.subtitle || "No subtitle statement added."}
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-50 border border-neutral-150 px-2.5 py-0.5 rounded-full font-semibold">
                          Opacity: {slide.overlay_opacity}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditHero(slide)}
                        className="h-8.5 w-8.5 rounded-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-gold-300 text-neutral-700 hover:text-gold-700 flex items-center justify-center transition-all cursor-pointer"
                        title="Edit Slide specs"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHero(slide.id)}
                        className="h-8.5 w-8.5 rounded-full bg-neutral-50 hover:bg-red-50 border border-neutral-200 hover:border-red-200 text-neutral-700 hover:text-red-650 flex items-center justify-center transition-all cursor-pointer"
                        title="Delete exhibition slide"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        
        /* Ledger Analytics financial view */
        <div className="space-y-8 text-left">
          <div className="bg-[#faf9f6]/92 border border-gold-200 rounded-2xl p-6 text-left shadow-xs">
            <h4 className="font-display text-xs uppercase tracking-wider text-[#151515] font-black mb-4 flex items-center">
              <TrendingUp className="h-4.5 w-4.5 mr-2 text-gold-650 font-bold" />
              FINANCIAL PERFORMANCE AGGREGATION
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5.5 bg-white border border-gold-100 rounded-xl shadow-xs">
                <span className="font-sans text-stone-500 text-xs font-semibold">Gross Invoiced Volume</span>
                <p className="font-serif italic text-3xl font-black text-neutral-950 mt-2">${analytics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-5.5 bg-white border border-gold-100 rounded-xl shadow-xs">
                <span className="font-sans text-stone-500 text-xs font-semibold">Total Courier Shipments</span>
                <p className="font-serif italic text-3xl font-black text-neutral-950 mt-2">{analytics.orderCount} conversions</p>
              </div>
              <div className="p-5.5 bg-white border border-gold-100 rounded-xl shadow-xs">
                <span className="font-sans text-stone-500 text-xs font-semibold">Average Checkout ticket value</span>
                <p className="font-serif italic text-3xl font-black text-neutral-950 mt-2">${analytics.averageTicket.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="border border-gold-150 rounded-2xl p-6.5 bg-white shadow-xs space-y-4">
              <h5 className="font-display text-[10px] uppercase tracking-widest font-black text-neutral-900">
                L'ÉTOILE DATABASE DISPATCH LOGS
              </h5>
              <div className="space-y-3.5 text-xs font-medium">
                <div className="flex justify-between items-center py-2 border-b border-gold-100">
                  <span className="text-neutral-500">Database Connection:</span>
                  <span className="text-teal-650 font-bold uppercase text-[10px]">Active (Online PostgreSQL)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gold-100">
                  <span className="text-neutral-500">Current SSL Configuration:</span>
                  <span className="text-neutral-900 font-bold font-mono">Enabled (AES-256)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gold-100">
                  <span className="text-neutral-500">Total Catalog SKU Density:</span>
                  <span className="text-neutral-900 font-bold">{products.length} cataloged SKUs</span>
                </div>
              </div>
            </div>

            <div className="border border-gold-150 rounded-2xl p-6.5 bg-white shadow-xs flex flex-col justify-center text-center py-8">
              <ShieldCheck className="h-10 w-10 text-teal-650 mx-auto mb-3" />
              <h5 className="font-display text-[11px] uppercase tracking-widest font-black text-neutral-900">
                AUDIT COMPLIANCE SECURED
              </h5>
              <p className="font-sans text-[11px] text-neutral-400 max-w-xs mx-auto leading-relaxed mt-2 font-medium">
                All status modifications and product curation additions are digitally signed inside profile records using PostgreSQL Row-Level-Security (RLS).
              </p>
            </div>
          </div>
        </div>
      )}

          </div>
        </main>
      </div>

      {/* 5. Create or Edit Product Element Modal Popup */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs cursor-pointer" />
          
          <div className="relative bg-[#faf9f6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gold-200 z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold-150 bg-neutral-950 text-white">
              <h3 className="font-display text-xs uppercase tracking-widest font-black text-gold-300 flex items-center">
                <PlusCircle className="h-4.5 w-4.5 mr-2" /> 
                {editingProduct ? "EDIT CURATED ATELIER SKU" : "CURATE NEW LAUNCH PRODUCT"}
              </h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateProduct} className="flex-grow overflow-y-auto p-6 md:p-8 space-y-5.5 text-left scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Designer / Textile Brand"
                  placeholder="e.g. Khaadi, Sana Safinaz"
                  required
                  value={newDesigner}
                  onChange={(e) => setNewDesigner(e.target.value)}
                />
                <Input
                  label="Product Listing Title"
                  placeholder="e.g. Pure Silk Embroidered Shirt"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-display font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Product Category Link
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white text-neutral-950 font-sans text-xs px-3.5 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-450 h-11.5 text-left cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Retail Price (USD)"
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                />
                <Input
                  label="Atelier Warehouse Stock"
                  type="number"
                  required
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                />
              </div>

              {/* Rich Cloudinary multi image uploader */}
              <div className="border-t border-gold-150/40 pt-4">
                <ImageUpload
                  images={newImages}
                  onChange={setNewImages}
                  maxImages={5}
                  label="Product Exhibit Images Gallery"
                />
              </div>

              <div className="text-left border-t border-gold-150/40 pt-4">
                <label className="block text-[10px] font-display font-semibold uppercase tracking-widest text-[#555] mb-1.5">
                  Small catalog description snippet
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe premium specs in 1-2 lines..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-445 text-left font-medium"
                />
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-display font-semibold uppercase tracking-widest text-[#555] mb-1.5">
                  Full Detailed Narrative description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Elaborate on catalog fabrics, silk weaves, patterns, cut styles..."
                  value={newLongDesc}
                  onChange={(e) => setNewLongDesc(e.target.value)}
                  className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-445 text-left font-medium"
                />
              </div>

              <Input
                label="Tactile Specs (Comma separated checklist)"
                placeholder="e.g. 100% Linen, Brass buttons, Hand embroidered, Cold handwash only"
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
              />

              {/* SEO inputs */}
              <div className="border-t border-gold-150/70 pt-5 space-y-4">
                <h4 className="font-display text-[10px] uppercase tracking-widest font-black text-neutral-800">
                  🎨 SEARCH ENGINE (SEO) COGNITIVE DATA
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Custom SEO Meta Title"
                    placeholder="e.g. Designer Embroidered Silk Kurti | Maison L'Étoile"
                    value={newSeoTitle}
                    onChange={(e) => setNewSeoTitle(e.target.value)}
                  />
                  <Input
                    label="Custom SEO Meta Description"
                    placeholder="Synthesize search summary for premium discoverability..."
                    value={newSeoDescription}
                    onChange={(e) => setNewSeoDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-gold-150 flex justify-end space-x-3">
                <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSubmittingProduct} className="cursor-pointer bg-neutral-950 hover:bg-neutral-850">
                  {editingProduct ? "Save Curated SKU" : "Register Curated Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.1 Category Creation/Editing Modal Popup */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCategoryModalOpen(false)} className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs cursor-pointer" />
          
          <div className="relative bg-[#faf9f6]/95 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gold-200 z-10 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold-150 bg-neutral-950 text-white">
              <h3 className="font-display text-xs uppercase tracking-widest font-black text-gold-300 flex items-center">
                <Layers className="h-4.5 w-4.5 mr-2" /> 
                {editingCategory ? "EDIT BRAND CATALOG CATEGORY" : "CURATE NEW ATELIER CATEGORY"}
              </h3>
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="text-neutral-400 hover:text-white transition-colors p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex-grow overflow-y-auto p-6 md:p-8 space-y-5.5 text-left scrollbar-thin">
              <Input
                label="Category Title Name"
                placeholder="e.g. Luxury Pret Wear, Geologic Home Accents"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
              />

              {/* Cloudinary Banner Upload */}
              <div className="border-t border-gold-150/40 pt-4">
                <ImageUpload
                  images={catBanner}
                  onChange={setCatBanner}
                  maxImages={1}
                  label="Category Landscape Showcase Banner"
                />
              </div>

              {/* Category SEO fields */}
              <div className="border-t border-gold-150/70 pt-5 space-y-4">
                <h4 className="font-display text-[10px] uppercase tracking-widest font-black text-neutral-800">
                  🌍 CATEGORY SEO METADATA SETTINGS
                </h4>
                <Input
                  label="Category SEO Meta Title"
                  placeholder="e.g. Prestige Fine Watches & Chronographs Collection"
                  value={catSeoTitle}
                  onChange={(e) => setCatSeoTitle(e.target.value)}
                />
                <div className="text-left">
                  <label className="block text-[10px] font-display font-semibold uppercase tracking-widest text-[#555] mb-1.5">
                    Category SEO Meta Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Craft a descriptive Search engine snippet for shoppers..."
                    value={catSeoDescription}
                    onChange={(e) => setCatSeoDescription(e.target.value)}
                    className="w-full bg-white text-neutral-950 placeholder-neutral-400 font-sans text-xs px-4 py-3 border border-gold-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-455 text-left font-medium"
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-gold-150 flex justify-end space-x-3">
                <Button variant="outline" type="button" onClick={() => setIsCategoryModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSavingCategory} className="cursor-pointer bg-neutral-950 hover:bg-neutral-850">
                  {editingCategory ? "Save Category Details" : "Publish Dynamic Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Robust Action Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div onClick={() => setIsConfirmDeleteOpen(false)} className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs transition-opacity cursor-pointer" />
          
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-neutral-150 z-10 p-6 text-left">
            <div className="flex items-center space-x-3 text-red-650 mb-4">
              <div className="bg-red-50 p-2.5 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
              </div>
              <h3 className="font-display text-base uppercase font-extrabold text-neutral-900">
                Confirm Deletion Action
              </h3>
            </div>

            <p className="font-sans text-sm text-neutral-500 leading-relaxed mb-6">
              Are you sure you want to permanently delete <strong>{deleteTargetTitle}</strong>? This will instantly synchronize with the Supabase database and purge assets from Cloudinary.
            </p>

            <div className="flex justify-end space-x-3 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-500 font-display text-xs uppercase font-extrabold transition-all outline-none cursor-pointer"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={handleConfirmedDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-750 text-white font-display text-xs uppercase font-extrabold transition-all flex items-center gap-1.5 shadow-md outline-none cursor-pointer disabled:opacity-45"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
