import { Link } from "@tanstack/react-router";
import { useAuth } from "@/store/authStore";

export default function PublicHeader() {
  const { user, logout } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? ""

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-white/10 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo_cia.png" alt="Cabelos e Cia" className="h-10 w-auto rounded-lg object-contain" />
          <span className="font-display text-xl font-bold tracking-tight">Cabelos e Cia</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Recursos
          </a>
          <a
            href="#pricing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Planos
          </a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/meus-agendamentos"
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
              >
                Olá, {firstName}
              </Link>
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-2"
            >
              Entrar
            </Link>
          )}
          <Link
            to={user ? "/agendar" : "/login"}
            className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Agendar agora
          </Link>
        </div>
      </div>
    </header>
  );
}
