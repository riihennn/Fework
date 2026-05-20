"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { raiseTicket } from "@/utils/ticketStorage";
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
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "client" as "client" | "worker",
    category: "payment" as any,
    priority: "medium" as any,
    subject: "",
    description: ""
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.description) {
      alert("Please fill out all fields.");
      return;
    }
    const newTkt = raiseTicket(formData);
    setTicketSuccess(newTkt.id);
    // Reset form data
    setFormData({
      name: "",
      email: "",
      role: "client",
      category: "payment",
      priority: "medium",
      subject: "",
      description: ""
    });
  };

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
              placeholder="Search guides, tutorials, or ask a question..."
              className="w-full h-16 pl-16 pr-6 bg-white rounded-3xl border border-gray-100 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/5 transition-all text-base font-medium text-[#0F172A] placeholder-gray-300 shadow-xl shadow-gray-100/50"
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

                <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <LifeBuoy size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Support Ticket</p>
                    <p className="text-sm font-bold text-[#0F172A]">File a formal complaint</p>
                  </div>
                  <button onClick={() => { setIsTicketModalOpen(true); setTicketSuccess(null); }} className="ml-auto text-xs font-black text-rose-600">RAISE TICKET</button>
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
            <p className="text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-0.5">
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

      {/* ─── Ticket Submission Modal ─── */}
      <AnimatePresence>
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setIsTicketModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-[32px] p-8 max-w-xl w-full shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar border border-slate-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A]">File a Ticket</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Submit a support request or complaint</p>
                </div>
                <button 
                  onClick={() => setIsTicketModalOpen(false)} 
                  className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                >
                  <ChevronDown size={20} className="rotate-90" />
                </button>
              </div>

              {ticketSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-teal-50 border border-teal-100 text-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-bold text-[#0F172A] mb-2">Ticket Submitted!</h4>
                  <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                    Your complaint has been successfully logged. The admin team will review it shortly.
                  </p>
                  <div className="inline-block bg-teal-50/50 border border-teal-100 px-4 py-2.5 rounded-2xl text-xs font-black text-teal-700 tracking-wider mb-8 uppercase">
                    Ticket ID: {ticketSuccess}
                  </div>
                  <button
                    onClick={() => setIsTicketModalOpen(false)}
                    className="w-full h-14 rounded-2xl font-bold text-white bg-[#0F172A] hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                  >
                    Close Support Portal
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-[#0F172A] focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-[#0F172A] focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Platform Role</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: "client" }))}
                          className={`py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                            formData.role === "client" ? "bg-white text-teal-600 shadow-sm" : "text-gray-400 hover:text-[#0F172A]"
                          }`}
                        >
                          Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, role: "worker" }))}
                          className={`py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                            formData.role === "worker" ? "bg-white text-teal-600 shadow-sm" : "text-gray-400 hover:text-[#0F172A]"
                          }`}
                        >
                          Worker
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issue Category</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-[#0F172A] outline-none focus:bg-white focus:border-teal-500 transition-all cursor-pointer"
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      >
                        <option value="payment">Payment & Refunds</option>
                        <option value="scheduling">Bookings & Delays</option>
                        <option value="quality">Quality of Work</option>
                        <option value="safety">Safety & Misbehavior</option>
                        <option value="technical">App Bug & Technical</option>
                        <option value="other">Other Issues</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority Level</label>
                    <div className="flex gap-2">
                      {["low", "medium", "high", "urgent"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, priority: lvl }))}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest border ${
                            formData.priority === lvl
                              ? lvl === "urgent"
                                ? "bg-red-50 text-red-600 border-red-200"
                                : lvl === "high"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : lvl === "medium"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                              : "bg-white text-gray-400 border-slate-100 hover:bg-slate-50/50"
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-[#0F172A] focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                      placeholder="Briefly state the issue..."
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Description</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm text-[#0F172A] focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all resize-none"
                      placeholder="Please explain the details of your issue so we can investigate..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-14 rounded-2xl font-bold text-white bg-[#0F172A] hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 mt-2"
                  >
                    Submit Support Ticket
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
