/**
 * Preset constants for Markdown-native frontmatter properties.
 * Maps user-friendly names to CSS values.
 */

export const BACKGROUND_PRESETS: Record<string, string> = {
    // Gradients
    sunset: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    ocean: "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
    forest: "linear-gradient(120deg, #a8edea 0%, #fed6e3 100%)",
    fire: "linear-gradient(45deg, #fa709a 0%, #fee140 100%)",
    night: "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)",
    aurora: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    cosmic: "linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)",

    // Named colors (CSS color names)
    blue: "#2563eb",
    red: "#dc2626",
    green: "#16a34a",
    purple: "#9333ea",
    orange: "#ea580c",
    pink: "#ec4899",
    yellow: "#eab308",
    teal: "#14b8a6",

    // Theme-specific
    dark: "#1a1a2e",
    light: "#ffffff",
    cream: "#faf9f5",
};

export const FONT_PRESETS: Record<string, string> = {
    // Generic families
    serif: "Lora, Georgia, serif",
    sans: "Poppins, Arial, sans-serif",
    "sans-serif": "Poppins, Arial, sans-serif",
    mono: "Consolas, Monaco, monospace",
    monospace: "Consolas, Monaco, monospace",
    cursive: "cursive",

    // Specific fonts (Google Fonts or system fonts)
    poppins: "Poppins, sans-serif",
    lora: "Lora, serif",
    "open-sans": "Open Sans, sans-serif",
    roboto: "Roboto, sans-serif",
    inter: "Inter, sans-serif",
    "source-code-pro": "Source Code Pro, monospace",
    georgia: "Georgia, serif",
    arial: "Arial, sans-serif",
    helvetica: "Helvetica, sans-serif",
    times: "Times New Roman, serif",
    verdana: "Verdana, sans-serif",
};

export const TEXT_SIZE_PRESETS: Record<string, string> = {
    small: "0.8em",
    normal: "1em",
    large: "1.2em",
    huge: "1.5em",
};

export const PADDING_PRESETS: Record<string, string> = {
    none: "0",
    small: "24px",
    normal: "48px",
    large: "72px",
};

export const COLOR_PRESETS: Record<string, string> = {
    // Same as background colors for consistency
    blue: "#2563eb",
    red: "#dc2626",
    green: "#16a34a",
    purple: "#9333ea",
    orange: "#ea580c",
    pink: "#ec4899",
    yellow: "#eab308",
    teal: "#14b8a6",
    white: "#ffffff",
    black: "#000000",
    gray: "#6b7280",
    "light-gray": "#e5e7eb",
    "dark-gray": "#374151",
};
