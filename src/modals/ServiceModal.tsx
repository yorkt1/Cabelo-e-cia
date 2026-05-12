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
import { useDb, type Service } from "@/store/mockDb";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Service | null;
}
interface Form {
  name: string;
  category: string;
  durationMin: number;
  price: number;
  commission: number;
}

export default function ServiceModal({ open, onOpenChange, editing }: Props) {
  const { addService, updateService } = useDb();
  const { register, handleSubmit, reset } = useForm<Form>();

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            name: editing.name,
            category: editing.category,
            durationMin: editing.durationMin,
            price: editing.price,
            commission: editing.commission,
          }
        : { name: "", category: "Cabelo", durationMin: 60, price: 80, commission: 40 },
    );
  }, [open, editing, reset]);

  function onSubmit(v: Form) {
    const payload = {
      name: v.name,
      category: v.category,
      durationMin: Number(v.durationMin),
      price: Number(v.price),
      commission: Number(v.commission),
    };
    if (editing) {
      updateService(editing.id, payload);
      toast.success("Atualizado");
    } else {
      addService({ ...payload, salonId: "salon_demo", active: true });
      toast.success("Criado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Editar" : "Novo"} serviço
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Input {...register("category")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input type="number" {...register("durationMin")} />
            </div>
            <div className="space-y-2">
              <Label>Preço</Label>
              <Input type="number" step="0.01" {...register("price")} />
            </div>
            <div className="space-y-2">
              <Label>Comissão (%)</Label>
              <Input type="number" {...register("commission")} />
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
