"use client";

import React from "react";
import ReportIssueForm from "@/components/shared/ReportIssueForm";

export default function ReportIssuePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 flex items-center justify-center">
      <div className="w-full">
        <ReportIssueForm onSuccessRedirect="/" />
      </div>
    </div>
  );
}
