"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, TrendingUp, ArrowRight } from "lucide-react";

const SUGGESTIONS = [
  { label: "Electrician",    category: "electrician", hot: true  },
  { label: "Plumber",        category: "plumber",     hot: true  },
  { label: "AC Repair",      category: "ac",          hot: true  },
  { label: "House Cleaning", category: "cleaner",     hot: false },
  { label: "Painter",        category: "painter",     hot: false },
  { label: "Carpenter",      category: "carpenter",   hot: false },
  { label: "Mechanic",       category: "mechanic",    hot: false },
  { label: "Mason",          category: "mason",       hot: false },
];

interface HeroSearchProps {
  initialQuery?: string;
  initialCity?: string;
}

export default function HeroSearch({ initialQuery = "", initialCity = "" }: HeroSearchProps) {
  const router = useRouter();
  const [query,    setQuery]    = useState(initialQuery);
  const [city,     setCity]     = useState(initialCity);
  const [focused,  setFocused]  = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [activeIdx,setActiveIdx]= useState(-1);

  const inputRef   = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? SUGGESTIONS.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))
    : SUGGESTIONS;

  const navigate = (q: string, c: string) => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("search", q.trim());
    if (c.trim()) params.set("city",   c.trim());
    inputRef.current?.blur();
    setShowDrop(false);
    setActiveIdx(-1);
    router.push(`/findservices${params.toString() ? "?" + params.toString() : ""}`);
  };

  const handleSearch = () => navigate(query, city);

  const pickSuggestion = (label: string) => {
    setQuery(label);
    navigate(label, city);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDrop) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && filtered[activeIdx]) {
        pickSuggestion(filtered[activeIdx].label);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowDrop(false);
      inputRef.current?.blur();
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative max-w-2xl mx-auto mb-6">
      {/* Search bar */}
      <motion.div
        animate={{
          boxShadow: focused
            ? "0 30px 80px rgba(0,0,0,0.35)"
            : "0 20px 40px rgba(0,0,0,0.2)",
        }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-full p-2 flex items-center"
      >
        {/* What input */}
        <div className="pl-5 flex items-center gap-3 flex-grow min-w-0">
          <Search
            size={20}
            className={`shrink-0 transition-colors duration-200 ${
              focused ? "text-teal-500" : "text-gray-400"
            }`}
          />
          <input
            ref={inputRef}
            id="hero-search"
            type="text"
            value={query}
            autoComplete="off"
            placeholder="What service do you need today?"
            onChange={e => {
              setQuery(e.target.value);
              setShowDrop(true);
              setActiveIdx(-1);
            }}
            onFocus={() => {
              setFocused(true);
              setShowDrop(true);
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-400 py-3 text-base outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Divider + city */}
        <div className="hidden sm:flex items-center gap-2 px-3 border-l border-gray-200 ml-2">
          <MapPin size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="City..."
            className="w-24 bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-400 py-3 text-sm outline-none"
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-[#006D77] text-white px-7 py-3 rounded-full font-bold hover:bg-[#005a63] active:scale-95 transition-all shrink-0 flex items-center gap-2 ml-1"
        >
          Search
          <ArrowRight size={16} />
        </button>
      </motion.div>

      {/* Suggestion Dropdown */}
      <AnimatePresence>
        {showDrop && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50"
            onMouseDown={e => e.preventDefault()}
          >
            <div className="px-5 pt-4 pb-2">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.15em]">
                {query.trim() ? "Suggestions" : "Popular Services"}
              </p>
            </div>

            <div className="pb-2">
              {filtered.length > 0 ? (
                filtered.slice(0, 7).map((s, i) => (
                  <button
                    key={s.category}
                    onClick={() => pickSuggestion(s.label)}
                    className={`w-full flex items-center gap-4 px-5 py-3 transition-colors text-left group ${
                      activeIdx === i ? "bg-gray-50" : "hover:bg-gray-50/70"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      activeIdx === i ? "bg-teal-50" : "bg-gray-100 group-hover:bg-teal-50"
                    }`}>
                      {s.hot
                        ? <TrendingUp size={15} className="text-teal-500" />
                        : <Search size={15} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-[#0F172A]">{s.label}</span>
                    </div>
                    {s.hot && (
                      <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full shrink-0">
                        Trending
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-gray-400">No suggestions — press Enter to search anyway</p>
                </div>
              )}
            </div>

            <div className="mx-5 mb-4 mt-1 pt-3 border-t border-gray-50 flex items-center justify-between">
              <span className="text-[10px] text-gray-300 font-bold">Use ↑↓ to navigate</span>
              <div className="flex gap-1">
                <kbd className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-mono">↵ Enter</kbd>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
