"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export default function SearchHeader({ totalWorkers }: { totalWorkers: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.get("city") || "");

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) params.set("search", searchQuery);
    else params.delete("search");
    
    if (locationQuery) params.set("city", locationQuery);
    else params.delete("city");

    router.push(`/findservices?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
      <div>
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Find Professionals</h1>
        <p className="text-gray-400 text-sm font-medium">
          {totalWorkers} available professionals near you
        </p>
      </div>
      <div className="flex-1 flex flex-col md:flex-row items-center bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
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
          onClick={handleSearch}
          className="hidden md:flex h-14 px-8 bg-[#0F172A] text-white text-sm font-black uppercase tracking-widest items-center justify-center hover:bg-gray-800 transition-all"
        >
          Find
        </button>
      </div>
    </div>
  );
}
