import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type ColorOpt = { hex: string; label: string };

const GOLD = "#C9A96E";

export function ProductCard({ p, hasPromo }: { p: Product; hasPromo?: boolean }) {
  const colors = (p.colors as unknown as ColorOpt[]) ?? [];
  const img = p.images?.[0];
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-[#F0E8DF] transition duration-300 hover:shadow-xl hover:ring-[#C9A96E]/40"
    >
      {/* Promo badge */}
      {hasPromo && (
        <span
          className="absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
          style={{ background: GOLD }}
        >
          Promo
        </span>
      )}

      {/* Image — 1:1 ratio */}
      <div className="relative aspect-square overflow-hidden bg-[#FFF8F5]">
        {img ? (
          <img
            src={img}
            alt={p.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-gray-300">
            Pas d'image
          </div>
        )}
        {/* Hover overlay button */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div
            className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white"
            style={{ background: GOLD }}
          >
            <ShoppingBag className="h-4 w-4" />
            Ajouter au panier
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display line-clamp-2 text-sm leading-snug" style={{ color: "#2C2C2A" }}>
          {p.name}
        </h3>
        <div className="flex items-center gap-1.5">
          {colors.slice(0, 5).map((c, i) => (
            <span
              key={i}
              title={c.label}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-[#e0d0c0] shadow-sm"
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        <div className="mt-auto pt-2">
          <span className="font-display text-lg" style={{ color: GOLD }}>
            {p.price} DH
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#F0E8DF]">
      <div className="aspect-square animate-pulse bg-[#FFF0EC]" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#FFF0EC]" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-[#FFF0EC]" />
      </div>
    </div>
  );
}
