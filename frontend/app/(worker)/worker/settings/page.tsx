"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function WorkerSettings() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
      <div className="bg-white rounded-[40px] border border-gray-100 p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-10">
        <div>
          <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">Account Preferences</h2>
          <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-2">Manage your profile and credentials</p>
        </div>

        <div className="space-y-6">
          {[
            { label: "Public Display Name", value: user?.name || "", type: "text", placeholder: "Your name" },
            { label: "Business Email", value: user?.email || "", type: "email", placeholder: "your@email.com" },
          ].map((field) => (
            <div key={field.label} className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{field.label}</label>
              <input
                type={field.type}
                defaultValue={field.value}
                placeholder={field.placeholder}
                className="w-full h-16 px-6 rounded-[24px] bg-gray-50 border border-gray-100 text-[15px] font-black text-[#0F172A] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all shadow-sm"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button className="flex-1 h-16 bg-[#0F172A] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-[0.98]">
            Save Changes
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 h-16 bg-rose-50 text-rose-500 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-100 transition-all active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
}
