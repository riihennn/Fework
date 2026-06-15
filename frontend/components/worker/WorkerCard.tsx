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
      className="bg-white rounded-[24px] border border-gray-200 p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-stretch md:items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.02)] relative group"
    >
      <div className="flex flex-row gap-4 md:gap-6 w-full flex-1">
        {/* Left side: Avatar */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-[2px] md:border-[3px] border-[#0F172A] bg-gray-50 flex items-center justify-center">
              {worker.user.avatar ? (
                <img
                  src={worker.user.avatar}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={worker.user.name}
                />
              ) : (
                <span className="text-2xl md:text-4xl font-black text-gray-300">
                  {worker.user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Verified Badge overlapping the bottom border */}
            <div className="absolute -bottom-2 left-1/2 -translate-y-0.5 -translate-x-1/2 bg-[#0F172A] text-white text-[8px] md:text-[9px] font-extrabold tracking-wider flex items-center gap-1 px-2 md:px-3 py-0.5 md:py-1 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
              <CheckCircle2 size={10} className="fill-white text-[#0F172A] w-2.5 h-2.5 md:w-3 md:h-3" /> 
              <span>Verified</span>
            </div>
          </div>

          {/* Invisible spacer to perfectly maintain the card structure */}
          <div className="hidden md:flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 mt-1 invisible pointer-events-none select-none">
            <span className="w-1.5 h-1.5 rounded-full" />
            Available Now
          </div>
        </div>

        {/* Middle side: Details */}
        <div className="flex-1 flex flex-col justify-center text-left">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <h3 className="text-lg md:text-2xl font-black text-[#0F172A] capitalize leading-tight">{worker.user.name}</h3>
            {worker.isElite && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 md:px-2 py-0.5 rounded-md border border-amber-200 mt-0.5 md:mt-0">
                <Star size={10} className="fill-amber-500 text-amber-500" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Elite</span>
              </div>
            )}
          </div>
          <p className="text-xs md:text-sm font-bold text-gray-500 mb-1.5 md:mb-2">{formatCategory(worker.category)}</p>

          <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3 md:mb-6">
            <MapPin size={12} className="text-[#0F172A]" />
            <span>{worker.city?.toUpperCase()}{worker.state ? `, ${worker.state.toUpperCase()}` : ""}</span>
          </div>

          {/* Row of stats */}
          <div className="flex flex-wrap gap-x-3 md:gap-x-6 gap-y-2 md:gap-y-4 items-center">
            {/* Rating */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1 md:gap-1.5 text-amber-400 mb-0.5 md:mb-1">
                <div className="flex items-center gap-0.5">
                  <Star size={12} className="fill-amber-400 text-amber-400 md:hidden" />
                  <div className="hidden md:flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        fill={star <= Math.round(worker.rating ?? 0) ? "currentColor" : "none"}
                        className="text-amber-400"
                      />
                    ))}
                  </div>
                </div>
                {worker.rating > 0 ? (
                  <span className="text-[11px] md:text-xs font-black text-[#0F172A] ml-0.5 flex items-center gap-1">
                    <span>{worker.rating.toFixed(1)}</span>
                    <span className="text-gray-400 font-bold text-[9px] md:text-[10px]">({worker.totalJobs || 0} jobs)</span>
                  </span>
                ) : (
                  <span className="text-[11px] md:text-xs font-bold text-gray-400 ml-0.5">New</span>
                )}
              </div>
              <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest">Rating</span>
            </div>

            {/* Experience */}
            <div className="flex flex-col items-start border-l border-gray-100 pl-3 md:pl-6">
              <span className="text-[13px] md:text-[15px] font-extrabold text-gray-400 leading-tight md:leading-normal">{worker.experience || "0"} Yrs</span>
              <span className="text-[8px] md:text-[9px] text-gray-400 uppercase tracking-widest mt-0.5 md:mt-0">Experience</span>
            </div>

            {/* Hourly Rate */}
            <div className="flex flex-col items-start border-l border-gray-100 pl-3 md:pl-6">
              <span className="text-[13px] md:text-[20px] font-extrabold text-[#0F172A] leading-tight md:leading-normal">₹ {worker.hourlyRate || "0"}</span>
              <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5 md:mt-0">Per Hour</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="w-full md:w-40 flex flex-col shrink-0 mt-3 md:mt-0">
        <Link
          href={`/findservices/${worker._id}`}
          className="w-full py-3 md:py-3.5 bg-[#0F172A] text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-800 transition-all text-center block shadow-sm hover:shadow-md"
        >
          Book Now
        </Link>
      </div>
    </motion.div>
  );
}

