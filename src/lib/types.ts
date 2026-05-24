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
