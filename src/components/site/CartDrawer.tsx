import { useState } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { usePackDiscount } from "@/hooks/use-pack-discount";
import { CheckoutModal } from "./CheckoutModal";

const GOLD = "#C9A96E";

export function CartDrawer() {
  const { items, isOpen, close, updateQty, remove, total } = useCart();
  const [checkout, setCheckout] = useState(false);
  const { pack, discount } = usePackDiscount(items, total);

  const finalTotal = total - discount;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={close}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Panier"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-xl">Votre panier ({items.length})</h2>
          <button onClick={close} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-primary/30">
                <ShoppingBag className="h-9 w-9 text-foreground/70" />
              </div>
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 rounded-2xl border border-border/60 bg-card p-3">
                  <img src={it.image} alt={it.name} className="h-20 w-20 flex-none rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium leading-snug">{it.name}</h3>
                      <button onClick={() => remove(it.id)} aria-label="Retirer" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{it.color} · Taille {it.size}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button onClick={() => updateQty(it.id, it.quantity - 1)} aria-label="-" className="grid h-7 w-7 place-items-center">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">{it.quantity}</span>
                        <button onClick={() => updateQty(it.id, it.quantity + 1)} aria-label="+" className="grid h-7 w-7 place-items-center">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold">{it.price * it.quantity} DH</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-card px-5 py-4">
            {/* Pack discount banner */}
            {pack && discount > 0 && (
              <div
                className="mb-3 flex items-center gap-2 rounded-xl p-3 text-xs"
                style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}30` }}
              >
                <Tag className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
                <span style={{ color: GOLD }}>
                  <strong>{pack.name}</strong> — réduction de{" "}
                  <strong>-{discount} DH</strong> appliquée
                </span>
              </div>
            )}

            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Sous-total</span>
              <span className="text-sm">{total} DH</span>
            </div>

            {discount > 0 && (
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-sm" style={{ color: GOLD }}>Réduction pack</span>
                <span className="text-sm font-semibold" style={{ color: GOLD }}>-{discount} DH</span>
              </div>
            )}

            <div className="mb-4 mt-2 flex items-baseline justify-between border-t pt-2" style={{ borderColor: "#f0f0f0" }}>
              <span className="text-sm text-muted-foreground">TOTAL</span>
              <span className="font-display text-2xl">{finalTotal} DH</span>
            </div>

            <button
              onClick={() => setCheckout(true)}
              className="w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #b8924a)`, boxShadow: `0 6px 20px ${GOLD}44` }}
            >
              Confirmer ma commande
            </button>
          </div>
        )}
      </aside>

      <CheckoutModal open={checkout} onClose={() => setCheckout(false)} />
    </>
  );
}
