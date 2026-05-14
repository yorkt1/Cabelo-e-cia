import { Link } from "@tanstack/react-router";

export default function PublicFooter() {
  return (
    <footer className="border-t border-border/40 bg-transparent mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <img src="/logo_cia.png" alt="Cabelos e Cia" className="h-10 w-auto rounded-lg object-contain" />
            <span className="font-display text-lg font-bold tracking-tight">Cabelos e Cia</span>
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
          © {new Date().getFullYear()} Cabelos e Cia · Feito com cuidado.
        </div>
      </div>
    </footer>
  );
}
