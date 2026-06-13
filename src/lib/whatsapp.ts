import { BRAND } from "./brand";
import type { CartItem } from "./cart-context";

const NUM_EMOJIS = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  address: string;
}

export function buildOrderMessage(items: CartItem[], info: CustomerInfo, total: number) {
  const lines: string[] = [];
  lines.push("Bonjour Fashion Lova Bety 👋", "", "🛍️ Nouvelle commande :", "");
  items.forEach((it, i) => {
    const e = NUM_EMOJIS[i] ?? `${i + 1}.`;
    lines.push(`${e} ${it.name}`);
    lines.push(`   • Couleur: ${it.color}`);
    lines.push(`   • Taille: ${it.size}`);
    lines.push(`   • Quantité: ${it.quantity}`);
    lines.push(`   • Prix unitaire: ${it.price} MAD`);
    lines.push("");
  });
  lines.push(`💰 TOTAL: ${total} MAD`, "");
  lines.push("👤 Informations client :");
  lines.push(`   • Nom: ${info.firstName} ${info.lastName}`);
  lines.push(`   • Téléphone: ${info.phone}`);
  lines.push(`   • Ville: ${info.city}`);
  lines.push(`   • Adresse: ${info.address}`);
  lines.push("");
  lines.push("🚚 Livraison à domicile partout au Maroc");
  lines.push("💳 Paiement à la livraison (cash)", "");
  lines.push("Merci de confirmer la disponibilité 🙏");
  return lines.join("\n");
}

export function buildWhatsAppUrl(text: string) {
  return `${BRAND.whatsappUrl}?text=${encodeURIComponent(text)}`;
}
