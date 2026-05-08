import { useForm } from "react-hook-form";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/store/authStore";
import { initials } from "@/utils/format";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name, email: user?.email } });

  if (!user) return null;
  return (
    <div>
      <PageHeader title="Meu perfil" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-border/60">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <Avatar className="size-24"><AvatarFallback className="bg-primary/20 text-foreground font-display text-2xl">{initials(user.name)}</AvatarFallback></Avatar>
            <p className="font-display text-xl font-semibold mt-4">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs uppercase tracking-wider text-primary mt-2">{user.role}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader><CardTitle className="font-display text-xl">Dados pessoais</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((v) => { updateProfile(v); toast.success("Atualizado"); })} className="space-y-4">
              <div className="space-y-2"><Label>Nome</Label><Input {...register("name")} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
