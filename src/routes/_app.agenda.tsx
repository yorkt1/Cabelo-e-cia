import { createFileRoute } from "@tanstack/react-router";
import AgendaPage from "@/pages/agenda/AgendaPage";
export const Route = createFileRoute("/_app/agenda")({ component: AgendaPage });
