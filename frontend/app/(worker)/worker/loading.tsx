import React from "react";

export default function Loading() {
  return (
    <div className="space-y-12 max-w-7xl animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-[32px] border border-gray-100 p-8 h-48 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 mb-6" />
            <div className="h-8 w-24 bg-gray-100 rounded-lg mb-2" />
            <div className="h-4 w-32 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Recent Activity Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[40px] border border-gray-100 p-10 h-[500px] shadow-sm">
            <div className="flex justify-between mb-10">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-100 rounded-lg" />
                <div className="h-4 w-64 bg-gray-100 rounded-lg" />
              </div>
              <div className="h-10 w-32 bg-gray-100 rounded-xl" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-full bg-gray-50 rounded-[28px]" />
              ))}
            </div>
          </div>
        </div>

        {/* Performance Skeleton */}
        <div className="space-y-8">
          <div className="bg-[#0F172A] rounded-[40px] p-10 h-72 shadow-2xl" />
          <div className="space-y-4">
            <div className="h-24 w-full bg-gray-100 rounded-[28px]" />
            <div className="h-24 w-full bg-gray-100 rounded-[28px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
