import { createFileRoute, redirect } from "@tanstack/react-router";
import ServicesPage from "@/pages/services/ServicesPage";
import { useAuth } from "@/store/authStore";

export const Route = createFileRoute("/_app/servicos")({
  beforeLoad: () => {
    const { user } = useAuth.getState();
    if (user?.role !== "owner" && user?.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: ServicesPage,
});
