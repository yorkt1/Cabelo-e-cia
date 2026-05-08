import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDb, type Client } from "@/store/mockDb";
import { initials, fmtDate } from "@/utils/format";
import ClientModal from "@/modals/ClientModal";
import { toast } from "sonner";

export default function ClientsPage() {
  const { clients, removeClient } = useDb();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const cols: ColumnDef<Client>[] = [
    {
      header: "Cliente",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9"><AvatarFallback className="bg-primary/15 text-foreground text-xs">{initials(row.original.name)}</AvatarFallback></Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Telefone", accessorKey: "phone" },
    {
      header: "Aniversário",
      accessorKey: "birthday",
      cell: ({ row }) => row.original.birthday ? fmtDate(row.original.birthday) : "—",
    },
    {
      header: "Visitas",
      accessorKey: "visits",
      cell: ({ row }) => <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{row.original.visits}</Badge>,
    },
    {
      header: "",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(row.original); setOpen(true); }}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { removeClient(row.original.id); toast.success("Cliente removido"); }}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${clients.length} clientes cadastrados`}
        actions={
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-4" /> Novo cliente
          </Button>
        }
      />
      <DataTable data={clients} columns={cols} searchPlaceholder="Buscar cliente..." />
      <ClientModal open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}
