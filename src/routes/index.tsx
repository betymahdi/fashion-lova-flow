import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, Star, MessageCircle, Sparkles } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useCategories, FALLBACK_CATEGORIES } from "@/lib/categories";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CartDrawer } from "@/components/site/CartDrawer";
import { WhatsAppFloating } from "@/components/site/WhatsAppFloating";
import { ProductCard, ProductCardSkeleton, type Product } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";

const PINK       = "#F9C6D0";
const PINK_DARK  = "#F0A8BB";
const PINK_SOFT  = "#FFF0F4";
const PINK_MID   = "#fce4ec";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fashion Lova Bety — Vêtements Femme Tendance | Boutique en Ligne Maroc" },
      { name: "description", content: "Découvrez notre collection de vêtements femme tendance : robes, tops, ensembles. Livraison rapide partout au Maroc, paiement à la livraison. Qualité premium garantie." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: cats } = useCategories();
  const CATEGORIES = cats && cats.length > 0 ? cats : FALLBACK_CATEGORIES;

  const { data: featured, isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products").select("*").eq("is_active", true)
        .order("created_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans">
      <SiteHeader />
      <CartDrawer />
      <WhatsAppFloating />

      {/* ══ HERO ══ */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
        style={{ background: `linear-gradient(160deg, ${PINK_SOFT} 0%, #fff 50%, #fff5f8 100%)` }}
      >
        {/* Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-20 h-[600px] w-[600px] rounded-full"
            style={{ background: `radial-gradient(circle, ${PINK}55 0%, transparent 65%)`, filter: "blur(90px)" }} />
          <div className="absolute -bottom-32 -right-20 h-[500px] w-[500px] rounded-full"
            style={{ background: `radial-gradient(circle, ${PINK}45 0%, transparent 65%)`, filter: "blur(70px)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full"
            style={{ background: `radial-gradient(circle, ${PINK_MID}60 0%, transparent 70%)`, filter: "blur(60px)" }} />
        </div>

        {/* Decorative dots grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `radial-gradient(${PINK_DARK} 1.5px, transparent 1.5px)`, backgroundSize: "32px 32px" }} />

        <div className="relative z-10 flex flex-col items-center gap-5">
          {/* Badge */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ background: `${PINK}60`, color: PINK_DARK, border: `1px solid ${PINK_DARK}30` }}
          >
            <Sparkles className="h-3 w-3" />
            Nouvelle collection 2026
          </span>

          {/* Title */}
          <h1 className="font-display leading-[1.02] tracking-tight"
            style={{ fontSize: "clamp(3.2rem,9vw,7rem)", color: "#1a1a1a" }}>
            <span style={{ color: PINK_DARK }}>Fashion</span>
            <br />
            <span style={{ color: "#1a1a1a" }}>Lova Bety</span>
          </h1>

          {/* Ornament */}
          <div className="flex items-center gap-3">
            <div className="h-px w-24" style={{ background: `linear-gradient(to right, transparent, ${PINK_DARK})` }} />
            <div className="h-2 w-2 rotate-45" style={{ background: PINK_DARK }} />
            <div className="h-px w-24" style={{ background: `linear-gradient(to left, transparent, ${PINK_DARK})` }} />
          </div>

          <p className="max-w-sm text-base leading-relaxed" style={{ color: "#999" }}>
            Mode féminine élégante &amp; tendance.<br />Livraison rapide partout au Maroc.
          </p>

          {/* CTAs */}
          <div className="mt-1 flex flex-wrap justify-center gap-3">
            <a
              href="#collections"
              className="rounded-full px-9 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${PINK_DARK} 0%, #e891aa 100%)`,
                boxShadow: `0 8px 32px ${PINK_DARK}55`,
              }}
            >
              Découvrir la collection
            </a>
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border-2 px-9 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ borderColor: PINK_DARK, color: PINK_DARK, background: "white" }}
            >
              Commander via WhatsApp
            </a>
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            {[
              { val: "10 000+", label: "Clientes satisfaites" },
              { val: "100%",    label: "Qualité garantie" },
              { val: "24-48h",  label: "Livraison express" },
            ].map(({ val, label }) => (
              <div key={val} className="flex flex-col items-center">
                <span className="font-display text-2xl font-bold" style={{ color: PINK_DARK }}>{val}</span>
                <span className="mt-0.5 text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: PINK_DARK }}>Scroll</span>
          <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 pt-1.5"
            style={{ borderColor: PINK_DARK }}>
            <div className="h-1.5 w-1 animate-bounce rounded-full" style={{ background: PINK_DARK }} />
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <div className="overflow-hidden py-3.5"
        style={{ background: `linear-gradient(90deg, ${PINK_DARK} 0%, #e891aa 50%, ${PINK_DARK} 100%)` }}>
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
          {[
            "Livraison gratuite partout au Maroc",
            "Nouvelle collection 2026",
            "Qualité premium garantie",
            "Paiement à la livraison",
            "Retours faciles sous 7 jours",
          ].flatMap((t, i) => [
            <span key={`t${i}`} className="mx-10 text-xs font-semibold uppercase tracking-[0.2em] text-white">{t}</span>,
            <span key={`d${i}`} className="text-white/50 self-center">✦</span>,
          ]).concat(
            ["Livraison gratuite partout au Maroc", "Nouvelle collection 2026", "Qualité premium garantie"].flatMap((t, i) => [
              <span key={`t2${i}`} className="mx-10 text-xs font-semibold uppercase tracking-[0.2em] text-white">{t}</span>,
              <span key={`d2${i}`} className="text-white/50 self-center">✦</span>,
            ])
          )}
        </div>
      </div>

      {/* ══ COLLECTIONS ══ */}
      <section id="collections" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <span
            className="mb-3 inline-block rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]"
            style={{ background: `${PINK}40`, color: PINK_DARK }}
          >
            Nos collections
          </span>
          <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "#1a1a1a" }}>
            Explorez le style
          </h2>
          <div className="mt-4 h-0.5 w-16 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${PINK_DARK}, transparent)` }} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              to="/collections/$category"
              params={{ category: c.slug }}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ minHeight: 200 }}
            >
              {c.image_url ? (
                <>
                  <img src={c.image_url} alt={c.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0"
                    style={{ background: i % 2 === 0 ? PINK_SOFT : "#fff0f6" }} />
                  <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, ${PINK_DARK}, #e891aa)` }} />
                  {/* Decorative circle */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30"
                    style={{ background: `radial-gradient(circle, ${PINK_DARK}, transparent)` }} />
                </>
              )}

              <div className="relative flex h-full flex-col justify-end p-5" style={{ minHeight: 200 }}>
                <h3 className="font-display text-lg font-semibold leading-tight"
                  style={{ color: c.image_url ? "white" : "#1a1a1a" }}>
                  {c.label}
                </h3>
                <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1"
                  style={{ color: c.image_url ? "white" : PINK_DARK }}>
                  Voir tout <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ══ */}
      <section style={{ background: `linear-gradient(180deg, ${PINK_SOFT} 0%, #fff8fa 100%)` }}>
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="mb-12 flex flex-col items-center text-center">
            <span
              className="mb-3 inline-block rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]"
              style={{ background: `${PINK}40`, color: PINK_DARK }}
            >
              Sélection du moment
            </span>
            <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "#1a1a1a" }}>
              Nouveautés 2026
            </h2>
            <div className="mt-4 h-0.5 w-16 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${PINK_DARK}, transparent)` }} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : (featured ?? []).length === 0
                ? (
                  <div className="col-span-full py-20 text-center">
                    <p className="font-display text-2xl" style={{ color: `${PINK_DARK}80` }}>
                      Collection bientôt disponible
                    </p>
                  </div>
                )
                : (featured ?? []).map((p) => <ProductCard key={p.id} p={p} />)
            }
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/collections/$category"
              params={{ category: CATEGORIES[0]?.slug ?? "tops" }}
              className="inline-flex items-center gap-2 rounded-full px-9 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                borderWidth: 2, borderStyle: "solid",
                borderColor: PINK_DARK, color: PINK_DARK,
                background: `${PINK}20`,
              }}
            >
              Voir toute la collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ WHY US ══ */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <div className="mb-12 flex flex-col items-center text-center">
          <span
            className="mb-3 inline-block rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]"
            style={{ background: `${PINK}40`, color: PINK_DARK }}
          >
            Pourquoi nous ?
          </span>
          <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "#1a1a1a" }}>
            L'élégance, promis
          </h2>
          <div className="mt-4 h-0.5 w-16 rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${PINK_DARK}, transparent)` }} />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { Icon: Truck,         title: "Livraison partout",    desc: "Toutes les villes du Maroc, directement chez vous en 48h." },
            { Icon: Star,          title: "Qualité premium",      desc: "Tissus doux, coupe parfaite, finitions soignées." },
            { Icon: MessageCircle, title: "Support rapide",       desc: "On vous répond sur WhatsApp rapidement." },
          ].map(({ Icon, title, desc }) => (
            <div key={title}
              className="group relative overflow-hidden rounded-3xl bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ boxShadow: `0 4px 24px ${PINK}35` }}
            >
              {/* bg accent */}
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 transition-opacity duration-300 group-hover:opacity-40"
                style={{ background: `radial-gradient(circle, ${PINK_DARK}, transparent)` }} />
              <div className="relative mb-5 grid h-13 w-13 place-items-center rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${PINK}60, ${PINK_MID})`, width: 52, height: 52 }}>
                <Icon className="h-5 w-5" style={{ color: PINK_DARK }} />
              </div>
              <h3 className="font-display text-lg" style={{ color: "#1a1a1a" }}>{title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ BANNER CTA ══ */}
      <section className="mx-5 mb-16 overflow-hidden rounded-3xl sm:mx-8"
        style={{ background: `linear-gradient(135deg, #e87fa0 0%, ${PINK_DARK} 40%, #f5b8cc 100%)` }}>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute right-1/3 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-white/5" />
        </div>
        <div className="relative flex flex-col items-center gap-6 px-8 py-16 text-center">
          <span className="rounded-full bg-white/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
            Collection 2026
          </span>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Votre style, notre passion
          </h2>
          <p className="max-w-xs text-sm text-white/80">
            Des pièces exclusives conçues pour la femme moderne et élégante.
          </p>
          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-white px-9 py-3.5 text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
            style={{ color: PINK_DARK }}
          >
            Commander maintenant
          </a>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
