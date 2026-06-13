import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, Pipette, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SIZES } from "@/lib/brand";
import { useCategories, FALLBACK_CATEGORIES } from "@/lib/categories";
import { uploadProductImage } from "@/lib/storage";
import { useAdminConfirm } from "@/lib/admin-confirm";
import type { Product, ColorOpt } from "@/components/site/ProductCard";

export function ProductForm({ initial }: { initial?: Product }) {
  const navigate = useNavigate();
  const confirmAction = useAdminConfirm();
  const { data: catsData } = useCategories({ includeInactive: true });
  const CATEGORIES = catsData && catsData.length > 0 ? catsData : FALLBACK_CATEGORIES;
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0].slug);
  const [price, setPrice] = useState<number>(Number(initial?.price ?? 0));
  const [stock, setStock] = useState<number>(initial?.stock ?? 0);
  const [colors, setColors] = useState<ColorOpt[]>((initial?.colors as unknown as ColorOpt[]) ?? []);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? []);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [isActive, setIsActive] = useState<boolean>(initial?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const cls = "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

  const COLOR_PRESETS: ColorOpt[] = [
    { hex: "#F9C6D0", label: "Rose" },
    { hex: "#D4A0A7", label: "Rose Gold" },
    { hex: "#FFFFFF", label: "Blanc" },
    { hex: "#000000", label: "Noir" },
    { hex: "#9CA3AF", label: "Gris" },
    { hex: "#B45309", label: "Camel" },
    { hex: "#1E3A8A", label: "Bleu marine" },
    { hex: "#15803D", label: "Vert" },
    { hex: "#DC2626", label: "Rouge" },
    { hex: "#FACC15", label: "Jaune" },
    { hex: "#7C3AED", label: "Violet" },
    { hex: "#FB923C", label: "Orange" },
  ];

  // Nuancier : lignes = teintes, colonnes = nuances (très clair → très foncé)
  const SHADE_PALETTE: { name: string; shades: string[] }[] = [
    { name: "Rose",   shades: ["#FFF1F4","#FCD9E0","#F9C6D0","#F0A8B6","#E07D90","#C75571","#9F3D55"] },
    { name: "Rouge",  shades: ["#FEE2E2","#FCA5A5","#F87171","#EF4444","#DC2626","#B91C1C","#7F1D1D"] },
    { name: "Orange", shades: ["#FFEDD5","#FED7AA","#FDBA74","#FB923C","#F97316","#EA580C","#9A3412"] },
    { name: "Jaune",  shades: ["#FEF9C3","#FEF08A","#FDE047","#FACC15","#EAB308","#CA8A04","#854D0E"] },
    { name: "Vert",   shades: ["#DCFCE7","#86EFAC","#4ADE80","#22C55E","#16A34A","#15803D","#14532D"] },
    { name: "Bleu",   shades: ["#DBEAFE","#93C5FD","#60A5FA","#3B82F6","#2563EB","#1E40AF","#1E3A8A"] },
    { name: "Violet", shades: ["#EDE9FE","#C4B5FD","#A78BFA","#8B5CF6","#7C3AED","#6D28D9","#4C1D95"] },
    { name: "Beige",  shades: ["#FAF7F2","#EFE4D2","#E2CFB1","#C9AE85","#B08D5B","#8A6A3D","#5C4527"] },
    { name: "Gris",   shades: ["#F3F4F6","#E5E7EB","#D1D5DB","#9CA3AF","#6B7280","#4B5563","#1F2937"] },
    { name: "Neutre", shades: ["#FFFFFF","#F5F5F4","#D6D3D1","#A8A29E","#57534E","#292524","#000000"] },
  ];

  const [showShades, setShowShades] = useState(false);
  const [customHex, setCustomHex] = useState("#F9C6D0");
  const [customLabel, setCustomLabel] = useState("");
  const [pickerImg, setPickerImg] = useState<string | null>(null);
  const pickerCanvasRef = useRef<HTMLCanvasElement>(null);

  const onPickerFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPickerImg(url);
  };

  const drawPickerImage = (img: HTMLImageElement) => {
    const canvas = pickerCanvasRef.current;
    if (!canvas) return;
    const maxW = 480;
    const scale = Math.min(1, maxW / img.naturalWidth);
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const pickFromImage = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = pickerCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    const hex = "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase();
    setCustomHex(hex);
    toast.success(`Couleur captée : ${hex}`);
  };


  const addColor = () => setColors([...colors, { hex: "#F9C6D0", label: "" }]);
  const addPreset = (p: ColorOpt) => {
    if (colors.some((c) => c.label.toLowerCase() === p.label.toLowerCase())) return;
    setColors([...colors, { ...p }]);
  };
  const addShade = (hex: string, baseName: string, shadeIdx: number) => {
    const label = `${baseName} ${shadeIdx + 1}`;
    if (colors.some((c) => c.hex.toLowerCase() === hex.toLowerCase())) return;
    setColors([...colors, { hex, label }]);
  };
  const addCustom = () => {
    const label = customLabel.trim();
    if (!label) return toast.error("Donnez un nom à la couleur personnalisée");
    if (colors.some((c) => c.label.toLowerCase() === label.toLowerCase())) return toast.error("Ce nom existe déjà");
    setColors([...colors, { hex: customHex, label }]);
    setCustomLabel("");
  };
  const updateColor = (i: number, patch: Partial<ColorOpt>) => setColors(colors.map((c, j) => j === i ? { ...c, ...patch } : c));
  const removeColor = (i: number) => setColors(colors.filter((_, j) => j !== i));
  const toggleSize = (s: string) => setSizes(sizes.includes(s) ? sizes.filter((x) => x !== s) : [...sizes, s]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadProductImage));
      setImages((prev) => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) ajoutée(s)`);
    } catch (e: any) {
      toast.error(e.message ?? "Échec upload");
    } finally { setUploading(false); }
  };

  const moveImg = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const arr = [...images];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setImages(arr);
  };

  const removeImg = (i: number) => setImages(images.filter((_, j) => j !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return toast.error("Nom et description requis");
    if (colors.some((c) => !c.label.trim())) return toast.error("Chaque couleur doit avoir un nom");
    const ok = await confirmAction({
      title: initial ? "Confirmer la modification" : "Confirmer la création",
      description: initial ? `Modifier "${name.trim()}" ?` : `Créer le produit "${name.trim()}" ?`,
    });
    if (!ok) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      price,
      stock,
      colors: colors as any,
      sizes,
      images,
      is_active: isActive,
    };
    const { error } = initial
      ? await supabase.from("products").update(payload).eq("id", initial.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(initial ? "Produit modifié" : "Produit créé");
    navigate({ to: "/admin/products" });
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{initial ? "Modifier le produit" : "Ajouter un produit"}</h1>
      </div>

      <div className="space-y-4 rounded-2xl bg-card p-6 ring-1 ring-border/60">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Nom du produit *</span>
          <input className={cls} required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Description *</span>
          <textarea rows={4} className={cls} required value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Catégorie</span>
            <select className={cls} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Prix (MAD) *</span>
            <input type="number" min={0} step={1} className={cls} required value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Stock *</span>
            <input type="number" min={0} step={1} className={cls} required value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          </label>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-card p-6 ring-1 ring-border/60">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Couleurs disponibles</h2>
          <button type="button" onClick={addColor} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs hover:bg-accent">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>
        <div>
          <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">Palette rapide — cliquez pour ajouter</p>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PRESETS.map((p) => {
              const used = colors.some((c) => c.label.toLowerCase() === p.label.toLowerCase());
              return (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => addPreset(p)}
                  disabled={used}
                  title={p.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${used ? "opacity-40" : "hover:bg-accent"}`}
                >
                  <span
                    className="block h-5 w-5 rounded-full ring-1 ring-border shadow-sm"
                    style={{ backgroundColor: p.hex }}
                  />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/60 p-3">
          <button
            type="button"
            onClick={() => setShowShades((s) => !s)}
            className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            {showShades ? "▾" : "▸"} Nuancier — choisir le degré exact d'une couleur
          </button>
          {showShades && (
            <div className="space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-1">
                  <thead>
                    <tr>
                      <th className="w-20 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Teinte</th>
                      {Array.from({ length: 7 }, (_, i) => (
                        <th key={i} className="text-center text-[10px] font-medium text-muted-foreground">{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SHADE_PALETTE.map((row) => (
                      <tr key={row.name}>
                        <td className="text-xs font-medium text-foreground/80">{row.name}</td>
                        {row.shades.map((hex, idx) => {
                          const used = colors.some((c) => c.hex.toLowerCase() === hex.toLowerCase());
                          return (
                            <td key={hex} className="text-center">
                              <button
                                type="button"
                                onClick={() => addShade(hex, row.name, idx)}
                                disabled={used}
                                title={`${row.name} ${idx + 1} — ${hex}`}
                                className={`h-8 w-8 rounded-full ring-1 ring-border shadow-sm transition hover:scale-110 ${used ? "opacity-30" : ""}`}
                                style={{ backgroundColor: hex }}
                              />

                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 space-y-3 border-t border-border pt-3">
                <div className="flex flex-wrap items-end gap-2">
                  <div>
                    <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Couleur personnalisée</p>
                    <div className="flex items-center gap-2">
                      <input type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-input" />
                      <span className="h-10 w-10 rounded-full ring-1 ring-border shadow-sm" style={{ backgroundColor: customHex }} />
                      <code className="rounded-md bg-secondary px-2 py-1 text-xs tabular-nums">{customHex.toUpperCase()}</code>
                    </div>
                  </div>
                  <input
                    placeholder="Nom (ex: Pêche pastel)"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className={`${cls} flex-1 min-w-[160px]`}
                  />
                  <button type="button" onClick={addCustom} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                    <Plus className="h-3.5 w-3.5" /> Ajouter
                  </button>
                </div>

                {/* Pipette : extraire couleur depuis une photo */}
                <div className="rounded-xl bg-secondary/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="inline-flex items-center gap-1.5 text-xs font-medium">
                      <Pipette className="h-3.5 w-3.5" /> Extraire une couleur depuis une image
                    </p>
                    <div className="flex gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-background px-3 py-1.5 text-xs ring-1 ring-border hover:bg-accent">
                        <ImageIcon className="h-3.5 w-3.5" /> Choisir une image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickerFile(e.target.files?.[0] ?? null)} />
                      </label>
                      {pickerImg && (
                        <button type="button" onClick={() => setPickerImg(null)} className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1.5 text-xs ring-1 ring-border hover:bg-accent">
                          <X className="h-3.5 w-3.5" /> Fermer
                        </button>
                      )}
                    </div>
                  </div>
                  {pickerImg ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-[11px] text-muted-foreground">Cliquez sur l'image pour récupérer le code couleur exact.</p>
                      <div className="overflow-hidden rounded-lg ring-1 ring-border">
                        <img
                          src={pickerImg}
                          alt=""
                          className="hidden"
                          crossOrigin="anonymous"
                          onLoad={(e) => drawPickerImage(e.currentTarget)}
                        />
                        <canvas
                          ref={pickerCanvasRef}
                          onClick={pickFromImage}
                          className="block max-h-[320px] w-full cursor-crosshair object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Importez une photo (tissu, inspiration…), cliquez dessus, le code couleur s'affichera automatiquement.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {colors.length === 0 && <p className="text-xs text-muted-foreground">Aucune couleur. Ajoutez-en au moins une.</p>}
        <div className="space-y-2">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-10 w-10 flex-none rounded-full ring-1 ring-border shadow-sm"
                style={{ backgroundColor: c.hex }}
              />
              <input type="color" value={c.hex} onChange={(e) => updateColor(i, { hex: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-input" />
              <input placeholder="Nom (ex: Rose)" value={c.label} onChange={(e) => updateColor(i, { label: e.target.value })} className={cls} />
              <button type="button" onClick={() => removeColor(i)} className="grid h-10 w-10 flex-none place-items-center rounded-lg text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-card p-6 ring-1 ring-border/60">
        <h2 className="font-display text-lg">Tailles disponibles</h2>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button key={s} type="button" onClick={() => toggleSize(s)} className={`h-10 min-w-10 rounded-full border px-4 text-sm font-medium transition ${sizes.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-input hover:bg-accent"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-card p-6 ring-1 ring-border/60">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Photos</h2>
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs hover:bg-accent">
            <Upload className="h-3.5 w-3.5" /> {uploading ? "Upload…" : "Ajouter"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          </label>
        </div>
        {images.length === 0 && <p className="text-xs text-muted-foreground">Aucune image. La première image est la principale.</p>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src, i) => (
            <div key={src} className="group relative overflow-hidden rounded-xl ring-1 ring-border">
              <img src={src} alt="" className="aspect-square w-full object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Principale</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-foreground/50 p-1 opacity-0 transition group-hover:opacity-100">
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveImg(i, -1)} className="grid h-7 w-7 place-items-center rounded-md bg-background/90"><ArrowUp className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => moveImg(i, 1)} className="grid h-7 w-7 place-items-center rounded-md bg-background/90"><ArrowDown className="h-3.5 w-3.5" /></button>
                </div>
                <button type="button" onClick={() => removeImg(i)} className="grid h-7 w-7 place-items-center rounded-md bg-destructive text-destructive-foreground"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-card p-6 ring-1 ring-border/60">
        <div>
          <p className="font-medium">Statut</p>
          <p className="text-xs text-muted-foreground">{isActive ? "Visible sur la boutique" : "Masqué"}</p>
        </div>
        <button type="button" onClick={() => setIsActive(!isActive)} className={`relative h-7 w-12 rounded-full transition ${isActive ? "bg-primary" : "bg-muted"}`}>
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-background shadow transition ${isActive ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => navigate({ to: "/admin/products" })} className="rounded-full border border-input px-5 py-2.5 text-sm hover:bg-accent">Annuler</button>
        <button type="submit" disabled={saving} className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
