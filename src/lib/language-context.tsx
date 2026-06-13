import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "FR" | "AR" | "EN";

interface LangCtxValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangCtx = createContext<LangCtxValue>({ lang: "FR", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { return (localStorage.getItem("site-lang") as Lang) || "FR"; } catch { return "FR"; }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("site-lang", l); } catch {}
  };

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
