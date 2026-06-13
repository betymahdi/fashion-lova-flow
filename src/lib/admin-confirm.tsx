import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { ShieldCheck, X } from "lucide-react";

// SHA-256 hash of the confirmation code (set by user)
// NOTE: 64 hex chars expected; the provided value below is what the user supplied.
const CONFIRM_HASH = "35d18de04fcee5f5d08e86b4772b941a8424a014f1e413bf2c721baba5d5c549";

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

type Pending = {
  title: string;
  description?: string;
  variant?: "default" | "danger";
  resolve: (ok: boolean) => void;
};

type Ctx = (opts: Omit<Pending, "resolve">) => Promise<boolean>;

const ConfirmCtx = createContext<Ctx | null>(null);

export function useAdminConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useAdminConfirm must be used inside AdminConfirmProvider");
  return ctx;
}

export function AdminConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ask = useCallback<Ctx>((opts) => {
    return new Promise<boolean>((resolve) => {
      setCode("");
      setError(null);
      setPending({ ...opts, resolve });
      setTimeout(() => inputRef.current?.focus(), 50);
    });
  }, []);

  const close = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
    setCode("");
    setError(null);
  };

  const submit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!code.trim()) return setError("Entrez le code");
    setChecking(true);
    const hex = await sha256Hex(code);
    setChecking(false);
    if (hex === CONFIRM_HASH) {
      close(true);
    } else {
      setError("Code incorrect");
      setCode("");
      inputRef.current?.focus();
    }
  };

  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl ring-1 ring-border">
            <div className="flex items-start justify-between gap-3">
              <div className={`grid h-11 w-11 place-items-center rounded-full ${pending.variant === "danger" ? "bg-destructive/10 text-destructive" : "bg-primary/30 text-foreground"}`}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <button type="button" onClick={() => close(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-3 font-display text-xl">{pending.title}</h2>
            {pending.description && <p className="mt-1 text-sm text-muted-foreground">{pending.description}</p>}
            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block font-medium">Code de confirmation</span>
              <input
                ref={inputRef}
                type="password"
                autoComplete="off"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(null); }}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm tracking-widest outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                placeholder="••••••"
              />
              {error && <span className="mt-1.5 block text-xs text-destructive">{error}</span>}
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => close(false)} className="rounded-full border border-input px-4 py-2 text-sm hover:bg-accent">Annuler</button>
              <button type="submit" disabled={checking} className={`rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50 ${pending.variant === "danger" ? "bg-destructive" : "bg-primary"}`}>
                {checking ? "…" : "Confirmer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}
