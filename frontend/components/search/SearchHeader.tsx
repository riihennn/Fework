"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";

// Structured Category Groups matching FilterSidebar
const categoryGroups = [
  {
    name: "Repairs & Maintenance",
    categories: [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Welder"
    ]
  },
  {
    name: "Electronics & Tech",
    categories: [
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
      "Computer Technician"
    ]
  },
  {
    name: "Construction & Interior",
    categories: [
      "Mason",
      "Tiles Worker",
      "Painter",
      "Steel Fabricator",
      "False Ceiling Worker",
      "Interior Designer",
      "POP Worker",
      "Glass Installer",
      "Roofing Worker"
    ]
  },
  {
    name: "Cleaning & Outdoors",
    categories: [
      "House Cleaner",
      "Deep Cleaning Worker",
      "Bathroom Cleaner",
      "Gardener",
      "Tree Cutter"
    ]
  }
];

const mobileGroups = [
  { id: "All", label: "All Services" },
  { id: "Repairs & Maintenance", label: "Repairs" },
  { id: "Electronics & Tech", label: "Electronics" },
  { id: "Construction & Interior", label: "Construction" },
  { id: "Cleaning & Outdoors", label: "Cleaning" }
];

export default function SearchHeader({ totalWorkers }: { totalWorkers: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [locationQuery, setLocationQuery] = useState(searchParams.get("city") || "");
  const activeCategory = searchParams.get("category") || "All";

  // State to track which group is viewed/active
  const [viewedGroup, setViewedGroup] = useState<string>("All");

  // Sync inputs when URL search parameters change
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setLocationQuery(searchParams.get("city") || "");
  }, [searchParams]);

  // Synchronize viewedGroup with active category from searchParams
  useEffect(() => {
    if (activeCategory === "All") {
      setViewedGroup("All");
    } else {
      const parentGroup = categoryGroups.find((group) =>
        group.categories.some((cat) => cat.toLowerCase() === activeCategory.toLowerCase())
      );
      if (parentGroup) {
        setViewedGroup(parentGroup.name);
      }
    }
  }, [activeCategory]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    const q = searchQuery.trim();
    const l = locationQuery.trim();

    if (q) {
      params.set("search", q);
      params.delete("category"); // Clear category filter to avoid conflict on text search
    } else {
      params.delete("search");
    }

    if (l) params.set("city", l);
    else params.delete("city");

    router.push(`/findservices?${params.toString()}`);
  };

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search"); // Clear search query to avoid conflict on category change
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`/findservices?${params.toString()}`);
  };

  const handleGroupSelect = (groupId: string) => {
    if (groupId === "All") {
      setViewedGroup("All");
      handleCategoryChange("All");
    } else {
      const group = categoryGroups.find((g) => g.name === groupId);
      if (group && group.categories.length > 0) {
        setViewedGroup(groupId);
        // Snappy selection: default to the first category in the selected group
        handleCategoryChange(group.categories[0]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const currentGroupCategories = categoryGroups.find((g) => g.name === viewedGroup)?.categories || [];

  return (
    <div className="flex flex-col gap-6 mb-10 md:mb-14">
      {/* Title Section */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight mb-2">
          Find Your Next Service Expert
        </h1>
        <p className="text-slate-400 text-sm font-semibold">
          {totalWorkers} available home and business professionals near you
        </p>
      </div>

      {/* Indeed-style prominent Search Bar */}
      <div className="w-full bg-white rounded-3xl border border-gray-400 shadow-[0_15px_40px_rgba(15,23,42,0.05)] p-2 md:p-3 transition-all duration-300">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0">

          {/* WHAT INPUT */}
          <div className="flex-1 flex items-center relative py-2.5 md:py-1.5 px-4 border-b md:border-b-0 md:border-r border-slate-100">
            <Search className="text-slate-400 mr-3 shrink-0" size={18} />
            <div className="flex-grow flex flex-col items-start min-w-0">
              <input
                type="text"
                placeholder="Skill, category, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm  text-[#0F172A] placeholder-slate-400 focus:outline-none h-6 min-w-0"
              />
            </div>
          </div>

          {/* WHERE INPUT */}
          <div className="flex-1 flex items-center relative py-2.5 md:py-1.5 px-4 border-b md:border-b-0 md:border-r border-slate-100 md:pl-6">
            <MapPin className="text-slate-400 mr-3 shrink-0" size={18} />
            <div className="flex-grow flex flex-col items-start min-w-0">
              <input
                type="text"
                placeholder="City in Kerala..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none h-6 min-w-0"
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            onClick={handleSearch}
            className="h-12 md:h-14 px-10 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest items-center justify-center hover:bg-slate-800 transition-all cursor-pointer rounded-2xl md:ml-3 shrink-0 shadow-sm"
          >
            Find Services
          </button>

        </div>
      </div>

      {/* Mobile/Tablet Category Quick Filters (Two-Tier) */}
      <div className="lg:hidden flex flex-col gap-3 w-full">
        {/* Tier 1: Groups */}
        <div className="w-full overflow-x-auto py-1 px-1 flex gap-2 scrollbar-none">
          {mobileGroups.map((group) => {
            const isSelected = viewedGroup === group.id;
            return (
              <button
                key={group.id}
                onClick={() => handleGroupSelect(group.id)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${isSelected
                  ? "bg-[#0F172A] border-[#0F172A] text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]"
                  }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        {/* Tier 2: Specific Categories under selected Group */}
        {viewedGroup !== "All" && currentGroupCategories.length > 0 && (
          <div className="w-full overflow-x-auto py-1.5 px-1 flex gap-2 scrollbar-none border-t border-slate-100/60 pt-3 transition-all duration-300">
            {currentGroupCategories.map((cat) => {
              const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3.5 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${isActive
                    ? "bg-teal-500 border-teal-500 text-white shadow-sm"
                    : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

