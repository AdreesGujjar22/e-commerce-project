"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "../../store";
import { getSessionUserAction, logoutAction } from "../../actions/auth.actions";
import { fetchUserCartAction, syncGuestCartAction } from "../../actions/cart.actions";
import { ShoppingBag, Search, Sparkles, User, Settings2, Menu, X, LogOut } from "lucide-react";
import Image from "next/image";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, setCartOpen, setChatOpen, searchQuery, setSearchQuery, triggerNotification, clearCart, user, setUser } = useStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth state
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const isSelected = (path: string) => pathname === path;

  // Track session on mount & path changes
  const checkSession = async () => {
    try {
      const res = await getSessionUserAction();
      if (res.success && res.user) {
        setUser(res.user);

        // Let's sync their Cart if they have guest items
        if (cart.length > 0) {
          await syncGuestCartAction(cart);
        }

        // Fetch user's persistent DB cart and merge into Zustand UI cache
        const cartData = await fetchUserCartAction();
        if (cartData.success && cartData.items) {
          // Sync database cart items to Zustand
          useStore.setState({ cart: cartData.items });
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session fetch failed:", err);
    }
  };

  useEffect(() => {
    checkSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await logoutAction();
      if (res.success) {
        setUser(null);
        clearCart(); // Clean cart cache on signout
        triggerNotification("Logged out successfully.");
        setShowProfileMenu(false);
        router.push("/");
      }
    } catch (err: any) {
      triggerNotification(err.message || "Failed signout.");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gold-150 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-700 hover:text-neutral-900 focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Navigation Links - Showcase Left Side */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              href="/collections"
              className={`font-display text-sm uppercase tracking-[0.15em] font-extrabold transition-colors hover:text-gold-600 ${isSelected("/collections") ? "text-gold-700 font-black" : "text-neutral-700"
                }`}
            >
              Browse Products
            </Link>
            <button
              onClick={() => setChatOpen(true)}
              className="font-display text-sm uppercase tracking-[0.15em] font-extrabold text-neutral-700 transition-colors hover:text-gold-600 flex items-center space-x-1.5 hover:cursor-pointer"
            >
              <Sparkles className="h-4.5 w-4.5 text-gold-500 animate-pulse" />
              <span>AI Style Chatbot</span>
            </button>
          </nav>

          {/* Luxury Brand Logo Centered */}
<div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
  <Link href="/" className="flex items-center justify-center">
    <div className="relative h-20 w-[140px]">
      <Image
        src="/logo.png"
        alt="Logo"
        fill
        className="object-contain"
      />
    </div>
  </Link>
</div>

        {/* Custom Action Group - Right Side */}
        <div className="flex items-center space-x-4 sm:space-x-6">

          {/* Inline Toggleable Search */}
          <div className={`relative hidden sm:flex items-center transition-all duration-300 ${isSearchOpen ? "w-64" : "w-10"}`}>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-neutral-700 hover:text-neutral-950 p-2 focus:outline-none"
              aria-label="Toggle search bar"
            >
              <Search className="h-5 w-5" />
            </button>
            {isSearchOpen && (
              <input
                type="text"
                placeholder="Search clothing, scents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-gold-300 focus:outline-none py-1 px-2 font-sans text-xs sm:text-sm text-neutral-900 placeholder-neutral-400"
                autoFocus
              />
            )}
          </div>

          {/* Admin Management System link (Only visible if admin role) */}
          {user && user.role === "admin" && (
            <Link
              href="/admin"
              className={`text-neutral-700 hover:text-neutral-950 p-2 focus:outline-none relative transition-colors ${isSelected("/admin") ? "text-gold-700 animate-pulse" : ""
                }`}
              title="Admin Dashboard"
            >
              <Settings2 className="h-5 w-5" />
            </Link>
          )}

          {/* Authentication Icon Selector & Dropdown */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="text-neutral-700 hover:text-gold-700 p-2 focus:outline-none flex items-center space-x-1"
                >
                  <User className="h-5 w-5 text-gold-600" />
                  <span className="text-xs font-display uppercase tracking-wide font-extrabold hidden sm:inline truncate max-w-[80px]">
                    {user.fullName.split(" ")[0]}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl border border-gold-150 bg-[#faf9f6]/95 backdrop-blur-md p-4 shadow-xl z-55">
                    <div className="pb-3 border-b border-gold-100 text-left">
                      <span className="block text-[9px] font-display text-gold-600 uppercase tracking-wider font-extrabold mb-0.5">
                        {user.role === "admin" ? "Store Administrator" : "Valued Customer"}
                      </span>
                      <span className="block text-sm uppercase font-display font-black text-neutral-900 truncate">
                        {user.fullName}
                      </span>
                      <span className="block text-xs text-neutral-400 font-sans truncate mt-0.5">
                        {user.email}
                      </span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-2.5 font-display text-xs uppercase tracking-wider font-bold text-red-500 hover:text-red-750 py-2.5 transition-colors focus:outline-none"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="text-neutral-700 hover:text-neutral-950 p-2 focus:outline-none transition-colors"
                title="Sign In / Register"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Shopping Bag Drawer Action Trigger */}
          <button
            onClick={() => setCartOpen(true)}
            className="text-neutral-700 hover:text-neutral-950 p-2 relative focus:outline-none transition-colors"
            aria-label="Toggle shopping bag"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-display font-black leading-none bg-gold-500 text-neutral-950 border border-[#faf9f6]">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>

      {/* Slideout Mobile Menu */ }
  {
    isMobileMenuOpen && (
      <div className="md:hidden border-t border-gold-150 bg-white/95 backdrop-blur-md">
        <div className="px-5 py-6 space-y-4 text-left">
          <Link
            href="/collections"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block font-display text-xs uppercase tracking-wider text-neutral-800 font-bold"
          >
            Browse Products
          </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setChatOpen(true);
            }}
            className="w-full text-left font-display text-xs uppercase tracking-wider text-neutral-800 font-bold flex items-center space-x-2 hover:cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-gold-500" />
            <span>AI Style Chatbot</span>
          </button>

          {user ? (
            <div className="pt-2 border-t border-gold-100">
              <div className="text-[10px] text-neutral-400 uppercase font-display mb-1">Signed In As</div>
              <div className="font-display font-black text-neutral-900 text-xs uppercase mb-3">{user.fullName}</div>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block font-display text-xs uppercase tracking-wider text-[#7c633a] font-bold mb-3"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block text-left text-red-500 font-display text-xs uppercase tracking-wider font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-display text-xs uppercase tracking-wider text-neutral-800 font-bold border-t border-gold-100 pt-3"
            >
              Sign In / Register
            </Link>
          )}

          {/* Mobile Search Inquiries */}
          <div className="pt-4 border-t border-gold-150">
            <div className="flex items-center bg-neutral-50 px-3 py-2.5 rounded-xl border border-gold-100">
              <Search className="h-4 w-4 text-neutral-400 mr-2" />
              <input
                type="text"
                placeholder="Search clothing, scents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-none font-sans text-xs text-neutral-900"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
    </header >
  );
};
