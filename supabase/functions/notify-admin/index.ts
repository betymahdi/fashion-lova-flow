import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface OrderPayload {
  full_name: string;
  phone: string;
  city: string;
  address?: string;
  contact_method: string;
  promo_code?: string;
  discount_amount: number;
  subtotal: number;
  total_price: number;
  items: OrderItem[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error("Missing Telegram credentials");
    }

    const order: OrderPayload = await req.json();

    const now = new Date().toLocaleString("fr-MA", {
      timeZone: "Africa/Casablanca",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const productsList = order.items
      .map((it) => `  • ${it.name} — ${it.size} — x${it.quantity} — ${it.price} DH`)
      .join("\n");

    const contactLabel = order.contact_method === "whatsapp" ? "WhatsApp" : "Appel";
    const promoLabel = order.promo_code || "Aucun";

    const message = [
      "🛍️ Nouvelle Commande — Fashion Lova Bety",
      "",
      `👤 Nom: ${order.full_name}`,
      `📞 Téléphone: ${order.phone}`,
      `🏙️ Ville: ${order.city}`,
      `📍 Adresse: ${order.address || "Non précisée"}`,
      `📲 Contact préféré: ${contactLabel}`,
      `🎁 Code promo utilisé: ${promoLabel}`,
      "",
      "🛒 Produits:",
      productsList,
      "",
      `💰 Sous-total: ${order.subtotal} DH`,
      `🏷️ Remise: -${order.discount_amount} DH`,
      `💰 Total: ${order.total_price} DH`,
      `📅 Date: ${now}`,
    ].join("\n");

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Telegram API error: ${errBody}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-admin error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
