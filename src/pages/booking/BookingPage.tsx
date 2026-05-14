import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ArrowRight, Calendar as CalIcon, Clock, Sparkles, Settings, XCircle, CalendarDays, Star } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const { services, professionals, appointments, addAppointment, addClient, updateClient, clients } = useDb();
  const { user } = useAuth();
  // Busca o cliente local no mockDb, mas usaremos o 'user' como fonte primária de dados reais
  const localClient = user?.role === "client" ? clients.find((c) => c.id === user.id) : undefined;
  const client = user?.role === "client" ? {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || ""
  } : undefined;
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string>("");
  const [professionalId, setProfessionalId] = useState<string>("");
  const [date, setDate] = useState<string>(dayjs().add(1, "day").format("YYYY-MM-DD"));
  const [time, setTime] = useState<string>("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "" });
  const [bookingFor, setBookingFor] = useState<"self" | "guest">(client ? "self" : "guest");
  const [paymentMethod, setPaymentMethod] = useState("Dinheiro");
  const [remoteAppointments, setRemoteAppointments] = useState<any[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [done, setDone] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [showExistingWarning, setShowExistingWarning] = useState(false);
  const [pendingTime, setPendingTime] = useState<string>("");
  const [reschedulingFrom, setReschedulingFrom] = useState<any>(null);
  const [loadingUserBookings, setLoadingUserBookings] = useState(false);
  
  const resetBooking = () => {
    setServiceId("");
    setProfessionalId("");
    setTime("");
    setDone(false);
    setStep(0);
  };

  const service = services.find((s) => s.id === serviceId);
  const professional = professionals.find((p) => p.id === professionalId);

  useEffect(() => {
    // Se estiver agendando para si mesmo e estiver logado
    if (user && bookingFor === "self") {
      setContact((prev) => ({
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        notes: prev.notes,
      }));
    } else if (bookingFor === "guest") {
      setContact((prev) => ({
        name: "",
        email: "",
        phone: "",
        notes: prev.notes,
      }));
    }
  }, [user, bookingFor]);

  // Busca agendamentos reais do Supabase para bloquear horários
  const fetchAvailability = async () => {
    if (!date || !professional) return;
    
    setLoadingAvailability(true);
    try {
      // Busca agendamentos do dia para este profissional
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("barbeiro_nome", professional.name)
        .gte("horario", dayjs(date).startOf("day").toISOString())
        .lte("horario", dayjs(date).endOf("day").toISOString())
        .neq("status", "cancelled");

      if (error) throw error;
      setRemoteAppointments(data || []);
    } catch (err) {
      console.error("Erro ao buscar disponibilidade:", err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [date, professional]);

  const fetchUserBookings = async () => {
    if (!user) return;
    
    setLoadingUserBookings(true);
    try {
      const cleanPhone = user.phone?.replace(/\D/g, "");
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .or(`phone_cliente.eq.${cleanPhone},codigo_cliente.eq.${user.id}`)
        .eq("status", "Agendado")
        .gte("horario", dayjs().startOf("day").toISOString()) // Pega desde o início de hoje
        .order("horario", { ascending: true });

      if (!error) {
        if (data && data.length > 0) {
          setExistingBooking(data[0]);
        } else {
          setExistingBooking(null);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar agendamentos do usuário:", err);
    } finally {
      setLoadingUserBookings(false);
    }
  };

  // Busca agendamentos do próprio usuário para evitar duplicidade
  useEffect(() => {
    fetchUserBookings();
  }, [user]);

  const slotStates = useMemo(() => {
    if (!professionalId || !date || !service || !user) return {};
    
    const states: Record<string, "available" | "self" | "other"> = {};

    TIMES.forEach((t) => {
      const [h, m] = t.split(":").map(Number);
      const start = dayjs(date).hour(h).minute(m);
      const end = start.add(service.durationMin, "minute");
      
      // Verifica agendamentos do Supabase (ignora mock local)
      const slotStartMin = start.hour() * 60 + start.minute();
      const slotEndMin = slotStartMin + service.durationMin;

      const overlappingAppts = remoteAppointments.filter((a) => {
        const apptDate = dayjs(a.horario);
        const apptStartMin = apptDate.hour() * 60 + apptDate.minute();
        const apptEndMin = apptStartMin + (a.duracao || 30);
        return apptStartMin < slotEndMin && apptEndMin > slotStartMin;
      });

      if (overlappingAppts.length > 0) {
        // Verifica se algum agendamento começa EXATAMENTE agora
        const startAppt = overlappingAppts.find(a => {
          const apptDate = dayjs(a.horario);
          return apptDate.hour() === start.hour() && apptDate.minute() === start.minute();
        });

        if (startAppt) {
          const isSelf = startAppt.phone_cliente?.replace(/\D/g, "") === user.phone?.replace(/\D/g, "") || 
                         startAppt.codigo_cliente === user.id;
          states[t] = isSelf ? "self" : "other";
        } else {
          // É um horário de continuação (meio do agendamento) -> vamos esconder
          states[t] = "hidden";
        }
      } else {
        states[t] = "available";
      }
    });

    return states;
  }, [professionalId, date, service, remoteAppointments, user]);

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

    const emailValid = contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email);

    if (!client) {
      client = addClient({
        salonId: "salon_demo",
        name: contact.name,
        email: emailValid ? contact.email : "",
        phone: contact.phone,
      });

      const { error: clientError } = await supabase.from("clientes").insert({
        nome: contact.name,
        telefone: contact.phone,
        email: emailValid ? contact.email : "",
        codigo: client.codigo,
      });

      if (clientError) {
        console.error("Erro ao salvar cliente no Supabase:", clientError);
      }
    } else {
      if (emailValid && client.email !== contact.email) {
        updateClient(client.id, { email: contact.email });
        
        const { error: updateError } = await supabase
          .from("clientes")
          .update({ email: contact.email })
          .eq("telefone", contact.phone.replace(/\D/g, ""));
          
        if (updateError) {
          console.error("Erro ao atualizar email no Supabase:", updateError);
        }
        
        client.email = contact.email;
      }
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
      status: "Agendado",
      descricao: contact.notes,
      barbeiro_nome: professional?.name,
      barbeiro_email: "leandroleandri36@gmail.com",
      barbeiro_telefone: professional?.phone || "55519987569", 
      proprietario: "Cabelo e Cia",
      proprietario_que_agendou: "Site",
      forma_de_pagamento: paymentMethod,
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
                className="px-5 py-3 rounded-xl border border-border hover:bg-secondary text-sm font-medium"
              >
                Voltar ao início
              </Link>
              <button
                onClick={resetBooking}
                className="px-5 py-3 rounded-xl border border-primary text-primary hover:bg-primary/5 text-sm font-medium"
              >
                Agendar novo horário
              </button>
              <div className="relative group">
                <div className="absolute -top-3 -right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce z-10">
                  - R$ 5,00
                </div>
                  <button
                    onClick={() => {
                      toast.info("Copiado para o clipboard!", {
                        description: "00020126580014BR.GOV.BCB.PIX...",
                      });
                    }}
                    className="px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Pagar {brl((service?.price ?? 0) - 5)} no Pix <Check className="size-4" />
                  </button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4">
              Pague antecipado via Pix e ganhe <strong>R$ 5,00 de desconto</strong> imediato.
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
                            "rounded-xl border transition-all flex flex-col items-center text-center overflow-hidden group relative",
                            active
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 bg-card",
                          )}
                        >
                          {/* Background/Cover Image */}
                          <div className="w-full h-24 relative overflow-hidden">
                            {p.coverImage && (
                              <img 
                                src={p.coverImage} 
                                className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                                alt=""
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card" />
                          </div>

                          <div className="px-5 pb-6 -mt-10 relative z-10 flex flex-col items-center w-full">
                            <Avatar className="size-20 border-4 border-background shadow-xl">
                              <AvatarImage src={p.avatar} className="object-cover" />
                              <AvatarFallback className="text-white text-xl" style={{ background: p.color }}>
                                {initials(p.name)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <h3 className="font-display text-lg font-semibold mt-4 text-foreground">
                              {p.name}
                            </h3>
                            
                            <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                              {p.specialties.slice(0, 2).join(" · ")}
                            </p>

                            <div className="flex gap-0.5 mt-3">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="size-3 text-primary fill-primary" />
                              ))}
                            </div>
                          </div>

                          {active && (
                            <div className="absolute top-3 right-3 size-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                              <Check className="size-3.5" strokeWidth={3} />
                            </div>
                          )}
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

                      {(service || professional) && (
                        <div className="mt-8 p-5 rounded-2xl border border-border/40 bg-primary/5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                            Sua escolha
                          </p>
                          <div className="space-y-4">
                            {service && (
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-medium">
                                  <Sparkles className="size-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{service.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {brl(service.price)} · {service.durationMin} min
                                  </p>
                                </div>
                              </div>
                            )}
                            {professional && (
                              <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                  <AvatarFallback className="text-white text-xs" style={{ background: professional.color }}>
                                    {initials(professional.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">Com {professional.name}</p>
                                  <p className="text-xs text-muted-foreground">Profissional</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
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
                        {loadingAvailability && (
                          <div className="col-span-3 py-6 flex flex-col items-center gap-3">
                            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-muted-foreground italic">Consultando agenda real...</p>
                          </div>
                        )}
                        {reschedulingFrom && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="col-span-3 bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4 mb-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                <Settings className="size-5 animate-spin-slow" />
                              </div>
                              <div className="text-left">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Modo Reagendamento</p>
                                <p className="text-xs text-primary/80">Escolha o novo horário para substituir o de {dayjs(reschedulingFrom.horario).format("HH:mm")}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setReschedulingFrom(null);
                                setTime("");
                              }}
                              className="text-primary hover:bg-primary/20 h-8"
                            >
                              Cancelar
                            </Button>
                          </motion.div>
                        )}
                        <div className="col-span-3 flex flex-wrap gap-4 mb-4 px-1">
                          <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full border-2 border-primary shadow-sm" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Livre</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full my-slot border shadow-sm" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meu Horário</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full occupied-pattern border border-muted/50 shadow-sm" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ocupado</span>
                          </div>
                        </div>

                        {!loadingAvailability && TIMES.map((t) => {
                          const state = slotStates[t] || "available";
                          
                          // Se for um horário de continuação, não renderizamos nada
                          if (state === "hidden") return null;

                          const isBusy = state !== "available";
                          const isSelf = state === "self";
                          
                          return (
                            <button
                              key={t}
                              onClick={() => {
                                if (isSelf) {
                                  // Abre opções de edição - busca o agendamento real pelo horário
                                  const appt = remoteAppointments.find(a => {
                                    // Compara apenas o horário formatado para evitar problemas de fuso
                                    return dayjs(a.horario).format("HH:mm") === t;
                                  });
                                  // Se não achar pelo horário exato, tenta achar o que o usuário clicou
                                  setEditingAppointment(appt || { time: t });
                                } else if (!isBusy && user) {
                                  // Se ele já tem um agendamento futuro E NÃO está no meio de um reagendamento, mostramos o aviso
                                  if (existingBooking && !reschedulingFrom) {
                                    setPendingTime(t); // Guarda o horário que ele quer
                                    setShowExistingWarning(true);
                                    // Não definimos o 'time' aqui para ele não ficar marcado na grade
                                  } else {
                                    setTime(t);
                                  }
                                }
                              }}
                              disabled={!user || (isBusy && !isSelf)}
                              className={cn(
                                "py-2.5 rounded-xl border text-sm transition-all relative flex flex-col items-center justify-center min-h-[50px] group overflow-hidden",
                                !user
                                  ? "border-border bg-muted/10 text-muted-foreground cursor-not-allowed"
                                  : isSelf
                                  ? "my-slot border-2 font-bold shadow-sm"
                                  : isBusy
                                  ? "occupied-pattern border-muted/30 text-muted-foreground/30 cursor-not-allowed"
                                  : time === t
                                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105 z-10 font-bold"
                                  : "border-primary/40 hover:border-primary bg-white text-primary font-semibold",
                                state === "available" && time !== t && !reschedulingFrom && "hover:bg-primary/5",
                                state === "available" && time !== t && reschedulingFrom && "reschedule-beam"
                              )}
                            >
                              <div className={cn("transition-all duration-200", isSelf && "group-hover:scale-0 group-hover:opacity-0")}>
                                <span className={cn(isBusy && !isSelf && "opacity-50")}>{t}</span>
                              </div>

                              {isSelf && (
                                <>
                                  <span className="text-[10px] uppercase tracking-tighter absolute bottom-1 font-black group-hover:opacity-0 transition-opacity">MEU</span>
                                  <Settings className="size-5 absolute opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 text-current" />
                                </>
                              )}

                              {isBusy && !isSelf && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-[120%] h-px bg-muted-foreground/10 rotate-[25deg]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
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
                        className="rounded-xl bg-white border-border/60 focus-visible:bg-white transition-colors h-11"
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
                        className="rounded-xl bg-white border-border/60 focus-visible:bg-white transition-colors h-11"
                      />
                    </div>
                    <div className="space-y-2.5 md:col-span-2">
                      <Label className="text-sm font-semibold">Email{bookingFor === "guest" ? " *" : ""}</Label>
                      <Input
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        className="rounded-xl bg-white border-border/60 focus-visible:bg-white transition-colors h-11"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-2.5 md:col-span-2">
                      <Label className="text-sm font-semibold">Observações (opcional)</Label>
                      <Textarea
                        rows={2}
                        value={contact.notes}
                        onChange={(e) => setContact({ ...contact, notes: e.target.value })}
                        className="rounded-xl bg-white border-border/60 focus-visible:bg-white transition-colors resize-none"
                        placeholder="Algum detalhe importante para a profissional?"
                      />
                    </div>
                    <div className="space-y-2.5 md:col-span-2">
                      <Label className="text-sm font-semibold">Forma de Pagamento *</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {["Dinheiro", "Cartão", "Pix"].map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={cn(
                              "py-3 px-2 rounded-xl border text-sm font-medium transition-all flex items-center justify-center",
                              paymentMethod === method
                                ? "bg-primary/10 border-primary text-primary shadow-sm"
                                : "border-border/60 hover:border-primary/40 bg-white text-muted-foreground"
                            )}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-border/40">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 mb-4">
                      <Sparkles className="size-4 text-primary" />
                      Resumo do agendamento
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="rounded-xl bg-primary/5 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Serviço</p>
                        <p className="font-semibold text-sm mt-2">{service?.name ?? "-"}</p>
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Profissional</p>
                        <p className="font-semibold text-sm mt-2">{professional?.name ?? "-"}</p>
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Valor</p>
                        <p className="font-semibold text-sm mt-2 text-primary">{brl(service?.price ?? 0)}</p>
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Data</p>
                        <p className="font-semibold text-sm mt-2">{fmtDate(date)}</p>
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-border/40 p-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Horário</p>
                        <p className="font-semibold text-sm mt-2">{time}</p>
                      </div>
                      <div className="rounded-xl bg-primary/5 border border-border/40 p-4">
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

      {/* Modal de Agendamento Existente (Prevenção de duplicidade) */}
      <AnimatePresence>
        {showExistingWarning && existingBooking && !reschedulingFrom && !editingAppointment && !done && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-background/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md bg-card border-2 border-primary/20 shadow-2xl rounded-[2rem] p-8 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
              
              <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                <CalendarDays className="size-10" />
              </div>

              <h3 className="text-2xl font-bold tracking-tight">Você já tem um horário!</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                Identificamos que você já possui um agendamento para:<br />
                <strong className="text-foreground font-semibold">
                  {dayjs(existingBooking.horario).format("DD/MM [às] HH:mm")}
                </strong>
              </p>

              <div className="grid gap-3 mt-10">
                <Button 
                  onClick={() => {
                    setShowExistingWarning(false);
                    setReschedulingFrom(existingBooking);
                    setTime(pendingTime); // Define direto o horário que ele havia clicado
                  }}
                  className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base font-semibold shadow-lg shadow-primary/20"
                >
                  <Settings className="size-5" /> Reagendar horário
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowExistingWarning(false);
                    setTime(""); // Desmarca o novo horário
                  }}
                  className="w-full h-14 rounded-2xl text-base font-medium border-border/60 hover:bg-secondary"
                >
                  Fechar
                </Button>
                
                <p className="text-[11px] text-muted-foreground mt-2">
                  * Recomendamos ter apenas um agendamento ativo por vez.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Gerenciamento do Agendamento (Ao clicar no "Meu" na grade) */}
      <AnimatePresence>
        {editingAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-card border border-border shadow-2xl rounded-3xl p-8 overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
              
              <div className="text-center mb-8">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                  <Settings className="size-7" />
                </div>
                <h3 className="text-xl font-semibold">Gerenciar Agendamento</h3>
                <p className="text-sm text-muted-foreground mt-1">Horário: {editingAppointment.time || dayjs(editingAppointment.horario).format("HH:mm")}</p>
              </div>

              {!confirmCancel ? (
                <div className="grid gap-3">
                  <Button 
                    onClick={() => {
                      setReschedulingFrom(editingAppointment);
                      setEditingAppointment(null);
                    }}
                    className="w-full h-12 rounded-xl flex items-center gap-2"
                  >
                    <CalendarDays className="size-4" /> Reagendar horário
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setConfirmCancel(true)}
                    className="w-full h-12 rounded-xl flex items-center gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/40"
                  >
                    <XCircle className="size-4" /> Cancelar agendamento
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => setEditingAppointment(null)}
                    className="w-full h-12 rounded-xl"
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                    <p className="text-sm font-medium text-red-600">Tem certeza que deseja cancelar?</p>
                    <p className="text-xs text-red-500/70 mt-1">
                      Este horário é {dayjs(editingAppointment.horario).fromNow()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="ghost"
                      onClick={() => setConfirmCancel(false)}
                      className="h-12 rounded-xl"
                    >
                      Não, manter
                    </Button>
                    <Button 
                      onClick={async () => {
                        const apptId = editingAppointment.id || editingAppointment.uuid;
                        
                        if (apptId) {
                          const { error } = await supabase
                            .from("agendamentos")
                            .update({ status: "cancelled" })
                            .eq(editingAppointment.id ? "id" : "uuid", apptId);
                          
                          if (!error) {
                            toast.success("Agendamento cancelado com sucesso!");
                            setEditingAppointment(null);
                            setConfirmCancel(false);
                            // Atualiza a agenda e o status do usuário instantaneamente
                            fetchAvailability();
                            fetchUserBookings();
                          } else {
                            console.error("Erro Supabase:", error);
                            toast.error("Erro ao cancelar no banco de dados.");
                          }
                        } else {
                          toast.error("Este agendamento ainda não foi sincronizado.");
                        }
                      }}
                      className="h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                    >
                      Sim, cancelar
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Reagendamento (Swap) */}
      <AnimatePresence>
        {reschedulingFrom && time && !done && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-background/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-card border-2 border-primary shadow-2xl rounded-[2.5rem] p-10 text-center relative overflow-hidden"
            >
              <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                <Sparkles className="size-10" />
              </div>

              <h3 className="text-2xl font-bold">Confirmar Reagendamento?</h3>
              
              <div className="my-8 space-y-4 text-center">
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold opacity-50">De</p>
                    <p className="text-lg font-medium line-through decoration-red-500/50">{dayjs(reschedulingFrom.horario).format("HH:mm")}</p>
                  </div>
                  <ArrowRight className="size-6 text-primary" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-primary">Para</p>
                    <p className="text-2xl font-bold text-primary">{time}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground px-4">
                  Seu horário anterior do dia {dayjs(reschedulingFrom.horario).format("DD/MM")} será cancelado automaticamente para dar lugar ao novo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setTime("")}
                  className="h-14 rounded-2xl"
                >
                  Escolher outro
                </Button>
                <Button 
                  onClick={async () => {
                    // 1. Cancela o antigo no Supabase
                    const { error: cancelError } = await supabase
                      .from("agendamentos")
                      .update({ status: "cancelled" })
                      .eq(reschedulingFrom.id ? "id" : "uuid", reschedulingFrom.id || reschedulingFrom.uuid);
                    
                    if (cancelError) {
                      console.error(cancelError);
                      toast.error("Erro ao cancelar horário anterior.");
                      return;
                    }

                    // 2. Prepara o novo
                    const [h, m] = time.split(":").map(Number);
                    const newStart = dayjs(date).hour(h).minute(m).second(0);
                    
                    const newApptData = {
                      ...reschedulingFrom,
                      horario: newStart.toISOString(),
                      status: "Agendado"
                    };
                    
                    delete newApptData.id;
                    delete newApptData.uuid;
                    delete newApptData.created_at;

                    const { error: insertError } = await supabase
                      .from("agendamentos")
                      .insert([newApptData]);

                    if (!insertError) {
                      toast.success("Reagendado com sucesso!");
                      setReschedulingFrom(null);
                      setTime("");
                      fetchAvailability();
                      fetchUserBookings();
                    } else {
                      console.error(insertError);
                      toast.error("Erro ao criar novo agendamento.");
                    }
                  }}
                  className="h-14 rounded-2xl bg-primary shadow-lg shadow-primary/30"
                >
                  Sim, Confirmar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
