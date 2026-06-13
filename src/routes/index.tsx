import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, Star, MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { useCategories, FALLBACK_CATEGORIES } from "@/lib/categories";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CartDrawer } from "@/components/site/CartDrawer";
import { WhatsAppFloating } from "@/components/site/WhatsAppFloating";
import { ProductCard, ProductCardSkeleton, type Product } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";

const PINK = "#F9C6D0";
const PINK_DARK = "#F0A8BB";
const PINK_SOFT = "#FFF0F4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fashion Lova Bety — Vêtements féminins élégants" },
      { name: "description", content: "Mode féminine élégante — Livraison partout au Maroc." },
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
        style={{ background: `linear-gradient(160deg, ${PINK_SOFT} 0%, #fff 55%, #fff5f8 100%)` }}
      >
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 left-0 h-[520px] w-[520px] rounded-full"
            style={{ background: `radial-gradient(circle, ${PINK}60 0%, transparent 70%)`, filter: "blur(80px)" }}
          />
          <div
            className="absolute -bottom-24 right-0 h-[400px] w-[400px] rounded-full"
            style={{ background: `radial-gradient(circle, ${PINK}40 0%, transparent 70%)`, filter: "blur(60px)" }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Badge */}
          <span
            className="rounded-full px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ background: `${PINK}50`, color: PINK_DARK }}
          >
            Nouvelle collection 2025
          </span>

          {/* Title */}
          <h1 className="font-display leading-[1.05] tracking-tight" style={{ fontSize: "clamp(3rem,9vw,6.5rem)", color: "#1a1a1a" }}>
            <span style={{ color: PINK_DARK }}>Fashion</span>
            <br />
            <span style={{ color: "#1a1a1a" }}>Lova Bety</span>
          </h1>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${PINK_DARK})` }} />
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: PINK_DARK }} />
            <div className="h-px w-20" style={{ background: `linear-gradient(to left, transparent, ${PINK_DARK})` }} />
          </div>

          <p className="max-w-xs text-base leading-relaxed" style={{ color: "#888" }}>
            Mode féminine élégante.<br />Livraison partout au Maroc.
          </p>

          {/* CTAs */}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <a
              href="#collections"
              className="rounded-full px-8 py-3.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${PINK_DARK}, #e891aa)`,
                boxShadow: `0 8px 28px ${PINK_DARK}55`,
              }}
            >
              Découvrir
            </a>
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border px-8 py-3.5 text-sm font-semibold transition-all hover:scale-105"
              style={{ borderColor: PINK_DARK, color: PINK_DARK, background: "white" }}
            >
              Commander via WhatsApp
            </a>
          </div>

          {/* Floating stats */}
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex h-9 w-5 items-start justify-center rounded-full border-2 pt-1.5" style={{ borderColor: PINK_DARK }}>
            <div className="h-1.5 w-1 animate-bounce rounded-full" style={{ background: PINK_DARK }} />
          </div>
        </div>
      </section>

      {/* ══ MARQUEE STRIP ══ */}
      <div className="overflow-hidden py-4" style={{ background: `linear-gradient(90deg, ${PINK_DARK}, #e891aa, ${PINK_DARK})` }}>
        <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="mx-10 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Livraison gratuite partout au Maroc &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ══ COLLECTIONS ══ */}
      <section id="collections" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mb-14 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: PINK_DARK }}>
            Nos collections
          </p>
          <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "#1a1a1a" }}>
            Explorez le style
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              to="/collections/$category"
              params={{ category: c.slug }}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ minHeight: 180 }}
            >
              {/* Wallpaper background */}
              {c.image_url ? (
                <>
                  <img
                    src={c.image_url}
                    alt={c.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Dark overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </>
              ) : (
                <>
                  <div
                    className="absolute inset-0"
                    style={{ background: i % 2 === 0 ? PINK_SOFT : "#fff0f6" }}
                  />
                  {/* Pink border top (no-image fallback) */}
                  <div
                    className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, ${PINK_DARK}, #e891aa)` }}
                  />
                </>
              )}

              <div className="relative flex h-full flex-col justify-end p-5" style={{ minHeight: 180 }}>
                <h3
                  className="font-display text-lg font-semibold leading-tight"
                  style={{ color: c.image_url ? "white" : "#1a1a1a" }}
                >
                  {c.label}
                </h3>
                <p
                  className="mt-1.5 flex items-center gap-1 text-xs font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ color: c.image_url ? "white" : PINK_DARK }}
                >
                  Voir tout <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ FEATURED PRODUCTS ══ */}
      <section style={{ background: PINK_SOFT }}>
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: PINK_DARK }}>
              Sélection du moment
            </p>
            <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "#1a1a1a" }}>
              Nouveautés
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : (featured ?? []).length === 0
                ? (
                  <div className="col-span-full py-20 text-center">
                    <p className="font-display text-2xl" style={{ color: `${PINK_DARK}80` }}>Collection bientôt disponible</p>
                  </div>
                )
                : (featured ?? []).map((p) => <ProductCard key={p.id} p={p} />)
            }
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/collections/$category"
              params={{ category: CATEGORIES[0]?.slug ?? "tops" }}
              className="inline-flex items-center gap-2 rounded-full border px-9 py-3.5 text-sm font-semibold transition hover:scale-105"
              style={{ borderColor: PINK_DARK, color: PINK_DARK }}
            >
              Voir toute la collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ WHY US ══ */}
      <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8">
        <div className="mb-14 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: PINK_DARK }}>
            Pourquoi nous ?
          </p>
          <h2 className="font-display text-4xl sm:text-5xl" style={{ color: "#1a1a1a" }}>
            L'élégance, promis
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            { Icon: Truck,         title: "Livraison partout",    desc: "Toutes les villes du Maroc, directement chez vous en 48h." },
            { Icon: Star,          title: "Qualité premium",      desc: "Tissus doux, coupe parfaite, finitions soignées." },
            { Icon: MessageCircle, title: "Support rapide",       desc: "On vous répond sur WhatsApp rapidement." },
          ].map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-3xl bg-white p-8 transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: `0 4px 30px ${PINK}40` }}
            >
              <div
                className="mb-5 grid h-12 w-12 place-items-center rounded-2xl"
                style={{ background: `${PINK}50` }}
              >
                <Icon className="h-5 w-5" style={{ color: PINK_DARK }} />
              </div>
              <h3 className="font-display text-lg" style={{ color: "#1a1a1a" }}>{title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ BANNER CTA ══ */}
      <section
        className="mx-5 mb-16 overflow-hidden rounded-3xl sm:mx-8"
        style={{ background: `linear-gradient(135deg, ${PINK_DARK}, #e891aa, #f5b8cc)` }}
      >
        <div className="flex flex-col items-center gap-6 px-8 py-16 text-center">
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
            className="rounded-full bg-white px-9 py-3.5 text-sm font-bold transition hover:scale-105 hover:shadow-xl"
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
