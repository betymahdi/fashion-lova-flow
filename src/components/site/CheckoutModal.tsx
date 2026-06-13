import { useState } from "react";
import { X, CheckCircle, Tag } from "lucide-react";
import { toast } from "sonner";
import { MOROCCAN_CITIES } from "@/lib/brand";
import { useCart } from "@/lib/cart-context";
import { usePackDiscount } from "@/hooks/use-pack-discount";
import { useLang, type Lang } from "@/lib/language-context";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/lib/cart-context";

const GOLD = "#C9A96E";
const PINK = "#F9C6D0";
const WA_NUMBER = "212781188202";

interface PromoResult { code: string; discount: number; label: string; }

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  FR: {
    greeting: "Bonjour Fashion Lova Bety,",
    newOrder: "Nouvelle commande :",
    color: "Couleur", size: "Taille", qty: "Quantite", unitPrice: "Prix unitaire",
    subtotal: "Sous-total", packApplied: "Pack applique", promoCode: "Code promo",
    total: "TOTAL",
    clientInfo: "Informations client :",
    name: "Nom", phone: "Telephone", city: "Ville", address: "Adresse",
    delivery: "Livraison a domicile partout au Maroc.",
    payment: "Paiement a la livraison (cash).",
    confirm: "Merci de confirmer la disponibilite.",
  },
  AR: {
    greeting: "مرحبا Fashion Lova Bety،",
    newOrder: "طلب جديد :",
    color: "اللون", size: "المقاس", qty: "الكمية", unitPrice: "السعر",
    subtotal: "المجموع الفرعي", packApplied: "باك مطبق", promoCode: "كود ترويجي",
    total: "الاجمالي",
    clientInfo: "معلومات العميل :",
    name: "الاسم", phone: "الهاتف", city: "المدينة", address: "العنوان",
    delivery: "التوصيل للمنزل في جميع انحاء المغرب.",
    payment: "الدفع عند الاستلام.",
    confirm: "شكرا على تاكيد التوفر.",
  },
  EN: {
    greeting: "Hello Fashion Lova Bety,",
    newOrder: "New order:",
    color: "Color", size: "Size", qty: "Quantity", unitPrice: "Unit price",
    subtotal: "Subtotal", packApplied: "Pack applied", promoCode: "Promo code",
    total: "TOTAL",
    clientInfo: "Customer info:",
    name: "Name", phone: "Phone", city: "City", address: "Address",
    delivery: "Home delivery anywhere in Morocco.",
    payment: "Cash on delivery.",
    confirm: "Please confirm availability.",
  },
} satisfies Record<Lang, Record<string, string>>;

