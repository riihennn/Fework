"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, MapPin, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { WorkerPublic } from "@/services/api";

export default function WorkerCard({ worker }: { worker: WorkerPublic }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-[40px] border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-10 items-center shadow-[0_15px_40px_rgba(0,0,0,0.02)] relative group overflow-hidden"
    >
      {/* Avatar */}
      <div className="relative">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] overflow-hidden ring-8 ring-gray-50 bg-gray-100 flex items-center justify-center">
          {worker.user.avatar ? (
            <img src={worker.user.avatar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={worker.user.name} />
          ) : (
            <span className="text-4xl font-black text-gray-300">
              {worker.user.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow" title="Online" />
      </div>

      {/* Info */}
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
          <h3 className="text-2xl font-black text-[#0F172A]">{worker.user.name}</h3>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="flex items-center gap-1 text-[9px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-md">
              <CheckCircle2 size={12} /> Verified
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <MapPin size={12} /> {worker.city}{worker.state ? `, ${worker.state}` : ""}
            </div>
          </div>
        </div>

        {worker.bio && (
          <p className="text-sm text-gray-400 mb-4 max-w-md">{worker.bio}</p>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 font-black text-lg">
              <Star size={16} fill="currentColor" /> {worker.rating > 0 ? worker.rating.toFixed(1) : "New"}
            </div>
            <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{worker.totalJobs} Jobs Done</div>
          </div>
          <div className="text-center md:text-left border-x border-gray-100">
            <div className="text-lg font-black text-[#0F172A] capitalize">{worker.experience || "—"} yrs</div>
            <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Experience</div>
          </div>
          <div className="text-center md:text-left">
            <div className="text-lg font-black text-[#0F172A] flex items-center justify-center md:justify-start gap-0.5">
              <span className="text-xs text-gray-300">₹</span>{worker.hourlyRate || "—"}
            </div>
            <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Per Hour</div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center md:justify-start gap-2">
          <span className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-xl text-[10px] font-bold uppercase tracking-wider capitalize">
            {worker.category}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full md:w-56 flex flex-col gap-3">
        <Link
          href={`/findservices/${worker._id}`}
          className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 text-center block"
        >
          Book Now
        </Link>
        <Link
          href={`/findservices/${worker._id}`}
          className="w-full py-4 border-2 border-gray-100 text-[#0F172A] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all text-center block"
        >
          View Profile
        </Link>
        <div className="flex items-center justify-center gap-1.5 text-teal-600 font-black text-[9px] uppercase tracking-widest mt-2">
          <Clock size={12} /> Available Now
        </div>
      </div>
    </motion.div>
  );
}
