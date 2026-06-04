"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { workerApi } from "@/services/api";
import { useSSE } from "@/hooks/useSSE";
import { IncomingJobAlertStack, IncomingJob } from "@/components/worker/dashboard/IncomingJobAlert";

// Components
import DashboardSidebar from "@/components/worker/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/worker/dashboard/DashboardHeader";
import StatusErrorModal from "@/components/worker/dashboard/StatusErrorModal";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated, isLoading, isSessionRestored } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);
  const [incomingJobs, setIncomingJobs] = useState<IncomingJob[]>([]);
  const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: "" });

  // Derive active section from pathname
  const activeSection = pathname.split("/").pop() || "overview";

  useEffect(() => {
    if (isAuthenticated && user?.role === "worker") {
      workerApi.getDashboard().then(data => {
        setIsAvailable(data.stats.isAvailable);
      }).catch((e) => {
        // Silently ignore expected errors (blocked/pending) — the page handles them
        const msg = (e?.message || "").toLowerCase();
        if (!msg.includes("blocked") && !msg.includes("pending")) {
          console.error("Layout dashboard fetch error:", e);
        }
      });
    }
  }, [isAuthenticated, user]);

  // ── Real-time SSE handlers ──────────────────────────────────
  const handleNewBooking = useCallback((data: { job: IncomingJob }) => {
    setIncomingJobs((prev) => {
      // Don't add duplicates
      if (prev.find((j) => j.id === data.job.id)) return prev;
      return [data.job, ...prev];
    });
  }, []);

  const handleBookingUpdated = useCallback((data: { jobId: string; status: string }) => {
    // Remove from incoming if the worker responded from another tab
    setIncomingJobs((prev) => prev.filter((j) => j.id !== data.jobId));
  }, []);

  const handleWorkerVerified = useCallback(() => {
    // Reload to refresh the dashboard blur/overlay instantly
    window.location.reload();
  }, []);

  const handleUserBlocked = useCallback(async () => {
    // Log out and redirect to login immediately so the worker doesn't get stuck on the dashboard
    await logout();
    router.push("/login?reason=blocked");
  }, [logout, router]);

  useSSE(
    {
      new_booking: handleNewBooking,
      booking_updated: handleBookingUpdated,
      worker_verified: handleWorkerVerified,
      user_blocked: handleUserBlocked,
    },
    { enabled: isAuthenticated && user?.role === "worker" }
  );

  // ── Alert handlers ─────────────────────────────────────────
  const handleResponded = useCallback((jobId: string, status: "accepted" | "cancelled") => {
    setIncomingJobs((prev) => prev.filter((j) => j.id !== jobId));
  }, []);

  const handleDismiss = useCallback((jobId: string) => {
    setIncomingJobs((prev) => prev.filter((j) => j.id !== jobId));
  }, []);

  // ── Other handlers ─────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleToggleAvailability = async () => {
    setTogglingAvailability(true);
    try {
      const res = await workerApi.toggleAvailability();
      setIsAvailable(res.isAvailable);
    } catch (e: any) {
      setErrorModal({ open: true, message: e.message || "Failed to update availability" });
    } finally {
      setTogglingAvailability(false);
    }
  };

  // While session is being restored, show a centered spinner.
  // We wait for isSessionRestored (not just isLoading) so we don't flicker back
  // to the spinner after the persisted store rehydrates from localStorage.
  if (!isSessionRestored || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Session restored and user is NOT authenticated — middleware will redirect, but just in case
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] flex">
      <DashboardSidebar
        user={user}
        activeSection={activeSection}
        isAvailable={isAvailable}
        togglingAvailability={togglingAvailability}
        handleToggleAvailability={handleToggleAvailability}
        handleLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#F8FAFC] lg:ml-72">
        <DashboardHeader
          user={user}
          activeSection={activeSection}
          setSidebarOpen={setSidebarOpen}
          pendingCount={incomingJobs.length}
        />

        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Real-time incoming job alerts — rendered at root so they float above everything */}
      <IncomingJobAlertStack
        jobs={incomingJobs}
        onResponded={handleResponded}
        onDismiss={handleDismiss}
      />

      <StatusErrorModal
        isOpen={errorModal.open}
        message={errorModal.message}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
      />
    </div>
  );
}
