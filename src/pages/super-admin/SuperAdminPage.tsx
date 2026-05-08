import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building2, DollarSign, Users, Activity } from "lucide-react";
import { useDb } from "@/store/mockDb";
import { brl } from "@/utils/format";

export default function SuperAdminPage() {
  const { salons, updateSalon, appointments, transactions } = useDb();
  const totalRevenue = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <PageHeader title="Super Admin" description="Visão global da plataforma" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Salões ativos" value={String(salons.filter(s => s.active).length)} icon={Building2} />
        <StatCard label="Receita total" value={brl(totalRevenue)} icon={DollarSign} />
        <StatCard label="Agendamentos" value={String(appointments.length)} icon={Activity} />
        <StatCard label="Usuários" value="42" icon={Users} />
      </div>
      <Card className="border-border/60">
        <CardHeader><CardTitle className="font-display text-xl">Salões</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {salons.map(s => (
            <div key={s.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.phone} · {s.address}</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="border-primary/30 text-primary capitalize">{s.plan}</Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{s.active ? "Ativo" : "Bloqueado"}</span>
                  <Switch checked={s.active} onCheckedChange={(v) => updateSalon(s.id, { active: v })} />
                </div>
                <Button variant="ghost" size="sm">Detalhes</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
