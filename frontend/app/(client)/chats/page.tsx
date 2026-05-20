"use client";

import React from "react";
import { MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ClientChatsPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white border border-slate-100 rounded-[32px] p-8 md:p-12 shadow-[0_15px_40px_rgba(15,23,42,0.03)] flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-8">
          <MessageSquare size={28} />
        </div>

        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mb-3">
          Chats Coming Soon
        </h1>

        <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8">
          Connect directly and chat with Fework Pros in real-time. We are rolling out our instant messaging service very soon.
        </p>

        <Link
          href="/findservices"
          className="w-full py-4 bg-[#0F172A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={12} />
          Back to Find Services
        </Link>
      </motion.div>
    </div>
  );
}
