import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ArrowRight, Calendar as CalIcon, Clock, Sparkles } from "lucide-react";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDb } from "@/store/mockDb";
import { useAuth } from "@/store/authStore";
import { brl, dayjs, fmtDate, initials } from "@/utils/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "@/utils/supabaseConfig";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { toast } from "sonner";

const STEPS = ["Serviço", "Profissional", "Data e hora", "Seus dados"] as const;

const TIMES = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
];

export default function BookingPage() {
  const { services, professionals, appointments, addAppointment, addClient, clients } = useDb();
  const { user } = useAuth();
  const client = user?.role === "client" ? clients.find((c) => c.id === user.id) : undefined;
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string>("");
  const [professionalId, setProfessionalId] = useState<string>("");
  const [date, setDate] = useState<string>(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [time, setTime] = useState<string>("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "" });
  const [bookingFor, setBookingFor] = useState<"self" | "guest">(client ? "self" : "guest");
  const [done, setDone] = useState(false);

  const service = services.find((s) => s.id === serviceId);
  const professional = professionals.find((p) => p.id === professionalId);

  useEffect(() => {
    if (client && bookingFor === "self") {
      setContact((prev) => ({
        name: client.name || prev.name,
        email: client.email || prev.email,
        phone: client.phone || prev.phone,
        notes: prev.notes,
      }));
      return;
    }

    if (bookingFor === "guest") {
      setContact((prev) => ({
        name: "",
        email: "",
        phone: "",
        notes: prev.notes,
      }));
    }
  }, [client, bookingFor]);

  const availableTimes = useMemo(() => {
    if (!professionalId || !date || !service) return TIMES;
    const dayAppts = appointments.filter(
      (a) =>
        a.professionalId === professionalId &&
        dayjs(a.start).isSame(date, "day") &&
        a.status !== "cancelled",
    );
    return TIMES.filter((t) => {
      const [h, m] = t.split(":").map(Number);
      const start = dayjs(date).hour(h).minute(m);
      const end = start.add(service.durationMin, "minute");
      return !dayAppts.some((a) => dayjs(a.start).isBefore(end) && dayjs(a.end).isAfter(start));
    });
  }, [professionalId, date, service, appointments]);

  const canProceed =
    (step === 0 && !!serviceId) ||
    (step === 1 && !!professionalId) ||
    (step === 2 && !!date && !!time && !!user) ||
    (step === 3 && !!contact.name && !!contact.phone && (bookingFor === "self" || !!contact.email));

  async function handleConfirm() {
    if (!service) return;
    const [h, m] = time.split(":").map(Number);
    const start = dayjs(date).hour(h).minute(m).second(0);
    const end = start.add(service.durationMin, "minute");

    const selfBooking = bookingFor === "self" && user?.role === "client";

    let client;
    if (selfBooking && user) {
      client = clients.find((c) => c.id === user.id);
    }

    if (!client) {
      client = clients.find((c) => c.phone.replace(/\D/g, "") === contact.phone.replace(/\D/g, ""));
    }

    if (!client) {
      client = addClient({
        salonId: "salon_demo",
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      });
    }

    // Dados formatados para a sua tabela 'agendamentos'
    const supabaseData = {
      nome_cliente: contact.name,
      phone_cliente: contact.phone,
      email_cliente: contact.email,
      codigo_cliente: client.codigo, // Agora usa o formato A1423
      tipo_corte: service.name,
      valor: service.price,
      duracao: service.durationMin,
      horario: start.toISOString(),
      status: "scheduled",
      descricao: contact.notes,
      barbeiro_nome: professional?.name,
      barbeiro_email: professional?.email,
      barbeiro_telefone: "", // Caso você queira adicionar depois no Professional
      proprietario: "Cabelo e Cia",
      proprietario_que_agendou: "Site",
      forma_de_pagamento: "A definir",
    };

    const appointmentData = {
      salonId: "salon_demo",
      clientId: client.id,
      professionalId,
      serviceIds: [serviceId],
      start: start.toISOString(),
      end: end.toISOString(),
      status: "scheduled" as const,
      notes: contact.notes,
      total: service.price,
    };

    // Insert into Supabase (tabela correta: agendamentos)
    const { error } = await supabase.from("agendamentos").insert(supabaseData);

    if (error) {
      console.error("Supabase insert error:", error);
      toast.error("Erro ao sincronizar com o banco de dados.");
    } else {
      // Also add locally
      addAppointment(appointmentData);
      toast.success("Agendamento confirmado!");
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="size-20 mx-auto rounded-full bg-primary/15 flex items-center justify-center">
              <Check className="size-10 text-primary" strokeWidth={2} />
            </div>
            <h1 className="font-display text-4xl font-semibold mt-8">Tudo certo!</h1>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Enviamos a confirmação para <strong>{contact.email || contact.phone}</strong>. Nos
              vemos em breve.
            </p>
            <Card className="mt-10 p-6 text-left border-border/60">
              <div className="space-y-3 text-sm">
                <Row label="Serviço" value={service?.name ?? ""} />
                <Row label="Profissional" value={professional?.name ?? ""} />
                <Row label="Data" value={fmtDate(date)} />
                <Row label="Horário" value={time} />
                <Row label="Valor" value={brl(service?.price ?? 0)} />
              </div>
            </Card>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Link
                to="/"
                className="px-5 py-3 rounded-xl border border-border hover:bg-secondary text-sm font-medium order-2 sm:order-1"
              >
                Voltar ao início
              </Link>
              <button
                onClick={() => {
                  toast.info("Copiado para o clipboard!", {
                    description: "00020126580014BR.GOV.BCB.PIX...",
                  });
                }}
                className="px-5 py-3 rounded-xl bg-[#00bdae] text-white hover:bg-[#00bdae]/90 text-sm font-medium flex items-center justify-center gap-2 order-1 sm:order-2 shadow-lg shadow-[#00bdae]/20"
              >
                Pagar agora com Pix <Check className="size-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4">
              Pague antecipado e garanta sua vaga com prioridade.
            </p>
          </motion.div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex items-center">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center text-sm font-medium border transition-colors",
                    i < step && "bg-primary text-primary-foreground border-primary",
                    i === step && "border-primary text-primary bg-primary/10",
                    i > step && "border-border text-muted-foreground",
                  )}
                >
                  {i < step ? <Check className="size-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] text-center",
                    i <= step ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn("h-px flex-1 mx-2 -mt-6", i < step ? "bg-primary" : "bg-border")}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="p-6 md:p-10 border-border/60">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold">
                    Qual serviço você deseja?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Escolha o que vamos cuidar hoje.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                    {services
                      .filter((s) => s.active)
                      .map((s) => {
                        const active = serviceId === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setServiceId(s.id)}
                            className={cn(
                              "text-left rounded-xl border p-5 transition-all",
                              active
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/40 bg-card",
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{s.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {s.category} · {s.durationMin} min
                                </p>
                              </div>
                              <p className="font-display text-lg font-semibold">{brl(s.price)}</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold">
                    Com quem você quer ser atendida?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Escolha sua profissional preferida.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
                    {professionals.map((p) => {
                      const active = professionalId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setProfessionalId(p.id)}
                          className={cn(
                            "rounded-xl border p-5 transition-all flex flex-col items-center text-center",
                            active
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 bg-card",
                          )}
                        >
                          <Avatar className="size-14">
                            <AvatarFallback className="text-white" style={{ background: p.color }}>
                              {initials(p.name)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-medium mt-3">{p.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {p.specialties.slice(0, 2).join(" · ")}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold">
                    Quando fica bom?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecione data e horário disponíveis.
                  </p>
                  <div className="grid md:grid-cols-2 gap-8 mt-8">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        <CalIcon className="size-3.5 inline mr-1.5" />
                        Data
                      </Label>
                      <Input
                        type="date"
                        value={date}
                        min={dayjs().format("YYYY-MM-DD")}
                        onChange={(e) => {
                          setDate(e.target.value);
                          setTime("");
                        }}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-3">
                        {dayjs(date).format("dddd, DD [de] MMMM")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        <Clock className="size-3.5 inline mr-1.5" />
                        Horário
                      </Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {!user && (
                          <div className="col-span-3 rounded-xl border border-border/70 bg-secondary/50 p-4 text-sm text-muted-foreground">
                            Faça login para verificar se você já tem um horário antes de escolher um novo.
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Link to="/login" className="text-primary hover:underline">
                                Entrar
                              </Link>
                              <span className="text-muted-foreground">ou</span>
                              <Link to="/auth/register" className="text-primary hover:underline">
                                criar conta
                              </Link>
                            </div>
                          </div>
                        )}
                        {availableTimes.length === 0 && (
                          <p className="col-span-3 text-sm text-muted-foreground py-6 text-center">
                            Sem horários nesse dia. Tente outra data.
                          </p>
                        )}
                        {availableTimes.map((t) => (
                          <button
                            key={t}
                            onClick={() => user && setTime(t)}
                            disabled={!user}
                            className={cn(
                              "py-2.5 rounded-lg border text-sm transition-colors",
                              !user
                                ? "border-border bg-muted/10 text-muted-foreground cursor-not-allowed"
                                : time === t
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:border-primary/40 bg-card",
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-semibold">Quase lá!</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Para confirmarmos e enviarmos lembretes.
                  </p>
                  {client ? (
                    <div className="flex justify-center mt-6 mb-8">
                      <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setBookingFor("self")}
                          className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all",
                            bookingFor === "self"
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Eu
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingFor("guest")}
                          className={cn(
                            "px-6 py-2 rounded-full text-sm font-medium transition-all",
                            bookingFor === "guest"
                              ? "bg-primary text-primary-foreground shadow-md"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          Convidado
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div className="grid md:grid-cols-2 gap-5 mt-10">
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold">Nome completo *</Label>
                      <Input
                        value={contact.name}
                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                        disabled={bookingFor === "self" && !!client}
                        className="rounded-xl bg-secondary/50 border-border/60 focus-visible:bg-background transition-colors h-11"
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-sm font-semibold">Telefone *</Label>
                      <Input
                        value={contact.phone}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        placeholder="(11) 99999-0000"
                        disabled={bookingFor === "self" && !!client}
                        className="rounded-xl bg-secondary/50 border-border/60 focus-visible:bg-background transition-colors h-11"
                      />
                    </div>
                    <div className="space-y-2.5 md:col-span-2">
                      <Label className="text-sm font-semibold">Email{bookingFor === "guest" ? " *" : ""}</Label>
                      <Input
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        className="rounded-xl bg-secondary/50 border-border/60 focus-visible:bg-background transition-colors h-11"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-2.5 md:col-span-2">
                      <Label className="text-sm font-semibold">Observações (opcional)</Label>
                      <Textarea
                        rows={3}
                        value={contact.notes}
                        onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                        className="rounded-xl bg-secondary/50 border-border/60 focus-visible:bg-background transition-colors resize-none"
                        placeholder="Algum detalhe importante para a profissional?"
                      />
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-border/40">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 mb-4">
                      <Sparkles className="size-4 text-primary" />
                      Resumo do agendamento
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="rounded-xl bg-secondary/30 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Serviço</p>
                        <p className="font-semibold text-sm mt-2">{service?.name ?? "-"}</p>
                      </div>
                      <div className="rounded-xl bg-secondary/30 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Profissional</p>
                        <p className="font-semibold text-sm mt-2">{professional?.name ?? "-"}</p>
                      </div>
                      <div className="rounded-xl bg-secondary/30 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Valor</p>
                        <p className="font-semibold text-sm mt-2 text-primary">{brl(service?.price ?? 0)}</p>
                      </div>
                      <div className="rounded-xl bg-secondary/30 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Data</p>
                        <p className="font-semibold text-sm mt-2">{fmtDate(date)}</p>
                      </div>
                      <div className="rounded-xl bg-secondary/30 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Horário</p>
                        <p className="font-semibold text-sm mt-2">{time}</p>
                      </div>
                      <div className="rounded-xl bg-secondary/30 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Duração</p>
                        <p className="font-semibold text-sm mt-2">{service?.durationMin ?? "-"} min</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))}
            >
              <ArrowLeft className="size-4" /> Voltar
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continuar <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={!canProceed}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Confirmar agendamento <Check className="size-4" />
              </Button>
            )}
          </div>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
