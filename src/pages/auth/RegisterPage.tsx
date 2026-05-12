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
  name: z.string().min(2),
  salonName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const reg = useAuth((s) => s.register);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    await reg(values);
    toast.success("Conta criada!");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold">Criar conta</h2>
        <p className="text-sm text-muted-foreground mt-2">Comece grátis por 14 dias.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Seu nome</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">Nome obrigatório</p>}
        </div>
        <div className="space-y-2">
          <Label>Nome do salão</Label>
          <Input {...register("salonName")} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">Email inválido</p>}
        </div>
        <div className="space-y-2">
          <Label>Senha</Label>
          <Input type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">Mínimo 6 caracteres</p>}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? "Criando..." : "Criar conta"}
        </Button>
      </form>
      <p className="text-sm text-center text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
