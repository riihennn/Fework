"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Search, SlidersHorizontal } from "lucide-react";

const categories = [
  "All",
  "Electrician",
  "Plumber",
  "AC Technician",
  "TV Repair Technician",
  "Refrigerator Technician",
  "Washing Machine Technician",
  "Water Purifier Technician",
  "Generator Technician",
  "CCTV Installer",
  "Solar Panel Technician",
  "Internet/WiFi Technician",
  "Mobile Repair Technician",
  "Computer Technician",
  "Carpenter",
  "Mason",
  "Tiles Worker",
  "Painter",
  "Welder",
  "Steel Fabricator",
  "False Ceiling Worker",
  "Interior Designer",
  "POP Worker",
  "Glass Installer",
  "Roofing Worker",
  "House Cleaner",
  "Deep Cleaning Worker",
  "Bathroom Cleaner",
  "Gardener",
  "Tree Cutter"
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";
  const [searchTerm, setSearchTerm] = useState("");

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`/findservices?${params.toString()}`);
  };

  // Filter categories by search term
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-white shrink-0">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal size={14} className="text-[#0F172A]" />
        <h2 className="text-xs font-black text-[#0F172A] uppercase tracking-widest">
          Filter by Category
        </h2>
      </div>

      {/* Category Search Input */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-all text-slate-800"
        />
      </div>

      {/* Categories Scrollable Box */}
      <div className="space-y-1 mb-8 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-semibold text-xs border text-left group ${
                  isActive
                    ? "bg-[#0F172A] border-[#0F172A] text-white shadow-sm"
                    : "bg-white border-transparent text-slate-600 hover:bg-slate-50/80 hover:text-[#0F172A]"
                }`}
              >
                {/* Visual Circle Indicator with first letter */}
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 transition-all ${
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/50"
                }`}>
                  {cat === "All" ? "A" : cat[0].toUpperCase()}
                </div>
                
                <span className="flex-1 truncate">{cat === "All" ? "All Services" : cat}</span>
                
                <ChevronRight 
                  size={12} 
                  className={`transition-all duration-300 ${
                    isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"
                  }`} 
                />
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-400 text-[11px] font-medium">
            No matching categories
          </div>
        )}
      </div>

      {/* Pro Benefits Promo Card */}
      <div className="mt-auto bg-gradient-to-br from-teal-50/60 to-teal-50/20 border border-teal-100/30 rounded-[24px] p-5 relative overflow-hidden group">
        <div className="absolute top-[-20%] right-[-20%] w-28 h-28 bg-teal-500/10 rounded-full blur-2xl transition-all"></div>
        <span className="inline-block px-2 py-0.5 bg-teal-600 text-white text-[8px] font-black uppercase tracking-widest rounded mb-3">Pro Benefits</span>
        <h3 className="text-[#0F172A] font-bold text-base mb-1.5">Instant Booking</h3>
        <p className="text-slate-500 text-[11px] mb-4 leading-relaxed">Book a top-rated pro in under 60 seconds with Fework Instant.</p>
        <button className="w-full py-2.5 bg-[#0F172A] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-800 transition-all">
          Learn More
        </button>
      </div>
    </aside>
  );
}
