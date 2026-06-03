export type LayoutType =
  | 'heroSection'
  | 'service'
  | 'footer'
  | 'navigation'
  | 'blog'
  | 'contactform'
  | 'cta'
  | 'events'
  | 'faq'
  | 'gallery'
  | 'pricing'
  | 'quotes'
  | 'reviews'
  | 'stats'
  | 'steps'
  | 'team'
  | 'whychooseus'
  | 'sidebyside'
  | 'interiorpage';

export interface VariantGroup {
  label?: string;
  values: string[];
}

export interface LayoutTypeDef {
  placeholder: string;
  prefix: LayoutType;
  optionLabel: string;
  groups: VariantGroup[];
}

function range(from: number, to: number): string[] {
  const out: string[] = [];
  for (let i = from; i <= to; i++) out.push(String(i));
  return out;
}

function rangePrefix(prefix: string, from: number, to: number): string[] {
  const out: string[] = [];
  for (let i = from; i <= to; i++) out.push(`${prefix}${i}`);
  return out;
}

export const LAYOUT_CATALOG: Record<LayoutType, LayoutTypeDef> = {
  heroSection: {
    placeholder: 'Hero',
    prefix: 'heroSection',
    optionLabel: 'hero',
    groups: [
      { label: 'centered', values: range(1, 15) },
      { label: 'landing&services', values: range(16, 63) },
      { label: 'leftaligned', values: range(64, 99) },
      { label: 'rightaligned', values: range(100, 123) },
    ],
  },
  service: {
    placeholder: 'Service',
    prefix: 'service',
    optionLabel: 'Service',
    groups: [
      { label: '3card', values: range(1, 54) },
      { label: '4card', values: [...range(55, 119), '170'] },
      { label: '5card', values: range(120, 128) },
      { label: 'combo', values: range(129, 138) },
      { label: 'dual', values: range(139, 169) },
    ],
  },
  footer: {
    placeholder: 'Footer',
    prefix: 'footer',
    optionLabel: 'footer',
    groups: [{ values: range(1, 21) }],
  },
  navigation: {
    placeholder: 'Navigation',
    prefix: 'navigation',
    optionLabel: 'nav',
    groups: [
      { values: range(1, 21) },
      { label: 'other', values: ['otherSlideRight'] },
    ],
  },
  blog: {
    placeholder: 'Blog',
    prefix: 'blog',
    optionLabel: 'blog',
    groups: [{ values: range(1, 13) }],
  },
  contactform: {
    placeholder: 'Contact Form',
    prefix: 'contactform',
    optionLabel: 'form',
    groups: [{ values: range(1, 33) }],
  },
  cta: {
    placeholder: 'CTA',
    prefix: 'cta',
    optionLabel: 'cta',
    groups: [{ values: range(1, 19) }],
  },
  events: {
    placeholder: 'Events',
    prefix: 'events',
    optionLabel: 'events',
    groups: [{ values: range(1, 10) }],
  },
  faq: {
    placeholder: 'FAQ',
    prefix: 'faq',
    optionLabel: 'faq',
    groups: [{ values: range(1, 28) }],
  },
  gallery: {
    placeholder: 'Gallery',
    prefix: 'gallery',
    optionLabel: 'gallery',
    groups: [{ values: range(1, 28) }],
  },
  pricing: {
    placeholder: 'Pricing',
    prefix: 'pricing',
    optionLabel: 'pricing',
    groups: [{ values: range(1, 34) }],
  },
  quotes: {
    placeholder: 'Quotes',
    prefix: 'quotes',
    optionLabel: 'quotes',
    groups: [{ values: range(1, 9) }],
  },
  reviews: {
    placeholder: 'Reviews',
    prefix: 'reviews',
    optionLabel: 'reviews',
    groups: [{ values: range(1, 21) }],
  },
  stats: {
    placeholder: 'Stats',
    prefix: 'stats',
    optionLabel: 'stats',
    groups: [{ values: range(1, 28) }],
  },
  steps: {
    placeholder: 'Steps',
    prefix: 'steps',
    optionLabel: 'steps',
    groups: [{ values: range(1, 31) }],
  },
  team: {
    placeholder: 'Team',
    prefix: 'team',
    optionLabel: 'team',
    groups: [{ values: range(1, 21) }],
  },
  whychooseus: {
    placeholder: 'Why Choose Us',
    prefix: 'whychooseus',
    optionLabel: 'whychooseus',
    groups: [{ values: range(1, 25) }],
  },
  sidebyside: {
    placeholder: 'Side by Side',
    prefix: 'sidebyside',
    optionLabel: 'sidebyside',
    groups: [
      { label: 'standard', values: rangePrefix('standard_', 1, 109) },
      { label: 'reversePair', values: rangePrefix('reversePair_', 1, 76) },
    ],
  },
  interiorpage: {
    placeholder: 'Interior Page',
    prefix: 'interiorpage',
    optionLabel: 'interiorpage',
    groups: [
      { label: 'about', values: rangePrefix('about_', 1, 4) },
      { label: 'banner', values: rangePrefix('banner_', 1, 11) },
      { label: 'contact', values: rangePrefix('contact_', 1, 3) },
      { label: 'content', values: rangePrefix('content_', 1, 7) },
      { label: 'faq', values: ['faq_1'] },
      { label: 'menu', values: rangePrefix('menu_', 1, 2) },
    ],
  },
};

export const LAYOUT_TYPES = Object.keys(LAYOUT_CATALOG) as LayoutType[];

export function toLayoutId(type: LayoutType, value: string): string {
  return `${LAYOUT_CATALOG[type].prefix}-${value}`;
}
