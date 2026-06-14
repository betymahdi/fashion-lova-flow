import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, Minus, Plus, Check, Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CartDrawer } from "@/components/site/CartDrawer";
import { WhatsAppFloating } from "@/components/site/WhatsAppFloating";
import { SIZES } from "@/lib/brand";
import { useCategories, categoryLabelFrom } from "@/lib/categories";
import { useCart } from "@/lib/cart-context";
import { usePackDiscount } from "@/hooks/use-pack-discount";
import type { ColorOpt, Product } from "@/components/site/ProductCard";

const GOLD = "#C9A96E";
const PINK = "#F9C6D0";

export const Route = createFileRoute("/product/$id")({
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.name
          ? `${loaderData.name} — Fashion Lova Bety`
          : "Produit — Fashion Lova Bety",
      },
      {
        name: "description",
        content: loaderData?.description
          ? `${loaderData.description.slice(0, 150)} — Livraison partout au Maroc.`
          : "Vêtement féminin tendance — Livraison partout au Maroc, paiement à la livraison.",
      },
    ],
  }),
  loader: async ({ params }): Promise<{ name: string; description: string | null } | null> => {
    const { data } = await supabase
      .from("products")
      .select("name, description")
      .eq("id", params.id)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) return null;
    return { name: (data as any).name ?? "", description: (data as any).description ?? null };
  },
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { add, open, items } = useCart();
  const { data: cats } = useCategories();

  const { data: p, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products").select("*").eq("id", id).eq("is_active", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const colors  = useMemo<ColorOpt[]>(() => (p?.colors as unknown as ColorOpt[]) ?? [], [p]);
  const sizes   = useMemo(() => p?.sizes ?? [], [p]);
  const images  = useMemo(() => p?.images ?? [], [p]);

  const [imgIdx, setImgIdx] = useState(0);
  const [color,  setColor]  = useState<ColorOpt | null>(null);
  const [size,   setSize]   = useState<string>("");
  const [qty,    setQty]    = useState(1);

  // Pack discount preview: simulate cart with this item added
  const simulatedItems = useMemo(() => {
    if (!p) return items;
    const newItem = { id: `${p.id}|preview`, productId: p.id, name: p.name, image: "", price: Number(p.price), color: "", size: "", quantity: qty };
    return [...items, newItem];
  }, [items, p, qty]);
  const simulatedSubtotal = simulatedItems.reduce((s, it) => s + it.quantity * it.price, 0);
  const { pack: previewPack, discount: previewDiscount } = usePackDiscount(simulatedItems, simulatedSubtotal);

  // Packs applicables à ce produit (pour affichage offre même si panier vide)
  const { data: applicablePacks } = useQuery({
    queryKey: ["applicable-packs", id],
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_packs")
        .select("*")
        .eq("is_active", true);
      if (error || !data) return [];
      return data.filter((pack) => {
        const ids = pack.product_ids as string[] | null;
        return !ids || ids.length === 0 || ids.includes(id);
      });
    },
  });

  if (!isLoading && !p) throw notFound();
  if (error) throw error;

  const stock      = p?.stock ?? 0;
  const stockLabel = stock <= 0 ? "Rupture de stock" : stock <= 3 ? "Stock limité" : "En stock";
  const stockDot   = stock <= 0 ? "#ef4444" : stock <= 3 ? "#f59e0b" : "#10b981";

  const handleAdd = () => {
    if (!p) return;
    if (!color) return toast.error("Choisissez une couleur");
    if (!size)  return toast.error("Choisissez une taille");
    if (stock <= 0) return toast.error("Produit en rupture");
    add({ productId: p.id, name: p.name, image: images[0] ?? "", price: Number(p.price), color: color.label, size, quantity: qty });
    toast.success("Ajouté au panier ✨");
    open();
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <CartDrawer />
      <WhatsAppFloating />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
        {/* Breadcrumb */}
        {p && (
          <Link
            to="/collections/$category"
            params={{ category: p.category }}
            className="mb-8 inline-flex items-center gap-1.5 text-sm transition"
            style={{ color: GOLD }}
          >
            <ChevronLeft className="h-4 w-4" />
            {categoryLabelFrom(cats, p.category)}
          </Link>
        )}

        {isLoading || !p ? (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl" style={{ background: PINK + "40" }} />
            <div className="space-y-4">
              {[3, 2, 4, 2].map((w, i) => (
                <div key={i} className="h-6 animate-pulse rounded-xl" style={{ width: `${w * 25}%`, background: PINK + "40" }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
            {/* ── Gallery ── */}
            <div className="flex flex-col gap-3">
              <div
                className="aspect-square overflow-hidden rounded-3xl"
                style={{ background: `linear-gradient(135deg, ${PINK}30, #fff8f5)` }}
              >
                {images[imgIdx] ? (
                  <img
                    src={images[imgIdx]}
                    alt={p.name}
                    className="h-full w-full object-cover transition duration-500"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-6xl opacity-20">✦</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className="h-20 w-20 flex-none overflow-hidden rounded-2xl ring-2 transition"
                      style={{ outline: i === imgIdx ? `2px solid ${GOLD}` : "2px solid transparent", opacity: i === imgIdx ? 1 : 0.6 }}
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="flex flex-col gap-6">
              {/* Name + stock */}
              <div>
                <h1 className="font-display text-3xl leading-tight sm:text-4xl" style={{ color: "#1a1a1a" }}>
                  {p.name}
                </h1>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: stockDot }} />
                  <span className="text-sm font-medium" style={{ color: stockDot }}>{stockLabel}</span>
                </div>
              </div>

              {/* Price */}
              <p className="font-display text-4xl font-bold" style={{ color: GOLD }}>
                {p.price} DH
              </p>

              {/* Description */}
              {p.description && (
                <p className="text-sm leading-relaxed text-gray-500 whitespace-pre-line">
                  {p.description}
                </p>
              )}

              {/* Offres packs applicables à ce produit */}
              {applicablePacks && applicablePacks.length > 0 && (
                <div className="flex flex-col gap-2">
                  {applicablePacks.map((pack) => {
                    const isActive = previewPack?.id === pack.id && previewDiscount > 0;
                    const discountLabel =
                      pack.discount_type === "percentage"
                        ? `-${pack.discount_value}%`
                        : `-${pack.discount_value} DH`;
                    return (
                      <div
                        key={pack.id}
                        className="flex items-start gap-3 rounded-2xl p-4 text-sm"
                        style={{
                          background: isActive ? `${GOLD}20` : `${GOLD}0D`,
                          border: `1px solid ${isActive ? GOLD : GOLD + "50"}`,
                        }}
                      >
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
                        <div>
                          <span className="font-semibold" style={{ color: GOLD }}>
                            {pack.name} — {discountLabel}
                          </span>
                          <p className="mt-0.5 text-gray-500">
                            {isActive
                              ? <><strong style={{ color: GOLD }}>Réduction activée !</strong> Votre panier bénéficie déjà de cette offre.</>
                              : `Achetez ${pack.min_items} article${pack.min_items > 1 ? "s" : ""} ou plus et économisez ${discountLabel} automatiquement.`
                            }
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Colors */}
              {colors.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Couleur : <span style={{ color: GOLD }}>{color?.label ?? "choisir"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c) => {
                      const selected = color?.label === c.label;
                      return (
                        <button
                          key={c.label}
                          onClick={() => setColor(c)}
                          title={c.label}
                          className="grid h-11 w-11 place-items-center rounded-full ring-offset-2 transition"
                          style={{
                            backgroundColor: c.hex,
                            boxShadow: selected ? `0 0 0 3px white, 0 0 0 5px ${GOLD}` : "none",
                          }}
                        >
                          {selected && <Check className="h-5 w-5 text-white mix-blend-difference" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Taille : <span style={{ color: GOLD }}>{size || "choisir"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.filter((s) => sizes.includes(s)).map((s) => {
                      const selected = size === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className="h-11 min-w-11 rounded-full border px-4 text-sm font-semibold transition"
                          style={{
                            background: selected ? GOLD : "white",
                            color: selected ? "white" : "#4B5563",
                            borderColor: selected ? GOLD : "#E5E7EB",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <p className="mb-3 text-sm font-semibold text-gray-700">Quantité</p>
                <div className="inline-flex items-center overflow-hidden rounded-full border" style={{ borderColor: "#E5E7EB" }}>
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="grid h-11 w-11 place-items-center transition hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold tabular-nums">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="grid h-11 w-11 place-items-center transition hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleAdd}
                disabled={stock <= 0}
                className="w-full rounded-full py-4 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: stock <= 0 ? "#D1D5DB" : `linear-gradient(135deg, ${GOLD}, #b8924a)`,
                  boxShadow: stock <= 0 ? "none" : `0 8px 24px ${GOLD}44`,
                }}
              >
                {stock <= 0 ? "Rupture de stock" : "Ajouter au panier"}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 border-t pt-4 text-xs text-gray-400" style={{ borderColor: PINK }}>
                <span>🚚 Livraison Maroc</span>
                <span>💳 Paiement livraison</span>
                <span>✨ Qualité garantie</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
