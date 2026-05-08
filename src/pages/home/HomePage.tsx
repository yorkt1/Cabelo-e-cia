import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Calendar,
  Sparkles,
  Users,
  BarChart3,
  MessageSquare,
  Shield,
  Check,
  ArrowRight,
  Star,
  Clock,
  MapPin,
  Phone,
  Instagram,
  Scissors,
  Heart,
  ChevronDown,
  PlayCircle,
} from "lucide-react";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";
import { Card } from "@/components/ui/card";
import { brl } from "@/utils/format";
import { useDb } from "@/store/mockDb";

const FEATURES = [
  { icon: Calendar, title: "Agenda inteligente", desc: "Drag-and-drop, conflitos detectados, múltiplos profissionais." },
  { icon: Users, title: "Clientes organizados", desc: "Histórico, aniversários, observações e frequência num lugar só." },
  { icon: MessageSquare, title: "Lembretes automáticos", desc: "Confirmações por WhatsApp e e-mail reduzem faltas em até 70%." },
  { icon: BarChart3, title: "Relatórios claros", desc: "Faturamento, ticket médio e produtividade em dashboards leves." },
  { icon: Sparkles, title: "Agendamento online", desc: "Sua cliente reserva sozinha, 24h por dia, do celular." },
  { icon: Shield, title: "Dados isolados", desc: "Multi-tenant com criptografia. Cada salão é independente." },
];

const STEPS = [
  { n: "01", title: "Escolha o serviço", desc: "Veja preços e duração de cada procedimento, sem surpresas." },
  { n: "02", title: "Selecione horário", desc: "Disponibilidade real, atualizada com a agenda da equipe." },
  { n: "03", title: "Receba a confirmação", desc: "Lembrete automático no WhatsApp e e-mail, 24h antes." },
];

const PLANS = [
  { name: "Starter", price: 49, features: ["1 profissional", "Agenda completa", "Cadastro de clientes", "Suporte por e-mail"] },
  { name: "Pro", price: 99, popular: true, features: ["Até 5 profissionais", "Tudo do Starter", "Lembretes WhatsApp", "Relatórios avançados", "Comissões"] },
  { name: "Premium", price: 199, features: ["Profissionais ilimitados", "Tudo do Pro", "Multi-unidade", "API e integrações", "Suporte prioritário"] },
];

const TESTIMONIALS = [
  { name: "Marina Castro", role: "Studio Belle · SP", text: "Em duas semanas zerei as faltas e organizei a agenda das três profissionais. Parece coisa de outro mundo." },
  { name: "Carla Mendes", role: "Rosé Atelier · RJ", text: "Minhas clientes amaram poder agendar pelo celular. O faturamento subiu 30% no primeiro mês." },
  { name: "Helena Lima", role: "Nude Beauty · BH", text: "Tudo na palma da mão. Relatórios claros, agenda linda e suporte que responde de verdade." },
];

