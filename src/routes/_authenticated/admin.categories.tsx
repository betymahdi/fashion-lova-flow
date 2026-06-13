import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Upload, Image } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminConfirm } from "@/lib/admin-confirm";
import type { Category } from "@/lib/categories";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesAdmin,
});

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const BUCKET = "category-images";

const cls =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CategoriesAdmin() {
  const qc = useQueryClient();
  const confirmAction = useAdminConfirm();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    qc.invalidateQueries({ queryKey: ["categories", "active"] });
    qc.invalidateQueries({ queryKey: ["categories", "all"] });
  };

  const remove = async (c: Category) => {
    const ok = await confirmAction({
      title: "Supprimer la catégorie",
      description: `Supprimer « ${c.label} » ? Les produits liés ne seront plus visibles dans cette catégorie.`,
      variant: "danger",
    });
    if (!ok) return;
    if (c.image_url) {
      const path = c.image_url.split(`${BUCKET}/`)[1];
      if (path) await supabase.storage.from(BUCKET).remove([path]);
    }
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Catégorie supprimée");
    refresh();
  };

  const toggleActive = async (c: Category) => {
    const ok = await confirmAction({
      title: c.is_active ? "Masquer la catégorie" : "Activer la catégorie",
      description: `« ${c.label} »`,
    });
    if (!ok) return;
    const { error } = await supabase.from("categories").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success(c.is_active ? "Catégorie masquée" : "Catégorie activée");
    refresh();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Catégories</h1>
          <p className="text-sm text-muted-foreground">
            {(data ?? []).length} catégorie{(data ?? []).length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nouvelle catégorie
        </button>
      </div>

      {(creating || editing) && (
        <CategoryForm
          initial={editing ?? undefined}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); }}
        />
      )}

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Aperçu</th>
                <th className="p-3">Nom</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Ordre</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Chargement…</td></tr>
              ) : (data ?? []).length === 0 ? (
                <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">Aucune catégorie.</td></tr>
              ) : (data ?? []).map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="p-3">
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt={c.label}
                        className="h-12 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                        <Image className="h-5 w-5" />
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-medium">{c.label}</td>
                  <td className="p-3 text-muted-foreground">{c.slug}</td>
                  <td className="p-3 tabular-nums">{c.sort_order}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                      {c.is_active ? "Active" : "Masquée"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => toggleActive(c)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent" title={c.is_active ? "Masquer" : "Activer"}>
                        {c.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => { setEditing(c); setCreating(false); }} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent" title="Modifier">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(c)} className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10" title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CategoryForm({ initial, onClose, onSaved }: { initial?: Category; onClose: () => void; onSaved: () => void }) {
  const confirmAction = useAdminConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  const [label, setLabel] = useState(initial?.label ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 100);
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [saving, setSaving] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image_url ?? null);
  const [uploading, setUploading] = useState(false);

  const onLabel = (v: string) => {
    setLabel(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!label.trim() || !slug.trim()) return toast.error("Nom et slug requis");
    const ok = await confirmAction({
      title: initial ? "Confirmer la modification" : "Confirmer la création",
      description: initial ? `Modifier « ${label.trim()} » ?` : `Créer la catégorie « ${label.trim()} » ?`,
    });
    if (!ok) return;
    setSaving(true);

    let finalImageUrl = imageUrl;

    // Upload new image if selected
    if (imageFile) {
      setUploading(true);
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const path = `${slug.trim()}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, imageFile, { upsert: true });
      setUploading(false);
      if (upErr) {
        setSaving(false);
        return toast.error("Erreur upload image : " + upErr.message);
      }
      finalImageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
    }

    const payload = {
      label: label.trim(),
      slug: slug.trim(),
      emoji: null,
      sort_order: sortOrder,
      is_active: isActive,
      image_url: finalImageUrl,
    };

    const { error } = initial
      ? await supabase.from("categories").update(payload).eq("id", initial.id)
      : await supabase.from("categories").insert(payload);

    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Catégorie modifiée" : "Catégorie créée");
    onSaved();
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-card p-6 ring-1 ring-border/60">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg">{initial ? "Modifier la catégorie" : "Nouvelle catégorie"}</h2>
        <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent"><X className="h-4 w-4" /></button>
      </div>

      {/* Image wallpaper upload */}
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Photo de couverture (wallpaper)</span>
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Aperçu"
              className="h-40 w-full rounded-xl object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 transition hover:bg-secondary/60"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cliquer pour choisir une photo (JPG, PNG, WEBP — max 5 Mo)</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onFileChange}
        />
        {!imagePreview && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="self-start text-xs underline text-muted-foreground"
          >
            {imageUrl ? "Changer la photo" : "Ou coller une URL →"}
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Nom *</span>
          <input className={cls} required value={label} onChange={(e) => onLabel(e.target.value)} placeholder="ex: Robes d'été" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Slug (URL) *</span>
          <input className={cls} required value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} placeholder="ex: robes-ete" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Ordre d'affichage</span>
          <input type="number" className={cls} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <button type="button" onClick={() => setIsActive(!isActive)} className={`relative h-7 w-12 rounded-full transition ${isActive ? "bg-primary" : "bg-muted"}`}>
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition ${isActive ? "left-[22px]" : "left-0.5"}`} />
        </button>
        <span>{isActive ? "Visible sur la boutique" : "Masquée"}</span>
      </label>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-full border border-input px-5 py-2.5 text-sm hover:bg-accent">Annuler</button>
        <button type="submit" disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          <Check className="h-4 w-4" /> {uploading ? "Upload…" : saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
