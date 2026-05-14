import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  setSidebar: (v: boolean) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarCollapsed: false,
      toggleTheme: () =>
        set((s) => {
          const t = s.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined")
            document.documentElement.classList.toggle("dark", t === "dark");
          return { theme: t };
        }),
      setSidebar: (v) => set({ sidebarCollapsed: v }),
    }),
    { name: "cabelos-cia-ui" },
  ),
);
