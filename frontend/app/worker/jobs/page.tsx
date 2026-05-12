"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, MapPin, Clock, X } from "lucide-react";

const mockJobs = [
  { id: 1, client: "Arun Kumar", service: "AC Repair", location: "Kochi", date: "Today, 2:00 PM", status: "pending", amount: 600, phone: "+91 9876543210" },
  { id: 2, client: "Priya Thomas", service: "Plumbing", location: "Kozhikode", date: "Yesterday", status: "completed", amount: 850, phone: "+91 9876543211" },
  { id: 3, client: "Rahul Menon", service: "Electrical Work", location: "Kochi", date: "In Progress", status: "ongoing", amount: 1200, phone: "+91 9876543212" },
  { id: 4, client: "Anitha Raj", service: "Painting", location: "Kochi", date: "3 days ago", status: "cancelled", amount: 0, phone: "+91 9876543213" },
];

export default function WorkerJobs() {
  const [jobs, setJobs] = React.useState(mockJobs);
  const [processingId, setProcessingId] = React.useState<number | null>(null);

  const handleAction = (id: number, action: 'accept' | 'decline') => {
    setProcessingId(id);
    // Simulate API call
    setTimeout(() => {
      setJobs(prev => prev.map(job => 
        job.id === id 
          ? { ...job, status: action === 'accept' ? 'ongoing' : 'cancelled' } 
          : job
      ));
      setProcessingId(null);
    }, 800);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-teal-600 bg-teal-50 border-teal-100";
      case "pending": return "text-amber-600 bg-amber-50 border-amber-100";
      case "ongoing": return "text-blue-600 bg-blue-50 border-blue-100";
      case "cancelled": return "text-rose-500 bg-rose-50 border-rose-100";
      default: return "text-gray-500 bg-gray-50 border-gray-100";
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl">
      <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Active Assignments</h2>
            <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">Manage and track your service requests</p>
          </div>
          <div className="flex gap-2">
            {["All", "Pending", "Active", "History"].map(filter => (
              <button key={filter} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'All' ? 'bg-[#0F172A] text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-400 hover:text-[#0F172A]'}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="group relative bg-white rounded-[32px] border border-gray-100 p-8 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-[24px] bg-gray-50 border border-gray-100 flex items-center justify-center text-[#0F172A] shadow-sm group-hover:scale-105 transition-transform duration-500">
                    <User size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-black text-[#0F172A] text-lg tracking-tight">{job.client}</h3>
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${statusColor(job.status)}`}>
                        {job.status === 'ongoing' ? 'In Progress' : job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-black uppercase tracking-widest">
                        <MapPin size={14} className="text-teal-500" /> {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 font-black uppercase tracking-widest">
                        <Clock size={14} className="text-teal-500" /> {job.date}
                      </div>
                      <div className="text-[11px] text-teal-600 font-black uppercase tracking-widest">
                        {job.service}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-8 pl-20 lg:pl-0 border-t lg:border-t-0 pt-6 lg:pt-0 border-gray-50">
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#0F172A] tracking-tighter">₹{job.amount}</div>
                    <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">Payout Amount</div>
                  </div>

                  <div className="flex items-center gap-3">
                    {job.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleAction(job.id, 'accept')}
                          disabled={processingId === job.id}
                          className="h-14 px-8 bg-[#0F172A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-600 transition-all active:scale-95 shadow-xl shadow-gray-200 disabled:opacity-50"
                        >
                          {processingId === job.id ? 'Processing...' : 'Accept Job'}
                        </button>
                        <button 
                          onClick={() => handleAction(job.id, 'decline')}
                          disabled={processingId === job.id}
                          className="h-14 w-14 flex items-center justify-center bg-rose-50 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <button className="h-14 px-8 bg-gray-50 border border-gray-100 text-[#0F172A] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
