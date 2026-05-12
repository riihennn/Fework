"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Award } from "lucide-react";

export default function PerformancePanel() {
  return (
    <div className="space-y-8">
      <div className="bg-[#0F172A] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
        <h3 className="text-xl font-black mb-6 tracking-tight">Performance Summary</h3>
        <div className="space-y-6">
          {[
            { label: "Profile Completion", val: 85, color: "bg-teal-500" },
            { label: "Client Satisfaction", val: 96, color: "bg-blue-500" },
            { label: "On-time Arrival", val: 92, color: "bg-amber-500" },
          ].map((p, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
                <span>{p.label}</span>
                <span>{p.val}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${p.val}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={`h-full ${p.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="space-y-4">
        {[
          { icon: Shield, title: "Identity Verified", desc: "Your KYC is complete", color: "bg-teal-50 text-teal-600 border-teal-100" },
          { icon: Award, title: "Elite Worker", desc: "Top 5% performer", color: "bg-blue-50 text-blue-600 border-blue-100" },
        ].map((badge, i) => (
          <div key={i} className={`p-6 rounded-[28px] border flex items-center gap-5 ${badge.color} shadow-sm`}>
            <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center shadow-sm">
              <badge.icon size={22} />
            </div>
            <div>
              <div className="text-xs font-black text-[#0F172A] uppercase tracking-widest">{badge.title}</div>
              <p className="text-[10px] opacity-60 font-bold mt-1">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
