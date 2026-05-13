import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, AuthUser, WorkerProfile } from "@/services/api";

// ─── State Shape ────────────────────────────────────────────────
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── Actions ─────────────────────────────────────────────────────
interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "client" | "worker",
    phone?: string,
    workerProfile?: WorkerProfile,
    city?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

// ─── Store ──────────────────────────────────────────────────────
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // ── Initial State ──────────────────────────────────────────
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Login ──────────────────────────────────────────────────
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login(email, password);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Login failed.";
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      // ── Register ───────────────────────────────────────────────
      register: async (name, email, password, role, phone, workerProfile, city) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register(name, email, password, role, phone, workerProfile, city);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Registration failed.";
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      // ── Logout ─────────────────────────────────────────────────
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      // ── Restore session from backend (via httpOnly cookie) ─────
      restoreSession: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      // ── Clear error ────────────────────────────────────────────
      clearError: () => set({ error: null }),
    }),
    {
      name: "fework-auth", // localStorage key
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
