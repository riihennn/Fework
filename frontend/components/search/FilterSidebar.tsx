"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Wrench, Tv, Hammer, Sparkles, Layers, Cog, Zap, Droplets, Paintbrush, Shield,
  Check,
  Loader2,
} from "lucide-react";
import { useSkillGroups } from "@/hooks/useSkillGroups";

// Icon resolver — maps string icon name from DB to Lucide component
const ICON_MAP: Record<string, React.ElementType> = {
  Wrench, Tv, Hammer, Sparkles, Layers, Cog, Zap, Droplets, Paintbrush, Shield,
};

function GroupIcon({ name, size = 14 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] || Wrench;
  return <Icon size={size} />;
}

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const { groups, loading } = useSkillGroups();

  // Auto-expand the group containing the active category, or the first group
  useEffect(() => {
    if (groups.length === 0) return;
    const initial: Record<string, boolean> = {};
    let foundActive = false;

    groups.forEach((group) => {
      const containsActive = group.skills.some(
        (s) => s.name.toLowerCase() === activeCategory.toLowerCase()
      );
      if (containsActive) {
        initial[group.category] = true;
        foundActive = true;
      }
    });

    if (!foundActive && groups.length > 0) {
      initial[groups[0].category] = true;
    }

    setExpandedGroups(initial);
  }, [activeCategory, groups]);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.push(`/findservices?${params.toString()}`);
  };

  const isSearching = searchTerm.trim().length > 0;

  // Filter groups based on search term
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      skills: group.skills.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.skills.length > 0);

  const toggleGroup = (groupName: string) => {
    if (isSearching) return;
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  return (
    <aside className="w-64 border-r border-slate-100 hidden lg:flex flex-col py-6 pr-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-white shrink-0 scrollbar-thin">
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

      {/* Categories Content */}
      <div className="space-y-3 mb-8">
        {/* All Services */}
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

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs font-semibold">Loading...</span>
          </div>
        )}

        {/* Grouped Accordions */}
        {!loading && filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const hasActiveCategory = group.skills.some(
              (s) => s.name.toLowerCase() === activeCategory.toLowerCase()
            );
            const isExpanded = isSearching ? true : !!expandedGroups[group.category];

            return (
              <div
                key={group.category}
                className={`border rounded-2xl overflow-hidden bg-white transition-all duration-300 ${
                  hasActiveCategory
                    ? "border-slate-200 shadow-sm"
                    : "border-slate-100 hover:border-slate-200/80"
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleGroup(group.category)}
                  disabled={isSearching}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                    hasActiveCategory ? "bg-slate-50/80" : "bg-slate-50/30 hover:bg-slate-50/60"
                  } ${isSearching ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      hasActiveCategory ? "bg-[#0F172A] text-teal-400" : "bg-slate-100 text-slate-500"
                    }`}>
                      <GroupIcon name={group.icon} size={14} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0F172A] block truncate">
                        {group.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {group.skills.length} {group.skills.length === 1 ? "service" : "services"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasActiveCategory && !isExpanded && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    )}
                    {!isSearching && (
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </div>
                </button>

                {/* Accordion Body */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded
                    ? "max-h-[500px] border-t border-slate-100/50 p-2 space-y-0.5 bg-white opacity-100"
                    : "max-h-0 opacity-0 pointer-events-none"
                }`}>
                  {group.skills.map((skill) => {
                    const isActive = activeCategory.toLowerCase() === skill.name.toLowerCase();
                    return (
                      <button
                        key={skill._id}
                        onClick={() => handleCategoryChange(skill.name)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left font-bold text-xs transition-all ${
                          isActive
                            ? "bg-[#0F172A] text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
                        }`}
                      >
                        <span className="truncate">{skill.name}</span>
                        {isActive && <Check size={12} className="text-teal-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          !loading && (
            <div className="text-center py-8 text-slate-400 text-xs font-semibold">
              No matching categories found
            </div>
          )
        )}
      </div>
    </aside>
  );
}
