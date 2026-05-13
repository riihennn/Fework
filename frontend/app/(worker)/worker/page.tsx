import React from "react";
import StatsGrid from "@/components/worker/dashboard/StatsGrid";
import RecentJobs from "@/components/worker/dashboard/RecentJobs";
import PerformancePanel from "@/components/worker/dashboard/PerformancePanel";
import { workerApi, WorkerDashboardData } from "@/services/api";
import { headers } from "next/headers";

export default async function WorkerOverview() {
  const headerList = await headers();
  const cookieHeader = headerList.get("cookie");
  
  let data: WorkerDashboardData | null = null;
  let error: string | null = null;

  try {
    data = await workerApi.getDashboard(cookieHeader ? { cookie: cookieHeader } : {});
  } catch (e: any) {
    console.error("Dashboard fetch error:", e);
    error = e.message || "Failed to load dashboard data";
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-100 rounded-[32px] text-rose-600 font-bold">
        {error}. Please make sure you are logged in as a worker.
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-12 max-w-7xl">
      <StatsGrid stats={data.stats} />

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <RecentJobs 
            jobs={data.recentJobs} 
          />
        </div>
        <PerformancePanel performance={data.performance} />
      </div>
    </div>
  );
}
