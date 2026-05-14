import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role, Client, useDb } from "./mockDb";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "@/utils/supabaseConfig";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  name: string;
  email: string;
  role: Role | "client";
  salonId: string;
  phone?: string;
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
  updateUser: (values: { name?: string; email?: string; phone?: string; birthday?: string }) => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        // Simulação de login para profissionais
        if (email === "contato@cabelos-cia.com" || email === "demo@cabelos-cia.com") {
          const salon = useDb.getState().salon;
          set({ 
            user: { id: "1", name: "Bruna Lima", email, role: "owner", salonId: salon?.id || "salon_demo" }, 
            isAuthenticated: true 
          });
        } else if (email === "colaborador@cabelos-cia.com") {
          set({ 
            user: { id: "u2", name: "Ana Silva", email, role: "professional", salonId: "salon_demo" }, 
            isAuthenticated: true 
          });
        } else {
          throw new Error("Credenciais inválidas");
        }
      },

      loginByPhone: async (phone) => {
        const cleanPhone = phone.replace(/\D/g, "");
        
        // Verifica no Supabase
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("telefone", cleanPhone)
          .maybeSingle();

        if (data) {
          const user: User = {
            id: data.id ? data.id.toString() : data.codigo,
            name: data.nome,
            email: data.email || "",
            role: "client",
            salonId: "salon_demo",
            phone: data.telefone
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

        const supabaseData = {
          nome: values.name,
          telefone: values.phone,
          email: values.email || "",
          codigo: newClient.codigo,
        };

        const { error } = await supabase.from("clientes").insert(supabaseData);
        if (error) {
          console.error("Erro ao salvar cliente no Supabase:", error);
        }

        const user: User = {
          id: newClient.id,
          name: newClient.name,
          email: newClient.email,
          role: "client",
          salonId: newClient.salonId,
          phone: newClient.phone
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

      updateUser: async (values) => {
        const state = useDb.getState();
        const { user } = useAuth.getState();
        if (!user) return;

        const oldId = user.id;
        // Busca o telefone localmente caso não esteja no objeto user ainda
        const localClient = state.clients.find(c => c.id === oldId);
        const currentPhone = user.phone || localClient?.phone;
        const cleanCurrentPhone = currentPhone?.replace(/\D/g, "");
        
        const newPhone = values.phone?.replace(/\D/g, "");

        // Dados baseados na sua tabela do Supabase
        const updateData: any = {
          nome: values.name,
          email: values.email,
          telefone: newPhone || cleanCurrentPhone,
          data: values.birthday 
        };

        console.log("Tentando atualizar perfil no Supabase...");
        console.log("Dados:", updateData);
        console.log("Filtros de busca:", { telefone: cleanCurrentPhone, codigo: oldId });

        // Tenta encontrar por telefone OU pelo código
        const { error, data } = await supabase
          .from("clientes")
          .update(updateData)
          .or(`telefone.eq."${cleanCurrentPhone}",codigo.eq."${oldId}"`)
          .select();

        if (error) {
          console.error("Erro ao atualizar perfil no Supabase:", error);
          throw error;
        }

        // --- NOVO: Atualiza também a tabela de AGENDAMENTOS ---
        try {
          const codigoMatch = localClient?.codigo || oldId;
          
          await supabase
            .from("agendamentos")
            .update({
              nome_cliente: values.name,
              email_cliente: values.email,
              phone_cliente: values.phone || currentPhone
            })
            .or(`phone_cliente.eq."${cleanCurrentPhone}",codigo_cliente.eq."${codigoMatch}"`);
        } catch (e) {
          console.warn("Aviso: Não foi possível atualizar dados na tabela de agendamentos.", e);
        }
        // -------------------------------------------------------

        console.log("Resultado da atualização:", data);

        // Atualiza localmente no mockDb
        state.updateClient(oldId, {
          name: values.name,
          email: values.email,
          phone: values.phone,
          birthday: values.birthday
        });

        // Atualiza no store de autenticação
        set((s) => ({
          user: s.user ? {
            ...s.user,
            name: values.name ?? s.user.name,
            email: values.email ?? s.user.email,
            phone: newPhone || s.user.phone
          } : null
        }));
      },
    }),
    { name: "belle-auth" }
  )
);
