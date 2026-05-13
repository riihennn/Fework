"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookOpen, CreditCard, Calendar, Shield,
  Briefcase, Users, ChevronDown, MessageCircle, Mail,
  Phone, ArrowRight, Zap, CheckCircle2, HelpCircle,
  Star, Clock, LifeBuoy, ExternalLink, Info
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { icon: BookOpen,    label: "Getting Started",  desc: "New to Fework? Learn the essential basics of our platform.", iconColor: "text-blue-500", bgColor: "bg-blue-50" },
  { icon: Calendar,   label: "Bookings",          desc: "Managing your schedule, appointments and cancellations.", iconColor: "text-indigo-500", bgColor: "bg-indigo-50" },
  { icon: CreditCard, label: "Payments",          desc: "Understanding cash-on-completion and payment security.", iconColor: "text-teal-500", bgColor: "bg-teal-50" },
  { icon: Shield,     label: "Safety & Trust",    desc: "Guidelines for a safe and professional experience for everyone.", iconColor: "text-rose-500", bgColor: "bg-rose-50" },
  { icon: Briefcase,  label: "For Professionals", desc: "Setting up your profile, rates, and finding your first clients.", iconColor: "text-amber-500", bgColor: "bg-amber-50" },
  { icon: Users,      label: "For Clients",       desc: "Finding the right talent and evaluating service quality.", iconColor: "text-purple-500", bgColor: "bg-purple-50" },
];

const FAQS = [
  {
    q: "How does the 'Cash on Completion' payment work?",
    a: "Fework operates on a trust-first model. You only pay the professional directly in cash after they have finished the task and you have inspected the work. Once you are satisfied, you mark the job as 'Completed' in the app to close the booking.",
  },
  {
    q: "Is there any insurance for the services booked?",
    a: "While Fework is a marketplace that connects you with independent professionals, we prioritize safety by verifying service providers. For large jobs, we recommend discussing insurance and guarantees directly with the professional before the work begins.",
  },
  {
    q: "What should I do if a professional is late?",
    a: "Punctuality is a key metric on Fework. If a pro is late, you can message them directly through the app. If they fail to show up, you can cancel the booking without any penalty and report the incident to our support team.",
  },
  {
    q: "How can I improve my visibility as a worker?",
    a: "Visibility is driven by your 'Pro Score', which is calculated based on your completion rate, average rating, and responsiveness. Maintaining a 4.5+ star rating and responding to requests within 30 minutes significantly boosts your search rank.",
  },
];

// ─── Components ──────────────────────────────────────────────────────────

function CategoryCard({ category, index }: { category: any; index: number }) {
  const Icon = category.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, borderColor: "rgba(20, 184, 166, 0.3)" }}
      className="bg-white border border-gray-100 rounded-3xl p-8 cursor-pointer shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-all duration-300 group"
    >
      <div className={`w-14 h-14 ${category.bgColor} ${category.iconColor} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{category.label}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-6">{category.desc}</p>
      <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest">
        Learn More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

function AccordionItem({ faq, index }: { faq: any; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className={`text-lg font-bold transition-colors ${isOpen ? "text-teal-600" : "text-[#0F172A] group-hover:text-teal-500"}`}>
          {faq.q}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-teal-50 text-teal-600 rotate-180" : "text-gray-300"}`}>
          <ChevronDown size={20} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm text-gray-500 leading-loose max-w-2xl">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-teal-100">
      
      {/* ─── Minimalist Clean Hero ─── */}
      <section className="bg-[#fcfdfd] border-b border-gray-100 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <HelpCircle size={14} /> Support Center
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:text-6xl font-black text-2xl font-bold text-[#0F172A] mb-4 tracking-tight mb-6 leading-tight"
          >
            How can we help <br className="hidden md:block" /> you today?
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg mb-12 max-w-xl mx-auto"
          >
            Search our knowledge base or browse categories below to find instant solutions for your needs.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={22} />
            </div>
            <input 
              type="text"
              placeholder="Describe your issue or ask a question..."
              className="w-full h-18 pl-16 pr-6 bg-white rounded-2xl border-2 border-gray-100 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/5 transition-all text-lg font-medium text-[#0F172A] placeholder-gray-300 shadow-sm"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── Category Grid ─── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-2">Browse by Topic</h2>
            <p className="text-sm text-gray-400 font-medium">Explore detailed guides and documentation organized by category.</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
            View all documentation <ExternalLink size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={i} category={cat} index={i} />
          ))}
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="bg-gray-50/50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
          <div>
            <div className="sticky top-24">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-teal-500 mb-6 border border-gray-100">
                <Info size={24} />
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-6">Frequently Asked <br /> Questions</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-md">
                Can't find the answer you're looking for? Reach out to our 24/7 support team for personalized assistance.
              </p>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Live Chat</p>
                    <p className="text-sm font-bold text-[#0F172A]">Available 24/7</p>
                  </div>
                  <button className="ml-auto text-xs font-black text-teal-600">START CHAT</button>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Email Support</p>
                    <p className="text-sm font-bold text-[#0F172A]">support@fework.com</p>
                  </div>
                  <button className="ml-auto text-xs font-black text-blue-600">SEND MAIL</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 p-10 md:p-12 shadow-xl">
            <div className="divide-y divide-gray-50">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} faq={faq} index={i} />
              ))}
            </div>
            
            <div className="mt-12 p-8 bg-[#0F172A] rounded-[32px] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-3xl rounded-full" />
              <h4 className="text-xl font-black mb-2 relative z-10">Still Stuck?</h4>
              <p className="text-white/60 text-sm mb-6 relative z-10 leading-relaxed">
                Sometimes a quick conversation is all you need. Speak with a human specialist.
              </p>
              <button className="w-full h-12 bg-teal-500 hover:bg-teal-400 text-[#0F172A] rounded-xl font-black text-sm transition-all relative z-10">
                Call Support Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Help Footer ─── */}
      <footer className="py-20 border-t border-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <p  className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-0.5">
              Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2" />
            </p>
          </div>
          <p className="text-sm text-gray-400 max-w-lg mx-auto leading-loose mb-10">
            Fework is Kerala's leading professional marketplace, connecting skilled individuals with clients through a secure, transparent platform.
          </p>
          <div className="flex flex-wrap justify-center gap-10 text-xs font-black text-[#0F172A] uppercase tracking-widest">
            <a href="#" className="hover:text-teal-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Safety Guidelines</a>
            <a href="#" className="hover:text-teal-600 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
