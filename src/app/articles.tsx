import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { router } from "expo-router";

const colors = {
  background: "#0B0E14",
  surface: "#111827",
  border: "#1F2937",

  primary: "#38BDF8",
  warning: "#F59E0B",

  text: "#F8FAFC",
  textSecondary: "#94A3B8",
};

export default function ArticlesScreen() {
  function openArticle() {
    Linking.openURL("https://doi.org/10.1038/s41598-020-77472-6");
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.logo}>SciFlow</Text>

            <Text style={styles.title}>Artigos</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Referências científicas associadas aos protocolos.
        </Text>

        <View style={styles.card}>
          <View style={styles.articleTop}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SCIENTIFIC REPORTS</Text>
            </View>

            <Text style={styles.year}>2020</Text>
          </View>

          <Text style={styles.articleTitle}>
            Antifungal activity of Xenorhabdus spp. and Photorhabdus spp.
            against the soybean pathogenic Sclerotinia sclerotiorum
          </Text>

          <Text style={styles.authors}>Chacón-Orozco, J. G. et al.</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>PROTOCOLOS RELACIONADOS</Text>

          <Text style={styles.protocol}>• Produção de CFS</Text>

          <Text style={styles.protocol}>
            • Inibição do crescimento micelial
          </Text>

          <Text style={styles.protocol}>• Teste de VOCs</Text>

          <Text style={styles.protocol}>• Proteção de sementes de soja</Text>

          <View style={styles.divider} />

          <Text style={styles.doi}>DOI: 10.1038/s41598-020-77472-6</Text>

          <Pressable style={styles.articleButton} onPress={openArticle}>
            <Text style={styles.articleButtonText}>ABRIR ARTIGO</Text>

            <Text style={styles.articleButtonArrow}>↗</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.replace("/")}>
          <Text style={styles.navIcon}>⌂</Text>

          <Text style={styles.navText}>Início</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/protocols")}
        >
          <Text style={styles.navIcon}>⚗</Text>

          <Text style={styles.navText}>Protocolos</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/history")}
        >
          <Text style={styles.navIcon}>◷</Text>

          <Text style={styles.navText}>Histórico</Text>
        </Pressable>

        <View style={styles.navItem}>
          <Text style={styles.navIconActive}>▤</Text>

          <Text style={styles.navTextActive}>Artigos</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    flex: 1,
  },

  container: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },

  back: {
    color: colors.primary,
    fontSize: 42,
    lineHeight: 42,
  },

  logo: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "700",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
    marginBottom: 24,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
  },

  articleTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    backgroundColor: "#33260A",
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  badgeText: {
    color: colors.warning,
    fontSize: 8,
    fontWeight: "800",
  },

  year: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  articleTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 26,
    marginTop: 16,
  },

  authors: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 10,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },

  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },

  protocol: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 7,
  },

  doi: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  articleButton: {
    backgroundColor: colors.primary,
    borderRadius: 11,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginTop: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  articleButtonText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "800",
  },

  articleButtonArrow: {
    color: colors.background,
    fontSize: 17,
  },

  bottomNav: {
    height: 76,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    paddingBottom: 8,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    color: colors.textSecondary,
    fontSize: 19,
  },

  navIconActive: {
    color: colors.primary,
    fontSize: 20,
  },

  navText: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 3,
  },

  navTextActive: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
  },
});
