import { useState } from "react";
import { Search, Calendar, Clock, Scissors, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PublicHeader from "@/components/common/PublicHeader";
import PublicFooter from "@/components/common/PublicFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDb } from "@/store/mockDb";
import { brl, dayjs, fmtTime, initials } from "@/utils/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "@tanstack/react-router";

export default function MyAppointments() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const { appointments, clients, services, professionals } = useDb();

  function handleSearch() {
    if (!search) return;
    const client = clients.find(c => c.email.toLowerCase() === search.toLowerCase() || c.phone.includes(search));
    if (client) {
      const appts = appointments
        .filter(a => a.clientId === client.id)
        .sort((a, b) => dayjs(b.start).valueOf() - dayjs(a.start).valueOf());
      setResults(appts);
    } else {
      setResults([]);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-semibold">Meus Agendamentos</h1>
          <p className="text-muted-foreground mt-2">Consulte seus horários marcados informando seu e-mail ou telefone.</p>
        </div>

        <div className="max-w-md mx-auto flex gap-2 mb-12">
          <Input 
            placeholder="E-mail ou Telefone" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} className="bg-primary text-primary-foreground">
            <Search className="size-4 mr-2" /> Buscar
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {results === null ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Calendar className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Informe seus dados acima para ver seus horários.</p>
            </motion.div>
          ) : results.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
              <p className="text-lg font-medium">Nenhum agendamento encontrado.</p>
              <p className="text-sm text-muted-foreground mt-1">Verifique os dados ou agende um novo horário.</p>
              <Link to="/agendar" className="mt-6 inline-flex text-primary font-medium hover:underline">Agendar agora</Link>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="grid gap-4"
            >
              <p className="text-sm font-medium text-muted-foreground mb-2">Encontramos {results.length} agendamentos:</p>
              {results.map((a) => {
                const svc = services.find(s => s.id === a.serviceIds[0]);
                const pro = professionals.find(p => p.id === a.professionalId);
                const isFuture = dayjs(a.start).isAfter(dayjs());

                return (
                  <Card key={a.id} className="border-border/60 overflow-hidden group hover:border-primary/40 transition-colors">
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
                          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Data</p>
                          <p className="font-medium flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-primary" /> {dayjs(a.start).format("DD/MM/YYYY")}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Horário</p>
                          <p className="font-medium flex items-center gap-1.5">
                            <Clock className="size-3.5 text-primary" /> {fmtTime(a.start)}
                          </p>
                        </div>
                        <div className="space-y-1 text-right md:text-left">
                          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Status</p>
                          <Badge variant={isFuture ? "default" : "secondary"} className="mt-1">
                            {a.status === "completed" ? "Finalizado" : a.status === "cancelled" ? "Cancelado" : isFuture ? "Agendado" : "Realizado"}
                          </Badge>
                        </div>
                      </div>

                      {isFuture && a.status !== "cancelled" && (
                        <Button variant="outline" size="sm" className="md:ml-4 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="mt-16 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" /> Voltar para o início
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
