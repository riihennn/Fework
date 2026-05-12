"use client";

import React from "react";
import Link from "next/link";

interface FooterProps {
  className?: string;
}

export const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={`bg-white border-t border-gray-100 pt-16 pb-8 ${className || ""}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-12">
          <div className="max-w-xs">
            <Link href="/" className="text-2xl font-bold text-[#0F172A] tracking-tight mb-4 flex items-center gap-0.5">
              Fework<span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2"></span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connecting you with the world's most reliable local experts for all your service needs.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-x-16 gap-y-8 text-sm">
            <Link href="#" className="text-gray-600 hover:text-[#0F172A] transition-colors">About Us</Link>
            <Link href="#" className="text-gray-600 hover:text-[#0F172A] transition-colors">Terms of Service</Link>
            <Link href="#" className="text-gray-600 hover:text-[#0F172A] transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-600 hover:text-[#0F172A] transition-colors">Contact Support</Link>
            <Link href="#" className="text-gray-600 hover:text-[#0F172A] transition-colors">Careers</Link>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400">
          <p>© 2024 Fework Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer">
              <span className="text-[10px]">●</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors cursor-pointer">
              <span className="text-[10px]">□</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
