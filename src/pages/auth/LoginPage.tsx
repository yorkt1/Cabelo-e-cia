import { useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "demo@belle.com", password: "123456" },
  });

  async function onSubmit(values: Form) {
    try {
      await login(values.email, values.password);
      toast.success("Bem-vinda de volta!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Não foi possível entrar.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold">Entrar</h2>
        <p className="text-sm text-muted-foreground mt-2">Acesse sua agenda em segundos.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Esqueci minha senha</Link>
          </div>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <div className="pt-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">Acesso Rápido (Demo)</p>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-12 flex flex-col gap-0.5"
            onClick={() => onSubmit({ email: "contato@belle.com", password: "password" })}
          >
            <span className="font-bold">Dono</span>
            <span className="text-[10px] opacity-60">Visão completa</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-12 flex flex-col gap-0.5"
            onClick={() => onSubmit({ email: "colaborador@belle.com", password: "password" })}
          >
            <span className="font-bold">Colaborador</span>
            <span className="text-[10px] opacity-60">Visão restrita</span>
          </Button>
        </div>
      </div>
      <p className="text-sm text-center text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link to="/register" className="text-primary font-medium hover:underline">Cadastre-se</Link>
      </p>
    </div>
  );
}
