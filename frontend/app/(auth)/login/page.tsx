"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, ArrowRight, ShieldCheck, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      // redirect based on rolex
      const { user } = useAuthStore.getState();
      if (user?.role === "worker") {
        router.push("/worker");
      } else {
        router.push("/");
      }
    } catch {
      // error is already set in the store
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <main className="flex-grow flex items-center justify-center px-6 py-8 sm:py-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:px-12 md:py-10 relative overflow-hidden">
            {/* Progress bar */}
            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-teal-600"
                />
              </div>
            )}

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Welcome Back</h1>
              <p className="text-gray-500">Sign in to continue to Fework</p>
            </div>

            {/* Error alert */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 text-rose-600 text-sm"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#0F172A] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-bold text-[#0F172A]">Password</label>
                  <Link href="#" className="text-xs text-teal-600 hover:underline font-medium">Forgot Password?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 ml-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${rememberMe ? "bg-teal-600 border-teal-600" : "border-gray-200 bg-white"}`}
                >
                  {rememberMe && <CheckCircle2 size={14} className="text-white" />}
                </button>
                <span className="text-sm text-gray-500 select-none cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                  Remember login
                </span>
              </div>

              {/* Submit */}
              <button
                disabled={isLoading}
                className="w-full h-12 mt-2 bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-400 font-medium tracking-wider">Or continue with</span>
                </div>
              </div>

              {/* Google */}
              <div className="grid grid-cols-1">
                <button 
                  type="button" 
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="h-12 rounded-2xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all font-bold text-sm text-[#0F172A] active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <div className="flex items-center justify-center gap-4 mt-2">
                <Link href="/signup" className="text-teal-600 font-bold hover:underline">Sign Up</Link>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <Link href="/signup/worker" className="text-[#0F172A] font-bold hover:underline">Join as Partner</Link>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-widest"
          >
            <ShieldCheck size={14} className="text-teal-500" />
            SECURE LOGIN BY FEWORK ENGINE
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}