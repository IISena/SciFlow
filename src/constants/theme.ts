import { Platform } from "react-native";

export const colors = {
  background: "#111418", surfaceLowest: "#0B0E12", surfaceLow: "#191C20",
  surface: "#1D2024", surfaceHigh: "#272A2F", surfaceHighest: "#32353A",
  border: "#3B4A3F", primary: "#00F59B", primarySoft: "#53FFAB",
  primaryDark: "#003920", secondary: "#FFB3B0", secondaryDark: "#901822",
  text: "#E1E2E8", textSecondary: "#B9CBBD", outline: "#849588",
  success: "#00E38F", warning: "#FFD166", error: "#FFB4AB",
};

export const Colors = {
  light: {
    text: "#111418", textSecondary: "#526057", background: "#F6FBF8",
    backgroundElement: "#E5EFE9", backgroundSelected: "#D0F5E1", border: "#C5D4CA",
    tint: "#006D42", icon: "#526057", tabIconDefault: "#849588", tabIconSelected: "#006D42",
  },
  dark: {
    text: colors.text, textSecondary: colors.textSecondary, background: colors.background,
    backgroundElement: colors.surface, backgroundSelected: colors.surfaceHigh, border: colors.border,
    tint: colors.primary, icon: colors.textSecondary, tabIconDefault: colors.outline, tabIconSelected: colors.primary,
  },
};
export type ThemeColor = keyof typeof Colors.light;
export const Spacing = { half: 2, one: 4, two: 8, three: 12, four: 16, five: 20 };
export const MaxContentWidth = 1200;

export const Fonts = {
  sans: Platform.select({ ios: "System", android: "sans-serif", default: "sans-serif" }),
  serif: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
  rounded: Platform.select({ ios: "System", android: "sans-serif", default: "sans-serif" }),
  mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
};
