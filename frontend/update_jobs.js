const fs = require('fs');
const file = 'app/(worker)/worker/jobs/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const marker = '// ─── Main Page ─────────────────────────────────────────────────────────';
const parts = content.split(marker);

const newComponent = `// ─── Main Page ─────────────────────────────────────────────────────────
export default function JobsPage() {
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = React.useState("active");

  const [activeJobs, setActiveJobs] = React.useState([]);
  const [historyJobs, setHistoryJobs] = React.useState([]);
  
  const [historyStatus, setHistoryStatus] = React.useState("completed");
  const [historyTotal, setHistoryTotal] = React.useState(0);
  const [historyPage, setHistoryPage] = React.useState(1);
  const [historyPages, setHistoryPages] = React.useState(1);
  
  const [loadingActive, setLoadingActive] = React.useState(true);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchActive = React.useCallback(async (silent = false) => {
    if (!silent) setLoadingActive(true);
    setError(null);
    try {
      const res = await bookingApi.getWorkerJobs({ status: "active", page: "1", limit: "50" });
      setActiveJobs(res.jobs);
    } catch (e) { setError(e.message || "Failed to load active jobs"); }
    finally { if (!silent) setLoadingActive(false); }
  }, []);

  const fetchHistory = React.useCallback(async (status, p, silent = false) => {
    if (!silent) setLoadingHistory(true);
    try {
      const res = await bookingApi.getWorkerJobs({ status: status === "all" ? "" : status, page: String(p), limit: "10" });
      setHistoryJobs(res.jobs);
      setHistoryTotal(res.pagination.total);
      setHistoryPages(res.pagination.pages);
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoadingHistory(false); }
  }, []);

  React.useEffect(() => { fetchActive(); }, [fetchActive]);
  React.useEffect(() => { fetchHistory(historyStatus, historyPage); }, [fetchHistory, historyStatus, historyPage]);

  React.useEffect(() => {
    if (!user?._id) return;
    const socketURL = API_BASE_URL.replace("/api", "");
    const socket = io(socketURL, { withCredentials: true });
    socket.on("connect", () => socket.emit("join_user", user._id));
    socket.on("new_booking", () => { fetchActive(true); fetchHistory(historyStatus, historyPage, true); });
    socket.on("booking_updated", () => { fetchActive(true); fetchHistory(historyStatus, historyPage, true); });
    return () => { socket.disconnect(); };
  }, [user, historyStatus, historyPage, fetchActive, fetchHistory]);

  const onRefresh = () => {
    fetchActive();
    fetchHistory(historyStatus, historyPage);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">My Jobs</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-bold">
            Manage your current tasks and view past history.
          </p>
        </div>
        <button onClick={onRefresh}
          className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-teal-600 hover:border-teal-100 transition-all shadow-sm self-start md:self-auto">
          <RefreshCw size={18} className={(loadingActive || loadingHistory) ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">{error}</div>
      )}

      <div className="flex items-center gap-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab("active")}
          className={\`pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 \${activeTab === "active" ? "border-[#0F172A] text-[#0F172A]" : "border-transparent text-gray-500 hover:text-gray-800"}\`}
        >
          Current Jobs
          {activeJobs.length > 0 && (
            <span className={\`px-2 py-0.5 rounded-full text-[10px] font-black \${activeTab === "active" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}\`}>
              {activeJobs.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={\`pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 \${activeTab === "history" ? "border-[#0F172A] text-[#0F172A]" : "border-transparent text-gray-500 hover:text-gray-800"}\`}
        >
          History
          {historyTotal > 0 && (
            <span className={\`px-2 py-0.5 rounded-full text-[10px] font-black \${activeTab === "history" ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-500"}\`}>
              {historyTotal}
            </span>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "active" ? (
          loadingActive ? (
            <div className="bg-white rounded-[24px] border border-gray-100 h-40 animate-pulse" />
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[32px] border border-dashed border-gray-200">
              <Zap size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No active jobs</p>
              <p className="text-xs text-gray-400 mt-1 font-medium">You don't have any current jobs or requests.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {activeJobs.map(job => (
                <JobCard key={job._id} job={job} onAction={onRefresh} />
              ))}
            </AnimatePresence>
          )
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Filter History</label>
                <div className="relative">
                  <select
                    value={historyStatus}
                    onChange={(e) => { setHistoryStatus(e.target.value); setHistoryPage(1); }}
                    className="appearance-none bg-white border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-[#0F172A] shadow-sm outline-none focus:border-teal-400 transition-all cursor-pointer min-w-[140px]"
                  >
                    <option value="completed">Completed Jobs</option>
                    <option value="cancelled">Cancelled Jobs</option>
                    <option value="all">All History</option>
                  </select>
                  <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {loadingHistory ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[24px] border border-gray-100 h-36 animate-pulse" />
              ))
            ) : historyJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[32px] border border-dashed border-gray-200">
                <CheckCircle2 size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No history yet</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">No past jobs match this filter.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {historyJobs.map(job => (
                  <JobCard key={job._id} job={job} onAction={onRefresh} />
                ))}
              </AnimatePresence>
            )}

            {historyPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                {Array.from({ length: historyPages }).map((_, i) => (
                  <button key={i} onClick={() => setHistoryPage(i + 1)}
                    className={\`w-10 h-10 rounded-xl text-sm font-black transition-all \${
                      historyPage === i + 1 ? "bg-[#0F172A] text-white shadow-lg" : "bg-white border border-gray-100 text-gray-400 hover:border-gray-200"
                    }\`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync(file, parts[0] + newComponent);
console.log('Successfully updated JobsPage with exact syntax');
