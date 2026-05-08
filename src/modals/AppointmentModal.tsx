import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDb, type Appointment, type AppointmentStatus } from "@/store/mockDb";
import { dayjs } from "@/utils/format";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Appointment | null;
  initialStart?: string | null;
}

interface Form {
  clientId: string;
  professionalId: string;
  serviceId: string;
  start: string;
  status: AppointmentStatus;
  notes?: string;
}

export default function AppointmentModal({ open, onOpenChange, editing, initialStart }: Props) {
  const { clients, professionals, services, addAppointment, updateAppointment, removeAppointment } = useDb();
  const { register, handleSubmit, reset, control } = useForm<Form>();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      reset({
        clientId: editing.clientId,
        professionalId: editing.professionalId,
        serviceId: editing.serviceIds[0],
        start: dayjs(editing.start).format("YYYY-MM-DDTHH:mm"),
        status: editing.status,
        notes: editing.notes,
      });
    } else {
      reset({
        clientId: clients[0]?.id,
        professionalId: professionals[0]?.id,
        serviceId: services[0]?.id,
        start: initialStart ? dayjs(initialStart).format("YYYY-MM-DDTHH:mm") : dayjs().format("YYYY-MM-DDTHH:mm"),
        status: "scheduled",
        notes: "",
      });
    }
  }, [open, editing, initialStart, clients, professionals, services, reset]);

  function onSubmit(values: Form) {
    const svc = services.find((s) => s.id === values.serviceId);
    if (!svc) return;
    const start = dayjs(values.start);
    const end = start.add(svc.durationMin, "minute");

    // conflict check
    const conflict = useDb.getState().appointments.some((a) =>
      a.id !== editing?.id &&
      a.professionalId === values.professionalId &&
      a.status !== "cancelled" &&
      dayjs(a.start).isBefore(end) &&
      dayjs(a.end).isAfter(start)
    );
    if (conflict) {
      toast.error("Conflito de horário com outro agendamento.");
      return;
    }

    const payload = {
      salonId: "salon_demo",
      clientId: values.clientId,
      professionalId: values.professionalId,
      serviceIds: [values.serviceId],
      start: start.toISOString(),
      end: end.toISOString(),
      status: values.status,
      notes: values.notes,
      total: svc.price,
    };

    if (editing) {
      updateAppointment(editing.id, payload);
      toast.success("Agendamento atualizado");
    } else {
      addAppointment(payload);
      toast.success("Agendamento criado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{editing ? "Editar" : "Novo"} agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Controller name="clientId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            )} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Profissional</Label>
              <Controller name="professionalId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{professionals.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-2">
              <Label>Serviço</Label>
              <Controller name="serviceId" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{services.filter(s => s.active).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Início</Label>
              <Input type="datetime-local" {...register("start")} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller name="status" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="no_show">Não compareceu</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea rows={3} {...register("notes")} />
          </div>
          <DialogFooter className="gap-2">
            {editing && (
              <Button type="button" variant="outline" className="text-destructive" onClick={() => { removeAppointment(editing.id); toast.success("Removido"); onOpenChange(false); }}>
                Excluir
              </Button>
            )}
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
