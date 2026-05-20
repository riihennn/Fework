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
      className="bg-white rounded-[24px] border border-gray-200 p-5 md:p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group"
    >
      {/* Left side: Avatar and Availability */}
      <div className="flex flex-col items-center gap-4 shrink-0">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#0F172A] bg-gray-50 flex items-center justify-center">
            {worker.user.avatar ? (
              <img
                src={worker.user.avatar}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={worker.user.name}
              />
            ) : (
              <span className="text-4xl font-black text-gray-300">
                d
              </span>
            )}
          </div>
          {/* Verified Badge overlapping the bottom border */}
          <div className="absolute -bottom-2 left-1/2 -translate-y-0.5 -translate-x-1/2 bg-[#0F172A] text-white text-[9px] font-extrabold tracking-wider flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
            <CheckCircle2 size={10} className="fill-white text-[#0F172A]" /> Verified
          </div>
        </div>

        {/* Availability Badge */}
        <div className="flex items-center gap-1.5 bg-[#E8F8F0] text-[#1E7E34] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mt-1">
          <span className="w-1.5 h-1.5 bg-[#28A745] rounded-full animate-pulse" />
          Available Now
        </div>
      </div>

      {/* Middle side: Details */}
      <div className="flex-1 text-center md:text-left flex flex-col justify-center">
        <h3 className="text-2xl font-black text-[#0F172A] capitalize mb-0.5">{worker.user.name}</h3>
        <p className="text-sm font-bold text-gray-500 mb-2">{formatCategory(worker.category)}</p>

        <div className="flex items-center justify-center md:justify-start gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">
          <MapPin size={12} className="text-[#0F172A]" />
          <span>{worker.city?.toUpperCase()}{worker.state ? `, ${worker.state.toUpperCase()}` : ""}</span>
        </div>

        {/* Row of stats */}
        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-4 items-center">
          {/* Rating */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    fill={star <= Math.round(worker.rating ?? 0) ? "currentColor" : "none"}
                    className="text-amber-400"
                  />
                ))}
              </div>
              {worker.rating > 0 ? (
                <span className="text-xs font-black text-[#0F172A] ml-1 flex items-center gap-1">
                  <span>{worker.rating.toFixed(1)}</span>
                  <span className="text-gray-400 font-bold text-[10px]">({worker.totalJobs || 0} jobs)</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-gray-400 ml-1">New</span>
              )}
            </div>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Rating</span>
          </div>

          {/* Experience */}
          <div className="flex flex-col items-center md:items-start border-l border-gray-100 pl-6">
            <span className="text-base font-extrabold text-[#0F172A]">{worker.experience || "0"} Yrs</span>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Experience</span>

          </div>

          {/* Hourly Rate */}
          <div className="flex flex-col items-center md:items-start border-l border-gray-100 pl-6">
            <span className="text-base font-extrabold text-[#0F172A]">₹ {worker.hourlyRate || "0"}</span>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Per Hour</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="w-full md:w-40 flex flex-col gap-3 shrink-0">
        <Link
          href={`/findservices/${worker._id}`}
          className="w-full py-3.5 bg-[#0F172A] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-800 transition-all text-center block"
        >
          Book Now
        </Link>
      </div>
    </motion.div>
  );
}
