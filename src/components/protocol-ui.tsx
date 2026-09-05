import { ReactNode, useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BioHeader, BottomNav, MainRoute } from "@/components/bio-shell";
import { colors, Fonts } from "@/constants/theme";

export function Page({ title, subtitle, active, children, resetKey }: { title: string; subtitle?: string; active: MainRoute; children: ReactNode; resetKey?: string }) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [resetKey]);
  return <View style={ui.screen}><BioHeader compact /><ScrollView ref={scroll} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={[ui.content, { paddingBottom: 100 + insets.bottom }]}>
    <Text selectable style={ui.title}>{title}</Text>
    {subtitle && <Text selectable style={ui.muted}>{subtitle}</Text>}
    {children}
  </ScrollView><BottomNav active={active} /></View>;
}
export function Card({ children }: { children: ReactNode }) { return <View style={ui.card}>{children}</View>; }
export function Button({ title, onPress, secondary = false, disabled = false }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [ui.button, secondary && ui.secondary, (disabled || pressed) && { opacity: 0.5 }]}>
    <Text style={[ui.buttonText, secondary && { color: colors.primarySoft }]}>{title}</Text>
  </Pressable>;
}
export function Field({ label, value, onChangeText, numeric = false, multiline = false, placeholder, editable = true }: { label: string; value: string; onChangeText: (value: string) => void; numeric?: boolean; multiline?: boolean; placeholder?: string; editable?: boolean }) {
  return <View style={ui.field}><Text style={ui.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} editable={editable} keyboardType={numeric ? "decimal-pad" : "default"} multiline={multiline} placeholder={placeholder} placeholderTextColor={colors.outline} style={[ui.input, multiline && { minHeight: 100, textAlignVertical: "top" }]} /></View>;
}
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16, width: "100%", maxWidth: 760, alignSelf: "center" },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  heading: { color: colors.text, fontSize: 19, fontWeight: "700" },
  text: { color: colors.text, fontSize: 14, lineHeight: 23 },
  muted: { color: colors.textSecondary, fontSize: 13, lineHeight: 21 },
  kicker: { color: colors.primarySoft, fontFamily: Fonts.mono, fontSize: 11, lineHeight: 18 },
  card: { backgroundColor: colors.surfaceLow, borderColor: colors.surfaceHigh, borderWidth: 1, borderRadius: 16, padding: 16, gap: 13 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, minHeight: 48, alignItems: "center", justifyContent: "center" },
  secondary: { backgroundColor: colors.surfaceHigh },
  buttonText: { color: colors.primaryDark, fontSize: 14, fontWeight: "800", textAlign: "center" },
  field: { gap: 7 }, label: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  input: { backgroundColor: colors.surfaceLowest, color: colors.text, borderWidth: 1, borderColor: colors.surfaceHigh, borderRadius: 10, padding: 12, minHeight: 48, fontSize: 15 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" },
  timer: { color: colors.secondary, fontFamily: Fonts.mono, fontSize: 32, fontVariant: ["tabular-nums"] },
  error: { color: colors.secondary, fontSize: 13, lineHeight: 21 },
});
