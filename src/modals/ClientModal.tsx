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
import { Textarea } from "@/components/ui/textarea";
import { useDb, type Client } from "@/store/mockDb";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Client | null;
}

interface Form {
  name: string;
  email: string;
  phone: string;
  birthday?: string;
  notes?: string;
}

export default function ClientModal({ open, onOpenChange, editing }: Props) {
  const { addClient, updateClient } = useDb();
  const { register, handleSubmit, reset } = useForm<Form>();

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            name: editing.name,
            email: editing.email,
            phone: editing.phone,
            birthday: editing.birthday,
            notes: editing.notes,
          }
        : { name: "", email: "", phone: "", birthday: "", notes: "" },
    );
  }, [open, editing, reset]);

  function onSubmit(values: Form) {
    if (editing) {
      updateClient(editing.id, values);
      toast.success("Cliente atualizado");
    } else {
      addClient({ ...values, salonId: "salon_demo" });
      toast.success("Cliente criado");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editing ? "Editar" : "Novo"} cliente
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input {...register("name", { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input {...register("phone")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Aniversário</Label>
            <Input type="date" {...register("birthday")} />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea rows={3} {...register("notes")} />
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
