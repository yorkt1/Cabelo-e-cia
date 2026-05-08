import { createFileRoute, redirect } from "@tanstack/react-router";
import FinancialPage from "@/pages/financial/FinancialPage";
import { useAuth } from "@/store/authStore";

export const Route = createFileRoute("/_app/financeiro")({
  beforeLoad: () => {
    const { user } = useAuth.getState();
    if (user?.role !== "owner") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: FinancialPage,
});
