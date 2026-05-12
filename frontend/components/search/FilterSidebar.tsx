"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";

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

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`/findservices?${params.toString()}`);
  };

  return (
    <aside className="w-72 border-r border-gray-100 hidden lg:flex flex-col p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
      <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Filter by Category</h2>
      <div className="space-y-1 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
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
  );
}
