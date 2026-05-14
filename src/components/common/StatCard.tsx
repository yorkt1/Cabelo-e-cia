import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export default function StatCard({ label, value, delta, icon: Icon, trend }: Props) {
  return (
    <Card className="border-border/60 hover:shadow-[0_8px_30px_-12px_rgba(226,74,58,0.4)] transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {label}
            </p>
            <p className="font-display text-3xl font-semibold">{value}</p>
            {delta && (
              <p
                className={cn(
                  "text-xs font-medium",
                  trend === "up" ? "text-emerald-600" : "text-orange-600",
                )}
              >
                {delta}
              </p>
            )}
          </div>
          <div className="size-11 rounded-xl bg-primary/15 flex items-center justify-center">
            <Icon className="size-5 text-primary" strokeWidth={1.75} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
