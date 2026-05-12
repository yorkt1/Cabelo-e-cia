import { useMemo } from "react";
import {
  CalendarDays,
  DollarSign,
  Users,
  TrendingUp,
  Scissors,
  CheckCircle2,
  Target,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDb } from "@/store/mockDb";
import { useAuth } from "@/store/authStore";
import { brl, dayjs, fmtTime, initials } from "@/utils/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardPage() {
  const { user } = useAuth();
  const { appointments, transactions, clients, services, professionals } = useDb();

  const isOwner = user?.role === "owner" || user?.role === "admin";
  const proId = professionals.find((p) => p.email === user?.email)?.id;

  // --- LOGIC FOR OWNER/ADMIN ---
  const ownerStats = useMemo(() => {
    const today = dayjs();
    const todayAppts = appointments.filter((a) => dayjs(a.start).isSame(today, "day"));
    const monthIncome = transactions
      .filter((t) => t.type === "income" && dayjs(t.date).isSame(today, "month"))
      .reduce((s, t) => s + t.amount, 0);
    const completed = appointments.filter((a) => a.status === "completed");
    const ticket = completed.length
      ? completed.reduce((s, a) => s + a.total, 0) / completed.length
      : 0;
    const newClients = clients.filter((c) => Number(c.id.split("_")[1]) > 25).length;
    return { todayAppts, monthIncome, ticket, newClients };
  }, [appointments, transactions, clients]);

  // --- LOGIC FOR PROFESSIONAL ---
  const proStats = useMemo(() => {
    if (!proId) return null;
    const today = dayjs();
    const myAppts = appointments.filter((a) => a.professionalId === proId);
    const todayAppts = myAppts.filter((a) => dayjs(a.start).isSame(today, "day"));
    const monthCompleted = myAppts.filter(
      (a) => a.status === "completed" && dayjs(a.start).isSame(today, "month"),
    );

    // Comissões (simulação baseada em 30% se não especificado)
    const commission = monthCompleted.reduce((s, a) => s + a.total * 0.3, 0);
    const goalProgress = (monthCompleted.length / 40) * 100; // Meta de 40 serviços/mês

    return { todayAppts, monthCompleted, commission, goalProgress };
  }, [appointments, proId]);

  const revenueData = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = dayjs().subtract(13 - i, "day");
      const v = transactions
        .filter((t) => t.type === "income" && dayjs(t.date).isSame(d, "day"))
        .reduce((s, t) => s + t.amount, 0);
      return { day: d.format("DD/MM"), valor: v };
    });
  }, [transactions]);

  const topServices = useMemo(() => {
    const counts = new Map<string, number>();
    appointments.forEach((a) =>
      a.serviceIds.forEach((sid) => counts.set(sid, (counts.get(sid) ?? 0) + 1)),
    );
    return [...counts.entries()]
      .map(([id, count]) => ({ name: services.find((s) => s.id === id)?.name ?? "—", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [appointments, services]);

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => {
          const isUpcoming = dayjs(a.start).isAfter(dayjs()) && a.status !== "cancelled";
          if (isOwner) return isUpcoming;
          return isUpcoming && a.professionalId === proId;
        })
        .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf())
        .slice(0, 6),
    [appointments, isOwner, proId],
  );

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={`Olá, ${user?.name.split(" ")[0]}!`}
          description="Aqui está o resumo dos seus atendimentos e metas."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Meus atendimentos hoje"
            value={String(proStats?.todayAppts.length ?? 0)}
            delta="Próximo às 14:00"
            trend="up"
            icon={Scissors}
          />
          <StatCard
            label="Minha comissão (mês)"
            value={brl(proStats?.commission ?? 0)}
            delta="Acumulado"
            trend="up"
            icon={DollarSign}
          />
          <StatCard
            label="Serviços realizados"
            value={String(proStats?.monthCompleted.length ?? 0)}
            delta="Este mês"
            trend="up"
            icon={CheckCircle2}
          />
          <StatCard
            label="Progresso da meta"
            value={`${Math.round(proStats?.goalProgress ?? 0)}%`}
            delta="Meta: 40 serv."
            trend="up"
            icon={Target}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold">
                Meus Próximos Atendimentos
              </CardTitle>
              <CardDescription>Confira sua agenda para as próximas horas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Nenhum agendamento próximo.
                </p>
              ) : (
                upcoming.map((a) => {
                  const cli = clients.find((c) => c.id === a.clientId);
                  const svc = services.find((s) => s.id === a.serviceIds[0]);
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors px-2 rounded-lg"
                    >
                      <Avatar className="size-10">
                        <AvatarFallback className="bg-primary/15 text-foreground text-xs">
                          {initials(cli?.name ?? "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{cli?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {svc?.name} · {fmtTime(a.start)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{dayjs(a.start).format("DD/MM")}</p>
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {a.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display text-xl font-semibold">
                Minha Meta Mensal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Serviços concluídos</span>
                  <span className="font-medium">{proStats?.monthCompleted.length} / 40</span>
                </div>
                <Progress value={proStats?.goalProgress} className="h-2" />
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs text-primary font-medium uppercase tracking-wider">
                  Dica do dia
                </p>
                <p className="text-sm mt-2 text-foreground/80 leading-relaxed">
                  Ofereça uma hidratação rápida para clientes de corte. Isso aumenta seu ticket e
                  ajuda a bater a meta!
                </p>
              </div>
              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-sm font-medium">Top serviços realizados</p>
                <div className="space-y-3">
                  {topServices.slice(0, 3).map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary" />
                        <span className="text-sm">{s.name}</span>
                      </div>
                      <span className="text-xs font-bold">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard Administrativo"
        description={`Olá! Hoje é ${dayjs().format("dddd, DD [de] MMMM")}.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Faturamento do mês"
          value={brl(ownerStats.monthIncome)}
          delta="+12,4% vs mês anterior"
          trend="up"
          icon={DollarSign}
        />
        <StatCard
          label="Agendamentos hoje"
          value={String(ownerStats.todayAppts.length)}
          delta={`${ownerStats.todayAppts.filter((a) => a.status === "confirmed").length} confirmados`}
          trend="up"
          icon={CalendarDays}
        />
        <StatCard
          label="Ticket médio"
          value={brl(ownerStats.ticket)}
          delta="+3,1%"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          label="Novos clientes"
          value={String(ownerStats.newClients)}
          delta="Últimos 30 dias"
          trend="up"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-xl font-semibold">
              Receita — últimos 14 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.78 0.08 20)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="oklch(0.78 0.08 20)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 30)" />
                <XAxis dataKey="day" stroke="oklch(0.5 0.03 25)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 25)" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid oklch(0.92 0.012 30)",
                    borderRadius: 12,
                  }}
                  formatter={(v) => brl(Number(v))}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="oklch(0.78 0.08 20)"
                  strokeWidth={2}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-xl font-semibold">Top serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topServices} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="oklch(0.5 0.03 25)"
                  fontSize={11}
                  width={110}
                />
                <Tooltip
                  cursor={{ fill: "oklch(0.96 0.012 30)" }}
                  contentStyle={{
                    background: "white",
                    border: "1px solid oklch(0.92 0.012 30)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="count" fill="oklch(0.78 0.08 20)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-xl font-semibold">
            Próximos agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.map((a) => {
            const cli = clients.find((c) => c.id === a.clientId);
            const svc = services.find((s) => s.id === a.serviceIds[0]);
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 py-3 border-b border-border last:border-b-0"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary/15 text-foreground text-xs">
                    {initials(cli?.name ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{cli?.name}</p>
                  <p className="text-xs text-muted-foreground">{svc?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {dayjs(a.start).format("DD/MM")} · {fmtTime(a.start)}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] mt-1 border-primary/30 text-primary"
                  >
                    {a.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
