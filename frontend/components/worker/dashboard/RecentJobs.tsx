"use client";

import React from "react";
import { User, MapPin, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  client: string;
  service: string;
  location: string;
  date: string;
  status: string;
  amount: number;
}

interface RecentJobsProps {
  jobs: Job[];
}

export default function RecentJobs({ jobs }: RecentJobsProps) {
  const statusColor = (status: string) => {
    if (status === "completed" || status === "accepted") return "text-teal-600 bg-teal-50 border-teal-100";
    if (status === "pending" || status === "in_progress") return "text-amber-600 bg-amber-50 border-amber-100";
    if (status === "cancelled") return "text-rose-500 bg-rose-50 border-rose-100";
    return "text-gray-500 bg-gray-50 border-gray-100";
  };

  return (
    <div className="bg-white rounded-[24px] md:rounded-[40px] border border-gray-100 p-5 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">Recent Activity</h2>
          <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Live tracking of your latest jobs</p>
        </div>
        <Link
          href="/worker/jobs"
          className="px-6 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] font-black text-[#0F172A] uppercase tracking-widest hover:bg-[#0F172A] hover:text-white transition-all shadow-sm flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto"
        >
          View Full History <ArrowUpRight size={14} />
        </Link>
      </div>
      
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 p-4 md:p-6 rounded-[20px] md:rounded-[28px] border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#0F172A] shadow-sm group-hover:scale-110 transition-transform duration-500">
                <User size={24} />
              </div>
              <div>
                <div className="font-black text-[#0F172A] text-[15px] tracking-tight">{job.client}</div>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-black uppercase tracking-widest mt-1">
                  <span className="text-teal-600">{job.service}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-8 pl-20 md:pl-0">
              <div className="text-[11px] text-gray-400 font-black uppercase tracking-[0.1em] flex items-center gap-2">
                <Clock size={14} className="text-teal-500" /> {new Date(job.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {new Date(job.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              {job.amount > 0 && (
                <div className="text-lg font-black text-[#0F172A] tracking-tight">₹{job.amount}</div>
              )}
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${statusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
