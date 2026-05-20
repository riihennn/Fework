"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronRight, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Wrench, 
  Tv, 
  Hammer, 
  Sparkles, 
  Check 
} from "lucide-react";

// Structured Category Groups with Lucide Icons
const categoryGroups = [
  {
    name: "Repairs & Maintenance",
    icon: Wrench,
    categories: [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Welder"
    ]
  },
  {
    name: "Electronics & Tech",
    icon: Tv,
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
    icon: Hammer,
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
    icon: Sparkles,
    categories: [
      "House Cleaner",
      "Deep Cleaning Worker",
      "Bathroom Cleaner",
      "Gardener",
      "Tree Cutter"
    ]
  }
];

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";
  const [searchTerm, setSearchTerm] = useState("");

  // Control accordion expanded state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Sync expanded state with active category when component loads or activeCategory changes
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    let foundActive = false;

    categoryGroups.forEach((group) => {
      const containsActive = group.categories.some(
        (cat) => cat.toLowerCase() === activeCategory.toLowerCase()
      );
      if (containsActive) {
        initial[group.name] = true;
        foundActive = true;
      }
    });

    // If "All" or a non-matching category is selected, expand the first group by default
    if (!foundActive && categoryGroups.length > 0) {
      initial[categoryGroups[0].name] = true;
    }

    setExpandedGroups(initial);
  }, [activeCategory]);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search"); // Clear search query to avoid category conflict
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`/findservices?${params.toString()}`);
  };

  const isSearching = searchTerm.trim().length > 0;

  // Filter category groups based on search term
  const filteredGroups = categoryGroups
    .map((group) => {
      const filteredCats = group.categories.filter((cat) =>
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return {
        ...group,
        categories: filteredCats,
      };
    })
    .filter((group) => group.categories.length > 0);

  const toggleGroup = (groupName: string) => {
    if (isSearching) return; // Don't toggle manually during search
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <aside className="w-80 border-r border-slate-100 hidden lg:flex flex-col p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-white shrink-0 scrollbar-thin">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal size={14} className="text-[#0F172A]" />
        <h2 className="text-xs font-black text-[#0F172A] uppercase tracking-widest">
          Filter by Category
        </h2>
      </div>

      {/* Category Search Input */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-all text-slate-800"
        />
      </div>

      {/* Categories Content Container */}
      <div className="space-y-3 mb-8">
        {/* All Services option */}
        {!isSearching && (
          <button
            onClick={() => handleCategoryChange("All")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-semibold text-xs border text-left ${
              activeCategory.toLowerCase() === "all"
                ? "bg-[#0F172A] border-[#0F172A] text-white shadow-sm"
                : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-[#0F172A] hover:border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[8px] font-black tracking-widest transition-all ${
                activeCategory.toLowerCase() === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                ALL
              </div>
              <span className="font-bold">All Services</span>
            </div>
            {activeCategory.toLowerCase() === "all" && <Check size={12} className="text-teal-400 shrink-0" />}
          </button>
        )}

        {/* Grouped Accordions */}
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const hasActiveCategory = group.categories.some(
              (cat) => cat.toLowerCase() === activeCategory.toLowerCase()
            );
            const isExpanded = isSearching ? true : !!expandedGroups[group.name];

            return (
              <div 
                key={group.name} 
                className={`border rounded-2xl overflow-hidden bg-white transition-all duration-300 ${
                  hasActiveCategory 
                    ? "border-slate-200 shadow-sm" 
                    : "border-slate-100 hover:border-slate-200/80"
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleGroup(group.name)}
                  disabled={isSearching}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                    hasActiveCategory ? "bg-slate-50/80" : "bg-slate-50/30 hover:bg-slate-50/60"
                  } ${isSearching ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      hasActiveCategory 
                        ? "bg-[#0F172A] text-teal-400" 
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      <group.icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0F172A] block truncate">
                        {group.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {group.categories.length} {group.categories.length === 1 ? "service" : "services"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {hasActiveCategory && !isExpanded && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                    )}
                    {!isSearching && (
                      <ChevronDown 
                        size={14} 
                        className={`text-slate-400 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`} 
                      />
                    )}
                  </div>
                </button>

                {/* Accordion Body */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isExpanded 
                      ? "max-h-[500px] border-t border-slate-100/50 p-2 space-y-0.5 bg-white opacity-100" 
                      : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  {group.categories.map((cat) => {
                    const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left font-bold text-xs transition-all ${
                          isActive
                            ? "bg-[#0F172A] text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {isActive && <Check size={12} className="text-teal-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs font-semibold">
            No matching categories found
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

