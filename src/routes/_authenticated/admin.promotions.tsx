import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminConfirm } from "@/lib/admin-confirm";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/promotions")({
  component: PromotionsPage,
});

type PromoCode = Tables<"promo_codes">;
type ProductPack = Tables<"product_packs">;
type Product = Tables<"products">;

const cls =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30";

const SQL_URL = "https://supabase.com/dashboard/project/aurysfkhblddcuoqnunr/sql/new";

function TableMissingBanner() {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div>
        <p className="font-semibold text-amber-800">Tables non créées dans Supabase</p>
        <p className="mt-1 text-amber-700">
          Les tables <code className="rounded bg-amber-100 px-1">promo_codes</code> et{" "}
          <code className="rounded bg-amber-100 px-1">product_packs</code> n'existent pas encore.
        </p>
        <a
          href={SQL_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
        >
          Ouvrir Supabase SQL Editor →
        </a>
        <p className="mt-2 text-xs text-amber-600">
          Colle le contenu du fichier{" "}
          <code className="rounded bg-amber-100 px-1">supabase/migrations/20260613000003_fix_tables_product_ids.sql</code>
          {" "}et exécute-le.
        </p>
      </div>
    </div>
  );
}

function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {active ? "Actif" : "Inactif"}
    </span>
  );
}

