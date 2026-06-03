// Shared catalog of layout variants, used by the page builder (new.astro) and the
// page structure editor (structure.astro). Single source of truth for the option lists.

export type LayoutType = 'heroSection' | 'service' | 'footer';

export interface VariantGroup {
  /** optgroup label; omit for a flat list */
  label?: string;
  /** variant values, e.g. ['1', '2', ...] */
  values: string[];
}

export interface LayoutTypeDef {
  /** label of the placeholder option shown when nothing is selected */
  placeholder: string;
  /** prefix used to build layoutId: `${prefix}-${value}` */
  prefix: LayoutType;
  /** prefix for each variant's display label, e.g. 'hero' -> "hero 1" */
  optionLabel: string;
  groups: VariantGroup[];
}

/** Inclusive numeric range as string values. */
function range(from: number, to: number): string[] {
  const out: string[] = [];
  for (let i = from; i <= to; i++) out.push(String(i));
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
    groups: [{ values: range(1, 27) }],
  },
};

export const LAYOUT_TYPES = Object.keys(LAYOUT_CATALOG) as LayoutType[];

/** Build the stored layoutId for a type + variant value. */
export function toLayoutId(type: LayoutType, value: string): string {
  return `${LAYOUT_CATALOG[type].prefix}-${value}`;
}
