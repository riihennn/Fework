const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ─── Types ───────────────────────────────────────────────────────
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "client" | "worker" | "admin";
  avatar?: string;
  city?: string;
  address?: string;
  state?: string;
  pincode?: string;
  isVerified: boolean;
}

export interface WorkerProfile {
  category?: string;
  bio?: string;
  experience?: string;
  hourlyRate?: number;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  skills?: string[];
}

export interface WorkerPublic {
  _id: string;
  category: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  experience: string;
  city: string;
  state: string;
  rating: number;
  totalJobs: number;
  isAvailable: boolean;
  user: { _id: string; name: string; email: string; avatar?: string };
}

export interface WorkerDashboardData {
  stats: {
    totalEarnings: number;
    jobsCompleted: number;
    rating: number;
    responseRate: number;
    isAvailable: boolean;
  };
  performance: {
    profileCompletion: number;
    clientSatisfaction: number;
    onTimeArrival: number;
  };
  recentJobs: {
    id: string;
    client: string;
    service: string;
    location: string;
    date: string;
    status: string;
    amount: number;
  }[];
}

// ─── Core fetch helper ────────────────────────────────────────────
const request = async <T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
  body?: unknown,
  customHeaders?: Record<string, string>
): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 
      "Content-Type": "application/json",
      ...customHeaders 
    },
    credentials: "include",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data.data as T;
};

// ─── Auth API ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: AuthUser; token: string }>("/auth/login", "POST", { email, password }),

  googleLogin: async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!data.success) {
      return { success: false, message: data.message, user: null, token: null };
    }
    return { success: true, user: data.data.user as AuthUser, token: data.data.token as string };
  },

  register: (
    name: string,
    email: string,
    password: string,
    role: "client" | "worker",
    phone?: string,
    workerProfile?: WorkerProfile,
    city?: string,
    address?: string,
    state?: string,
    pincode?: string
  ) =>
    request<{ user: AuthUser; token: string }>("/auth/register", "POST", {
      name, email, password, role, phone, city, address, state, pincode, ...workerProfile,
    }),

  me: () =>
    request<AuthUser>("/auth/me", "GET"),

  logout: () =>
    request<null>("/auth/logout", "POST"),
};

export interface EarningsData {
  summary: {
    totalEarnings: number;
    thisMonth: number;
    thisWeek: number;
    pendingEarnings: number;
    totalJobs: number;
    avgPerJob: number;
  };
  monthlyBreakdown: { month: string; amount: number }[];
  recentTransactions: {
    id: string;
    service: string;
    client: string;
    clientAvatar?: string;
    amount: number;
    paidAt: string;
    location: string;
  }[];
}

