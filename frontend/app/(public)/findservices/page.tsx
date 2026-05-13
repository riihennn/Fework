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
  let error: string | null = null;

  try {
    workers = await workerApi.getAll(fetchParams);
  } catch (e) {
    error = "Failed to load workers. Please try again.";
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#0F172A] selection:bg-teal-100 selection:text-teal-900">


      <div className="flex pt-16 max-w-[1600px] mx-auto min-h-screen">
        <FilterSidebar />

        <main className="flex-1 p-6 md:p-10 lg:px-12 bg-gray-50/30">
          <SearchHeader totalWorkers={workers.length} />

          {error && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-600 text-sm font-bold">
              <ShieldCheck size={18} /> {error}
            </div>
          )}

          {!error && workers.length === 0 && (
            <div className="text-center py-24">
              <UserCircle size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No professionals available right now</p>
              <p className="text-xs text-gray-400 mt-2">Try adjusting your filters or check back soon.</p>
            </div>
          )}

          <div className="space-y-6">
            {workers.map((worker) => (
              <WorkerCard key={worker._id} worker={worker} />
            ))}
          </div>
        </main>

        <aside className="w-80 border-l border-gray-100 hidden xl:flex flex-col p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
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
          </div>

          <div className="bg-[#0F172A] rounded-[32px] p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.1),transparent)]"></div>
            <Zap className="text-teal-400 mx-auto mb-6" size={32} />
            <h3 className="text-white font-black text-xl mb-3">Join as Pro</h3>
            <p className="text-white/40 text-xs font-bold leading-relaxed mb-8">Start your journey with Fework and grow your business.</p>
            <Link href="/signup/worker" className="block w-full py-4 bg-white text-[#0F172A] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
              Get Started
            </Link>
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