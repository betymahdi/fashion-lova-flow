import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, Tag, LogOut, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";
import { AdminConfirmProvider } from "@/lib/admin-confirm";

export const Route = createFileRoute("/_authenticated/admin")({
  component: () => (
    <AdminConfirmProvider>
      <AdminLayout />
    </AdminConfirmProvider>
  ),
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const active = pathname === to || (to !== "/admin/dashboard" && pathname.startsWith(to));
    return (
      <Link to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-primary/50 font-semibold text-foreground" : "text-foreground/70 hover:bg-sidebar-accent"}`}>
        <Icon className="h-4 w-4" /> {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-secondary/20">
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2 px-2">
          <img src={BRAND.logo} alt="" className="h-9 w-9 rounded-xl border border-border/60 bg-white object-contain p-1 shadow-sm" />
          <span className="font-display text-base leading-tight">Fashion Lova Bety</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/admin/products" icon={Package} label="Produits" />
          <NavItem to="/admin/categories" icon={Tag} label="Catégories" />
          <NavItem to="/admin/promotions" icon={Percent} label="Promotions" />
        </nav>
        <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground/70 transition hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </aside>

      <div className="flex-1">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src={BRAND.logo} alt="" className="h-8 w-8 rounded-xl border border-border/60 bg-white object-contain p-1 shadow-sm" />
            <span className="font-display">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/admin/products" className="rounded-full bg-accent px-3 py-1.5 text-xs">Produits</Link>
            <button onClick={logout} className="rounded-full bg-accent px-3 py-1.5 text-xs">Sortir</button>
          </div>
        </header>
        <main className="p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
