import { Platform } from "react-native";

export const colors = {
  background: "#0B0E14",

  surface: "#111827",
  surfaceSecondary: "#1E293B",

  border: "#1F2937",

  primary: "#38BDF8",
  warning: "#F59E0B",

  text: "#F8FAFC",
  textSecondary: "#94A3B8",

  success: "#22C55E",
  error: "#EF4444",
};

export const Fonts = {
  sans: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "sans-serif",
  }),

  serif: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "serif",
  }),

  rounded: Platform.select({
    ios: "System",
    android: "sans-serif",
    default: "sans-serif",
  }),

  mono: Platform.select({
    ios: "Courier",
    android: "monospace",
    default: "monospace",
  }),
};
