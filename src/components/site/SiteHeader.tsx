import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { BRAND } from "@/lib/brand";
import { useCategories, FALLBACK_CATEGORIES } from "@/lib/categories";
import { useCart } from "@/lib/cart-context";
import { useLang } from "@/lib/language-context";

const GOLD = "#C9A96E";
const LANGS = ["FR", "AR", "EN"] as const;

export function SiteHeader() {
  const { count, open } = useCart();
  const { lang, setLang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: cats } = useCategories();
  const CATEGORIES = cats && cats.length > 0 ? cats : FALLBACK_CATEGORIES;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const NavLink = ({ to, label, params }: { to: string; label: string; params?: Record<string, string> }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        params={params}
        onClick={() => setMobileOpen(false)}
        className="relative pb-0.5 text-sm transition"
        style={{ color: active ? GOLD : "#4A4A4A" }}
      >
        {label}
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: GOLD }} />
        )}
      </Link>
    );
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white transition-shadow duration-300"
      style={{ boxShadow: scrolled ? "0 2px 16px -4px rgba(201,169,110,0.18)" : "0 1px 0 #f0e8df" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* LEFT — Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src={BRAND.logo}
            alt={BRAND.name}
            loading="eager"
            decoding="async"
            className="h-14 w-14 rounded-xl border-2 bg-white object-contain p-1 shadow-sm"
            style={{ borderColor: GOLD }}
          />
          <span className="hidden font-display text-base leading-none sm:block" style={{ color: "#2C2C2A" }}>
            BLova
          </span>
        </Link>

        {/* CENTER — Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" label={lang === "AR" ? "الرئيسية" : lang === "EN" ? "Home" : "Accueil"} />
          {CATEGORIES.map((c) => (
            <NavLink key={c.slug} to="/collections/$category" params={{ category: c.slug }} label={c.label} />
          ))}
          <NavLink to="/contact" label={lang === "AR" ? "تواصل معنا" : lang === "EN" ? "Contact" : "Contact"} />
        </nav>

        {/* RIGHT — Actions */}
        <div className="flex items-center gap-2">
          <button aria-label="Rechercher" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#F9C6D0]/40">
            <Search className="h-4 w-4" style={{ color: "#4A4A4A" }} />
          </button>

          <button
            onClick={open}
            aria-label="Ouvrir le panier"
            className="relative grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#F9C6D0]/40"
          >
            <ShoppingBag className="h-4 w-4" style={{ color: "#4A4A4A" }} />
            {count > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-0.5 text-[10px] font-bold text-white"
                style={{ background: GOLD }}
              >
                {count}
              </span>
            )}
          </button>

          {/* Language switcher */}
          <div className="hidden items-center gap-0.5 md:flex">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="rounded px-2 py-1 text-xs transition"
                style={{ color: lang === l ? GOLD : "#9CA3AF", fontWeight: lang === l ? 700 : 400 }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#F9C6D0]/40 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" style={{ color: GOLD }} /> : <Menu className="h-5 w-5" style={{ color: "#4A4A4A" }} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="border-t bg-white px-4 py-4 md:hidden" style={{ borderColor: "#F9C6D0" }}>
          <div className="flex flex-col gap-1">
            {[
              { to: "/", label: lang === "AR" ? "الرئيسية" : lang === "EN" ? "Home" : "Accueil" },
              ...CATEGORIES.map((c) => ({ to: `/collections/${c.slug}`, label: c.label })),
              { to: "/contact", label: lang === "AR" ? "تواصل معنا" : lang === "EN" ? "Contact" : "Contact" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm transition"
                style={{ color: pathname === to ? GOLD : "#4A4A4A", background: pathname === to ? "#FFF5EE" : "transparent" }}
              >
                {label}
              </Link>
            ))}
          </div>
          {/* Mobile language switcher */}
          <div className="mt-3 flex gap-1 border-t pt-3" style={{ borderColor: "#F9C6D0" }}>
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="rounded px-3 py-1.5 text-xs font-medium transition"
                style={{ background: lang === l ? `${GOLD}20` : "transparent", color: lang === l ? GOLD : "#9CA3AF" }}
              >
                {l}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
