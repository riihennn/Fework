"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { workerApi, WorkerPublic } from "@/services/api";
import WorkerCard from "@/components/worker/WorkerCard";
import { Loader2, UserCircle } from "lucide-react";

interface WorkerListProps {
  initialWorkers: WorkerPublic[];
  initialPages: number;
  params: any;
}

export default function WorkerList({ initialWorkers, initialPages, params }: WorkerListProps) {
  const [workers, setWorkers] = useState<WorkerPublic[]>(initialWorkers);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(page < initialPages);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  const loadMoreWorkers = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await workerApi.getAll({ ...params, page: nextPage.toString() });
      
      if (res.workers.length > 0) {
        setWorkers((prev) => [...prev, ...res.workers]);
        setPage(nextPage);
        setHasMore(nextPage < res.pagination.pages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more workers:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, params]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreWorkers();
    }
  }, [inView, hasMore, loading, loadMoreWorkers]);

  // Reset if params change (filters applied)
  useEffect(() => {
    setWorkers(initialWorkers);
    setPage(1);
    setHasMore(1 < initialPages);
  }, [initialWorkers, initialPages, params]);

  if (workers.length === 0) {
    return (
      <div className="text-center py-24">
        <UserCircle size={48} className="text-gray-200 mx-auto mb-4" />
        <p className="text-sm font-black text-gray-300 uppercase tracking-widest">No professionals available right now</p>
        <p className="text-xs text-gray-400 mt-2">Try adjusting your filters or check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {workers.map((worker) => (
        <WorkerCard key={`${worker._id}-${worker.user?._id}`} worker={worker} />
      ))}
      
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
              <Loader2 size={16} className="animate-spin text-teal-500" />
              Loading more professionals...
            </div>
          )}
        </div>
      )}
      
      {!hasMore && workers.length > 0 && (
        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest py-8">
          You've reached the end of the list
        </p>
      )}
    </div>
  );
}
