import { createFileRoute, redirect } from "@tanstack/react-router";
import SettingsPage from "@/pages/settings/SettingsPage";
import { useAuth } from "@/store/authStore";

export const Route = createFileRoute("/_app/configuracoes")({
  beforeLoad: () => {
    const { user } = useAuth.getState();
    if (user?.role !== "owner" && user?.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SettingsPage,
});
