import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CartDrawer } from "@/components/site/CartDrawer";
import { WhatsAppFloating } from "@/components/site/WhatsAppFloating";
import { BRAND } from "@/lib/brand";

const GOLD = "#C9A96E";
const PINK = "#F9C6D0";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Fashion Lova Bety" },
      { name: "description", content: "Contactez Fashion Lova Bety sur WhatsApp ou Instagram." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <CartDrawer />
      <WhatsAppFloating />

      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="font-display text-4xl sm:text-5xl" style={{ color: "#2C2C2A" }}>
            Nous contacter
          </h1>
          <div
            className="mx-auto mt-4 h-px w-20"
            style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }}
          />
          <p className="mt-5 text-sm text-gray-400">
            Nous répondons dans les plus brefs délais
          </p>
        </div>

        {/* Contact cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {/* WhatsApp */}
          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition hover:shadow-lg"
            style={{ background: "#FFF8F5", border: `1px solid ${PINK}` }}
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full transition group-hover:scale-105"
              style={{ background: "#25D366" }}
            >
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.116 1.535 5.845L.057 23.476l5.765-1.516A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.665-.52-5.181-1.424l-.372-.22-3.421.9.916-3.342-.242-.383A9.938 9.938 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg" style={{ color: "#2C2C2A" }}>WhatsApp</h2>
              <p className="mt-1 text-sm text-gray-400">+212 781 188 202</p>
            </div>
            <span
              className="rounded-full px-5 py-2 text-sm font-semibold text-white transition group-hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              Envoyer un message
            </span>
          </a>

          {/* Instagram */}
          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition hover:shadow-lg"
            style={{ background: "#FFF8F5", border: `1px solid ${PINK}` }}
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full transition group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
            >
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg" style={{ color: "#2C2C2A" }}>Instagram</h2>
              <p className="mt-1 text-sm text-gray-400">@fashion_lova_bety</p>
            </div>
            <span
              className="rounded-full px-5 py-2 text-sm font-semibold text-white transition group-hover:opacity-90"
              style={{ background: `linear-gradient(135deg, #f09433, #dc2743, #bc1888)` }}
            >
              Voir notre page
            </span>
          </a>
        </div>

        {/* Info line */}
        <p
          className="mt-12 rounded-2xl py-5 text-center text-sm font-medium"
          style={{ background: PINK, color: "#6B4C3B" }}
        >
          Nous répondons dans les plus brefs délais
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
