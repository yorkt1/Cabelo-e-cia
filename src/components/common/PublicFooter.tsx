import { Link } from "@tanstack/react-router";

export default function PublicFooter() {
  return (
    <footer className="border-t border-border/60 bg-background mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <img src="https://instagram.fpoa5-1.fna.fbcdn.net/v/t51.82787-19/656281532_18427314040139147_4277075764603741806_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fpoa5-1.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2gGAgfqyyCeb03OqFZMhcW7P6XMqP1rBtLfKQrHo2cw8BrZJO9ulonLMQRr7DL89NCFb34ydcVIZQf-VGzDJvT8D&_nc_ohc=gsOsO_Tk5b0Q7kNvwHIrWAY&_nc_gid=96RqFQcM4c6x-usumeVDcw&edm=APoiHPcBAAAA&ccb=7-5&oh=00_Af6Jix-H8KzMW1sQky0tlE_5JWunwSvomCNuXAbw0R2hZA&oe=6A0BC2F7&_nc_sid=22de04" alt="Cabelos e Cia" className="h-10 w-auto object-contain" />
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
