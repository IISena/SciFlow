import { ReactNode } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, Fonts } from "@/constants/theme";

export type MainRoute = "home" | "protocols" | "execution" | "notes";
const navItems = [
  { route: "home", label: "Início", icon: "⌂", href: "/" },
  { route: "protocols", label: "Protocolos", icon: "⚗", href: "/protocols" },
  { route: "execution", label: "Execução", icon: "◷", href: "/protocols/cfs-execution" },
  { route: "notes", label: "Anotações", icon: "≡", href: "/notes" },
] as const;

export function BioHeader({ compact = false }: { compact?: boolean }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.header, { paddingTop: insets.top + 8, height: insets.top + 66 }]}>
    <View style={styles.brandRow}><View style={styles.brandIcon}><Text style={styles.brandGlyph}>⚗</Text></View><View>
      <View style={styles.brandNameRow}><Text selectable style={styles.brand}>SciFlow</Text><View style={styles.liveDot} /></View>
      {!compact && <Text selectable style={styles.brandSub}>BIOLAB OS</Text>}
    </View></View>
    <View style={styles.headerRight}><View style={styles.online}><View style={styles.alertDot} /><Text style={styles.onlineText}>ONLINE</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>GS</Text></View></View>
  </View>;
}

export function BottomNav({ active }: { active: MainRoute }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.navWrap, { paddingBottom: Math.max(insets.bottom, 10) }]}><View style={styles.nav}>
    {navItems.map((item) => { const selected = item.route === active; return <Pressable key={item.route} style={styles.navItem} onPress={() => router.replace(item.href as never)}>
      <Text style={[styles.navIcon, selected && styles.navActive]}>{item.icon}</Text><Text style={[styles.navLabel, selected && styles.navActive]}>{item.label}</Text>
    </Pressable>; })}
  </View></View>;
}

export function SectionTitle({ children, detail }: { children: ReactNode; detail?: string }) {
  return <View style={styles.sectionRow}><Text selectable style={styles.sectionTitle}>{children}</Text>{detail && <Text selectable style={styles.sectionDetail}>{detail}</Text>}</View>;
}
export function Chip({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return <View style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  header: { backgroundColor: "rgba(17,20,24,0.98)", paddingHorizontal: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#20252A" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 }, brandIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surfaceHigh, alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(0,245,155,0.22)" },
  brandGlyph: { color: colors.primarySoft, fontSize: 20 }, brandNameRow: { flexDirection: "row", alignItems: "center", gap: 6 }, brand: { color: colors.text, fontSize: 18, fontWeight: "800" }, liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, boxShadow: "0 0 8px #00F59B" }, brandSub: { color: colors.textSecondary, fontSize: 9, fontFamily: Fonts.mono, letterSpacing: 1.3 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 9 }, online: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.surfaceHigh, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 14 }, alertDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary }, onlineText: { color: colors.secondary, fontSize: 9, fontFamily: Fonts.mono, fontWeight: "700" }, avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }, avatarText: { color: colors.primaryDark, fontWeight: "900", fontSize: 11 },
  navWrap: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 12, alignItems: "center" }, nav: { width: "100%", maxWidth: 480, height: 64, borderRadius: 32, backgroundColor: "rgba(25,28,32,0.97)", paddingHorizontal: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-around", boxShadow: "0 8px 32px rgba(0,0,0,0.65)" }, navItem: { minWidth: 64, minHeight: 48, alignItems: "center", justifyContent: "center", gap: 2 }, navIcon: { color: colors.textSecondary, fontSize: 21 }, navLabel: { color: colors.textSecondary, fontSize: 9, fontFamily: Fonts.mono }, navActive: { color: colors.primary, fontWeight: "800" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, sectionTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: "800" }, sectionDetail: { color: colors.primarySoft, fontFamily: Fonts.mono, fontSize: 10 }, chip: { paddingHorizontal: 13, height: 34, borderRadius: 17, backgroundColor: colors.surfaceHigh, alignItems: "center", justifyContent: "center" }, chipActive: { backgroundColor: colors.primary }, chipText: { color: colors.textSecondary, fontFamily: Fonts.mono, fontSize: 10 }, chipTextActive: { color: colors.primaryDark, fontWeight: "900" },
});
