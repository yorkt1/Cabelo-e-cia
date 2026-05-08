import { Outlet, Link } from "@tanstack/react-router";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/30 via-accent/40 to-secondary relative overflow-hidden">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 size-[28rem] rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="size-10 rounded-xl bg-card flex items-center justify-center font-display font-semibold text-foreground">B</div>
          <span className="font-display text-2xl font-semibold">Belle</span>
        </Link>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-5xl font-semibold leading-tight text-foreground">
            A agenda do seu salão, com a leveza que ele merece.
          </h1>
          <p className="mt-6 text-foreground/70 text-lg">
            Gestão completa para salões, barbearias, nail e lash designers — em um só lugar.
          </p>
        </div>
        <p className="text-xs text-foreground/60 relative z-10">© Belle SaaS · Made with care</p>
      </div>
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
