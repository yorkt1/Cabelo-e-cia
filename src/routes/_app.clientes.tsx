import { createFileRoute } from "@tanstack/react-router";
import ClientsPage from "@/pages/clients/ClientsPage";
export const Route = createFileRoute("/_app/clientes")({ component: ClientsPage });
