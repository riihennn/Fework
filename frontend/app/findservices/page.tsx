"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Zap,
  Clock,
  Loader2,
  AlertCircle,
  UserCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { workerApi, WorkerPublic } from "@/services/api";

const categories = [
  "All",
  "plumber",
  "electrician",
  "ac",
  "cleaner",
  "painter",
  "carpenter",
  "mechanic",
  "mason",
];

export default function FindServicePage() {
  const [workers, setWorkers] = useState<WorkerPublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const fetchWorkers = async () => {
    try {
      setIsLoading(true);
      const params: any = { isAvailable: "true" };
      if (activeCategory !== "All") params.category = activeCategory;
      if (searchQuery) params.search = searchQuery;
      if (locationQuery) params.city = locationQuery;

      const data = await workerApi.getAll(params);
      setWorkers(data);
    } catch {
      setError("Failed to load workers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [activeCategory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchWorkers();
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#0F172A] selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <div className="flex pt-16 max-w-[1600px] mx-auto min-h-screen">
        {/* Left Sidebar: Filters */}
        <aside className="w-72 border-r border-gray-100 hidden lg:flex flex-col p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Filter by Category</h2>
          <div className="space-y-1 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm capitalize ${
                  activeCategory === cat
                    ? "bg-[#0F172A] text-white shadow-lg shadow-gray-200"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#0F172A]"
                }`}
              >
                {cat === "All" ? "All Professionals" : cat}
                <ChevronRight size={14} className={activeCategory === cat ? "opacity-100" : "opacity-0"} />
              </button>
            ))}
          </div>

          {/* Featured Perk */}
          <div className="mt-auto bg-teal-50 rounded-[24px] p-6 relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-teal-500/10 rounded-full blur-2xl transition-all"></div>
            <span className="inline-block px-2 py-1 bg-teal-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md mb-4">Pro Benefits</span>
            <h3 className="text-[#0F172A] font-bold text-lg mb-2">Instant Booking</h3>
            <p className="text-gray-500 text-xs mb-6 leading-relaxed">Book a top-rated pro in under 60 seconds with Fework Instant.</p>
            <button className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all">
              Learn More
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10 lg:px-12 bg-gray-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Find Professionals</h1>
              <p className="text-gray-400 text-sm font-medium">
                {isLoading ? "Loading..." : `${workers.length} available professionals near you`}
              </p>
            </div>
            <div className="flex-1 flex flex-col md:flex-row items-center bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
              {/* What */}
              <div className="flex-1 flex items-center relative group w-full border-b md:border-b-0 md:border-r border-gray-100">
                <Search className="absolute left-4 text-gray-300 group-focus-within:text-teal-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="What: Skill, job title, or name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-14 pl-12 pr-4 bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
              {/* Where */}
              <div className="flex-1 flex items-center relative group w-full">
                <MapPin className="absolute left-4 text-gray-300 group-focus-within:text-teal-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Where: City in Kerala"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-14 pl-12 pr-4 bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
              <button
                onClick={fetchWorkers}
                className="hidden md:flex h-14 px-8 bg-[#0F172A] text-white text-sm font-black uppercase tracking-widest items-center justify-center hover:bg-gray-800 transition-all"
              >
                Find
              </button>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-teal-500" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-600 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* No workers online */}
          {!isLoading && !error && workers.length === 0 && (
            <div className="text-center py-24">
              <UserCircle size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No professionals available right now</p>
              <p className="text-xs text-gray-400 mt-2">Check back soon — workers go online throughout the day</p>
            </div>
          )}

          {/* Workers Grid */}
          <div className="space-y-6">
            {workers.map((worker) => (
              <motion.div
                key={worker._id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-[40px] border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-10 items-center shadow-[0_15px_40px_rgba(0,0,0,0.02)] relative group overflow-hidden"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[32px] overflow-hidden ring-8 ring-gray-50 bg-gray-100 flex items-center justify-center">
                    {worker.user.avatar ? (
                      <img src={worker.user.avatar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={worker.user.name} />
                    ) : (
                      <span className="text-4xl font-black text-gray-300">
                        {worker.user.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow" title="Online" />
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                    <h3 className="text-2xl font-black text-[#0F172A]">{worker.user.name}</h3>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <div className="flex items-center gap-1 text-[9px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-md">
                        <CheckCircle2 size={12} /> Verified
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={12} /> {worker.city}{worker.state ? `, ${worker.state}` : ""}
                      </div>
                    </div>
                  </div>

                  {worker.bio && (
                    <p className="text-sm text-gray-400 mb-4 max-w-md">{worker.bio}</p>
                  )}

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 font-black text-lg">
                        <Star size={16} fill="currentColor" /> {worker.rating > 0 ? worker.rating.toFixed(1) : "New"}
                      </div>
                      <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{worker.totalJobs} Jobs Done</div>
                    </div>
                    <div className="text-center md:text-left border-x border-gray-100">
                      <div className="text-lg font-black text-[#0F172A] capitalize">{worker.experience || "—"} yrs</div>
                      <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Experience</div>
                    </div>
                    <div className="text-center md:text-left">
                      <div className="text-lg font-black text-[#0F172A] flex items-center justify-center md:justify-start gap-0.5">
                        <span className="text-xs text-gray-300">₹</span>{worker.hourlyRate || "—"}
                      </div>
                      <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Per Hour</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-xl text-[10px] font-bold uppercase tracking-wider capitalize">
                      {worker.category}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full md:w-56 flex flex-col gap-3">
                  <Link
                    href={`/findservices/${worker._id}`}
                    className="w-full py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 text-center block"
                  >
                    Book Now
                  </Link>
                  <Link
                    href={`/findservices/${worker._id}`}
                    className="w-full py-4 border-2 border-gray-100 text-[#0F172A] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all text-center block"
                  >
                    View Profile
                  </Link>
                  <div className="flex items-center justify-center gap-1.5 text-teal-600 font-black text-[9px] uppercase tracking-widest mt-2">
                    <Clock size={12} /> Available Now
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
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