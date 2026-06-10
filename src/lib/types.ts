export type RootColorKey =
  | '--primary' | '--secondary' | '--headerColor' | '--grey' | '--bodyTextColor'
  | '--backgroundColor' | '--primaryLight' | '--secondaryLight' | '--bodyTextColorWhite' | '--errorColor';

export type RootFontKey = '--headerFont' | '--bodyFont' | '--navNeon';

export interface ProjectTheme {
  rootColors: Record<RootColorKey, string>;
  customVars: Array<{ name: string; hex: string }>;
  rootFonts: Record<RootFontKey, string>;
}

export interface OverridesPayload {
  textOverrides: Record<string, string>;
  imageOverrides: Record<string, string>;
  localColors: Record<string, { color?: string; backgroundColor?: string }>;
  buttonOverrides: Record<string, string>;
}

export const EMPTY_OVERRIDES: OverridesPayload = {
  textOverrides: {},
  imageOverrides: {},
  localColors: {},
  buttonOverrides: {},
};

export type FontCategory = 'sans' | 'serif' | 'mono' | 'display';

export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  sans: 'Sans-serif',
  serif: 'Serif',
  mono: 'Monospace',
  display: 'Display',
};

// Order here = order categories appear in the picker.
export const FONT_CATEGORY_ORDER: ReadonlyArray<FontCategory> = ['sans', 'serif', 'mono', 'display'];

export const FONT_STACKS: ReadonlyArray<{ label: string; stack: string; category: FontCategory }> = [
  // --- Sans-serif ---
  { label: 'Inter',             stack: "'Inter', sans-serif",            category: 'sans' },
  { label: 'Roboto',            stack: "'Roboto', sans-serif",           category: 'sans' },
  { label: 'Poppins',           stack: "'Poppins', sans-serif",          category: 'sans' },
  { label: 'Montserrat',        stack: "'Montserrat', sans-serif",       category: 'sans' },
  { label: 'Lato',              stack: "'Lato', sans-serif",             category: 'sans' },
  { label: 'Nunito',            stack: "'Nunito', sans-serif",           category: 'sans' },
  { label: 'DM Sans',           stack: "'DM Sans', sans-serif",          category: 'sans' },
  { label: 'Space Grotesk',     stack: "'Space Grotesk', sans-serif",    category: 'sans' },
  { label: 'Syne',              stack: "'Syne', sans-serif",             category: 'sans' },
  { label: 'Noto Sans',         stack: "'Noto Sans', sans-serif",        category: 'sans' },
  { label: 'Pontano Sans',      stack: "'Pontano Sans', sans-serif",     category: 'sans' },
  { label: 'Oswald',            stack: "'Oswald', sans-serif",           category: 'sans' },
  { label: 'Source Sans 3',     stack: "'Source Sans 3', sans-serif",    category: 'sans' },
  { label: 'Helvetica / Arial', stack: "Helvetica, Arial, sans-serif",   category: 'sans' },
  { label: 'System UI',         stack: "system-ui, sans-serif",          category: 'sans' },
  // --- Serif ---
  { label: 'Merriweather',      stack: "'Merriweather', serif",          category: 'serif' },
  { label: 'Playfair Display',  stack: "'Playfair Display', serif",      category: 'serif' },
  { label: 'Lora',              stack: "'Lora', serif",                  category: 'serif' },
  { label: 'Source Serif Pro',  stack: "'Source Serif Pro', serif",      category: 'serif' },
  { label: 'Noto Serif Lao',    stack: "'Noto Serif Lao', serif",        category: 'serif' },
  { label: 'Caudex',            stack: "'Caudex', serif",                category: 'serif' },
  { label: 'Stint Ultra Expanded', stack: "'Stint Ultra Expanded', serif", category: 'serif' },
  { label: 'Charter',           stack: "'Charter', serif",               category: 'serif' },
  { label: 'Georgia',           stack: "Georgia, serif",                 category: 'serif' },
  { label: 'Times New Roman',   stack: "'Times New Roman', serif",       category: 'serif' },
  // --- Monospace ---
  { label: 'Inconsolata',       stack: "'Inconsolata', monospace",       category: 'mono' },
  { label: 'Courier',           stack: "'Courier New', monospace",       category: 'mono' },
  // --- Display / decorative ---
  { label: 'Yellowtail',        stack: "'Yellowtail', cursive",          category: 'display' },
];

export const DEFAULT_THEME: ProjectTheme = {
  rootColors: {
    '--primary': '#ff6a3e',
    '--secondary': '#ffba43',
    '--headerColor': '#1a1a1a',
    '--grey': '#cccccc',
    '--bodyTextColor': '#353535',
    '--backgroundColor': '#ffffff',
    '--primaryLight': '#ffd9cc',
    '--secondaryLight': '#ffeac7',
    '--bodyTextColorWhite': '#f5f5f5',
    '--errorColor': '#d62828',
  },
  customVars: [],
  rootFonts: {
    '--headerFont': "'Oswald', sans-serif",
    '--bodyFont': "'Source Sans 3', sans-serif",
    '--navNeon': "'Oswald', sans-serif",
  },
};
