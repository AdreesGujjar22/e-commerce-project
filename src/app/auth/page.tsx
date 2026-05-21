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

  // Field error states for direct inline validation
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullNameError, setFullNameError] = useState("");

  const roleError = searchParams.get("role_error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Reset standard errors
    setEmailError("");
    setPasswordError("");
    setFullNameError("");

    let hasError = false;

    // Email validation
    if (!email) {
      setEmailError("Please enter your email address.");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    }

    // Password validation
    if (!password) {
      setPasswordError("Please enter your password.");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      hasError = true;
    }

    // Full name validation (only for registration)
    if (!isLogin && !fullName.trim()) {
      setFullNameError("Please enter your full name.");
      hasError = true;
    }

    if (hasError) {
      setIsLoading(false);
      triggerNotification("Please fix the errors in the form above.");
      return;
    }

    try {
      if (isLogin) {
        const payload = { email, password };
        const res = await loginAction(payload);
        
        if (res.success && res.user) {
          triggerNotification(`Welcome back, ${res.user.fullName}!`);
          if (res.user.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/collections");
          }
        } else {
          // If the action returned an error, check if it fits email or password
          const errMsg = res.error || "Incorrect email or password. Please try again.";
          if (errMsg.toLowerCase().includes("email") || errMsg.toLowerCase().includes("user not found")) {
            setEmailError(errMsg);
          } else if (errMsg.toLowerCase().includes("password") || errMsg.toLowerCase().includes("invalid login credentials")) {
            setPasswordError(errMsg);
          } else {
            setEmailError(errMsg);
          }
          triggerNotification(errMsg);
        }
      } else {
        const payload = { email, password, fullName };
        const res = await signupAction(payload);

        if (res.success) {
          triggerNotification("Account created successfully! Please sign in with your email and password.");
          setIsLogin(true);
          setPassword("");
        } else {
          const errMsg = res.error || "Could not register. This email might already be in use.";
          if (errMsg.toLowerCase().includes("email")) {
            setEmailError(errMsg);
          } else {
            triggerNotification(errMsg);
          }
        }
      }
    } catch (err: any) {
      triggerNotification(err.message || "Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAutofill = () => {
    const adminEmail = "admin@Aroojletoile.com";
    setEmail(adminEmail);
    setPassword("securepassword123");
    setIsLogin(true);
    setEmailError("");
    setPasswordError("");
    triggerNotification("Admin credentials autofilled. Click Sign In.");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-left">
      <div className="text-center mb-10">
        <div className="inline-flex items-center space-x-1.5 bg-neutral-900 text-gold-300 text-[9px] font-display font-medium uppercase tracking-[0.25em] px-3.5 py-1.5 rounded mb-6">
          <Compass className="h-2.5 w-2.5" />
          <span>Arooj Arts - Login</span>
        </div>
        
        <h1 className="font-display text-2.5xl md:text-3xl uppercase tracking-tight text-neutral-950 font-black mb-2">
          {isLogin ? "CUSTOMER SIGN IN" : "CREATE NEW ACCOUNT"}
        </h1>
        <p className="font-sans text-xs text-neutral-500 max-w-xs mx-auto text-center">
          {isLogin
            ? "Sign in to your account with your email and password to start shopping."
            : "Register a new profile to place orders, track shipments, and get discounts."}
        </p>
      </div>

      {roleError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-750 text-xs font-sans flex items-start gap-2.5 shadow-sm">
          <ShieldCheck className="h-4.5 w-4.5 text-red-550 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-display font-black text-[10px] uppercase tracking-wider block mb-0.5">ADMIN PORTAL STRICTLY SECURED</span>
            Your account is registered as a customer and does not have admin rights.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gold-150 rounded-2xl p-6 shadow-sm text-left">
        {!isLogin && (
          <Input
            label="Full Name"
            placeholder="e.g. Ali Khan"
            required
            value={fullName}
            error={fullNameError}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. ali.khan@gmail.com"
          required
          value={email}
          error={emailError}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          error={passwordError}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" size="lg" className="w-full mt-2" isLoading={isLoading}>
          {isLogin ? "Sign In" : "Register Account"}
        </Button>

        <div className="text-center pt-3 border-t border-gold-100">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setEmailError("");
              setPasswordError("");
              setFullNameError("");
            }}
            className="text-neutral-500 hover:text-neutral-950 font-display text-[9.5px] uppercase tracking-widest font-black transition-colors focus:outline-none"
          >
            {isLogin ? "Don't have an account? Register here" : "Already have an account? Sign In"}
          </button>
        </div>
      </form>

    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="animate-spin h-6 w-6 border-b-2 border-gold-500 rounded-full" />
          <p className="font-sans text-xs text-neutral-400 mt-4">Loading secure portal...</p>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
