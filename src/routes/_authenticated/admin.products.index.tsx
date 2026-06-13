import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, categoryLabelFrom, FALLBACK_CATEGORIES } from "@/lib/categories";
import { useAdminConfirm } from "@/lib/admin-confirm";
import type { ColorOpt, Product } from "@/components/site/ProductCard";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  component: ProductsList,
});

function ProductsList() {
  const qc = useQueryClient();
  const confirmAction = useAdminConfirm();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const { data: catsData } = useCategories({ includeInactive: true });
  const CATEGORIES = catsData && catsData.length > 0 ? catsData : FALLBACK_CATEGORIES;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((p) =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!cat || p.category === cat)
  );

  const toggleActive = async (p: Product) => {
    const ok = await confirmAction({
      title: p.is_active ? "Masquer le produit" : "Activer le produit",
      description: `« ${p.name} »`,
    });
    if (!ok) return;
    const { error } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(p.is_active ? "Produit masqué" : "Produit activé");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  const remove = async (p: Product) => {
    const ok = await confirmAction({
      title: "Supprimer le produit",
      description: `Cette action est irréversible. Supprimer « ${p.name} » ?`,
      variant: "danger",
    });
    if (!ok) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Produit supprimé");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Produits</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} produit{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <Link to="/admin/products/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Ajouter un produit
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/60">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit…" className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ring" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Photo</th><th className="p-3">Nom</th><th className="p-3">Catégorie</th>
                <th className="p-3">Prix</th><th className="p-3">Stock</th><th className="p-3">Couleurs</th>
                <th className="p-3">Statut</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Chargement…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">Aucun produit. <Link to="/admin/products/new" className="text-foreground underline">En ajouter un</Link></td></tr>
              ) : filtered.map((p) => {
                const colors = (p.colors as unknown as ColorOpt[]) ?? [];
                return (
                  <tr key={p.id} className="border-t border-border/60">
                    <td className="p-3">{p.images?.[0] ? <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-muted" />}</td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{categoryLabelFrom(catsData, p.category)}</td>
                    <td className="p-3 tabular-nums">{p.price} MAD</td>
                    <td className="p-3 tabular-nums">{p.stock}</td>
                    <td className="p-3">
                      <div className="flex gap-1">{colors.slice(0, 4).map((c, i) => <span key={i} className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} />)}</div>
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{p.is_active ? "Actif" : "Masqué"}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => toggleActive(p)} title={p.is_active ? "Masquer" : "Activer"} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent">
                          {p.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <Link to="/admin/products/$id/edit" params={{ id: p.id }} title="Modifier" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => remove(p)} title="Supprimer" className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
