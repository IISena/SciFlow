import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useCallback, useState } from "react";

import { router, useFocusEffect } from "expo-router";

import {
  ExecutionRecord,
  getActiveExecution,
  getHistory,
} from "../services/storage";

const colors = {
  background: "#0B0E14",

  surface: "#111827",
  surfaceSecondary: "#1E293B",

  border: "#1F2937",

  primary: "#38BDF8",
  warning: "#F59E0B",
  success: "#22C55E",

  text: "#F8FAFC",
  textSecondary: "#94A3B8",
};

const TOTAL_CFS_STEPS = 5;

export default function HomeScreen() {
  const [activeExecution, setActiveExecution] =
    useState<ExecutionRecord | null>(null);

  const [completedCount, setCompletedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      async function loadHome() {
        const active = await getActiveExecution();

        const history = await getHistory();

        setActiveExecution(active);
        setCompletedCount(history.length);
      }

      loadHome();
    }, []),
  );

  const currentStep = activeExecution
    ? activeExecution.currentStepIndex + 1
    : 0;

  const progress = activeExecution
    ? Math.round((currentStep / TOTAL_CFS_STEPS) * 100)
    : 0;

  const progressWidth = `${progress}%` as `${number}%`;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}

        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>SciFlow</Text>

            <Text style={styles.logoSubtitle}>Laboratório inteligente</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>GS</Text>
          </View>
        </View>

        {/* BOAS-VINDAS */}

        <View style={styles.welcome}>
          <Text style={styles.title}>Olá, Pesquisador</Text>

          <Text style={styles.subtitle}>
            Organize e acompanhe seus protocolos experimentais.
          </Text>
        </View>

        {/* PROTOCOLO ATIVO */}

        {activeExecution ? (
          <View style={styles.activeProtocol}>
            <View style={styles.activeTopRow}>
              <View>
                <View style={styles.statusRow}>
                  <View style={styles.activeDot} />

                  <Text style={styles.activeLabel}>PROTOCOLO ATIVO</Text>
                </View>

                <Text style={styles.protocolTitle}>
                  {activeExecution.protocolName}
                </Text>
              </View>

              <Text style={styles.code}>PRT-001</Text>
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                ETAPA {currentStep} DE {TOTAL_CFS_STEPS}
              </Text>

              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: progressWidth,
                  },
                ]}
              />
            </View>

            <Pressable
              style={styles.continueButton}
              onPress={() => router.push("/protocols/cfs-execution")}
            >
              <Text style={styles.continueText}>CONTINUAR PROTOCOLO</Text>

              <Text style={styles.continueArrow}>→</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyProtocol}>
            <Text style={styles.emptyLabel}>NENHUM PROTOCOLO ATIVO</Text>

            <Text style={styles.emptyTitle}>Pronto para começar?</Text>

            <Text style={styles.emptyDescription}>
              Escolha um protocolo na biblioteca e inicie uma nova execução.
            </Text>

            <Pressable
              style={styles.chooseButton}
              onPress={() => router.push("/protocols")}
            >
              <Text style={styles.chooseButtonText}>ABRIR BIBLIOTECA</Text>
            </Pressable>
          </View>
        )}

        {/* ACESSO RÁPIDO */}

        <Text style={styles.sectionTitle}>ACESSO RÁPIDO</Text>

        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickButton}
            onPress={() => router.push("/protocols")}
          >
            <Text style={styles.quickIcon}>🧪</Text>

            <Text style={styles.quickText}>Protocolos</Text>
          </Pressable>

          <Pressable
            style={styles.quickButton}
            onPress={() => router.push("/history")}
          >
            <Text style={styles.quickIcon}>◷</Text>

            <Text style={styles.quickText}>Histórico</Text>
          </Pressable>

          <Pressable
            style={styles.quickButton}
            onPress={() => router.push("/articles")}
          >
            <Text style={styles.quickIcon}>📄</Text>

            <Text style={styles.quickText}>Artigos</Text>
          </Pressable>
        </View>

        {/* VISÃO GERAL */}

        <Text style={styles.sectionTitle}>VISÃO GERAL</Text>

        <View style={styles.overviewCard}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>4</Text>

            <Text style={styles.overviewLabel}>Protocolos</Text>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewItem}>
            <Text
              style={[
                styles.overviewValue,
                {
                  color: colors.success,
                },
              ]}
            >
              {completedCount}
            </Text>

            <Text style={styles.overviewLabel}>Concluídos</Text>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewItem}>
            <Text
              style={[
                styles.overviewValue,
                {
                  color: colors.warning,
                },
              ]}
            >
              {activeExecution ? 1 : 0}
            </Text>

            <Text style={styles.overviewLabel}>Em andamento</Text>
          </View>
        </View>
      </ScrollView>

      {/* MENU INFERIOR */}

      <View style={styles.bottomNav}>
        <Pressable style={styles.navItem}>
          <Text style={styles.navIconActive}>⌂</Text>

          <Text style={styles.navTextActive}>Início</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },

  logo: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: "700",
  },

  logoSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: colors.text,
    fontWeight: "700",
  },

  welcome: {
    marginBottom: 24,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },

  activeProtocol: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
    padding: 19,
    marginBottom: 27,
  },

  activeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
    marginRight: 8,
  },

  activeLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  protocolTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "700",
  },

  code: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 23,
    marginBottom: 8,
  },

  progressText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },

  progressPercent: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  progressBackground: {
    height: 6,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    overflow: "hidden",
  },

  progressBar: {
    height: 6,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },

  continueButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 18,
    paddingTop: 15,
  },

  continueText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  continueArrow: {
    color: colors.primary,
    fontSize: 20,
  },

  emptyProtocol: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 27,
  },

  emptyLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "700",
    marginTop: 9,
  },

  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },

  chooseButton: {
    backgroundColor: colors.primary,
    borderRadius: 11,
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 17,
  },

  chooseButtonText: {
    color: colors.background,
    fontWeight: "800",
    fontSize: 11,
  },

  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 11,
  },

  quickActions: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 27,
  },

  quickButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 18,
    alignItems: "center",
  },

  quickIcon: {
    color: colors.primary,
    fontSize: 21,
    marginBottom: 7,
  },

  quickText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
  },

  overviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 20,
    flexDirection: "row",
  },

  overviewItem: {
    flex: 1,
    alignItems: "center",
  },

  overviewDivider: {
    width: 1,
    backgroundColor: colors.border,
  },

  overviewValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "700",
  },

  overviewLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 5,
    textAlign: "center",
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
