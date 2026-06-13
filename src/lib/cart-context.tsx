import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  id: string; // unique per product+color+size
  productId: string;
  name: string;
  image: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: Omit<CartItem, "id" | "quantity"> & { quantity?: number }) => void;
  updateQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  total: number;
}

const CartContext = createContext<CartCtx | null>(null);
const STORAGE_KEY = "flb_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartCtx>(() => ({
    items,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((v) => !v),
    add: (it) => {
      const qty = it.quantity ?? 1;
      const key = `${it.productId}|${it.color}|${it.size}`;
      setItems((curr) => {
        const found = curr.find((c) => c.id === key);
        if (found) return curr.map((c) => c.id === key ? { ...c, quantity: c.quantity + qty } : c);
        return [...curr, { ...it, id: key, quantity: qty }];
      });
    },
    updateQty: (id, qty) => setItems((curr) => qty <= 0
      ? curr.filter((c) => c.id !== id)
      : curr.map((c) => c.id === id ? { ...c, quantity: qty } : c)),
    remove: (id) => setItems((curr) => curr.filter((c) => c.id !== id)),
    clear: () => setItems([]),
    count: items.reduce((s, i) => s + i.quantity, 0),
    total: items.reduce((s, i) => s + i.quantity * i.price, 0),
  }), [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
