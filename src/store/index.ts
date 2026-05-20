import { create } from "zustand";
import { Product, CartItem, Order } from "../types";
import {
  addToCartAction,
  removeFromCartAction,
  updateCartQuantityAction,
  clearCartAction,
} from "../actions/cart.actions";

interface LAtelierStore {
  cart: CartItem[];
  isCartOpen: boolean;
  activeProduct: Product | null;
  isChatOpen: boolean;
  notification: string | null;
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  user: any | null;
  
  // Actions
  setCartOpen: (open: boolean) => void;
  setActiveProduct: (product: Product | null) => void;
  setChatOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sortBy: string) => void;
  setUser: (user: any | null) => void;
  
  triggerNotification: (msg: string) => void;
  clearNotification: () => void;
  
  // Cart operations
  addToCart: (product: Product, quantity?: number, size?: string, engraving?: string) => Promise<void>;
  removeFromCart: (productId: string, size?: string) => Promise<void>;
  updateCartQuantity: (productId: string, size: string | undefined, delta: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useStore = create<LAtelierStore>((set, get) => ({
  cart: [],
  isCartOpen: false,
  activeProduct: null,
  isChatOpen: false,
  notification: null,
  searchQuery: "",
  selectedCategory: "all",
  sortBy: "default",
  user: null,

  setCartOpen: (open) => set({ isCartOpen: open }),
  setActiveProduct: (product) => set({ activeProduct: product }),
  setChatOpen: (open) => set({ isChatOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sortBy) => set({ sortBy }),
  setUser: (user) => set({ user }),

  triggerNotification: (msg) => {
    set({ notification: msg });
    // Auto clear after 4s
    setTimeout(() => {
      if (get().notification === msg) {
        set({ notification: null });
      }
    }, 4000);
  },
  
  clearNotification: () => set({ notification: null }),

  addToCart: async (product, quantity = 1, size = "M", engraving = "") => {
    if (product.stock <= 0) {
      get().triggerNotification("Apologies, this item is fully sold out.");
      return;
    }

    const cart = get().cart;
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.size === size
    );

    let updatedCart = [...cart];
    let newQty = quantity;

    if (existingIndex > -1) {
      const existingItem = cart[existingIndex];
      newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        get().triggerNotification(`Only ${product.stock} items currently in stock.`);
        return;
      }
      updatedCart[existingIndex] = { ...existingItem, quantity: newQty };
    } else {
      updatedCart = [...cart, { product, quantity, size, engraving }];
    }

    set({ cart: updatedCart });
    get().triggerNotification(`Added ${product.name} to your Cart.`);

    // If user is authenticated, persist to database asynchronously
    const currentUser = get().user;
    if (currentUser) {
      try {
        const res = await addToCartAction(product.id, quantity, size, engraving);
        if (!res.success) {
          get().triggerNotification(res.error || "Failed to persist item to server cart.");
        }
      } catch (err) {
        console.error("Cart DB sync failed:", err);
      }
    }
  },

  removeFromCart: async (productId, size) => {
    const updatedCart = get().cart.filter(
      (item) => !(item.product.id === productId && item.size === size)
    );
    set({ cart: updatedCart });
    get().triggerNotification("Removed item from cart.");

    const currentUser = get().user;
    if (currentUser) {
      try {
        const res = await removeFromCartAction(productId, size || "M");
        if (!res.success) {
          get().triggerNotification(res.error || "Failed to sync cart removal to server.");
        }
      } catch (err) {
        console.error("Cart DB sync failed:", err);
      }
    }
  },

  updateCartQuantity: async (productId, size, delta) => {
    const cart = get().cart;
    let targetQ = 1;
    let found = false;

    const updatedCart = cart.map((item) => {
      if (item.product.id === productId && item.size === size) {
        targetQ = item.quantity + delta;
        if (targetQ <= 0) return item;
        if (targetQ > item.product.stock) {
          get().triggerNotification(`Apologies, only ${item.product.stock} available in showroom.`);
          return item;
        }
        found = true;
        return { ...item, quantity: targetQ };
      }
      return item;
    });

    if (!found) return;

    set({ cart: updatedCart });

    const currentUser = get().user;
    if (currentUser) {
      try {
        const res = await updateCartQuantityAction(productId, size || "M", targetQ);
        if (!res.success) {
          get().triggerNotification(res.error || "Failed to sync cart update to server.");
        }
      } catch (err) {
        console.error("Cart DB sync failed:", err);
      }
    }
  },

  clearCart: async () => {
    set({ cart: [] });

    const currentUser = get().user;
    if (currentUser) {
      try {
        await clearCartAction();
      } catch (err) {
        console.error("Cart DB sync failed:", err);
      }
    }
  },
}));
