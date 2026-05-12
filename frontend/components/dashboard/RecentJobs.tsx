"use client";

import React from "react";
import { User, MapPin, Clock } from "lucide-react";

interface Job {
  id: number;
  client: string;
  service: string;
  location: string;
  date: string;
  status: string;
  amount: number;
}

interface RecentJobsProps {
  jobs: Job[];
  statusColor: (status: string) => string;
  onViewAll: () => void;
}

export default function RecentJobs({ jobs, statusColor, onViewAll }: RecentJobsProps) {
  return (
    <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Recent Activity</h2>
          <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Live tracking of your latest jobs</p>
        </div>
        <button
          onClick={onViewAll}
          className="px-6 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] font-black text-[#0F172A] uppercase tracking-widest hover:bg-[#0F172A] hover:text-white transition-all shadow-sm"
        >
          View Full History
        </button>
      </div>
      
      <div className="space-y-3">
        {jobs.map((job) => (
          <div key={job.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[28px] border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all group">
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
                <Clock size={14} className="text-teal-500" /> {job.date}
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
