"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, Clock, Star } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Match",
    desc: "Our AI pairs you with the best professional for your specific needs in seconds.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: ShieldCheck,
    title: "Fully Vetted",
    desc: "Every professional undergoes rigorous background checks and skill verification.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Clock,
    title: "60-Min Arrival",
    desc: "Need it now? Our express pros can be at your doorstep within the hour.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Star,
    title: "Premium Quality",
    desc: "We maintain a 4.8+ star average across our entire network of professionals.",
    color: "bg-purple-50 text-purple-600",
  },
];

export default function FeatureSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="p-8 rounded-[32px] border border-gray-50 hover:border-teal-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <f.icon size={24} />
              </div>
              <h3 className="text-xl font-black text-[#0F172A] mb-4 tracking-tight">{f.title}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
