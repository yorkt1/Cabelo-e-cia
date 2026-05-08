import { createFileRoute } from "@tanstack/react-router";
import SuperAdminPage from "@/pages/super-admin/SuperAdminPage";
export const Route = createFileRoute("/_app/admin")({ component: SuperAdminPage });
