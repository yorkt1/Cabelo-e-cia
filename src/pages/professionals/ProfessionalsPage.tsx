import { useState } from "react";
import { Plus, Pencil, Trash2, Mail } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDb, type Professional } from "@/store/mockDb";
import { initials } from "@/utils/format";
import ProfessionalModal from "@/modals/ProfessionalModal";
import { toast } from "sonner";

export default function ProfessionalsPage() {
  const { professionals, removeProfessional } = useDb();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);

  return (
    <div>
      <PageHeader
        title="Profissionais"
        description={`${professionals.length} no time`}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" /> Novo profissional
          </Button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {professionals.map((p) => (
          <Card key={p.id} className="border-border/60 group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="size-14" style={{ backgroundColor: p.color }}>
                  <AvatarFallback
                    className="text-white font-medium"
                    style={{ backgroundColor: p.color }}
                  >
                    {initials(p.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Mail className="size-3" /> {p.email}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {p.specialties.map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="bg-secondary text-secondary-foreground text-[10px]"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Comissão <span className="font-semibold text-foreground">{p.commission}%</span>
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(p);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      removeProfessional(p.id);
                      toast.success("Removido");
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ProfessionalModal open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
