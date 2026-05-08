import { useEffect } from "react";
import { Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCircle,
  DollarSign,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  Crown,
  Bell,
} from "lucide-react";
import { useAuth } from "@/store/authStore";
import { useUi } from "@/store/uiStore";
import { useDb } from "@/store/mockDb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initials } from "@/utils/format";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["owner", "admin", "professional", "receptionist"] },
  { to: "/agenda", label: "Agenda", icon: Calendar, roles: ["owner", "admin", "professional", "receptionist"] },
  { to: "/clientes", label: "Clientes", icon: Users, roles: ["owner", "admin", "professional", "receptionist"] },
  { to: "/profissionais", label: "Profissionais", icon: UserCircle, roles: ["owner", "admin"] },
  { to: "/servicos", label: "Serviços", icon: Scissors, roles: ["owner", "admin"] },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign, roles: ["owner"] },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3, roles: ["owner", "admin"] },
  { to: "/assinatura", label: "Assinatura", icon: CreditCard, roles: ["owner"] },
  { to: "/configuracoes", label: "Configurações", icon: Settings, roles: ["owner", "admin"] },
] as const;

export default function AppLayout() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const { theme, toggleTheme, sidebarCollapsed, setSidebar } = useUi();
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const salons = useDb((s) => s.salons);
  const currentSalon = salons.find((s) => s.id === user?.salonId);

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300",
          sidebarCollapsed ? "w-[76px]" : "w-[260px]"
        )}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-semibold">
            B
          </div>
          {!sidebarCollapsed && (
            <div className="leading-tight">
              <p className="font-display text-lg font-semibold">Belle</p>
              <p className="text-[11px] text-muted-foreground">{currentSalon?.name}</p>
            </div>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.filter((item) => (item.roles as unknown as string[]).includes(user.role)).map((item) => {
            const active = path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        {user.role === "owner" && (
          <div className="p-3 border-t border-border space-y-1">
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Crown className="size-[18px]" strokeWidth={1.75} />
              {!sidebarCollapsed && <span>Super Admin</span>}
            </Link>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebar(!sidebarCollapsed)} className="hidden md:inline-flex">
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="size-5" />
          </Button>
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Link to="/perfil">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/20 text-foreground text-sm">{initials(user.name)}</AvatarFallback>
              </Avatar>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => { logout(); navigate({ to: "/login" }); }}>
              <LogOut className="size-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
