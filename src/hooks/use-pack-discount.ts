import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/lib/cart-context";
import type { Tables } from "@/integrations/supabase/types";

type ProductPack = Tables<"product_packs">;

interface PackDiscount {
  pack: ProductPack | null;
  discount: number;
}

export function usePackDiscount(items: CartItem[], subtotal: number): PackDiscount {
  const { data: packs } = useQuery({
    queryKey: ["active-packs"],
    queryFn: async (): Promise<ProductPack[]> => {
      const { data, error } = await supabase
        .from("product_packs")
        .select("*")
        .eq("is_active", true);
      if (error) return []; // table may not exist yet
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return useMemo((): PackDiscount => {
    if (!packs || packs.length === 0 || items.length === 0) {
      return { pack: null, discount: 0 };
    }

    let bestPack: ProductPack | null = null;
    let bestDiscount = 0;

    for (const pack of packs) {
      const ids = pack.product_ids as string[] | null;

      const eligibleItems =
        ids && ids.length > 0
          ? items.filter((it) => ids.includes(it.productId))
          : items;

      const totalQty = eligibleItems.reduce((s, it) => s + it.quantity, 0);
      if (totalQty < pack.min_items) continue;

      const discount =
        pack.discount_type === "percentage"
          ? Math.round((subtotal * pack.discount_value) / 100)
          : pack.discount_value;

      if (discount > bestDiscount) {
        bestDiscount = discount;
        bestPack = pack;
      }
    }

    return { pack: bestPack, discount: bestDiscount };
  }, [packs, items, subtotal]);
}
