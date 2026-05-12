import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, Client, useDb } from "./mockDb";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role | "client";
  salonId: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginByPhone: (phone: string) => Promise<{ isNew: boolean; user?: User }>;
  registerClient: (values: { name: string; phone: string; email?: string; birthday?: string }) => Promise<void>;
  register: (values: { name: string; salonName: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  setRole: (role: Role | "client") => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        // Simulação de login para profissionais
        if (email === "contato@belle.com" || email === "demo@belle.com") {
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

      loginByPhone: async (phone) => {
        const db = useDb.getState();
        const cleanPhone = phone.replace(/\D/g, "");
        const client = db.clients.find(c => c.phone.replace(/\D/g, "") === cleanPhone);
        
        if (client) {
          const user: User = {
            id: client.id,
            name: client.name,
            email: client.email,
            role: "client",
            salonId: client.salonId
          };
          set({ user, isAuthenticated: true });
          return { isNew: false, user };
        }
        
        return { isNew: true };
      },

      registerClient: async (values) => {
        const db = useDb.getState();
        const newClient = db.addClient({
          salonId: "salon_demo",
          name: values.name,
          phone: values.phone,
          email: values.email || "",
          birthday: values.birthday
        });

        const user: User = {
          id: newClient.id,
          name: newClient.name,
          email: newClient.email,
          role: "client",
          salonId: newClient.salonId
        };
        set({ user, isAuthenticated: true });
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
