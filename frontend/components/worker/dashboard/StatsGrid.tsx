"use client";

import React from "react";
import { motion } from "framer-motion";
import { DollarSign, Briefcase, Star, Zap } from "lucide-react";

interface StatsGridProps {
  stats: {
    totalEarnings: number;
    jobsCompleted: number;
    rating: number;
    responseRate: number;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const displayStats = [
    { label: "Total Earnings", value: `₹${stats.totalEarnings.toLocaleString()}`, change: "+12%", icon: DollarSign, color: "text-teal-600 bg-teal-50" },
    { label: "Jobs Completed", value: stats.jobsCompleted.toString(), change: "+2", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
    { label: "Avg. Rating", value: stats.rating.toString(), change: "+0.1", icon: Star, color: "text-amber-600 bg-amber-50" },
    { label: "Response Rate", value: `${stats.responseRate}%`, change: "stable", icon: Zap, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
      {displayStats.map((stat, i) => (
        <motion.div 
          key={i} 
          whileHover={{ y: -4 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-100 p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500"
        >
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 ${stat.color} transition-transform duration-500`}>
            <stat.icon className="w-5 h-5 md:w-[22px] md:h-[22px]" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight mb-1 truncate">{stat.value}</div>
          <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">{stat.label}</div>
          <div className="flex flex-col xl:flex-row xl:items-center gap-1 xl:gap-1.5 mt-3 md:mt-4">
            <span className="text-[10px] md:text-[11px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full inline-block w-fit">{stat.change}</span>
            <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden sm:inline-block">Growth</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
