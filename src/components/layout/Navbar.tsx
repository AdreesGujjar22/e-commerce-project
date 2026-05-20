"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "../../store";
import { getSessionUserAction, logoutAction } from "../../actions/auth.actions";
import { fetchUserCartAction, syncGuestCartAction } from "../../actions/cart.actions";
import { ShoppingBag, Search, Sparkles, User, Settings2, Menu, X, LogOut, ShieldCheck } from "lucide-react";

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
        triggerNotification("Security session cleared.");
        setShowProfileMenu(false);
        router.push("/");
      }
    } catch (err: any) {
      triggerNotification(err.message || "Failed signout.");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-gold-150 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Icon */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-700 hover:text-neutral-900 focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
            </button>
          </div>

          {/* Navigation Links - Showcase Left Side */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              href="/collections"
              className={`font-display text-[10px] uppercase tracking-[0.2em] font-medium transition-colors hover:text-gold-600 ${
                isSelected("/collections") ? "text-gold-700 font-bold" : "text-neutral-600"
              }`}
            >
              The Showroom
            </Link>
            <button
              onClick={() => setChatOpen(true)}
              className="font-display text-[10px] uppercase tracking-[0.2em] font-medium text-neutral-600 transition-colors hover:text-gold-600 flex items-center space-x-1.5"
            >
              <Sparkles className="h-3 w-3 text-gold-500 animate-pulse" />
              <span>Aura concierge</span>
            </button>
          </nav>

          {/* Luxury Brand Logo Centered */}
          <div className="text-center absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none">
            <Link href="/" className="flex flex-col items-center">
              <span className="font-display text-base tracking-[0.35em] uppercase font-bold text-neutral-950">
                MAISON L'ÉTOILE
              </span>
              <span className="font-serif text-[8px] italic tracking-[0.35em] text-gold-600 uppercase mt-0.5">
                haute couture & art
              </span>
            </Link>
          </div>

          {/* Custom Action Group - Right Side */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            
            {/* Inline Toggleable Search */}
            <div className={`relative hidden sm:flex items-center transition-all duration-300 ${isSearchOpen ? "w-60" : "w-10"}`}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-neutral-600 hover:text-neutral-950 p-2 focus:outline-none"
                aria-label="Toggle search bar"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
              {isSearchOpen && (
                <input
                  type="text"
                  placeholder="Inquire products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-gold-300 focus:outline-none py-1 px-2 font-sans text-xs text-neutral-900 placeholder-neutral-400"
                  autoFocus
                />
              )}
            </div>

            {/* Admin Management System link (Only visible if admin role) */}
            {user && user.role === "admin" && (
              <Link
                href="/admin"
                className={`text-neutral-600 hover:text-neutral-950 p-2 focus:outline-none relative transition-colors ${
                  isSelected("/admin") ? "text-gold-700 animate-pulse" : ""
                }`}
                title="Atelier Admin"
              >
                <Settings2 className="h-4.5 w-4.5" />
              </Link>
            )}

            {/* Authentication Icon Selector & Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="text-neutral-600 hover:text-gold-700 p-2 focus:outline-none flex items-center space-x-1"
                  >
                    <User className="h-4.5 w-4.5 text-gold-600" />
                    <span className="text-[9px] font-display uppercase tracking-wider font-extrabold hidden sm:inline truncate max-w-[70px]">
                      {user.fullName.split(" ")[0]}
                    </span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-56 rounded-xl border border-gold-150 bg-[#faf9f6] p-4 shadow-xl z-55">
                      <div className="pb-3 border-b border-gold-100 text-left">
                        <span className="block text-[8.5px] font-display text-gold-600 uppercase tracking-widest font-black mb-0.5">
                          {user.role === "admin" ? "Grand Steward" : "Bespoke Patron"}
                        </span>
                        <span className="block text-xs uppercase font-display font-black text-neutral-900 truncate">
                          {user.fullName}
                        </span>
                        <span className="block text-[10px] text-neutral-400 font-sans tracking-normal truncate mt-0.5">
                          {user.email}
                        </span>
                      </div>
                      
                      <div className="pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center space-x-2.5 font-display text-[9px] uppercase tracking-widest font-bold font-black text-red-500 hover:text-red-750 py-2.5 transition-colors focus:outline-none"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Clear Session</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="text-neutral-600 hover:text-neutral-950 p-2 focus:outline-none"
                  title="Sign In"
                >
                  <User className="h-4.5 w-4.5" />
                </Link>
              )}
            </div>

            {/* Shopping Bag Drawer Action Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="text-neutral-600 hover:text-neutral-950 p-2 relative focus:outline-none"
              aria-label="Toggle shopping bag"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[8px] font-display font-black leading-none bg-gold-500 text-neutral-950 border border-[#faf9f6]">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slideout Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gold-150 bg-white/95 backdrop-blur-md">
          <div className="px-5 py-6 space-y-4 text-left">
            <Link
              href="/collections"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-display text-[11px] uppercase tracking-widest text-neutral-800"
            >
              The Showroom
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setChatOpen(true);
              }}
              className="w-full text-left font-display text-[11px] uppercase tracking-widest text-neutral-800 flex items-center space-x-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold-500" />
              <span>Aura concierge</span>
            </button>

            {user ? (
              <div className="pt-2 border-t border-gold-100">
                <div className="text-[10px] text-neutral-400 uppercase font-display mb-1">Authenticated Account</div>
                <div className="font-display font-black text-neutral-900 text-xs uppercase mb-3">{user.fullName}</div>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-display text-[11px] uppercase tracking-widest text-[#7c633a] font-bold mb-3"
                  >
                    Atelier Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block text-left text-red-500 font-display text-[11px] uppercase tracking-widest font-bold"
                >
                  Clear Session (Sign Out)
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-display text-[11px] uppercase tracking-widest text-neutral-800 border-t border-gold-100 pt-3"
              >
                Sign In / Enroll
              </Link>
            )}

            {/* Mobile Search Inquiries */}
            <div className="pt-4 border-t border-gold-150">
              <div className="flex items-center bg-neutral-50 px-3 py-2.5 rounded-xl border border-gold-100">
                <Search className="h-3.5 w-3.5 text-neutral-400 mr-2" />
                <input
                  type="text"
                  placeholder="Inquire products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent focus:outline-none font-sans text-xs text-neutral-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
