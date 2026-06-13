import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CartDrawer } from "@/components/site/CartDrawer";
import { WhatsAppFloating } from "@/components/site/WhatsAppFloating";
import { BackToTop } from "@/components/site/BackToTop";
import { ProductCard, ProductCardSkeleton, type Product } from "@/components/site/ProductCard";
import { useCategories, categoryLabelFrom, FALLBACK_CATEGORIES } from "@/lib/categories";

const GOLD = "#C9A96E";
const PINK = "#F9C6D0";

export const Route = createFileRoute("/collections/$category")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.category} — Fashion Lova Bety` },
      { name: "description", content: `Découvrez notre collection en polyamide premium.` },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const { data: cats } = useCategories();
  const CATEGORIES = cats && cats.length > 0 ? cats : FALLBACK_CATEGORIES;
  const label = categoryLabelFrom(cats, category);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  const { data, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(
    () => (data ?? []).filter((p) => Number(p.price) <= maxPrice),
    [data, maxPrice]
  );

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <CartDrawer />
      <WhatsAppFloating />
      <BackToTop />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Page title */}
        <h1 className="font-display text-4xl sm:text-5xl" style={{ color: "#2C2C2A" }}>
          {label}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {filtered.length} produit{filtered.length > 1 ? "s" : ""}
        </p>

        {/* Category tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const active = c.slug === category;
            return (
              <Link
                key={c.slug}
                to="/collections/$category"
                params={{ category: c.slug }}
                className="shrink-0 rounded-full border px-5 py-2 text-sm font-medium transition"
                style={{
                  background: active ? GOLD : "white",
                  color: active ? "white" : "#6B7280",
                  borderColor: active ? GOLD : PINK,
                }}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Price filter only */}
        <div
          className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl p-4"
          style={{ background: "#FFF8F5", border: `1px solid ${PINK}` }}
        >
          <div className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-xs">
            <label className="font-medium text-gray-600">
              Prix max : <span style={{ color: GOLD }}>{maxPrice} DH</span>
            </label>
            <input
              type="range"
              min={50}
              max={1000}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: GOLD }}
            />
          </div>

          {maxPrice < 1000 && (
            <button
              onClick={() => setMaxPrice(1000)}
              className="rounded-full border px-4 py-2 text-xs text-gray-500 transition hover:bg-gray-50"
              style={{ borderColor: PINK }}
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Product grid */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : filtered.length === 0
              ? (
                <div className="col-span-full py-20 text-center">
                  <div
                    className="mx-auto grid h-20 w-20 place-items-center rounded-full text-3xl"
                    style={{ background: PINK }}
                  >
                    ✦
                  </div>
                  <p className="mt-4 text-sm text-gray-400">Aucun produit pour ces critères.</p>
                </div>
              )
              : filtered.map((p) => <ProductCard key={p.id} p={p} />)
          }
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
