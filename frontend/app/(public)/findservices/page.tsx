import React from "react";
import {
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Zap,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { workerApi, WorkerPublic } from "@/services/api";
import FilterSidebar from "@/components/search/FilterSidebar";
import SearchHeader from "@/components/search/SearchHeader";
import WorkerCard from "@/components/worker/WorkerCard";
import WorkerList from "@/components/search/WorkerList";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    city?: string;
  }>;
}

export default async function FindServicePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const fetchParams: any = { isAvailable: "true" };
  if (params.category && params.category !== "All") fetchParams.category = params.category;
  if (params.search) fetchParams.search = params.search;
  if (params.city) fetchParams.city = params.city;

  let workers: WorkerPublic[] = [];
  let totalPages = 1;
  let totalWorkers = 0;
  let error: string | null = null;

  try {
    const res = await workerApi.getAll(fetchParams);
    workers = res.workers;
    totalPages = res.pagination.pages;
    totalWorkers = res.pagination.total;
  } catch (e) {
    error = "Failed to load workers. Please try again.";
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#0F172A] selection:bg-teal-100 selection:text-teal-900">


      <div className="flex max-w-[1300px] mx-auto min-h-screen px-4 md:px-6 lg:px-8 gap-6 lg:gap-10">
        <FilterSidebar />

        <main className="flex-1 min-w-0 py-6 md:px-4 lg:px-6 bg-gray-50/30">
          <SearchHeader totalWorkers={totalWorkers} />

          {error && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-600 text-sm font-bold">
              <ShieldCheck size={18} /> {error}
            </div>
          )}

          {!error && (
            <WorkerList
              initialWorkers={workers}
              initialPages={totalPages}
              params={fetchParams}
            />
          )}
        </main>

        <aside className="w-64 border-l border-gray-100 hidden xl:flex flex-col py-6 pl-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <h2 className="text-lg font-black text-[#0F172A] tracking-tight mb-8">Platform Trust</h2>
          <div className="space-y-6 mb-10">
            {[
              { icon: ShieldCheck, title: "Identity Verified", desc: "All pros undergo strict ID verification." },
              { icon: TrendingUp, title: "Quality Control", desc: "Continuous monitoring of service quality." },
              { icon: MessageSquare, title: "24/7 Support", desc: "Our experts are always here to help you." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 shrink-0 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-widest mb-1">{item.title}</h4>
                  <p className="text-gray-400 text-[10px] font-bold leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}

            {/* Pro Benefits Promo Card */}
            <div className="mt-auto bg-gradient-to-br from-teal-50/60 to-teal-50/20 border border-teal-100/30 rounded-[24px] p-5 relative overflow-hidden group">
                  <div className="absolute top-[-20%] right-[-20%] w-28 h-28 bg-teal-500/10 rounded-full blur-2xl transition-all"></div>
                  <span className="inline-block px-2 py-0.5 bg-teal-600 text-white text-[8px] font-black uppercase tracking-widest rounded mb-3">Pro Benefits</span>
                  <h3 className="text-[#0F172A] font-bold text-base mb-1.5">Instant Booking</h3>
                  <p className="text-slate-500 text-[11px] mb-4 leading-relaxed">Book a top-rated pro in under 60 seconds with Fework Instant.</p>
                  <Link href="/membership" className="block w-full py-2.5 bg-[#0F172A] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-800 transition-all text-center">
                    Learn More
                  </Link>
            </div>
          </div>


        </aside>
      </div>

      <footer className="py-12 border-t border-gray-100 text-center bg-gray-50/20">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
          © 2024 FEWORK TECHNOLOGIES. PRECISION MINIMALISM IN HOME SERVICES.
        </p>
      </footer>
    </div>
  );
}