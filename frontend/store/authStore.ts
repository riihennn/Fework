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
  googleLogin: (email: string) => Promise<boolean>;
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

      // ── Google Login ───────────────────────────────────────────
      googleLogin: async (email) => {
        set({ isLoading: true, error: null });
        const result = await authApi.googleLogin(email);
        if (!result.success) {
          set({ error: result.message, isLoading: false });
          return false;
        }
        set({ user: result.user, isAuthenticated: true, isLoading: false });
        return true;
      },

      // ── Register ───────────────────────────────────────────────
      register: async (name, email, password, role, phone, workerProfile, city, address, state, pincode) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register(name, email, password, role, phone, workerProfile, city, address, state, pincode);
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
