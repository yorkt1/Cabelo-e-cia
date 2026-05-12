import { Check } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/authStore";
import { useDb } from "@/store/mockDb";
import { toast } from "sonner";
import { brl } from "@/utils/format";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    features: ["1 profissional", "Agenda completa", "Cadastro de clientes", "Suporte email"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    features: [
      "Até 5 profissionais",
      "Tudo do Starter",
      "Relatórios avançados",
      "Lembretes WhatsApp",
      "Comissões",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 199,
    features: [
      "Profissionais ilimitados",
      "Tudo do Pro",
      "Multi-unidade",
      "API e integrações",
      "Suporte prioritário",
    ],
  },
] as const;

export default function SubscriptionPage() {
  const user = useAuth((s) => s.user);
  const { salons, updateSalon } = useDb();
  const salon = salons.find((s) => s.id === user?.salonId);
  const current = salon?.plan ?? "pro";

  return (
    <div>
      <PageHeader title="Assinatura" description="Escolha o plano ideal para seu salão" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((p) => {
          const active = current === p.id;
          return (
            <Card
              key={p.id}
              className={cn(
                "border-border/60 relative",
                active && "border-primary shadow-[0_8px_30px_-12px_rgba(232,180,184,0.45)]",
              )}
            >
              {p.id === "pro" && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Mais popular
                </Badge>
              )}
              <CardContent className="p-8 space-y-6">
                <div>
                  <p className="font-display text-2xl font-semibold">{p.name}</p>
                  <p className="mt-3">
                    <span className="font-display text-4xl font-semibold">{brl(p.price)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "w-full",
                    active
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                  disabled={active}
                  onClick={() => {
                    if (salon) {
                      updateSalon(salon.id, { plan: p.id });
                      toast.success(`Plano alterado para ${p.name}`);
                    }
                  }}
                >
                  {active ? "Plano atual" : "Selecionar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
