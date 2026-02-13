export interface SlidesDeck {
  globalConfig: DeckConfig;
  slides: Slide[];
}

export interface DeckConfig {
  theme: string;
  transition: TransitionType;
  aspectRatio: string;
  highlightStyle: string;
  header?: string;
  footer?: string;
}

export interface Slide {
  index: number;
  content: string;
  notes: string;
  frontmatter: SlideFrontmatter;
  /** Raw markdown including frontmatter, before parsing */
  raw: string;
}

export interface SlideFrontmatter {
  layout?: LayoutType;
  image?: string;
  fragments?: boolean;

  // Markdown-native properties (user-friendly)
  background?: string;              // Preset name, color, or image path
  "background-color"?: string;      // Override background color
  "accent-color"?: string;          // Accent color for highlights
  "text-color"?: string;            // Text color
  "text-size"?: "small" | "normal" | "large" | "huge" | "auto";
  "text-align"?: "left" | "center" | "right";
  "heading-font"?: string;          // Font preset or font-family name
  "body-font"?: string;             // Font preset or font-family name
  padding?: "none" | "small" | "normal" | "large";
  
  // Multi-column ratio for two-cols layout
  cols?: string;                    // e.g. "2 1" → 2fr 1fr

  // Power user escape hatch
  "custom-css"?: string;            // Raw CSS for advanced users
  
  // Legacy properties (backwards compatibility)
  class?: string;
  transition?: TransitionType;
  [key: string]: unknown;           // Allows sp-* properties for backwards compat
}

export type LayoutType =
  | "default"
  | "cover"
  | "center"
  | "two-cols"
  | "image-right"
  | "image-left"
  | "section"
  | "quote"
  | "full";

export type TransitionType =
  | "slide"
  | "fade"
  | "slide-up"
  | "none";

export const DEFAULT_DECK_CONFIG: DeckConfig = {
  theme: "academic",
  transition: "slide",
  aspectRatio: "16/9",
  highlightStyle: "github",
};

export const PREVIEW_VIEW_TYPE = "slides-plus-preview";
export const PRESENTATION_VIEW_TYPE = "slides-plus-presentation";
export const PRESENTER_VIEW_TYPE = "slides-plus-presenter";
