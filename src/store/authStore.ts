import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, useDb } from "./mockDb";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  salonId: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (values: { name: string; salonName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  setRole: (role: Role) => void; // Apenas para testes/demo
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Simulação de login
        if (email === "contato@belle.com") {
          set({ 
            user: { id: "u1", name: "Guilherme (Dono)", email, role: "owner", salonId: "salon_demo" }, 
            isAuthenticated: true 
          });
        } else if (email === "colaborador@belle.com") {
          set({ 
            user: { id: "u2", name: "Ana Silva", email, role: "professional", salonId: "salon_demo" }, 
            isAuthenticated: true 
          });
        } else {
          throw new Error("Credenciais inválidas");
        }
      },
      register: async ({ name, salonName, email }) => {
        const user: User = {
          id: Math.random().toString(36).slice(2, 10),
          name,
          email,
          role: "owner",
          salonId: "salon_demo",
        };

        useDb.getState().updateSalon(user.salonId, { name: salonName });
        set({ user, isAuthenticated: true });
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      setRole: (role) => set((state) => ({ 
        user: state.user ? { ...state.user, role } : null 
      })),
    }),
    { name: "belle-auth" }
  )
);
