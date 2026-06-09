"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, MapPin, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { WorkerPublic } from "@/services/api";

export default function WorkerCard({ worker }: { worker: WorkerPublic }) {
  const formatCategory = (cat?: string) => {
    if (!cat) return "Partner";
    return cat.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-[24px] border border-gray-200 p-4 md:p-6 flex flex-col md:flex-row gap-5 md:gap-6 items-start md:items-center justify-between shadow-sm relative group"
    >
      <div className="flex flex-col md:flex-row gap-5 md:gap-6 w-full flex-1">
        
        {/* Top/Left: Avatar + Info */}
        <div className="flex gap-4 items-center md:items-start md:w-1/3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[3px] border-[#0F172A] bg-gray-50 flex items-center justify-center">
              {worker.user.avatar ? (
                <img src={worker.user.avatar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={worker.user.name} />
              ) : (
                <span className="text-3xl md:text-4xl font-black text-gray-300">
                  {worker.user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[9px] font-extrabold tracking-wider flex items-center gap-1 px-2.5 py-0.5 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
              <CheckCircle2 size={10} className="fill-white text-[#0F172A]" /> Verified
            </div>
          </div>

          {/* Info (Name, Category, Location) */}
          <div className="flex flex-col justify-center md:mt-2">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3 className="text-lg md:text-2xl font-black text-[#0F172A] capitalize leading-tight">{worker.user.name}</h3>
              {worker.isElite && (
                <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Elite</span>
                </div>
              )}
            </div>
            <p className="text-xs md:text-sm font-bold text-gray-500 mb-1.5">{formatCategory(worker.category)}</p>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <MapPin size={12} className="text-[#0F172A]" />
              <span>{worker.city?.toUpperCase()}{worker.state ? `, ${worker.state.toUpperCase()}` : ""}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between md:justify-start gap-2 md:gap-8 bg-gray-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none w-full md:w-auto md:flex-1 md:ml-6 self-center">
          {/* Rating */}
          <div className="flex flex-col items-center md:items-start flex-1 md:flex-none">
            <div className="flex items-center gap-1 text-amber-400 mb-1">
              <Star size={14} fill="currentColor" className="text-amber-400" />
              {worker.rating > 0 ? (
                <span className="text-xs font-black text-[#0F172A] flex items-center gap-1">
                  <span>{worker.rating.toFixed(1)}</span>
                  <span className="text-gray-400 font-bold text-[10px]">({worker.totalJobs || 0})</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-gray-400">New</span>
              )}
            </div>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Rating</span>
          </div>

          <div className="w-px h-8 bg-gray-200 md:bg-gray-100"></div>

          {/* Experience */}
          <div className="flex flex-col items-center md:items-start flex-1 md:flex-none">
            <span className="text-sm md:text-[15px] font-extrabold text-[#0F172A] md:text-gray-400 mb-0.5">{worker.experience || "0"} Yrs</span>
            <span className="text-[9px] text-gray-400 uppercase tracking-widest">Experience</span>
          </div>

          <div className="w-px h-8 bg-gray-200 md:bg-gray-100"></div>

          {/* Hourly Rate */}
          <div className="flex flex-col items-center md:items-start flex-1 md:flex-none">
            <span className="text-sm md:text-[18px] font-extrabold text-[#0F172A] mb-0.5">₹ {worker.hourlyRate || "0"}</span>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Per Hour</span>
          </div>
        </div>

      </div>

      {/* Right side: Actions */}
      <div className="w-full md:w-40 shrink-0">
        <Link
          href={`/findservices/${worker._id}`}
          className="w-full py-3.5 bg-[#0F172A] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-800 transition-all text-center block shadow-sm hover:shadow-md"
        >
          Book Now
        </Link>
      </div>
    </motion.div>
  );
}
