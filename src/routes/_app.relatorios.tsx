import { createFileRoute, redirect } from "@tanstack/react-router";
import ReportsPage from "@/pages/reports/ReportsPage";
import { useAuth } from "@/store/authStore";

export const Route = createFileRoute("/_app/relatorios")({
  beforeLoad: () => {
    const { user } = useAuth.getState();
    if (user?.role !== "owner" && user?.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: ReportsPage,
});
