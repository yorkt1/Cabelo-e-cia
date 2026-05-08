import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const { register, handleSubmit } = useForm<{ password: string; confirm: string }>();
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold">Nova senha</h2>
        <p className="text-sm text-muted-foreground mt-2">Defina uma nova senha para sua conta.</p>
      </div>
      <form
        onSubmit={handleSubmit(() => { toast.success("Senha alterada"); navigate({ to: "/login" }); })}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label>Nova senha</Label>
          <Input type="password" {...register("password", { required: true, minLength: 6 })} />
        </div>
        <div className="space-y-2">
          <Label>Confirmar senha</Label>
          <Input type="password" {...register("confirm", { required: true })} />
        </div>
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Salvar
        </Button>
      </form>
      <p className="text-sm text-center text-muted-foreground">
        <Link to="/login" className="text-primary font-medium hover:underline">Voltar</Link>
      </p>
    </div>
  );
}
