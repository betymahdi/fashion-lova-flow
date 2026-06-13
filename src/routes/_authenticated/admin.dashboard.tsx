import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import {
  Package, CheckCircle2, AlertTriangle, Tags, Plus, List,
  Sparkles, TrendingUp, ChevronLeft, ChevronRight, Eye, ShoppingBag,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ColorOpt } from "@/components/site/ProductCard";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: products } = useQuery({
    queryKey: ["admin", "dashboard-products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const all = products ?? [];
  const total = all.length;
  const active = all.filter((p) => p.is_active).length;
  const out = all.filter((p) => (p.stock ?? 0) <= 0).length;
  const cats = new Set(all.map((p) => p.category)).size;
  const recent = all.slice(0, 8);
  const lowStock = all.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 3).slice(0, 6);

  const stats = [
    { Icon: Package, label: "Total produits", value: total, tint: "from-rose-200 to-pink-300", iconBg: "bg-white/70" },
    { Icon: CheckCircle2, label: "En ligne", value: active, tint: "from-emerald-200 to-teal-300", iconBg: "bg-white/70" },
    { Icon: AlertTriangle, label: "Ruptures", value: out, tint: "from-amber-200 to-orange-300", iconBg: "bg-white/70" },
    { Icon: Tags, label: "Catégories", value: cats, tint: "from-violet-200 to-fuchsia-300", iconBg: "bg-white/70" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary/60 via-pink-200 to-rose-300 p-8 shadow-[0_20px_60px_-30px_oklch(0.78_0.12_8/0.7)]">
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-rose-400/30 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Tableau de bord
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">Bonjour Bety ✨</h1>
            <p className="mt-1 max-w-md text-sm text-foreground/70">
              Voici un aperçu de votre boutique aujourd'hui — gérez vos produits en un clin d'œil.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/products/new" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background shadow-lg transition hover:scale-105">
              <Plus className="h-4 w-4" /> Nouveau produit
            </Link>
            <Link to="/admin/products" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-white">
              <List className="h-4 w-4" /> Voir tout
            </Link>
          </div>
        </div>
      </section>

      {/* Stats carousel */}
      <Carousel title="Statistiques" subtitle="Vue d'ensemble en temps réel">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`snap-start min-w-[220px] flex-none rounded-3xl bg-gradient-to-br ${s.tint} p-5 shadow-[0_10px_30px_-15px_oklch(0.78_0.1_8/0.55)] ring-1 ring-white/40`}
          >
            <div className={`grid h-11 w-11 place-items-center rounded-2xl ${s.iconBg} backdrop-blur`}>
              <s.Icon className="h-5 w-5 text-foreground/80" />
            </div>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-foreground/70">{s.label}</p>
            <p className="font-display text-4xl text-foreground">{s.value}</p>
          </div>
        ))}
      </Carousel>

      {/* Quick actions */}
      <section className="grid gap-4 sm:grid-cols-3">
        <QuickCard to="/admin/products/new" Icon={Plus} title="Ajouter un produit" desc="Créer une nouvelle fiche" tint="bg-primary" textTint="text-primary-foreground" />
        <QuickCard to="/admin/products" Icon={ShoppingBag} title="Gérer le catalogue" desc={`${total} produit${total > 1 ? "s" : ""}`} tint="bg-card ring-1 ring-border" />
        <QuickCard to="/admin/categories" Icon={Tags} title="Catégories" desc={`${cats} catégorie${cats > 1 ? "s" : ""}`} tint="bg-card ring-1 ring-border" />
      </section>

      {/* Recent products carousel */}
      <Carousel
        title="Produits récents"
        subtitle="Vos derniers ajouts"
        cta={<Link to="/admin/products" className="text-xs font-semibold underline-offset-4 hover:underline">Voir tout →</Link>}
      >
        {recent.length === 0 ? (
          <EmptyCard label="Aucun produit pour l'instant" />
        ) : (
          recent.map((p) => <ProductMiniCard key={p.id} p={p} />)
        )}
      </Carousel>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <Carousel
          title="Stock bientôt épuisé"
          subtitle="Pensez à réapprovisionner"
          icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
        >
          {lowStock.map((p) => (
            <div key={p.id} className="snap-start min-w-[260px] flex-none rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <div className="flex items-center gap-3">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt="" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-amber-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-amber-700">Reste {p.stock} en stock</p>
                </div>
              </div>
              <Link to="/admin/products/$id/edit" params={{ id: p.id }} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:underline">
                Modifier <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </Carousel>
      )}
    </div>
  );
}

function QuickCard({ to, Icon, title, desc, tint, textTint }: { to: string; Icon: any; title: string; desc: string; tint: string; textTint?: string }) {
  return (
    <Link to={to} className={`group flex items-center gap-3 rounded-2xl p-5 transition hover:scale-[1.02] ${tint} ${textTint ?? ""}`}>
      <div className={`grid h-12 w-12 place-items-center rounded-full ${textTint ? "bg-background/30" : "bg-secondary"}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-display text-lg">{title}</p>
        <p className={`text-xs ${textTint ? "opacity-80" : "text-muted-foreground"}`}>{desc}</p>
      </div>
    </Link>
  );
}

function Carousel({ title, subtitle, cta, icon, children }: { title: string; subtitle?: string; cta?: React.ReactNode; icon?: React.ReactNode; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl">{icon}{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {cta}
          <div className="hidden gap-1 md:flex">
            <button onClick={() => scroll(-1)} className="grid h-9 w-9 place-items-center rounded-full bg-card ring-1 ring-border hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => scroll(1)} className="grid h-9 w-9 place-items-center rounded-full bg-card ring-1 ring-border hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
      <div ref={ref} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {children}
      </div>
    </section>
  );
}

function ProductMiniCard({ p }: { p: Product }) {
  const colors = (p.colors as unknown as ColorOpt[]) ?? [];
  return (
    <Link to="/admin/products/$id/edit" params={{ id: p.id }} className="snap-start min-w-[200px] flex-none overflow-hidden rounded-2xl bg-card ring-1 ring-border transition hover:shadow-lg">
      <div className="aspect-square bg-muted">
        {p.images?.[0] ? <img src={p.images[0]} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-muted-foreground">Pas d'image</div>}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="line-clamp-1 text-sm font-medium">{p.name}</p>
        <div className="flex items-center justify-between">
          <span className="font-display text-base">{p.price} MAD</span>
          {p.is_active ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700"><Eye className="h-3 w-3" /> Actif</span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">Masqué</span>
          )}
        </div>
        {colors.length > 0 && (
          <div className="flex gap-1">
            {colors.slice(0, 5).map((c, i) => (
              <span key={i} title={c.label} className="h-3.5 w-3.5 rounded-full ring-1 ring-border" style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyCard({ label }: { label: string }) {
  return (
    <div className="snap-start min-w-[260px] flex-none rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Link to="/admin/products/new" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline">
        <Plus className="h-3.5 w-3.5" /> Ajouter
      </Link>
    </div>
  );
}
