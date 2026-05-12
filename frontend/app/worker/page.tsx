"use client";

import React from "react";
import { motion } from "framer-motion";
import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentJobs from "@/components/dashboard/RecentJobs";
import PerformancePanel from "@/components/dashboard/PerformancePanel";

const mockJobs = [
  { id: 1, client: "Arun Kumar", service: "AC Repair", location: "Kochi", date: "Today, 2:00 PM", status: "pending", amount: 600 },
  { id: 2, client: "Priya Thomas", service: "Plumbing", location: "Kozhikode", date: "Yesterday", status: "completed", amount: 850 },
  { id: 3, client: "Rahul Menon", service: "Electrical Work", location: "Kochi", date: "2 days ago", status: "completed", amount: 1200 },
  { id: 4, client: "Anitha Raj", service: "Painting", location: "Kochi", date: "3 days ago", status: "cancelled", amount: 0 },
];

export default function WorkerOverview() {
  const statusColor = (status: string) => {
    if (status === "completed") return "text-teal-600 bg-teal-50 border-teal-100";
    if (status === "pending") return "text-amber-600 bg-amber-50 border-amber-100";
    if (status === "cancelled") return "text-rose-500 bg-rose-50 border-rose-100";
    return "text-gray-500 bg-gray-50 border-gray-100";
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-7xl">
      <StatsGrid />

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <RecentJobs 
            jobs={mockJobs} 
            statusColor={statusColor} 
            onViewAll={() => window.location.href = "/worker/jobs"} 
          />
        </div>
        <PerformancePanel />
      </div>
    </motion.div>
  );
}
