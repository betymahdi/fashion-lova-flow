import logoAsset from "@/assets/logo-blova.png";

export const BRAND = {
  name: "Fashion Lova Bety",
  tagline: "Mode féminine tendance • Livraison partout au Maroc",
  instagram: "fashion_lova_bety",
  instagramUrl: "https://instagram.com/fashion_lova_bety",
  // Use a phone-based wa.me link so `?text=` works for prefilled messages
  whatsappUrl: "https://wa.me/212781188202",
  logo: logoAsset,
};

export const CATEGORIES = [
  { slug: "top-basic", label: "Top Basic" },
  { slug: "top-tendance", label: "Top Tendance" },
  { slug: "top-summer", label: "Top Summer" },
  { slug: "robes", label: "Robes" },
] as const;

export const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

export const MOROCCAN_CITIES = [
  "Agadir","Al Hoceima","Asilah","Azrou","Beni Mellal","Berkane","Berrechid","Casablanca","Chefchaouen",
  "Dakhla","El Jadida","Errachidia","Essaouira","Fès","Fnideq","Guelmim","Ifrane","Kénitra","Khémisset",
  "Khénifra","Khouribga","Laâyoune","Larache","Marrakech","Meknès","Mohammedia","Nador","Ouarzazate",
  "Oujda","Rabat","Safi","Salé","Sefrou","Settat","Sidi Kacem","Sidi Slimane","Tanger","Tan-Tan",
  "Taourirt","Taroudant","Taza","Témara","Tétouan","Tiznit","Youssoufia","Zagora",
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