// ── Build WhatsApp message (no emojis) ────────────────────────────────────────
function buildWAMessage(
  lang: Lang,
  items: CartItem[],
  info: { fullName: string; phone: string; city: string; address: string },
  subtotal: number,
  packName: string | null,
  packDiscount: number,
  promo: PromoResult | null,
  finalTotal: number
): string {
  const t = T[lang];
  const lines: string[] = [];
  lines.push(t.greeting, "", t.newOrder, "");
  items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name}`);
    lines.push(`   - ${t.color}: ${it.color}`);
    lines.push(`   - ${t.size}: ${it.size}`);
    lines.push(`   - ${t.qty}: ${it.quantity}`);
    lines.push(`   - ${t.unitPrice}: ${it.price} DH`);
    lines.push("");
  });
  lines.push(`${t.subtotal}: ${subtotal} DH`);
  if (packName && packDiscount > 0) lines.push(`${t.packApplied} (${packName}): -${packDiscount} DH`);
  if (promo && promo.discount > 0) lines.push(`${t.promoCode} (${promo.code}): -${promo.discount} DH`);
  lines.push(`${t.total}: ${finalTotal} DH`, "");
  lines.push(t.clientInfo);
  lines.push(`   - ${t.name}: ${info.fullName}`);
  lines.push(`   - ${t.phone}: ${info.phone}`);
  lines.push(`   - ${t.city}: ${info.city}`);
  if (info.address.trim()) lines.push(`   - ${t.address}: ${info.address}`);
  lines.push("", t.delivery, t.payment, "", t.confirm);
  return lines.join("\n");
}

// ── Component ─────────────────────────────────────────────────────────────────
export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, clear, close } = useCart();
  const { lang } = useLang();
  const subtotal = items.reduce((s, it) => s + it.quantity * it.price, 0);
  const { pack: appliedPack, discount: packDiscount } = usePackDiscount(items, subtotal);

  const [info, setInfo] = useState({ fullName: "", phone: "", city: "", address: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactMethod, setContactMethod] = useState<"whatsapp" | "call">("whatsapp");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const totalAfterPack = Math.max(0, subtotal - packDiscount);
  const promoDiscount = promo?.discount ?? 0;
  const finalTotal = Math.max(0, totalAfterPack - promoDiscount);
  const totalDiscount = packDiscount + promoDiscount;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!info.fullName.trim()) e.fullName = "Requis";
    if (!/^0[67]\d{8}$/.test(info.phone.replace(/\s/g, ""))) e.phone = "Format: 06xxxxxxxx ou 07xxxxxxxx";
    if (!info.city) e.city = "Requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoError("");
    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .from("promo_codes").select("*").eq("code", code).eq("is_active", true).single();
      if (error) {
        const isTableMissing = error.message?.includes("schema cache") || error.message?.includes("does not exist");
        setPromoError(isTableMissing ? "Service promo indisponible" : "Code promo invalide ou expiré");
        setPromo(null);
        return;
      }
      if (!data) { setPromoError("Code promo invalide ou expiré"); setPromo(null); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { setPromoError("Code promo invalide ou expiré"); setPromo(null); return; }
      if (data.max_uses !== null && data.current_uses >= data.max_uses) { setPromoError("Code promo invalide ou expiré"); setPromo(null); return; }
      if (data.min_purchase_amount !== null && totalAfterPack < data.min_purchase_amount) {
        setPromoError(`Montant minimum d'achat : ${data.min_purchase_amount} DH`); setPromo(null); return;
      }
      const discount = data.discount_type === "percentage"
        ? Math.round((totalAfterPack * data.discount_value) / 100)
        : data.discount_value;
      const label = data.discount_type === "percentage" ? `-${data.discount_value}%` : `-${data.discount_value} DH`;
      setPromo({ code, discount, label });
    } catch {
      setPromoError("Service promo indisponible");
      setPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const submit = async (method: "whatsapp" | "call") => {
    if (!validate()) return;
    setContactMethod(method);
    setSubmitting(true);

    // Create WA anchor SYNCHRONOUSLY before any await — bypasses popup blocker
    let waAnchor: HTMLAnchorElement | null = null;
    if (method === "whatsapp") {
      const msg = buildWAMessage(lang, items, info, subtotal, appliedPack?.name ?? null, packDiscount, promo, finalTotal);
      waAnchor = document.createElement("a");
      waAnchor.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
      waAnchor.target = "_blank";
      waAnchor.rel = "noopener noreferrer";
      document.body.appendChild(waAnchor);
    }

    const orderPayload = {
      full_name: info.fullName.trim(),
      phone: info.phone.replace(/\s/g, ""),
      city: info.city,
      address: info.address.trim() || null,
      contact_method: method,
      promo_code: promo?.code || null,
      discount_amount: totalDiscount,
      subtotal,
      total_price: finalTotal,
      items: items.map((it) => ({
        name: it.name, size: it.size, color: it.color,
        quantity: it.quantity, price: it.price,
      })),
    };

    try {
      // 1. Save order to DB
      await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      // 2. Telegram via Edge Function (secrets guaranteed server-side)
      supabase.functions.invoke("notify-admin", { body: orderPayload }).catch(() => {});

      if (waAnchor) waAnchor.click();
      clear();
      setSuccess(true);
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      if (waAnchor) document.body.removeChild(waAnchor);
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setInfo({ fullName: "", phone: "", city: "", address: "" });
    setPromo(null);
    setPromoInput("");
    setErrors({});
    close();
    onClose();
  };

  const cls = "w-full rounded-xl border border-[#e8d5c4] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button
          onClick={handleClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full transition hover:bg-[#F9C6D0]/40"
        >
          <X className="h-5 w-5" style={{ color: GOLD }} />
        </button>

        {success ? (
          <div className="flex flex-col items-center px-8 py-14 text-center">
            <div className="mb-6 grid h-20 w-20 place-items-center rounded-full" style={{ background: PINK }}>
              <CheckCircle className="h-10 w-10" style={{ color: GOLD }} />
            </div>
            <h2 className="font-display text-2xl" style={{ color: "#2C2C2A" }}>Commande reçue !</h2>
            <p className="mt-3 text-sm text-gray-500">Nous vous contacterons très bientôt.</p>
            <button
              onClick={handleClose}
              className="mt-8 rounded-full px-8 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: GOLD }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="px-6 pt-8 pb-6">
            <div className="mb-1 flex items-center gap-2">
              <div className="h-px flex-1" style={{ background: GOLD, opacity: 0.3 }} />
              <span className="text-xs font-medium tracking-widest uppercase" style={{ color: GOLD }}>Validation</span>
              <div className="h-px flex-1" style={{ background: GOLD, opacity: 0.3 }} />
            </div>
            <h2 className="mt-3 text-center font-display text-2xl" style={{ color: "#2C2C2A" }}>Vos informations</h2>
            <p className="mb-6 mt-1 text-center text-xs text-gray-400">
              Livraison partout au Maroc · Paiement à la livraison
            </p>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-gray-700">Nom complet</span>
                <input className={cls} placeholder="Prénom et nom" value={info.fullName}
                  onChange={(e) => setInfo({ ...info, fullName: e.target.value })} />
                {errors.fullName && <span className="text-xs text-red-500">{errors.fullName}</span>}
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-gray-700">Téléphone</span>
                <input className={cls} placeholder="06 ou 07 …" value={info.phone}
                  onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
                {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-gray-700">Ville</span>
                <select className={cls} value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })}>
                  <option value="">Choisir une ville…</option>
                  {MOROCCAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.city && <span className="text-xs text-red-500">{errors.city}</span>}
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-gray-700">
                  Adresse <span className="font-normal text-gray-400">(optionnel)</span>
                </span>
                <textarea rows={2} className={cls} placeholder="Quartier, rue, numéro…"
                  value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} />
              </label>

              {/* Promo code */}
              <div className="flex flex-col gap-1.5 text-sm">
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <Tag className="h-3.5 w-3.5" style={{ color: GOLD }} />
                  Code promo <span className="font-normal text-gray-400">(optionnel)</span>
                </span>
                <div className="flex gap-2">
                  <input className={cls} placeholder="Ex: BIENVENUE10"
                    value={promoInput} onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromo(null); setPromoError(""); }}
                    disabled={!!promo} />
                  {promo ? (
                    <button type="button" onClick={() => { setPromo(null); setPromoInput(""); }}
                      className="shrink-0 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-50">
                      Retirer
                    </button>
                  ) : (
                    <button type="button" onClick={applyPromo} disabled={promoLoading || !promoInput.trim()}
                      className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                      style={{ background: GOLD }}>
                      {promoLoading ? "…" : "Appliquer"}
                    </button>
                  )}
                </div>
                {promoError && <span className="text-xs text-red-500">{promoError}</span>}
                {promo && <span className="text-xs font-medium" style={{ color: GOLD }}>Code appliqué : {promo.label}</span>}
              </div>

              {/* Order summary */}
              <div className="mt-1 rounded-2xl p-4 text-sm" style={{ background: "#FFF8F5", border: `1px solid ${PINK}` }}>
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span><span>{subtotal} DH</span>
                </div>
                {appliedPack && packDiscount > 0 && (
                  <div className="mt-1.5 flex justify-between" style={{ color: GOLD }}>
                    <span>Pack : {appliedPack.name}</span><span>-{packDiscount} DH</span>
                  </div>
                )}
                {promo && promoDiscount > 0 && (
                  <div className="mt-1.5 flex justify-between" style={{ color: GOLD }}>
                    <span>Code : {promo.code}</span><span>-{promoDiscount} DH</span>
                  </div>
                )}
                <div className="mt-3 flex items-baseline justify-between border-t pt-3" style={{ borderColor: PINK }}>
                  <span className="font-semibold text-gray-800">Total</span>
                  <span className="font-display text-xl" style={{ color: GOLD }}>{finalTotal} DH</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-1 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => submit("whatsapp")} disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "#25D366" }}>
                  {submitting && contactMethod === "whatsapp" ? "Envoi…" : "Confirmer via WhatsApp"}
                </button>
                <button type="button" onClick={() => submit("call")} disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: GOLD }}>
                  {submitting && contactMethod === "call" ? "Envoi…" : "Confirmer par Appel"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
