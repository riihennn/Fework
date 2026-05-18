
"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShoppingBasket, 
  Wrench, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

function SignupOptions() {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const query = qs ? `?${qs}` : "";

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      <div className="px-6 py-4 md:py-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-0.5">
          Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2"></span>
        </Link>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-4 md:py-6">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-2">Welcome to Fework</h1>
          <p className="text-gray-500 text-base">How would you like to use our platform today?</p>
        </div>

        <div className="max-w-3xl w-full grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Client Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group relative bg-white rounded-[28px] border border-gray-100 p-5 md:p-6 flex flex-col items-center text-center shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all"
          >
            <div className="w-full aspect-[16/10] rounded-[20px] overflow-hidden mb-6 relative">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800" 
                alt="I need help" 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/10 to-transparent"></div>
            </div>

            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-4 shadow-sm">
              <ShoppingBasket size={24} />
            </div>

            <h2 className="text-xl font-bold text-[#0F172A] mb-2">I need help</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed max-w-[240px]">
              Discover top-rated professionals for home services and specialized luxury assistance.
            </p>

            <Link 
              href={`/signup/client${query}`}
              className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 text-sm"
            >
              Continue as Client
            </Link>
          </motion.div>

          {/* Partner Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group relative bg-white rounded-[28px] border border-gray-100 p-5 md:p-6 flex flex-col items-center text-center shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all"
          >
            <div className="w-full aspect-[16/10] rounded-[20px] overflow-hidden mb-6 relative">
              <img 
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800" 
                alt="I want to work" 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/10 to-transparent"></div>
            </div>

            <div className="w-12 h-12 bg-[#F0FDF4] rounded-xl flex items-center justify-center text-teal-600 mb-4 shadow-sm">
              <Wrench size={24} />
            </div>

            <h2 className="text-xl font-bold text-[#0F172A] mb-2">I want to work</h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed max-w-[240px]">
              Join our elite network of service partners and grow your business today.
            </p>

            <Link 
              href={`/signup/worker${query}`}
              className="w-full py-3 bg-white border-2 border-[#0F172A] text-[#0F172A] rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
            >
              Become a Partner
            </Link>
          </motion.div>
        </div>

        <div className="mt-8 md:mt-10 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 font-bold hover:underline">Log in here</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SignupOptions />
    </Suspense>
  );
}
