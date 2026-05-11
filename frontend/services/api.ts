const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// ─── Types ───────────────────────────────────────────────────────
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "client" | "worker";
  avatar?: string;
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
}

export interface WorkerPublic {
  _id: string;
  category: string;
  bio: string;
  hourlyRate: number;
  experience: string;
  city: string;
  state: string;
  rating: number;
  totalJobs: number;
  isAvailable: boolean;
  user: { _id: string; name: string; email: string; avatar?: string };
}

// ─── Core fetch helper ────────────────────────────────────────────
const request = async <T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
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

  register: (
    name: string,
    email: string,
    password: string,
    role: "client" | "worker",
    phone?: string,
    workerProfile?: WorkerProfile
  ) =>
    request<{ user: AuthUser; token: string }>("/auth/register", "POST", {
      name, email, password, role, phone, ...workerProfile,
    }),

  me: () =>
    request<AuthUser>("/auth/me", "GET"),

  logout: () =>
    request<null>("/auth/logout", "POST"),
};

// ─── Worker API ───────────────────────────────────────────────────
export const workerApi = {
  // GET /api/workers — public: all workers (client sees available ones)
  getAll: (params?: Record<string, string>) => {
    const queryString = params 
      ? "?" + new URLSearchParams(params).toString() 
      : "";
    return request<WorkerPublic[]>(`/workers${queryString}`, "GET");
  },

  getById: (id: string) =>
    request<WorkerPublic>(`/workers/${id}`, "GET"),

  // PUT /api/workers/availability — worker toggles online/offline
  toggleAvailability: () =>
    request<{ isAvailable: boolean }>("/workers/availability", "PUT"),
};