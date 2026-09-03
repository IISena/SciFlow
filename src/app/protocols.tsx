import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { useState } from "react";

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

const protocols = [
  {
    id: "cfs",
    code: "PRT-001",
    name: "Produção de CFS",
    category: "Preparo de amostra",
    organism: "Xenorhabdus / Photorhabdus",
    available: true,
  },

  {
    id: "inhibition",
    code: "PRT-002",
    name: "Inibição do crescimento micelial",
    category: "Atividade antifúngica",
    organism: "Sclerotinia sclerotiorum",
    available: false,
  },

  {
    id: "vocs",
    code: "PRT-003",
    name: "Teste de VOCs",
    category: "Compostos orgânicos voláteis",
    organism: "Xenorhabdus szentirmaii",
    available: false,
  },

  {
    id: "seeds",
    code: "PRT-004",
    name: "Proteção de sementes de soja",
    category: "Proteção de sementes",
    organism: "Glycine max",
    available: false,
  },
];

export default function ProtocolsScreen() {
  const [search, setSearch] = useState("");

  const filteredProtocols = protocols.filter((protocol) =>
    protocol.name.toLowerCase().includes(search.toLowerCase()),
  );

  function openProtocol(protocolId: string, available: boolean) {
    if (protocolId === "cfs" && available) {
      router.push("/protocols/cfs");

      return;
    }

    Alert.alert(
      "Protocolo em desenvolvimento",
      "Este protocolo será disponibilizado em uma próxima versão do SciFlow.",
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.logo}>SciFlow</Text>

            <Text style={styles.title}>Biblioteca</Text>
          </View>
        </View>

        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Pesquisar protocolos..."
          placeholderTextColor={colors.textSecondary}
        />

        <View style={styles.filters}>
          <View style={styles.activeFilter}>
            <Text style={styles.activeFilterText}>Todos</Text>
          </View>

          <View style={styles.filter}>
            <Text style={styles.filterText}>Antifúngico</Text>
          </View>

          <View style={styles.filter}>
            <Text style={styles.filterText}>Sementes</Text>
          </View>
        </View>

        {filteredProtocols.map((protocol) => (
          <Pressable
            key={protocol.id}
            style={[styles.card, protocol.available && styles.featuredCard]}
            onPress={() => openProtocol(protocol.id, protocol.available)}
          >
            <View style={styles.cardTop}>
              <View
                style={
                  protocol.available ? styles.codeBadgeActive : styles.codeBadge
                }
              >
                <Text
                  style={protocol.available ? styles.codeActive : styles.code}
                >
                  {protocol.code}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </View>

            <Text style={styles.protocolName}>{protocol.name}</Text>

            <Text style={styles.category}>{protocol.category}</Text>

            <View style={styles.divider} />

            <View style={styles.footer}>
              <Text style={styles.organism}>{protocol.organism}</Text>

              <Text
                style={protocol.available ? styles.available : styles.future}
              >
                {protocol.available ? "DISPONÍVEL" : "EM BREVE"}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem} onPress={() => router.replace("/")}>
          <Text style={styles.navIcon}>⌂</Text>

          <Text style={styles.navText}>Início</Text>
        </Pressable>

        <View style={styles.navItem}>
          <Text style={styles.navIconActive}>⚗</Text>

          <Text style={styles.navTextActive}>Protocolos</Text>
        </View>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/history")}
        >
          <Text style={styles.navIcon}>◷</Text>

          <Text style={styles.navText}>Histórico</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.push("/articles")}
        >
          <Text style={styles.navIcon}>▤</Text>

          <Text style={styles.navText}>Artigos</Text>
        </Pressable>
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
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
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

  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    color: colors.text,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 14,
  },

  filters: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },

  activeFilter: {
    backgroundColor: colors.warning,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },

  activeFilterText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "800",
  },

  filter: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  filterText: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 17,
    marginBottom: 13,
  },

  featuredCard: {
    borderColor: "#6B4A0B",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  codeBadge: {
    backgroundColor: "#1E293B",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  codeBadgeActive: {
    backgroundColor: "#33260A",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  code: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
  },

  codeActive: {
    color: colors.warning,
    fontSize: 9,
    fontWeight: "700",
  },

  arrow: {
    color: colors.textSecondary,
    fontSize: 25,
  },

  protocolName: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "700",
    marginTop: 11,
  },

  category: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },

  organism: {
    flex: 1,
    color: colors.primary,
    fontSize: 10,
  },

  available: {
    color: colors.success ?? "#22C55E",
    fontSize: 8,
    fontWeight: "800",
  },

  future: {
    color: colors.textSecondary,
    fontSize: 8,
    fontWeight: "700",
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
