import { createFileRoute } from "@tanstack/react-router";
import MyAppointments from "@/pages/client/MyAppointments";

export const Route = createFileRoute("/meus-agendamentos")({
  component: MyAppointments,
  head: () => ({
    meta: [
      { title: "Meus Agendamentos — Belle" },
      { name: "description", content: "Consulte seus horários agendados e histórico de atendimentos." },
    ],
  }),
});
