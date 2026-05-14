import { useEffect, useState } from "react";
import { Search, Calendar, Clock, Scissors, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useDb, Appointment } from "@/store/mockDb";
import { useAuth } from "@/store/authStore";
import { brl, dayjs, fmtTime, initials } from "@/utils/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

type Step = "phone" | "register" | "appointments";

export default function MyAppointments() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [registerData, setRegisterData] = useState({ name: "", email: "", birthday: "" });
  const [results, setResults] = useState<Appointment[] | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", email: "", phone: "", birthday: "" });

  const { appointments, clients, services, professionals, updateClient } = useDb();
  const { user, loginByPhone, registerClient, logout, isAuthenticated, updateUser } = useAuth();
  const isClientAuthenticated = isAuthenticated && user?.role === "client";

  useEffect(() => {
    if (isClientAuthenticated && user) {
      const appts = appointments
        .filter((a) => a.clientId === user.id)
        .sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf());
      setResults(appts);
      setStep("appointments");

      // Set initial profile data
      const client = clients.find(c => c.id === user.id);
      if (client) {
        setProfileData({
          name: client.name,
          email: client.email || "",
          phone: client.phone,
          birthday: client.birthday || ""
        });
      }
    }
  }, [isClientAuthenticated, user?.id, appointments, clients]);

  async function handlePhoneSearch() {
    if (!phone) return;

    const { isNew, user: loggedUser } = await loginByPhone(phone);
    if (!isNew && loggedUser) {
      const appts = appointments
        .filter((a) => a.clientId === loggedUser.id)
        .sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf());
      setResults(appts);
      setStep("appointments");
      toast.success(`Bem-vinda, ${loggedUser.name}!`);
    } else {
      setStep("register");
    }
  }

  async function handleRegister() {
    if (!registerData.name || !registerData.birthday || !phone) {
      toast.error("Preencha os dados obrigatórios");
      return;
    }

    await registerClient({
      name: registerData.name,
      phone: phone,
      email: registerData.email || undefined,
      birthday: registerData.birthday,
    });

    setResults([]);
    setStep("appointments");
    toast.success("Conta criada com sucesso!");
  }

  async function handleUpdateProfile() {
    try {
      await updateUser(profileData);
      setIsEditingProfile(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      toast.error("Erro ao atualizar perfil");
    }
  }

  function handleLogout() {
    logout();
    setStep("phone");
    setPhone("");
    setRegisterData({ name: "", email: "", birthday: "" });
    setIsEditingProfile(false);
    setResults(null);
  }

  if (step === "appointments" && isClientAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold">Meus Agendamentos</h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                Olá, {user?.name} 
                <button 
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  {isEditingProfile ? "Cancelar edição" : "Editar perfil"}
                </button>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isEditingProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Editar Perfil</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-name" className="text-xs">Nome completo</Label>
                        <Input 
                          id="edit-name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-phone" className="text-xs">Telefone</Label>
                        <Input 
                          id="edit-phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-email" className="text-xs">Email</Label>
                        <Input 
                          id="edit-email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="edit-birthday" className="text-xs">Data de nascimento</Label>
                        <Input 
                          id="edit-birthday"
                          type="date"
                          value={profileData.birthday}
                          onChange={(e) => setProfileData({...profileData, birthday: e.target.value})}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button size="sm" onClick={handleUpdateProfile}>
                        Salvar Alterações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {results && results.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
              {results.map((a) => {
                const svc = services.find((s) => s.id === a.serviceIds[0]);
                const pro = professionals.find((p) => p.id === a.professionalId);
                const isFuture = dayjs(a.start).isAfter(dayjs());

                return (
                  <Card
                    key={a.id}
                    className="border-border/60 overflow-hidden group hover:border-primary/40 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Scissors className="size-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{svc?.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <User className="size-3.5" /> com {pro?.name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:flex md:items-center gap-6 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                            Data
                          </p>
                          <p className="font-medium flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-primary" />{" "}
                            {dayjs(a.start).format("DD/MM/YYYY")}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                            Horário
                          </p>
                          <p className="font-medium flex items-center gap-1.5">
                            <Clock className="size-3.5 text-primary" /> {fmtTime(a.start)}
                          </p>
                        </div>
                        <div className="space-y-1 text-right md:text-left">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
                            Status
                          </p>
                          <Badge variant={isFuture ? "default" : "secondary"} className="mt-1">
                            {a.status === "completed"
                              ? "Finalizado"
                              : a.status === "cancelled"
                                ? "Cancelado"
                                : isFuture
                                  ? "Agendado"
                                  : "Realizado"}
                          </Badge>
                        </div>
                      </div>

                      {isFuture && a.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="md:ml-4 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <p className="text-lg font-medium">Nenhum agendamento encontrado.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Agende um novo horário para ser atendida.
              </p>
              <Link
                to="/agendar"
                className="mt-6 inline-flex text-primary font-medium hover:underline"
              >
                Agendar agora
              </Link>
            </motion.div>
          )}

          <div className="mt-16 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" /> Voltar para o início
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-semibold">
            {step === "register" ? "Complete seu cadastro" : "Meus Agendamentos"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === "register"
              ? "Você ainda não tem cadastro. Preencha os dados abaixo."
              : "Informe seu número de telefone para acessar seus agendamentos."}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "phone" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePhoneSearch()}
                  />
                </div>
                <Button
                  onClick={handlePhoneSearch}
                  className="w-full bg-primary text-primary-foreground"
                >
                  <Search className="size-4 mr-2" /> Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {step === "register" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Novo Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthday">Data de nascimento *</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={registerData.birthday}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, birthday: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleRegister}
                    className="w-full bg-primary text-primary-foreground"
                  >
                    <CheckCircle2 className="size-4 mr-2" /> Criar conta e ver agendamentos
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setStep("phone");
                      setRegisterData({ name: "", email: "", birthday: "" });
                    }}
                  >
                    Voltar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {step === "phone" && (
          <div className="mt-16 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" /> Voltar para o início
            </Link>
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
