import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useCallback, useState } from "react";

import { router, useFocusEffect } from "expo-router";

import { ExecutionRecord, getHistory } from "../services/storage";

const colors = {
  background: "#0B0E14",
  surface: "#111827",
  border: "#1F2937",

  primary: "#38BDF8",
  success: "#22C55E",

  text: "#F8FAFC",
  textSecondary: "#94A3B8",
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<ExecutionRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadHistory() {
        const records = await getHistory();

        setHistory(records);
      }

      loadHistory();
    }, []),
  );

  function formatDate(date?: string) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString("pt-BR");
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

            <Text style={styles.title}>Histórico</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Execuções concluídas e registros experimentais.
        </Text>

        {history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nenhuma execução</Text>

            <Text style={styles.emptyText}>
              Os protocolos finalizados aparecerão aqui.
            </Text>

            <Pressable
              style={styles.protocolButton}
              onPress={() => router.push("/protocols")}
            >
              <Text style={styles.protocolButtonText}>ABRIR PROTOCOLOS</Text>
            </Pressable>
          </View>
        ) : (
          history.map((execution) => {
            const notes = Object.values(execution.notes).filter(
              (note) => note.trim() !== "",
            );

            return (
              <View key={execution.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.status}>✓ CONCLUÍDO</Text>

                  <Text style={styles.code}>PRT-001</Text>
                </View>

                <Text style={styles.protocolName}>
                  {execution.protocolName}
                </Text>

                <Text style={styles.date}>
                  {formatDate(execution.completedAt)}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionLabel}>CONFIGURAÇÃO</Text>

                <Text style={styles.data}>
                  {execution.numberOfCultures} culturas
                </Text>

                <Text style={styles.data}>
                  {execution.volumePerCulture} mL por cultura
                </Text>

                <Text style={styles.total}>
                  {execution.totalVolume} mL de TSB no total
                </Text>

                {notes.length > 0 && (
                  <>
                    <View style={styles.divider} />

                    <Text style={styles.sectionLabel}>ANOTAÇÕES</Text>

                    {notes.map((note, index) => (
                      <Text key={index} style={styles.note}>
                        • {note}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            );
          })
        )}
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

        <View style={styles.navItem}>
          <Text style={styles.navIconActive}>◷</Text>

          <Text style={styles.navTextActive}>Histórico</Text>
        </View>

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

  empty: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },

  protocolButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 18,
  },

  protocolButtonText: {
    color: colors.background,
    fontSize: 9,
    fontWeight: "800",
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 17,
    marginBottom: 14,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  status: {
    color: colors.success,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  code: {
    color: colors.textSecondary,
    fontSize: 9,
  },

  protocolName: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "700",
    marginTop: 10,
  },

  date: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 13,
  },

  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 7,
  },

  data: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 3,
  },

  total: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },

  note: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 4,
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
