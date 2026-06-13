import { createAPIFileRoute } from "@tanstack/react-start/api";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Resolves Telegram chat ID: env var first, then getUpdates auto-detect
async function getTelegramChatId(token: string): Promise<string | null> {
  const envId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (envId) return envId;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getUpdates?limit=1&offset=-1`
    );
    const json = (await res.json()) as {
      result?: Array<{ message?: { chat?: { id?: number } } }>;
    };
    return json?.result?.[0]?.message?.chat?.id?.toString() ?? null;
  } catch {
    return null;
  }
}

export const APIRoute = createAPIFileRoute("/api/public/orders")({
  POST: async ({ request }) => {
    try {
      const body = await request.json();

      // Save order to database
      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .insert({
          full_name: body.full_name,
          phone: body.phone,
          city: body.city,
          address: body.address || null,
          contact_method: body.contact_method ?? "whatsapp",
          promo_code: body.promo_code || null,
          discount_amount: body.discount_amount ?? 0,
          subtotal: body.subtotal,
          total_price: body.total_price,
          items: body.items ?? [],
        })
        .select()
        .single();

      if (error) throw error;

      // Increment promo code uses if one was applied
      if (body.promo_code) {
        await supabaseAdmin.rpc("increment_promo_uses", {
          promo_code_value: body.promo_code,
        });
      }

      // Send Telegram notification (server-side — token never exposed to browser)
      const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();
      if (TG_TOKEN) {
        try {
          const chatId = await getTelegramChatId(TG_TOKEN);
          if (chatId) {
            const now = new Date().toLocaleString("fr-MA", {
              timeZone: "Africa/Casablanca",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const productsList = (body.items ?? [])
              .map(
                (it: { name: string; size: string; color: string; quantity: number; price: number }) =>
                  `  ${it.name} | ${it.color} | ${it.size} | x${it.quantity} | ${it.price} DH`
              )
              .join("\n");

            const discountLine =
              (body.discount_amount ?? 0) > 0
                ? `Remise: -${body.discount_amount} DH\n`
                : "";

            const tgMessage = [
              "Nouvelle Commande - Fashion Lova Bety",
              "─────────────────────",
              `Nom: ${body.full_name}`,
              `Tel: ${body.phone}`,
              `Ville: ${body.city}`,
              `Adresse: ${body.address || "Non precisee"}`,
              `Contact: ${body.contact_method === "whatsapp" ? "WhatsApp" : "Appel"}`,
              `Code promo: ${body.promo_code || "Aucun"}`,
              "─────────────────────",
              "Articles:",
              productsList,
              "─────────────────────",
              `Sous-total: ${body.subtotal} DH`,
              discountLine.trim(),
              `Total: ${body.total_price} DH`,
              `Date: ${now}`,
            ]
              .filter((l) => l !== "")
              .join("\n");

            await fetch(
              `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: tgMessage }),
              }
            );
          }
        } catch (tgErr) {
          // Don't fail the order if Telegram notification fails
          console.warn("Telegram notification failed:", tgErr);
        }
      }

      return new Response(JSON.stringify({ ok: true, orderId: order?.id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Order submission error:", err);
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
});
