import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  slug: string;
  label: string;
  emoji: string | null;
  sort_order: number;
  is_active: boolean;
  image_url: string | null;
};

export const FALLBACK_CATEGORIES: Category[] = [
  { id: "f1", slug: "top-basic", label: "Top Basic", emoji: null, sort_order: 10, is_active: true, image_url: null },
  { id: "f2", slug: "top-tendance", label: "Top Tendance", emoji: null, sort_order: 20, is_active: true, image_url: null },
  { id: "f3", slug: "top-summer", label: "Top Summer", emoji: null, sort_order: 30, is_active: true, image_url: null },
  { id: "f4", slug: "robes", label: "Robes", emoji: null, sort_order: 40, is_active: true, image_url: null },
];

export function useCategories(opts?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: ["categories", opts?.includeInactive ? "all" : "active"],
    queryFn: async (): Promise<Category[]> => {
      let q = supabase.from("categories").select("*").order("sort_order");
      if (!opts?.includeInactive) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Category[];
    },
    staleTime: 60_000,
  });
}

export function categoryLabelFrom(cats: Category[] | undefined, slug: string): string {
  return cats?.find((c) => c.slug === slug)?.label ?? slug;
}
