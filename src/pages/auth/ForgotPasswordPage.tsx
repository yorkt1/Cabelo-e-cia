import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold">Esqueci minha senha</h2>
        <p className="text-sm text-muted-foreground mt-2">Enviaremos um link para seu email.</p>
      </div>
      <form
        onSubmit={handleSubmit(() => toast.success("Link de recuperação enviado!"))}
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...register("email", { required: true })} />
        </div>
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Enviar link
        </Button>
      </form>
      <p className="text-sm text-center text-muted-foreground">
        <Link to="/login" className="text-primary font-medium hover:underline">Voltar para login</Link>
      </p>
    </div>
  );
}
