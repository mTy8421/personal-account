/**
 * Design System Color Palette & Tokens
 *
 * Primary: #083D77 (Trustworthy / Stable / Professional)
 * Background / Cream: #EBEBD3
 * Danger / Expense: #DA4167
 * Warning / Highlight: #F4D35E
 * Accent / Secondary: #F78764
 * Success / Income: #2A9D8F
 */

export const THEME_COLORS = {
  // Brand Core
  primary: {
    DEFAULT: "#083D77",
    hover: "#062F5C",
    foreground: "#FFFFFF",
    subtle: "#E6EFF8",
  },
  // Surface / Background
  background: {
    DEFAULT: "#EBEBD3",
    card: "#FFFFFF",
    foreground: "#141B24",
  },
  // Financial Semantics
  danger: {
    DEFAULT: "#DA4167",
    hover: "#C33559",
    foreground: "#FFFFFF",
    subtle: "#FDF1F4",
    text: "#B8284E", // High-contrast WCAG AA text
  },
  warning: {
    DEFAULT: "#F4D35E",
    hover: "#E7C44D",
    foreground: "#352802", // Dark text for WCAG AAA compliance (Contrast > 10:1)
    subtle: "#FEF9EB",
    text: "#7A5B04", // High-contrast text on light background
  },
  accent: {
    DEFAULT: "#F78764",
    hover: "#E6724E",
    foreground: "#FFFFFF",
    subtle: "#FEF3EE",
    text: "#B24623",
  },
  success: {
    DEFAULT: "#2A9D8F",
    hover: "#228479",
    foreground: "#FFFFFF",
    subtle: "#EDF7F6",
    text: "#1B6E64", // High-contrast WCAG AA text on white/cream (> 4.5:1)
  },
} as const;

export const CHART_COLORS = {
  income: THEME_COLORS.success.DEFAULT,
  expense: THEME_COLORS.danger.DEFAULT,
  transfer: THEME_COLORS.primary.DEFAULT,
  accent: THEME_COLORS.accent.DEFAULT,
  warning: THEME_COLORS.warning.DEFAULT,
} as const;
