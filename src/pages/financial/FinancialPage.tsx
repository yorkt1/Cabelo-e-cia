import { useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDb } from "@/store/mockDb";
import { brl, dayjs, fmtDate } from "@/utils/format";

export default function FinancialPage() {
  const { transactions } = useDb();

  const stats = useMemo(() => {
    const month = dayjs();
    const monthTx = transactions.filter((t) => dayjs(t.date).isSame(month, "month"));
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const sorted = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
        .slice(0, 30),
    [transactions],
  );

  return (
    <div>
      <PageHeader title="Financeiro" description="Caixa do mês atual" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Entradas"
          value={brl(stats.income)}
          icon={TrendingUp}
          delta="+8,2%"
          trend="up"
        />
        <StatCard
          label="Saídas"
          value={brl(stats.expense)}
          icon={TrendingDown}
          delta="-2,1%"
          trend="down"
        />
        <StatCard label="Saldo" value={brl(stats.balance)} icon={Wallet} />
      </div>
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-display text-xl">Últimas transações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sorted.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-9 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                >
                  {t.type === "income" ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <TrendingDown className="size-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(t.date)} ·{" "}
                    <Badge variant="outline" className="text-[10px]">
                      {t.category}
                    </Badge>
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}
              >
                {t.type === "income" ? "+" : "−"} {brl(t.amount)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
