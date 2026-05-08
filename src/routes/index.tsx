import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/pages/home/HomePage";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Belle — Agenda profissional para salões e estética" },
      { name: "description", content: "SaaS de agendamento minimalista para salões, barbearias, nail e lash designers. Reduza faltas, organize sua agenda e cresça com leveza." },
      { property: "og:title", content: "Belle — Agenda profissional para salões" },
      { property: "og:description", content: "Agendamento online, clientes, finanças e relatórios em um só lugar." },
    ],
  }),
});
