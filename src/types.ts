export interface SlidesDeck {
  globalConfig: DeckConfig;
  slides: Slide[];
}

export interface DeckConfig {
  theme: string;
  transition: TransitionType;
  aspectRatio: string;
  highlightStyle: string;
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
  background?: string;
  class?: string;
  transition?: TransitionType;
  [key: string]: unknown;
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
  theme: "default",
  transition: "slide",
  aspectRatio: "16/9",
  highlightStyle: "github",
};

export const PREVIEW_VIEW_TYPE = "slides-plus-preview";
export const PRESENTATION_VIEW_TYPE = "slides-plus-presentation";
export const PRESENTER_VIEW_TYPE = "slides-plus-presenter";
