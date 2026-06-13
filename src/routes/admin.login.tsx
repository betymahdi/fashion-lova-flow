import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/admin/dashboard" });
  },
  head: () => ({ meta: [{ title: "Connexion admin — Fashion Lova Bety" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/admin/dashboard" });
    } catch {
      // Never reveal which credential is wrong
      toast.error("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  const cls = "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/30 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 shadow-xl ring-1 ring-border/60">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={BRAND.logo} alt={BRAND.name} className="h-16 w-16 rounded-xl border border-border/60 bg-white object-contain p-1 shadow-sm" />
          <h1 className="mt-3 font-display text-2xl">Admin</h1>
          <p className="text-xs text-muted-foreground">{BRAND.name}</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input type="email" required className={cls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Mot de passe</span>
            <input type="password" required minLength={6} className={cls} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" disabled={loading} className="mt-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {loading ? "…" : "Se connecter"}
          </button>
        </form>
        <p className="mt-4 text-center text-[11px] text-muted-foreground">Accès réservé à l'administratrice.</p>
      </div>
    </div>
  );
}
