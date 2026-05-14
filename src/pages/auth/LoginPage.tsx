import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const clientSchema = z.object({
  phone: z.string().min(10, "Telefone inválido"),
  name: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  birthday: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type ClientForm = z.infer<typeof clientSchema>;

export default function LoginPage() {
  const { login, loginByPhone, registerClient } = useAuth();
  const navigate = useNavigate();
  const [isNewClient, setIsNewClient] = useState(false);
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const clientForm = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: { phone: "", name: "", email: "", birthday: "" },
  });

  async function onProfessionalSubmit(values: LoginForm) {
    try {
      await login(values.email, values.password);
      toast.success("Bem-vinda de volta!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Não foi possível entrar.");
    }
  }

  async function onClientSubmit(values: ClientForm) {
    try {
      if (!phoneSubmitted) {
        const { isNew } = await loginByPhone(values.phone);
        if (isNew) {
          setIsNewClient(true);
          setPhoneSubmitted(true);
          toast.info("Parece que é sua primeira vez! Complete seu cadastro.");
        } else {
          toast.success("Bem-vinda de volta!");
          navigate({ to: "/meus-agendamentos" });
        }
      } else {
        await registerClient({
          name: values.name || "",
          phone: values.phone,
          email: values.email,
          birthday: values.birthday,
        });
        toast.success("Cadastro realizado com sucesso!");
        navigate({ to: "/meus-agendamentos" });
      }
    } catch (error) {
      toast.error("Erro ao processar sua solicitação.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold">Entrar</h2>
        <p className="text-sm text-muted-foreground mt-2">Escolha como deseja acessar.</p>
      </div>

      <Tabs defaultValue="client" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="client">Sou Cliente</TabsTrigger>
          <TabsTrigger value="pro">Sou Profissional</TabsTrigger>
        </TabsList>

        <TabsContent value="client">
          <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone">Seu Telefone</Label>
              <Input 
                id="phone" 
                placeholder="(00) 00000-0000" 
                disabled={phoneSubmitted}
                {...clientForm.register("phone")} 
              />
              {clientForm.formState.errors.phone && <p className="text-xs text-destructive">{clientForm.formState.errors.phone.message}</p>}
            </div>

            {isNewClient && (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="name">Seu Nome Completo</Label>
                  <Input id="name" placeholder="Como quer ser chamada?" {...clientForm.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Opcional)</Label>
                  <Input id="email" type="email" placeholder="Para receber lembretes" {...clientForm.register("email")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Data de Nascimento (Opcional)</Label>
                  <Input id="birthday" type="date" {...clientForm.register("birthday")} />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={clientForm.formState.isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {clientForm.formState.isSubmitting ? "Carregando..." : phoneSubmitted ? "Concluir Cadastro" : "Entrar"}
            </Button>
            
            {phoneSubmitted && (
              <button 
                type="button" 
                onClick={() => { setPhoneSubmitted(false); setIsNewClient(false); }}
                className="text-xs text-muted-foreground hover:text-primary w-full text-center"
              >
                Usar outro número
              </button>
            )}
          </form>
        </TabsContent>

        <TabsContent value="pro">
          <form onSubmit={loginForm.handleSubmit(onProfessionalSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...loginForm.register("email")} />
              {loginForm.formState.errors.email && <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <Input id="password" type="password" {...loginForm.register("password")} />
              {loginForm.formState.errors.password && <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loginForm.formState.isSubmitting ? "Entrando..." : "Entrar como Profissional"}
            </Button>

            <div className="pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
                Acesso Rápido (Demo)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-12 flex flex-col gap-0.5"
                  onClick={() => onProfessionalSubmit({ email: "contato@cabelos-cia.com", password: "password" })}
                >
                  <span className="font-bold">Dono</span>
                  <span className="text-[10px] opacity-60">Visão completa</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-12 flex flex-col gap-0.5"
                  onClick={() => onProfessionalSubmit({ email: "colaborador@cabelos-cia.com", password: "password" })}
                >
                  <span className="font-bold">Colaborador</span>
                  <span className="text-[10px] opacity-60">Visão restrita</span>
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      <p className="text-sm text-center text-muted-foreground">
        Novo salão?{" "}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Cadastre seu negócio
        </Link>
      </p>
    </div>
  );
}

