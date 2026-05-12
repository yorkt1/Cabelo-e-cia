import { useForm } from "react-hook-form";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/authStore";
import { useDb } from "@/store/mockDb";
import { toast } from "sonner";

export default function SettingsPage() {
  const user = useAuth((s) => s.user);
  const { salons, updateSalon } = useDb();
  const salon = salons.find((s) => s.id === user?.salonId);
  const { register, handleSubmit } = useForm({
    defaultValues: { name: salon?.name, phone: salon?.phone, address: salon?.address },
  });

  return (
    <div>
      <PageHeader title="Configurações" description="Dados do seu salão" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-xl">Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((v) => {
                if (salon) {
                  updateSalon(salon.id, v);
                  toast.success("Salvo!");
                }
              })}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Nome do salão</Label>
                <Input {...register("name")} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input {...register("address")} />
              </div>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Salvar
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-xl">Horário de funcionamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((d) => (
              <div
                key={d}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="font-medium text-sm">{d}</span>
                <span className="text-sm text-muted-foreground">09:00 — 19:00</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-sm">Domingo</span>
              <span className="text-sm text-muted-foreground">Fechado</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
