import { createFileRoute, redirect } from "@tanstack/react-router";
import SubscriptionPage from "@/pages/subscription/SubscriptionPage";
import { useAuth } from "@/store/authStore";

export const Route = createFileRoute("/_app/assinatura")({
  beforeLoad: () => {
    const { user } = useAuth.getState();
    if (user?.role !== "owner") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SubscriptionPage,
});
