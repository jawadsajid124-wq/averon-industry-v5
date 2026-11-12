import { Product } from '../types/index.ts';

export const PREVIEW_DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-watch-tourbillon-01',
    name: 'Averon Sovereign Skeleton Tourbillon',
    category: 'Watches',
    price: 3850,
    originalPrice: 4200,
    image: '/src/assets/images/demo_watch_tourbillon_1794415277831.jpg',
    badge: 'Horlogerie Piece',
    stock: 4,
    rating: 5.0,
    reviewsCount: 18,
    description:
      'Handcrafted flying tourbillon complication with exposed mechanical architecture, hand-chamfered bridges, and an aerospace titanium chassis with double anti-reflective sapphire crystal.',
    specs: {
      'Movement': 'Manufacture Calibre AV-01 Tourbillon, 28,800 vph',
      'Power Reserve': '72 Hours Dual Barrel',
      'Case Diameter': '42mm Grade 5 Titanium',
      'Glass': 'Double Curved Scratch-Resistant Sapphire Crystal',
      'Strap': 'Hand-Stitched Alligator Grain Leather with Deployment Clasp',
      'Water Resistance': '10 ATM (100 meters)'
    },
    featured: true
  },
  {
    id: 'demo-wallet-exotic-02',
    name: 'Averon Royale Obsidian Bi-Fold',
    category: 'Wallets',
    price: 480,
    originalPrice: 550,
    image: '/src/assets/images/demo_wallet_exotic_1794415279039.jpg',
    badge: 'Haute Maroquinerie',
    stock: 9,
    rating: 4.9,
    reviewsCount: 24,
    description:
      'Ultra-refined exotic embossed full-grain leather wallet meticulously hand-stitched by master artisans, lined with ballistic RFID-shielded aerospace microfiber and finished with sterling silver foil embossing.',
    specs: {
      'Leather': 'Grade-1 Full-Grain French Calfskin with Exotic Texture',
      'Lining': 'Faraday RFID-Shielded Ballistic Silk Microfiber',
      'Capacity': '8 Dedicated Card Slots, 2 Hidden Cash Pockets',
      'Finishing': 'Hand-Burnished Waxed Edge Creasing',
      'Dimensions': '11.0 cm x 9.0 cm x 1.2 cm'
    },
    featured: false
  },
  {
    id: 'demo-sunglasses-titanium-03',
    name: 'Averon Aero-01 Polarized Aviator',
    category: 'Sunglasses',
    price: 620,
    originalPrice: 690,
    image: '/src/assets/images/demo_sunglasses_titanium_1794415278985.jpg',
    badge: 'Aerospace Grade',
    stock: 7,
    rating: 4.9,
    reviewsCount: 15,
    description:
      'Engineered from ultra-lightweight dark titanium with laser-knurled flex hinges and 9-layer polarized obsidian chrome lenses providing 100% UVA/UVB optical clarity and anti-glare filtration.',
    specs: {
      'Frame': 'Aerospace Beta-Titanium Monobloc Frame',
      'Lenses': '9-Layer Polarized Chrome Obsidian Glass',
      'UV Protection': 'UV400 / 100% UVA & UVB Shield',
      'Hinges': 'Custom Micro-Knurled German Screwless Flex Hinges',
      'Weight': '18.4 grams'
    },
    featured: false
  },
  {
    id: 'demo-perfume-oud-noir-04',
    name: 'Averon Haute Parfumerie — Ambre Nocturne',
    category: 'Perfumes',
    price: 360,
    originalPrice: 410,
    image: '/src/assets/images/demo_perfume_oud_noir_1794415280134.jpg',
    badge: 'Extrait de Parfum',
    stock: 12,
    rating: 5.0,
    reviewsCount: 31,
    description:
      'High-concentration (32%) extrait de parfum formulated with rare aged Cambodian agarwood, smoky black amber, Tuscan leather, and Bulgarian damask rose in a heavy hand-cut smoked crystal flacon with magnetic silver cap.',
    specs: {
      'Concentration': 'Extrait de Parfum (32% Pure Aromatic Essence)',
      'Top Notes': 'Sicilian Bergamot, Rare Saffron, Cardamom',
      'Heart Notes': 'Smoked Amber Velvet, Bulgarian Damask Rose',
      'Base Notes': 'Vintage Cambodian Oud, Tuscan Leather, Madagascar Bourbon Vanilla',
      'Volume': '100 ml / 3.4 fl. oz.'
    },
    featured: false
  },
  {
    id: 'demo-cufflinks-damascus-05',
    name: 'Averon Damascus Forged Cufflinks',
    category: 'Accessories',
    price: 290,
    originalPrice: 340,
    image: '/src/assets/images/demo_cufflinks_damascus_1794415279488.jpg',
    badge: 'Bespoke Atelier',
    stock: 6,
    rating: 4.8,
    reviewsCount: 12,
    description:
      'Folded 128-layer hand-forged Swedish Damascus steel featuring bespoke woodgrain striations, inlaid with genuine autoclave carbon fiber and fitted with 950 platinum toggle mechanisms.',
    specs: {
      'Material': '128-Layer Hand-Folded Swedish Damascus Steel',
      'Core Inlay': 'Twill Weave Autoclave Cured Carbon Fiber',
      'Toggle Bar': 'Hallmarked 950 Platinum Plated Solid Brass',
      'Dimensions': '16mm x 16mm x 3.5mm Face',
      'Presentation': 'Lacquer Burlwood Presentation Case'
    },
    featured: false
  }
];

/**
 * Robust detection of preview / review / staging environment.
 * In a true production deployment (e.g. averonindustry.com without dev flags),
 * this strictly returns false to ensure demo products never bleed into production.
 */
export function isPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Vite Development mode
  if (import.meta.env.DEV) return true;

  const hostname = window.location.hostname.toLowerCase();
  const search = window.location.search.toLowerCase();

  // 2. AI Studio Staging / Dev / Sandbox domains
  if (
    hostname.includes('ais-dev') ||
    hostname.includes('ais-pre') ||
    hostname.includes('run.app') ||
    hostname.includes('localhost') ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.web.app') ||
    hostname.endsWith('.firebaseapp.com')
  ) {
    return true;
  }

  // 3. Explicit reviewer preview query param ?preview=true
  if (search.includes('preview=true') || search.includes('demo=true')) {
    return true;
  }

  return false;
}
