import { createFileRoute } from "@tanstack/react-router";
import BookingPage from "@/pages/booking/BookingPage";

export const Route = createFileRoute("/agendar")({
  component: BookingPage,
  head: () => ({
    meta: [
      { title: "Agendar — Belle" },
      { name: "description", content: "Agende seu horário em poucos segundos. Escolha serviço, profissional, data e pronto." },
      { property: "og:title", content: "Agende seu horário — Belle" },
    ],
  }),
});
