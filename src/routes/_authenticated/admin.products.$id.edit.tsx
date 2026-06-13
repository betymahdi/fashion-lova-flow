import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/components/site/ProductCard";

export const Route = createFileRoute("/_authenticated/admin/products/$id/edit")({
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  if (isLoading) return <p className="text-center text-muted-foreground">Chargement…</p>;
  if (!data) return <p className="text-center text-muted-foreground">Produit introuvable</p>;
  return <ProductForm initial={data} />;
}
