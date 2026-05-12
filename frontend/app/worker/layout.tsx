"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { workerApi } from "@/services/api";

// Components
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated, restoreSession } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  // Derive active section from pathname
  const activeSection = pathname.split("/").pop() || "overview";

  useEffect(() => {
    if (!isAuthenticated) {
      restoreSession().catch(() => router.push("/login"));
    }
  }, [isAuthenticated, restoreSession, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleToggleAvailability = async () => {
    setTogglingAvailability(true);
    try {
      const res = await workerApi.toggleAvailability();
      setIsAvailable(res.isAvailable);
    } catch {
      // ignore
    } finally {
      setTogglingAvailability(false);
    }
  };

  if (!isAuthenticated && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] flex">
      <DashboardSidebar 
        user={user}
        activeSection={activeSection}
        setActiveSection={(id) => router.push(`/worker/${id === 'overview' ? '' : id}`)}
        isAvailable={isAvailable}
        togglingAvailability={togglingAvailability}
        handleToggleAvailability={handleToggleAvailability}
        handleLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#F8FAFC]">
        <DashboardHeader 
          user={user}
          activeSection={activeSection}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
