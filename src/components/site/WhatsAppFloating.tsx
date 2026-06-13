import { MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/brand";

export function WhatsAppFloating() {
  return (
    <a
      href={BRAND.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactez-nous sur WhatsApp"
      className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg shadow-whatsapp/40 transition hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </a>
  );
}
