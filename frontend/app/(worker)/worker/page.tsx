import React from "react";
import StatsGrid from "@/components/worker/dashboard/StatsGrid";
import RecentJobs from "@/components/worker/dashboard/RecentJobs";
import PerformancePanel from "@/components/worker/dashboard/PerformancePanel";
import { workerApi, WorkerDashboardData } from "@/services/api";
import { headers } from "next/headers";
import { Clock, ShieldAlert, Ban } from "lucide-react";

export default async function WorkerOverview() {
  const headerList = await headers();
  const cookieHeader = headerList.get("cookie");
  
  let data: WorkerDashboardData | null = null;
  let error: string | null = null;

  try {
    data = await workerApi.getDashboard(cookieHeader ? { cookie: cookieHeader } : {});
  } catch (e: any) {
    error = e.message || "Failed to load dashboard data";
    // Only log truly unexpected errors, not handled cases like blocked accounts
    const isExpected = error.toLowerCase().includes("blocked") || error.toLowerCase().includes("pending");
    if (!isExpected) console.error("Dashboard fetch error:", e);
  }

  const isBlocked = error?.toLowerCase().includes("blocked");

  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/60 backdrop-blur-md">
        <div className="bg-white max-w-lg w-full p-10 rounded-[32px] shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-rose-50 p-5 rounded-full mb-6 border border-rose-100 shadow-inner">
            <Ban size={48} className="text-rose-500" />
          </div>
          <h2 className="text-3xl font-black text-[#0F172A] mb-4">Account Blocked</h2>
          <p className="text-gray-500 font-medium leading-relaxed mb-8">
            Your account has been blocked by the admin. Please contact support if you believe this is a mistake.
          </p>
          <div className="w-full flex flex-col gap-3">
            <a href="mailto:support@fework.com" className="block w-full py-4 bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-md">
              Contact Support
            </a>
            <a href="/login" className="block w-full py-3 text-gray-500 rounded-2xl font-bold hover:text-gray-700 transition-all text-sm">
              Sign out
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-100 rounded-[32px] text-rose-600 font-bold">
        {error}. Please make sure you are logged in as a worker.
      </div>
    );
  }

  if (!data) return null;

  const isNotApproved = data.verificationStatus !== "approved";

  return (
    <div className="relative max-w-7xl">
      {isNotApproved && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/60 backdrop-blur-md">
          {data.verificationStatus === "pending" ? (
            <div className="bg-white max-w-lg w-full p-10 rounded-[32px] shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
              <div className="bg-amber-50 p-5 rounded-full mb-6 border border-amber-100 shadow-inner">
                <Clock size={48} className="text-amber-500" />
              </div>
              <h2 className="text-3xl font-black text-[#0F172A] mb-4">Profile Under Review</h2>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                Your profile is currently pending approval by our admin team. You will be able to receive jobs and go online once your account is verified.
              </p>
              <div className="w-full flex items-center justify-center">
                <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm w-full text-center">
                  Please check back later
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white max-w-lg w-full p-10 rounded-[32px] shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
              <div className="bg-rose-50 p-5 rounded-full mb-6 border border-rose-100 shadow-inner">
                <ShieldAlert size={48} className="text-rose-500" />
              </div>
              <h2 className="text-3xl font-black text-[#0F172A] mb-4">Verification Rejected</h2>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                Your profile has been rejected. Please review your details in the settings tab and ensure your ID proof is valid.
              </p>
              <div className="w-full">
                <a href="/worker/settings" className="block w-full py-4 bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-md">
                  Update Profile Details
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`space-y-12 transition-all duration-500 ${isNotApproved ? "opacity-30 pointer-events-none select-none blur-[4px] grayscale-[0.5]" : ""}`}>
        <StatsGrid stats={data.stats} />

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <RecentJobs jobs={data.recentJobs} />
          </div>
          <PerformancePanel performance={data.performance} />
        </div>
      </div>
    </div>
  );
}
