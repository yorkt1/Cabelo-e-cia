import { Link } from "@tanstack/react-router";

export default function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-background mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-semibold text-sm">
              B
            </div>
            <span className="font-display text-xl font-semibold">Belle</span>
          </div>
          <p className="text-muted-foreground mt-3 max-w-xs">
            A agenda do seu salão com a leveza que ele merece.
          </p>
        </div>
        <div>
          <p className="font-medium mb-3">Produto</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <a href="#features" className="hover:text-foreground">
                Recursos
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-foreground">
                Planos
              </a>
            </li>
            <li>
              <Link to="/agendar" className="hover:text-foreground">
                Agendar
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium mb-3">Conta</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/login" className="hover:text-foreground">
                Entrar
              </Link>
            </li>
            <li>
              <Link to="/register" className="hover:text-foreground">
                Criar conta
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-5 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Belle SaaS · Feito com cuidado.
        </div>
      </div>
    </footer>
  );
}
