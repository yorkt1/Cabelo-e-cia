import { createFileRoute, redirect } from "@tanstack/react-router";
import ProfessionalsPage from "@/pages/professionals/ProfessionalsPage";
import { useAuth } from "@/store/authStore";

export const Route = createFileRoute("/_app/profissionais")({
  beforeLoad: () => {
    const { user } = useAuth.getState();
    if (user?.role !== "owner" && user?.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: ProfessionalsPage,
});
