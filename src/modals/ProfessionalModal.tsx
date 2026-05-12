import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDb, type Professional } from "@/store/mockDb";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Professional | null;
}
interface Form {
  name: string;
  email: string;
  commission: number;
  specialties: string;
  color: string;
}

export default function ProfessionalModal({ open, onOpenChange, editing }: Props) {
  const { addProfessional, updateProfessional } = useDb();
  const { register, handleSubmit, reset } = useForm<Form>();

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            name: editing.name,
            email: editing.email,
            commission: editing.commission,
            specialties: editing.specialties.join(", "),
            color: editing.color,
          }
        : { name: "", email: "", commission: 30, specialties: "", color: "#E8B4B8" },
    );
  }, [open, editing, reset]);

  function onSubmit(v: Form) {
    const payload = {
      name: v.name,
      email: v.email,
      commission: Number(v.commission),
      color: v.color,
      specialties: v.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (editing) {
      updateProfessional(editing.id, payload);
      toast.success("Atualizado");
    } else {
      addProfessional({ ...payload, salonId: "salon_demo" });
      toast.success("Criado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Editar" : "Novo"} profissional
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
          </div>
          <div className="space-y-2">
            <Label>Especialidades (separadas por vírgula)</Label>
            <Input {...register("specialties")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Comissão (%)</Label>
              <Input type="number" {...register("commission")} />
            </div>
            <div className="space-y-2">
              <Label>Cor da agenda</Label>
              <Input type="color" {...register("color")} className="h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
