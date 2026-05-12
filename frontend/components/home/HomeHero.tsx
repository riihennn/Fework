"use client";

import React from "react";
import { motion } from "framer-motion";
import HeroSearch from "@/components/HeroSearch";
import { useRouter } from "next/navigation";

export default function HomeHero() {
  const router = useRouter();
  const navigateSearch = (term: string) => router.push(`/findservices?search=${encodeURIComponent(term)}`);

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px] pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8">
              The Future of Home Services
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-[#0F172A] tracking-tight mb-8 leading-[1.1]">
              Precision Professionals <br />
              <span className="text-teal-500">On-Demand.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with vetted, high-performance experts in under 60 seconds. 
              The premium standard for modern home maintenance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <HeroSearch />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 text-gray-400 text-xs font-bold uppercase tracking-widest"
          >
            <span className="text-gray-300">Popular:</span>
            {["Electrician", "House Cleaning", "AC Repair", "Plumber"].map(term => (
              <button
                key={term}
                onClick={() => navigateSearch(term)}
                className="hover:text-[#0F172A] transition-colors border-b border-transparent hover:border-gray-200 pb-0.5"
              >
                {term}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
