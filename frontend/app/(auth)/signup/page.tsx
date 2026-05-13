
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShoppingBasket, 
  Wrench, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <div className="px-6 py-8 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-0.5">
          Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2"></span>
        </Link>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center px-6 py-8 md:py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">Welcome to Fework</h1>
          <p className="text-gray-500 text-lg">How would you like to use our platform today?</p>
        </div>

        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 md:gap-10">
          {/* Client Card */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group relative bg-white rounded-[32px] border border-gray-100 p-6 flex flex-col items-center text-center shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all"
          >
            <div className="w-full aspect-[16/10] rounded-[24px] overflow-hidden mb-8 relative">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800" 
                alt="I need help" 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/10 to-transparent"></div>
            </div>

            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 mb-6 shadow-sm">
              <ShoppingBasket size={24} />
            </div>

            <h2 className="text-2xl font-bold text-[#0F172A] mb-3">I need help</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-[240px]">
              Discover top-rated professionals for home services and specialized luxury assistance.
            </p>

            <Link 
              href="/signup/client" 
              className="w-full py-3.5 bg-[#0F172A] text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 text-sm"
            >
              Continue as Client
            </Link>
          </motion.div>

          {/* Partner Card */}
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group relative bg-white rounded-[32px] border border-gray-100 p-6 flex flex-col items-center text-center shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all"
          >
            <div className="w-full aspect-[16/10] rounded-[24px] overflow-hidden mb-8 relative">
              <img 
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800" 
                alt="I want to work" 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/10 to-transparent"></div>
            </div>

            <div className="w-12 h-12 bg-[#F0FDF4] rounded-xl flex items-center justify-center text-teal-600 mb-6 shadow-sm">
              <Wrench size={24} />
            </div>

            <h2 className="text-2xl font-bold text-[#0F172A] mb-3">I want to work</h2>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-[240px]">
              Join our elite network of service partners and grow your business today.
            </p>

            <Link 
              href="/signup/worker" 
              className="w-full py-3.5 bg-white border-2 border-[#0F172A] text-[#0F172A] rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
            >
              Become a Partner
            </Link>
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 font-bold hover:underline">Log in here</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
