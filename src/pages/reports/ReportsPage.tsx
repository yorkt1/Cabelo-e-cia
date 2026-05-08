import { useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDb } from "@/store/mockDb";
import { brl, dayjs } from "@/utils/format";

const PASTEL = ["oklch(0.78 0.08 20)", "oklch(0.82 0.06 70)", "oklch(0.72 0.07 340)", "oklch(0.85 0.05 100)", "oklch(0.7 0.06 50)"];

export default function ReportsPage() {
  const { appointments, services, professionals, transactions } = useDb();

  const monthly = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = dayjs().subtract(5 - i, "month");
      const v = transactions.filter(t => t.type === "income" && dayjs(t.date).isSame(d, "month")).reduce((s, t) => s + t.amount, 0);
      return { mes: d.format("MMM/YY"), valor: v };
    });
  }, [transactions]);

  const byProf = useMemo(() => professionals.map((p, i) => ({
    name: p.name.split(" ")[0],
    value: appointments.filter(a => a.professionalId === p.id && a.status === "completed").length,
    color: PASTEL[i % PASTEL.length],
  })), [appointments, professionals]);

  const byHour = useMemo(() => {
    const m = new Map<number, number>();
    appointments.forEach(a => { const h = dayjs(a.start).hour(); m.set(h, (m.get(h) ?? 0) + 1); });
    return [...Array(13)].map((_, i) => ({ hora: `${i + 8}h`, ag: m.get(i + 8) ?? 0 }));
  }, [appointments]);

  const cancelRate = useMemo(() => {
    const total = appointments.length;
    const c = appointments.filter(a => a.status === "cancelled" || a.status === "no_show").length;
    return total ? ((c / total) * 100).toFixed(1) : "0";
  }, [appointments]);

  return (
    <div>
      <PageHeader title="Relatórios" description="Visão geral de performance" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="font-display text-xl">Faturamento mensal</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 30)" />
                <XAxis dataKey="mes" stroke="oklch(0.5 0.03 25)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 25)" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                <Tooltip formatter={(v) => brl(Number(v))} contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.012 30)", borderRadius: 12 }} />
                <Bar dataKey="valor" fill="oklch(0.78 0.08 20)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader><CardTitle className="font-display text-xl">Atendimentos por profissional</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byProf} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {byProf.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-2">
          <CardHeader><CardTitle className="font-display text-xl">Horários mais ocupados</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 30)" />
                <XAxis dataKey="hora" stroke="oklch(0.5 0.03 25)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 25)" fontSize={12} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.012 30)", borderRadius: 12 }} />
                <Bar dataKey="ag" fill="oklch(0.82 0.06 70)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-2">
          <CardHeader><CardTitle className="font-display text-xl">Indicadores</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Taxa de cancelamento</p><p className="font-display text-3xl font-semibold mt-2">{cancelRate}%</p></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Total de serviços</p><p className="font-display text-3xl font-semibold mt-2">{services.length}</p></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Profissionais ativos</p><p className="font-display text-3xl font-semibold mt-2">{professionals.length}</p></div>
            <div><p className="text-xs text-muted-foreground uppercase tracking-wider">Atendimentos totais</p><p className="font-display text-3xl font-semibold mt-2">{appointments.length}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
