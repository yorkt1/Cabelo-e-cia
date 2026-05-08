import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useDb } from "@/store/mockDb";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AppointmentModal from "@/modals/AppointmentModal";
import { Card } from "@/components/ui/card";
import type { Appointment } from "@/store/mockDb";

export default function AgendaPage() {
  const { appointments, professionals, clients, services, updateAppointment } = useDb();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [initialStart, setInitialStart] = useState<string | null>(null);
  const calRef = useRef<FullCalendar>(null);

  const events = useMemo(
    () => appointments.map((a) => {
      const pro = professionals.find((p) => p.id === a.professionalId);
      const cli = clients.find((c) => c.id === a.clientId);
      const svc = services.find((s) => s.id === a.serviceIds[0]);
      return {
        id: a.id,
        title: `${cli?.name ?? "Cliente"} · ${svc?.name ?? ""}`,
        start: a.start,
        end: a.end,
        backgroundColor: pro?.color ?? "var(--primary)",
        borderColor: pro?.color ?? "var(--primary)",
        textColor: "#fff",
        extendedProps: { appt: a },
      };
    }),
    [appointments, professionals, clients, services]
  );

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Arraste para reagendar. Clique em um horário para criar."
        actions={
          <Button onClick={() => { setEditing(null); setInitialStart(null); setOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" /> Novo agendamento
          </Button>
        }
      />
      <Card className="p-4 border-border/60">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
          locale="pt-br"
          buttonText={{ today: "Hoje", month: "Mês", week: "Semana", day: "Dia" }}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="21:00:00"
          height={720}
          editable
          selectable
          nowIndicator
          events={events}
          select={(info) => {
            setEditing(null);
            setInitialStart(info.startStr);
            setOpen(true);
          }}
          eventClick={(info) => {
            setEditing(info.event.extendedProps.appt as Appointment);
            setOpen(true);
          }}
          eventDrop={(info) => {
            const appt = info.event.extendedProps.appt as Appointment;
            updateAppointment(appt.id, { start: info.event.startStr, end: info.event.endStr });
          }}
          eventResize={(info) => {
            const appt = info.event.extendedProps.appt as Appointment;
            updateAppointment(appt.id, { start: info.event.startStr, end: info.event.endStr });
          }}
        />
      </Card>
      <AppointmentModal open={open} onOpenChange={setOpen} editing={editing} initialStart={initialStart} />
    </div>
  );
}
