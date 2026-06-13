import { Link } from "@tanstack/react-router";
import { BRAND } from "@/lib/brand";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const GOLD = "#C9A96E";
const PINK = "#F9C6D0";

export function SiteFooter() {
  return (
    <footer style={{ background: "#FFF8F5", borderTop: `1px solid ${PINK}` }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">

          {/* LEFT — Logo + brand */}
          <div className="flex flex-col items-start gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src={BRAND.logo}
                alt={BRAND.name}
                className="h-12 w-12 rounded-xl border-2 bg-white object-contain p-1 shadow-sm"
                style={{ borderColor: GOLD }}
              />
              <span className="font-display text-lg leading-none" style={{ color: "#2C2C2A" }}>
                {BRAND.name}
              </span>
            </Link>
            <p className="text-sm text-gray-400">
              Vêtements féminins élégants
            </p>
          </div>

          {/* CENTER — Links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>
              Navigation
            </p>
            {[
              { to: "/", label: "Accueil" },
              { to: "/contact", label: "Contact" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-gray-500 transition hover:text-gray-800"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* RIGHT — Social */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: GOLD }}>
              Nous suivre
            </p>
            <a
              href={BRAND.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800"
            >
              <InstagramIcon className="h-4 w-4" />
              @fashion_lova_bety
            </a>
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.116 1.535 5.845L.057 23.476l5.765-1.516A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.665-.52-5.181-1.424l-.372-.22-3.421.9.916-3.342-.242-.383A9.938 9.938 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              wa.me/212781188202
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 flex flex-col items-center gap-2 border-t pt-6 text-center sm:flex-row sm:justify-between"
          style={{ borderColor: PINK }}
        >
          <p className="text-xs text-gray-400">© 2025 Fashion Lova Bety. Tous droits réservés.</p>
          <p className="text-xs text-gray-300">Livraison partout au Maroc</p>
        </div>
      </div>
    </footer>
  );
}
