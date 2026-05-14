import { Outlet, Link } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/30 via-accent/40 to-secondary relative overflow-hidden">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 size-[28rem] rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <img src="https://instagram.fpoa5-1.fna.fbcdn.net/v/t51.82787-19/656281532_18427314040139147_4277075764603741806_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fpoa5-1.fna.fbcdn.net&_nc_cat=111&_nc_oc=Q6cZ2gGAgfqyyCeb03OqFZMhcW7P6XMqP1rBtLfKQrHo2cw8BrZJO9ulonLMQRr7DL89NCFb34ydcVIZQf-VGzDJvT8D&_nc_ohc=gsOsO_Tk5b0Q7kNvwHIrWAY&_nc_gid=96RqFQcM4c6x-usumeVDcw&edm=APoiHPcBAAAA&ccb=7-5&oh=00_Af6Jix-H8KzMW1sQky0tlE_5JWunwSvomCNuXAbw0R2hZA&oe=6A0BC2F7&_nc_sid=22de04" alt="Cabelos e Cia" className="h-12 w-auto object-contain" />
        </Link>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-5xl font-semibold leading-tight text-foreground">
            A agenda do seu salão, com a leveza que ele merece.
          </h1>
          <p className="mt-6 text-foreground/70 text-lg">
            Gestão completa para salões, barbearias, nail e lash designers — em um só lugar.
          </p>
        </div>
        <p className="text-xs text-foreground/60 relative z-10">© Cabelos e Cia · Feito com cuidado.</p>
      </div>
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