function PromotionsPage() {
  const [tab, setTab] = useState<"codes" | "packs">("codes");

  return (
    <div>
      <h1 className="font-display text-3xl">Promotions</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gérez les codes promo et les packs articles.
      </p>

      <div className="mt-6 flex gap-2 border-b border-border">
        {(["codes", "packs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium transition ${
              tab === t
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "codes" ? "Codes Promo" : "Packs Articles"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "codes" ? <PromoCodesTab /> : <PacksTab />}
      </div>
    </div>
  );
}

// ─── PROMO CODES ──────────────────────────────────────────────────────────────

function PromoCodesTab() {
  const qc = useQueryClient();
  const confirmAction = useAdminConfirm();
  const [form, setForm] = useState<Partial<PromoCode> | null>(null);

  const { data, isLoading, error: promoError } = useQuery({
    queryKey: ["admin", "promo-codes"],
    queryFn: async (): Promise<PromoCode[]> => {
      const { data, error } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    retry: false,
  });

  const savePromo = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form) return;
    const payload = {
      code: (form.code ?? "").toUpperCase(),
      discount_type: form.discount_type ?? "percentage",
      discount_value: Number(form.discount_value ?? 0),
      min_purchase_amount: form.min_purchase_amount ? Number(form.min_purchase_amount) : null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active ?? true,
      expires_at: form.expires_at || null,
    };
    const { error } = form.id
      ? await supabase.from("promo_codes").update(payload).eq("id", form.id)
      : await supabase.from("promo_codes").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Code mis à jour" : "Code créé");
    setForm(null);
    qc.invalidateQueries({ queryKey: ["admin", "promo-codes"] });
  };

  const deletePromo = async (row: PromoCode) => {
    const ok = await confirmAction({ title: "Supprimer ce code promo ?", description: row.code, variant: "danger" });
    if (!ok) return;
    const { error } = await supabase.from("promo_codes").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Code supprimé");
    qc.invalidateQueries({ queryKey: ["admin", "promo-codes"] });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setForm({ discount_type: "percentage", is_active: true })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Créer un code promo
        </button>
      </div>

      {promoError && <TableMissingBanner />}

      {form !== null && (
        <PromoCodeForm initial={form} onClose={() => setForm(null)} onSubmit={savePromo} onChange={setForm} />
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Valeur</th>
              <th className="px-4 py-3">Utilisations</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Expiration</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : (data ?? []).length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Aucun code promo</td></tr>
            ) : (
              (data ?? []).map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-semibold">{row.code}</td>
                  <td className="px-4 py-3">{row.discount_type === "percentage" ? "Pourcentage" : "Fixe"}</td>
                  <td className="px-4 py-3">{row.discount_type === "percentage" ? `${row.discount_value}%` : `${row.discount_value} DH`}</td>
                  <td className="px-4 py-3">{row.current_uses}{row.max_uses !== null ? ` / ${row.max_uses}` : ""}</td>
                  <td className="px-4 py-3"><Badge active={row.is_active} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {row.expires_at ? new Date(row.expires_at).toLocaleDateString("fr-MA") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setForm(row)} className="rounded-lg p-1.5 hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => deletePromo(row)} className="rounded-lg p-1.5 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PromoCodeForm({ initial, onClose, onSubmit, onChange }: {
  initial: Partial<PromoCode>; onClose: () => void;
  onSubmit: (e: { preventDefault(): void }) => void; onChange: (v: Partial<PromoCode>) => void;
}) {
  const f = initial;
  const set = (patch: Partial<PromoCode>) => onChange({ ...f, ...patch });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
        <h2 className="font-display text-xl">{f.id ? "Modifier" : "Créer"} un code promo</h2>
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Code</span>
            <input required className={cls} value={f.code ?? ""} onChange={(e) => set({ code: e.target.value.toUpperCase() })} placeholder="Ex: BIENVENUE10" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Type de remise</span>
              <select className={cls} value={f.discount_type ?? "percentage"} onChange={(e) => set({ discount_type: e.target.value })}>
                <option value="percentage">Pourcentage</option>
                <option value="fixed">Montant fixe</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Valeur</span>
              <input required type="number" min={0} className={cls} value={f.discount_value ?? ""} onChange={(e) => set({ discount_value: Number(e.target.value) })} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Montant min. (opt.)</span>
              <input type="number" min={0} className={cls} value={f.min_purchase_amount ?? ""} onChange={(e) => set({ min_purchase_amount: e.target.value ? Number(e.target.value) : null })} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Utilisations max (opt.)</span>
              <input type="number" min={1} className={cls} value={f.max_uses ?? ""} onChange={(e) => set({ max_uses: e.target.value ? Number(e.target.value) : null })} />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Expiration (opt.)</span>
            <input type="datetime-local" className={cls} value={f.expires_at ? f.expires_at.slice(0, 16) : ""} onChange={(e) => set({ expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={f.is_active ?? true} onChange={(e) => set({ is_active: e.target.checked })} className="rounded" />
            Actif
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-input py-2.5 text-sm hover:bg-muted">Annuler</button>
            <button type="submit" className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
              {f.id ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── PACKS ────────────────────────────────────────────────────────────────────

function PacksTab() {
  const qc = useQueryClient();
  const confirmAction = useAdminConfirm();
  const [form, setForm] = useState<Partial<ProductPack> | null>(null);

  const { data: products } = useQuery({
    queryKey: ["admin", "all-products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase.from("products").select("id,name,price,category,images").eq("is_active", true).order("name");
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  });

  const { data, isLoading, error: packsError } = useQuery({
    queryKey: ["admin", "product-packs"],
    queryFn: async (): Promise<ProductPack[]> => {
      const { data, error } = await supabase.from("product_packs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    retry: false,
  });

  const savePack = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form) return;
    const payload = {
      name: form.name ?? "",
      description: form.description || null,
      min_items: Number(form.min_items ?? 2),
      discount_type: form.discount_type ?? "percentage",
      discount_value: Number(form.discount_value ?? 0),
      applicable_categories: form.applicable_categories ?? null,
      product_ids: form.product_ids ?? null,
      is_active: form.is_active ?? true,
    };
    const { error } = form.id
      ? await supabase.from("product_packs").update(payload).eq("id", form.id)
      : await supabase.from("product_packs").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Pack mis à jour" : "Pack créé");
    setForm(null);
    qc.invalidateQueries({ queryKey: ["admin", "product-packs"] });
    qc.invalidateQueries({ queryKey: ["active-packs"] });
  };

  const deletePack = async (row: ProductPack) => {
    const ok = await confirmAction({ title: "Supprimer ce pack ?", description: row.name, variant: "danger" });
    if (!ok) return;
    const { error } = await supabase.from("product_packs").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Pack supprimé");
    qc.invalidateQueries({ queryKey: ["admin", "product-packs"] });
    qc.invalidateQueries({ queryKey: ["active-packs"] });
  };

  const packSummary = (row: ProductPack) => {
    const ids = row.product_ids as string[] | null;
    if (ids && ids.length > 0) return `${ids.length} article(s) spécifique(s)`;
    const cats = row.applicable_categories as string[] | null;
    if (cats && cats.length > 0) return cats.join(", ");
    return "Tous les articles";
  };

  return (
    <div>
      {packsError && <TableMissingBanner />}

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setForm({ discount_type: "percentage", is_active: true, min_items: 2 })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Créer un pack
        </button>
      </div>

      {form !== null && (
        <PackForm
          initial={form}
          products={products ?? []}
          onClose={() => setForm(null)}
          onSubmit={savePack}
          onChange={setForm}
        />
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Min articles</th>
              <th className="px-4 py-3">Remise</th>
              <th className="px-4 py-3">Applicabilité</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Chargement…</td></tr>
            ) : (data ?? []).length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Aucun pack créé</td></tr>
            ) : (
              (data ?? []).map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.min_items} articles</td>
                  <td className="px-4 py-3">
                    {row.discount_type === "percentage" ? `${row.discount_value}%` : row.discount_type === "fixed_price" ? `Prix fixe ${row.discount_value} DH` : `-${row.discount_value} DH`}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{packSummary(row)}</td>
                  <td className="px-4 py-3"><Badge active={row.is_active} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setForm(row)} className="rounded-lg p-1.5 hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => deletePack(row)} className="rounded-lg p-1.5 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PackForm({ initial, products, onClose, onSubmit, onChange }: {
  initial: Partial<ProductPack>; products: Product[];
  onClose: () => void; onSubmit: (e: { preventDefault(): void }) => void;
  onChange: (v: Partial<ProductPack>) => void;
}) {
  const f = initial;
  const set = (patch: Partial<ProductPack>) => onChange({ ...f, ...patch });

  const [mode, setMode] = useState<"all" | "products">(
    (f.product_ids as string[] | null)?.length ? "products" : "all"
  );

  const selectedIds = (f.product_ids as string[] | null) ?? [];

  const toggleProduct = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((s) => s !== id)
      : [...selectedIds, id];
    set({ product_ids: next.length > 0 ? next : null });
  };

  const handleModeChange = (m: "all" | "products") => {
    setMode(m);
    if (m === "all") set({ product_ids: null, applicable_categories: null });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl bg-background shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-border bg-background px-6 py-4">
          <h2 className="font-display text-xl">{f.id ? "Modifier" : "Créer"} un pack</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto px-6 py-4">
          {/* Name + description */}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Nom du pack</span>
            <input required className={cls} value={f.name ?? ""} onChange={(e) => set({ name: e.target.value })} placeholder="Ex: Pack 2 articles -20%" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Description (opt.)</span>
            <input className={cls} value={f.description ?? ""} onChange={(e) => set({ description: e.target.value })} />
          </label>

          {/* Discount settings */}
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Min articles</span>
              <input required type="number" min={1} className={cls} value={f.min_items ?? 2} onChange={(e) => set({ min_items: Number(e.target.value) })} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Type remise</span>
              <select className={cls} value={f.discount_type ?? "percentage"} onChange={(e) => set({ discount_type: e.target.value })}>
                <option value="percentage">% remise</option>
                <option value="fixed">- Montant fixe DH</option>
                <option value="fixed_price">Prix total fixe DH</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">
                {f.discount_type === "fixed_price" ? "Prix total (DH)" : f.discount_type === "percentage" ? "Pourcentage (%)" : "Montant remise (DH)"}
              </span>
              <input required type="number" min={0} className={cls} value={f.discount_value ?? ""} onChange={(e) => set({ discount_value: Number(e.target.value) })} />
            </label>
          </div>

          {/* Applicability mode */}
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Appliquer à</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleModeChange("all")}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  mode === "all" ? "border-primary bg-primary/20 text-foreground" : "border-input text-muted-foreground hover:bg-accent"
                }`}
              >
                Tous les articles
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("products")}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  mode === "products" ? "border-primary bg-primary/20 text-foreground" : "border-input text-muted-foreground hover:bg-accent"
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                Articles spécifiques
              </button>
            </div>
          </div>

          {/* Product picker */}
          {mode === "products" && (
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Choisir les articles</span>
                {selectedIds.length > 0 && (
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-foreground">
                    {selectedIds.length} sélectionné(s)
                  </span>
                )}
              </div>
              {products.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucun article disponible</p>
              ) : (
                <div className="max-h-60 overflow-y-auto rounded-2xl border border-border">
                  {products.map((p) => {
                    const selected = selectedIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleProduct(p.id)}
                        className={`flex w-full items-center gap-3 border-b border-border/50 px-3 py-2.5 text-left text-xs transition last:border-0 hover:bg-muted/40 ${
                          selected ? "bg-primary/10" : ""
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="h-10 w-10 flex-none overflow-hidden rounded-lg bg-muted">
                          {(p.images as string[])?.[0] ? (
                            <img src={(p.images as string[])[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">✦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="text-muted-foreground">{p.price} DH · {p.category}</p>
                        </div>
                        <div className={`grid h-5 w-5 flex-none place-items-center rounded-full border-2 transition ${
                          selected ? "border-primary bg-primary" : "border-border"
                        }`}>
                          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={f.is_active ?? true} onChange={(e) => set({ is_active: e.target.checked })} className="rounded" />
            Actif
          </label>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-input py-2.5 text-sm hover:bg-muted">Annuler</button>
            <button type="submit" className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
              {f.id ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
