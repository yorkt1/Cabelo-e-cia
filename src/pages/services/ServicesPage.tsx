import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useDb, type Service } from "@/store/mockDb";
import { brl } from "@/utils/format";
import ServiceModal from "@/modals/ServiceModal";
import { toast } from "sonner";

export default function ServicesPage() {
  const { services, updateService, removeService } = useDb();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const cols: ColumnDef<Service>[] = [
    { header: "Serviço", accessorKey: "name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { header: "Categoria", accessorKey: "category", cell: ({ row }) => <Badge variant="outline" className="border-primary/30 text-primary">{row.original.category}</Badge> },
    { header: "Duração", accessorKey: "durationMin", cell: ({ row }) => `${row.original.durationMin} min` },
    { header: "Preço", accessorKey: "price", cell: ({ row }) => brl(row.original.price) },
    { header: "Comissão", accessorKey: "commission", cell: ({ row }) => `${row.original.commission}%` },
    {
      header: "Ativo",
      id: "active",
      cell: ({ row }) => (
        <Switch checked={row.original.active} onCheckedChange={(v) => updateService(row.original.id, { active: v })} />
      ),
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(row.original); setOpen(true); }}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { removeService(row.original.id); toast.success("Removido"); }}><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Serviços"
        description={`${services.length} serviços disponíveis`}
        actions={
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" /> Novo serviço
          </Button>
        }
      />
      <DataTable data={services} columns={cols} searchPlaceholder="Buscar serviço..." />
      <ServiceModal open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