const FAQ = [
  { q: "Preciso instalar algum aplicativo?", a: "Não. O Belle roda direto no navegador, no computador ou no celular. Suas clientes também agendam pelo navegador, sem baixar nada." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Sem fidelidade, sem multa. Você pode cancelar com um clique a qualquer momento dentro da sua conta." },
  { q: "Os dados ficam seguros?", a: "Sim. Cada salão tem dados isolados, criptografados em trânsito e em repouso, com backups diários automáticos." },
  { q: "Funciona para barbearia e estética?", a: "Funciona para qualquer negócio que trabalhe com agendamento por horário: salão, barbearia, estética, podologia, manicure, lash designer e mais." },
  { q: "Tem teste grátis?", a: "Sim, 14 dias com acesso completo a todas as funcionalidades. Sem precisar cadastrar cartão de crédito." },
];

export default function HomePage() {
  const services = useDb((s) => s.services).filter((s) => s.active).slice(0, 6);
  const professionals = useDb((s) => s.professionals).slice(0, 4);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const today = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/4 size-[600px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-40 right-0 size-[500px] rounded-full bg-accent/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 size-[400px] rounded-full bg-secondary/60 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border/60 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Agendamento online em 30 segundos
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold tracking-tight mt-6 leading-[1.05]">
              Reserve seu momento de{" "}
              <span className="bg-gradient-to-r from-primary via-rose-400 to-accent-foreground bg-clip-text text-transparent">
                cuidado.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mt-5 max-w-xl">
              Escolha o serviço, o horário e a profissional. Sem ligação, sem espera —
              sua agenda em poucos toques.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-8">
              <Link
                to="/agendar"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3.5 rounded-xl font-medium transition-all shadow-[0_8px_30px_-12px_rgba(232,180,184,0.6)] hover:shadow-[0_12px_40px_-12px_rgba(232,180,184,0.8)]"
              >
                Agendar horário <ArrowRight className="size-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground px-3 py-2"
              >
                <PlayCircle className="size-4" /> Ver como funciona
              </a>
            </div>
            <div className="flex items-center gap-6 mt-8 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {professionals.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="size-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-medium text-primary-foreground"
                      style={{ background: p.color }}
                    >
                      {p.name.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="ml-1">+1.200 clientes felizes</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-primary text-primary" />
                ))}
                <span className="ml-1">4.9/5</span>
              </div>
            </div>
          </motion.div>

          {/* Quick booking card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <Card className="p-6 border-border/60 shadow-[0_30px_80px_-30px_rgba(232,180,184,0.5)] bg-card/90 backdrop-blur">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary font-medium">Próximo horário</p>
                  <p className="font-display text-lg font-semibold capitalize mt-0.5">{today}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">
                  Disponível
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { time: "09:00", name: "Corte + Escova", pro: "Camila", color: "#E8B4B8" },
                  { time: "10:30", name: "Coloração", pro: "Bruna", color: "#C9ADA7" },
                  { time: "14:00", name: "Manicure em Gel", pro: "Marina", color: "#E5989B" },
                  { time: "16:30", name: "Design de Sobrancelha", pro: "Helena", color: "#D8A7B1" },
                ].map((a) => (
                  <div
                    key={a.time}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-background hover:border-primary/40 transition-colors cursor-pointer group"
                  >
                    <div className="size-10 rounded-lg flex items-center justify-center text-xs font-medium text-primary-foreground shrink-0" style={{ background: a.color }}>
                      <Clock className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground">com {a.pro}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{a.time}</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              <Link
                to="/agendar"
                className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
              >
                Ver todos os horários <ArrowRight className="size-4" />
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <section className="border-y border-border/60 bg-card/40">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "+1.200", l: "salões ativos" },
            { v: "98%", l: "satisfação" },
            { v: "−70%", l: "no-show" },
            { v: "4.9", l: "★ avaliação" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-3xl font-semibold">{s.v}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Como funciona</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 tracking-tight">
            Três passos. Zero complicação.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-14 relative">
          {STEPS.map((s, i) => (
            <Card key={s.n} className="p-8 border-border/60 relative overflow-hidden">
              <span className="font-display text-7xl font-semibold text-primary/15 absolute -top-2 -right-2 select-none">{s.n}</span>
              <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                {i === 0 && <Scissors className="size-5 text-primary" strokeWidth={1.75} />}
                {i === 1 && <Calendar className="size-5 text-primary" strokeWidth={1.75} />}
                {i === 2 && <MessageSquare className="size-5 text-primary" strokeWidth={1.75} />}
              </div>
              <p className="font-display text-xl font-semibold">{s.title}</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== SERVICES SHOWCASE ===== */}
      <section id="services" className="bg-card/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Nossos serviços</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 tracking-tight">
                Cuidado para cada detalhe.
              </h2>
            </div>
            <Link to="/agendar" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
            {services.map((s) => (
              <Card key={s.id} className="p-6 border-border/60 hover:border-primary/40 transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-25px_rgba(232,180,184,0.5)] group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {s.category}
                    </span>
                    <p className="font-display text-xl font-semibold mt-3">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                      <Clock className="size-3" /> {s.durationMin} min
                    </p>
                  </div>
                  <p className="font-display text-2xl font-semibold text-primary shrink-0">{brl(s.price)}</p>
                </div>
                <Link
                  to="/agendar"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-foreground/70 group-hover:text-primary transition-colors"
                >
                  Agendar <ArrowRight className="size-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROFESSIONALS ===== */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Nossa equipe</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 tracking-tight">
            Mãos talentosas, olhar único.
          </h2>
          <p className="text-muted-foreground mt-4">
            Profissionais experientes, especializadas em fazer você se sentir incrível.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14">
          {professionals.map((p) => (
            <Card key={p.id} className="p-6 border-border/60 text-center group hover:border-primary/40 transition-colors">
              <div
                className="size-20 mx-auto rounded-full flex items-center justify-center font-display text-2xl font-semibold text-primary-foreground"
                style={{ background: p.color }}
              >
                {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <p className="font-display text-lg font-semibold mt-4">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {p.specialties.join(" · ")}
              </p>
              <div className="flex justify-center gap-0.5 mt-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-primary text-primary" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== FEATURES (for salon owners) ===== */}
      <section id="features" className="bg-card/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Para o seu salão</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 tracking-tight">
              Tudo que você precisa pra crescer.
            </h2>
            <p className="text-muted-foreground mt-4">
              Pensado por quem entende do dia a dia. Sem ruído, sem firula — só o essencial, bem feito.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-7 border-border/60 hover:border-primary/40 transition-colors group">
                <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                  <f.icon className="size-5 text-primary" strokeWidth={1.75} />
                </div>
                <p className="font-display text-xl font-semibold mt-5">{f.title}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA banner ===== */}
      <section className="max-w-6xl mx-auto px-6 pt-24">
        <div className="rounded-3xl bg-gradient-to-br from-primary/30 via-accent/30 to-secondary p-10 md:p-16 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                Sua próxima cliente está procurando agora.
              </h2>
              <p className="text-foreground/70 mt-4">
                Coloque seu salão online em minutos. Sem mensalidade no primeiro mês.
              </p>
            </div>
            <div className="flex md:justify-end gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90 px-7 py-4 rounded-xl font-medium transition-colors"
              >
                Começar grátis <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Planos</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 tracking-tight">
            Escolha o tamanho do seu sonho.
          </h2>
          <p className="text-muted-foreground mt-4">
            Sem fidelidade. Cancele quando quiser. 14 dias grátis em todos.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
          {PLANS.map((p) => (
            <Card
              key={p.name}
              className={`p-8 relative border-border/60 ${p.popular ? "border-primary shadow-[0_8px_30px_-12px_rgba(232,180,184,0.5)]" : ""}`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-medium px-3 py-1 rounded-full">
                  Mais popular
                </span>
              )}
              <p className="font-display text-2xl font-semibold">{p.name}</p>
              <p className="mt-3">
                <span className="font-display text-4xl font-semibold">{brl(p.price)}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </p>
              <ul className="mt-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="size-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className={`mt-8 inline-flex w-full items-center justify-center px-4 py-2.5 rounded-xl font-medium transition-colors ${
                  p.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Começar com {p.name}
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-card/40 border-y border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Depoimentos</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 tracking-tight">
              Quem usa, ama.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="p-7 border-border/60">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="font-display text-lg leading-snug mt-5">"{t.text}"</p>
                <div className="mt-6 pt-5 border-t border-border/60">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Perguntas frequentes</p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 tracking-tight">
            Tudo certo pra começar?
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <Card key={item.q} className="border-border/60 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-card/60 transition-colors"
                >
                  <span className="font-medium">{item.q}</span>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* ===== CONTACT / VISIT ===== */}
      <section id="contact" className="bg-gradient-to-b from-transparent to-card/60">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Visite-nos</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 tracking-tight">
                Estamos esperando por você.
              </h2>
              <p className="text-muted-foreground mt-4">
                Um espaço pensado para você relaxar, se cuidar e sair se sentindo a melhor versão de si mesma.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <MapPin className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rua das Flores, 123</p>
                    <p className="text-xs text-muted-foreground">Jardins · São Paulo, SP</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Clock className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Seg a Sáb · 09h às 20h</p>
                    <p className="text-xs text-muted-foreground">Domingos com agendamento</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Phone className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">(11) 99999-0000</p>
                    <p className="text-xs text-muted-foreground">WhatsApp e ligações</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Instagram className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">@studiobelle</p>
                    <p className="text-xs text-muted-foreground">Inspirações e novidades</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-8 border-border/60 bg-card/90 backdrop-blur shadow-[0_30px_80px_-30px_rgba(232,180,184,0.4)]">
              <div className="flex items-center gap-2 text-primary">
                <Heart className="size-5 fill-primary" />
                <p className="text-xs uppercase tracking-wider font-medium">Reserve agora</p>
              </div>
              <h3 className="font-display text-3xl font-semibold mt-3 leading-tight">
                Pronta pra um momento só seu?
              </h3>
              <p className="text-sm text-muted-foreground mt-3">
                Nossa agenda online é simples, rápida e funciona 24 horas por dia.
              </p>
              <Link
                to="/agendar"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3.5 rounded-xl font-medium transition-all shadow-[0_8px_30px_-12px_rgba(232,180,184,0.6)]"
              >
                Agendar agora <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/login"
                className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Já é cliente? Entre na sua conta
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
