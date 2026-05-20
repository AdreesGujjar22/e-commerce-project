"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, signupAction } from "../../actions/auth.actions";
import { useStore } from "../../store";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Compass, Sparkle, ShieldCheck, User, LogOut } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { triggerNotification } = useStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roleError = searchParams.get("role_error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const payload = { email, password };
        const res = await loginAction(payload);
        
        if (res.success && res.user) {
          triggerNotification(`Welcome back, ${res.user.fullName}.`);
          if (res.user.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/collections");
          }
        } else {
          triggerNotification(res.error || "Mismatched security keys. Please review.");
        }
      } else {
        const payload = { email, password, fullName };
        const res = await signupAction(payload);

        if (res.success) {
          triggerNotification("Registry generated. Please sign in with your credentials.");
          setIsLogin(true);
          setPassword("");
        } else {
          triggerNotification(res.error || "Failed to catalog patron. Try again.");
        }
      }
    } catch (err: any) {
      triggerNotification(err.message || "Credential transmission error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAutofill = () => {
    const adminEmail = "admin@maisonletoile.com";
    setEmail(adminEmail);
    setPassword("securepassword123");
    setIsLogin(true);
    triggerNotification("Steward keys populated.");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-left">
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-1.5 bg-neutral-900 text-gold-300 text-[8px] font-display font-medium uppercase tracking-[0.25em] px-3.5 py-1.5 rounded mb-6">
          <Compass className="h-2.5 w-2.5" />
          <span>ateliers identity ledger</span>
        </div>
        
        <h1 className="font-display text-2.5xl md:text-3.5xl uppercase tracking-tight text-neutral-950 font-black mb-2">
          {isLogin ? "PATRON SIGN IN" : "ATELIER REGISTRY"}
        </h1>
        <p className="font-sans text-xs text-neutral-500 max-w-xs mx-auto text-center">
          {isLogin
            ? "Authenticate security credentials to enter the luxury gallery showroom."
            : "Enroll in our exclusive customer ledgers for custom engraving privileges."}
        </p>
      </div>

      {roleError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-750 text-xs font-sans flex items-start gap-2.5 shadow-sm">
          <ShieldCheck className="h-4.5 w-4.5 text-red-550 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-display font-black text-[10px] uppercase tracking-wider block mb-0.5">ADMIN ONLY SECURED PORTAL</span>
            Your account is categorized as a patron tier, which lacks administrative authority.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gold-150 rounded-2xl p-6 shadow-sm text-left">
        {!isLogin && (
          <Input
            label="Full Noble Name"
            placeholder="e.g. Lady Evelyn Audrey"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        <Input
          label="Patron Registered Email"
          type="email"
          placeholder="e.g. evelyn@sterling-hall.co"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Vault Password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
          {isLogin ? "Acquire Security Session" : "Publish Registry Details"}
        </Button>

        <div className="text-center pt-3 border-t border-gold-100">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-neutral-500 hover:text-neutral-950 font-display text-[9.5px] uppercase tracking-widest font-black transition-colors focus:outline-none"
          >
            {isLogin ? "Generate brand new account" : "Exist in registry? Sign in"}
          </button>
        </div>
      </form>

      {/* Admin Quick Login Seeding Interface */}
      <div className="mt-8 bg-[#faf9f6]/80 border border-gold-150 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-sm">
        <div className="text-left w-full sm:w-auto">
          <span className="font-display text-[8.5px] uppercase tracking-wider font-extrabold text-[#7c633a] flex items-center mb-1">
            <Sparkle className="h-3 w-3 mr-1 text-gold-600 fill-gold-600/10" />
            STEWARD ADMIN ACCESS
          </span>
          <p className="font-sans text-[10.5px] text-neutral-400">
            Seed administrative keys corresponding to our singleton `.env` profile.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdminAutofill}
          className="flex-shrink-0 bg-neutral-950 text-gold-300 hover:bg-neutral-800 text-[9px] font-display uppercase tracking-widest font-black px-4 py-2.5 rounded-full transition-all focus:outline-none"
        >
          Autofill Keys
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="animate-spin h-6 w-6 border-b-2 border-gold-500 rounded-full" />
          <p className="font-sans text-xs text-neutral-400 mt-4">Preparing secure access vaults...</p>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
