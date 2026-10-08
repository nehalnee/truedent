import raw from '../data/products.json';

export interface Product {
  slug: string;
  name: string;
  group: 'Dental Equipment' | 'Dental Material';
  brand: string | null;
  categories: string[];
  comingSoon: boolean;
  featured: boolean;
  /** Price in LYD. null = "price on request" (the old site only had placeholder prices). */
  price: number | null;
  inStock: boolean;
  image: string;
  gallery: string[];
  summary: string;
  description: string;
}

// Tidy up the category names inherited from the old WordPress store
const CATEGORY_NAMES: Record<string, string> = {
  'Apex Locater': 'Apex Locators',
  'apex locater with rotary motor': 'Apex Locators',
  'Multi-Function Ultra-Sonic Scaler': 'Ultrasonic Scalers',
  'Light Cure': 'Light Cures',
  'Obturation System': 'Obturation Systems',
  'Air Polisher Plus': 'Air Polishers',
  'Air-Polisher Powder': 'Air-Polisher Powders',
  'Implant Motor': 'Implant Motors',
  'Surgical Microscope': 'Surgical Microscopes',
};

export const GROUPS = [
  {
    key: 'equipment',
    name: 'Dental Equipment',
    blurb: 'Rotary motors, apex locators, scalers, light cures, radiology and surgical units.',
  },
  {
    key: 'materials',
    name: 'Dental Material',
    label: 'Dental Materials',
    blurb: 'Endodontic, restorative and cementation materials from Nexobio, FGM, RAMO and Prevest DenePro.',
  },
] as const;

export const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const products: Product[] = (raw as any[]).map((p) => ({
  ...p,
  price: p.price ?? null,
  categories: [...new Set<string>(p.categories.map((c: string) => CATEGORY_NAMES[c] ?? c))],
}));

export const groupKey = (p: Product) => (p.group === 'Dental Equipment' ? 'equipment' : 'materials');

/** Category for equipment, brand for materials: the most useful filter for each group. */
export const facetOf = (p: Product) => (p.group === 'Dental Equipment' ? p.categories[0] : p.brand) ?? 'Other';

export function facets(group: Product['group']) {
  const counts = new Map<string, number>();
  for (const p of products) if (p.group === group) counts.set(facetOf(p), (counts.get(facetOf(p)) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, slug: slugify(name), count }));
}

export const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))] as string[];

export const featured = products.filter((p) => p.featured && !p.comingSoon);

export function related(p: Product, n = 4) {
  return products
    .filter((x) => x.slug !== p.slug && facetOf(x) === facetOf(p))
    .concat(products.filter((x) => x.slug !== p.slug && x.group === p.group && facetOf(x) !== facetOf(p)))
    .slice(0, n);
}

export const formatPrice = (price: number | null) =>
  price == null ? 'Price on request' : `${price.toLocaleString('en')} LYD`;