export interface PaginatedWorkers {
  workers: WorkerPublic[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// ─── Worker API ───────────────────────────────────────────────────
export const workerApi = {
  getAll: (params?: Record<string, string>) => {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return request<PaginatedWorkers>(`/workers${queryString}`, "GET");
  },

  getById: (id: string) =>
    request<WorkerPublic>(`/workers/${id}`, "GET"),

  getDashboard: (headers?: Record<string, string>) =>
    request<WorkerDashboardData>("/workers/dashboard", "GET", undefined, headers),

  toggleAvailability: () =>
    request<{ isAvailable: boolean }>("/workers/availability", "PUT"),

  getEarnings: () =>
    request<EarningsData>("/workers/earnings", "GET"),
};

// ─── Booking Types ────────────────────────────────────────────
export type JobStatus =
  | "pending" | "accepted" | "in_progress"
  | "awaiting_approval" | "completed" | "disputed" | "cancelled";

export interface BookingJob {
  _id: string;
  client: { _id: string; name: string; email: string; avatar?: string; phone?: string };
  worker: string | { _id: string; user: { _id: string; name: string; email: string; avatar?: string; phone?: string } };
  service: string;
  description: string;
  location: string;
  status: JobStatus;
  scheduledAt: string;
  estimatedPay: number;
  actualPay?: number;
  isUrgent: boolean;
  paymentMethod: "cash";
  paymentStatus: "pending" | "paid";
  workerNote?: string;
  clientApproval?: {
    approved: boolean;
    note?: string;
    approvedAt?: string;
  };
  reviewed: boolean;
  rescheduledCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookingsResponse {
  jobs: BookingJob[];
  pagination: { total: number; page: number; pages: number };
}

// ─── Booking API ──────────────────────────────────────────────
export const bookingApi = {
  // POST /api/bookings — client books a worker
  create: (data: {
    workerId: string;
    service: string;
    description: string;
    location: string;
    scheduledAt: string;
    estimatedPay: number;
    isUrgent?: boolean;
  }) => request<{ jobId: string }>("/bookings", "POST", data),

  // GET /api/bookings/worker — worker's paginated job list
  getWorkerJobs: (params?: { status?: string; page?: string; limit?: string }) => {
    const qs = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return request<BookingsResponse>(`/bookings/worker${qs}`, "GET");
  },

  // GET /api/bookings/client — client's requested jobs
  getClientJobs: (params?: { status?: string; page?: string; limit?: string }) => {
    const qs = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return request<BookingsResponse>(`/bookings/client${qs}`, "GET");
  },

  // PUT /api/bookings/:jobId/respond
  respond: (jobId: string, action: "accept" | "decline") =>
    request<{ status: string }>(`/bookings/${jobId}/respond`, "PUT", { action }),

  // PUT /api/bookings/:jobId/status (worker advances status)
  updateStatus: (jobId: string, status: string, opts?: { actualPay?: number; workerNote?: string }) =>
    request<{ status: string }>(`/bookings/${jobId}/status`, "PUT", { status, ...opts }),

  // PUT /api/bookings/:jobId/approve (client approves or disputes)
  approveJob: (jobId: string, action: "approve" | "dispute", note?: string, actualPay?: number) =>
    request<{ status: string; paymentStatus: string }>(`/bookings/${jobId}/approve`, "PUT", { action, note, actualPay }),

  // PUT /api/bookings/:jobId/cancel (client cancels pending/accepted booking)
  cancelBooking: (jobId: string, reason?: string) =>
    request<{ status: string }>(`/bookings/${jobId}/cancel`, "PUT", { reason }),

  // PUT /api/bookings/:jobId/reschedule (client reschedules pending/accepted booking)
  rescheduleBooking: (jobId: string, scheduledAt: string) =>
    request<{ scheduledAt: string; status: string }>(`/bookings/${jobId}/reschedule`, "PUT", { scheduledAt }),
};

// ─── SSE Helper ───────────────────────────────────────────────
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ─── Review API ──────────────────────────────────────────
export interface ReviewData {
  _id: string;
  job: { _id: string; service: string } | string;
  client: { _id: string; name: string; avatar?: string } | string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface WorkerReviewsResponse {
  reviews: ReviewData[];
  total: number;
  avgRating: number;
}

export interface MyReviewsResponse {
  reviews: ReviewData[];
  total: number;
  avgRating: number;
  breakdown: Record<number, number>;
}

export const reviewApi = {
  // POST /api/reviews — submit after job completion
  submit: (jobId: string, rating: number, comment?: string) =>
    request<ReviewData>("/reviews", "POST", { jobId, rating, comment }),

  // GET /api/reviews/worker/:workerId — all reviews for a worker (public)
  getWorkerReviews: (workerId: string) =>
    request<WorkerReviewsResponse>(`/reviews/worker/${workerId}`, "GET"),

  getMyReviews: () =>
    request<MyReviewsResponse>("/reviews/mine", "GET"),

  // GET /api/reviews/check/:jobId — check if client already reviewed
  checkReviewed: (jobId: string) =>
    request<{ reviewed: boolean }>(`/reviews/check/${jobId}`, "GET"),
};

// ─── Message API ──────────────────────────────────────────
export interface ChatMessage {
  _id: string;
  job: string;
  sender: string;
  senderModel: "User" | "Worker";
  text: string;
  createdAt: string;
}

export const messageApi = {
  getMessages: (jobId: string) =>
    request<ChatMessage[]>(`/messages/${jobId}`, "GET"),
};

// ─── Admin Types ──────────────────────────────────────────────
export interface AdminStats {
  overview: {
    totalUsers: number;
    totalWorkers: number;
    totalBookings: number;
    totalRevenue: number;
    clientCount: number;
    workerCount: number;
    pendingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    disputedBookings: number;
    newUsersThisMonth: number;
  };
  recentUsers: AdminUser[];
  bookingsByStatus: { _id: string; count: number }[];
  trendData: { name: string; revenue: number; bookings: number }[];
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  city?: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export interface AdminWorker {
  _id: string;
  category: string;
  rating: number;
  totalJobs: number;
  isAvailable: boolean;
  isElite: boolean;
  hourlyRate: number;
  city: string;
  createdAt: string;
  userInfo: { name: string; email: string; avatar?: string };
}

export interface AdminBooking {
  _id: string;
  service: string;
  description: string;
  location: string;
  status: string;
  scheduledAt: string;
  estimatedPay: number;
  actualPay?: number;
  isUrgent: boolean;
  paymentStatus: string;
  createdAt: string;
  client: { _id: string; name: string; email: string; avatar?: string };
  worker: { _id: string; user: { name: string; email: string; avatar?: string } };
}

export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ─── Admin API ────────────────────────────────────────────────
export const adminApi = {
  getStats: () =>
    request<AdminStats>("/admin/stats", "GET"),

  getUsers: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ users: AdminUser[]; pagination: AdminPagination }>(`/admin/users${qs}`, "GET");
  },

  deleteUser: (id: string) =>
    request<null>(`/admin/users/${id}`, "DELETE"),

  toggleBlockUser: (id: string) =>
    request<{ isBlocked: boolean }>(`/admin/users/${id}/block`, "PATCH"),

  getWorkers: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ workers: AdminWorker[]; pagination: AdminPagination }>(`/admin/workers${qs}`, "GET");
  },

  toggleElite: (id: string) =>
    request<{ isElite: boolean }>(`/admin/workers/${id}/elite`, "PATCH"),

  getBookings: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ bookings: AdminBooking[]; pagination: AdminPagination }>(`/admin/bookings${qs}`, "GET");
  },

  updateBookingStatus: (id: string, status: string) =>
    request<AdminBooking>(`/admin/bookings/${id}/status`, "PATCH", { status }),
};