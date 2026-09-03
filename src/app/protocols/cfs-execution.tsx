import { useEffect, useState } from "react";

import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { router } from "expo-router";

import {
    ExecutionRecord,
    TimerState,
    addToHistory,
    clearActiveExecution,
    getActiveExecution,
    saveActiveExecution,
} from "../../services/storage";

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

type ProtocolStep = {
  id: string;
  title: string;
  instruction: string;

  parameters?: {
    label: string;
    value: string;
  }[];

  timerSeconds?: number;
};

const steps: ProtocolStep[] = [
  {
    id: "prepare-culture",

    title: "Preparar cultura bacteriana",

    instruction:
      "Preparar a cultura bacteriana utilizando meio TSB para iniciar a produção do sobrenadante livre de células.",

    parameters: [
      {
        label: "Meio",
        value: "TSB",
      },
    ],
  },

  {
    id: "incubation",

    title: "Incubação sob agitação",

    instruction:
      "Incubar a cultura bacteriana em TSB sob agitação constante durante o período determinado.",

    parameters: [
      {
        label: "Temperatura",
        value: "27°C",
      },

      {
        label: "Agitação",
        value: "150 rpm",
      },

      {
        label: "Tempo",
        value: "144 h",
      },
    ],

    timerSeconds: 144 * 60 * 60,
  },

  {
    id: "centrifugation",

    title: "Centrifugação",

    instruction:
      "Centrifugar a cultura para separar as células bacterianas do sobrenadante.",

    parameters: [
      {
        label: "Força",
        value: "3067.34 RCF",
      },

      {
        label: "Temperatura",
        value: "4°C",
      },

      {
        label: "Tempo",
        value: "60 min",
      },
    ],

    timerSeconds: 60 * 60,
  },

  {
    id: "supernatant",

    title: "Recuperar sobrenadante",

    instruction:
      "Após a centrifugação, recuperar cuidadosamente o sobrenadante, evitando transferir o material celular sedimentado.",
  },

  {
    id: "filtration",

    title: "Filtração",

    instruction:
      "Filtrar o sobrenadante recuperado utilizando filtro estéril para obtenção do sobrenadante livre de células (CFS).",

    parameters: [
      {
        label: "Filtro",
        value: "0,22 µm",
      },
    ],
  },
];

export default function CFSExecutionScreen() {
  const [execution, setExecution] = useState<ExecutionRecord | null>(null);

  const [loaded, setLoaded] = useState(false);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [timeRemaining, setTimeRemaining] = useState(0);

  const [isRunning, setIsRunning] = useState(false);

  const [showNotes, setShowNotes] = useState(false);

  const currentStep = steps[currentStepIndex];

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const progressWidth = `${progress}%` as `${number}%`;

  useEffect(() => {
    async function loadExecution() {
      const saved = await getActiveExecution();

      if (saved) {
        setExecution(saved);

        setCurrentStepIndex(saved.currentStepIndex);
      }

      setLoaded(true);
    }

    loadExecution();
  }, []);

  useEffect(() => {
    if (!loaded || !execution || !currentStep) {
      return;
    }

    if (!currentStep.timerSeconds) {
      setTimeRemaining(0);
      setIsRunning(false);
      return;
    }

    const savedTimer = execution.timers[currentStep.id];

    if (!savedTimer) {
      setTimeRemaining(currentStep.timerSeconds);

      setIsRunning(false);

      return;
    }

    if (savedTimer.isRunning && savedTimer.endAt) {
      const remaining = calculateRemainingTime(savedTimer.endAt);

      setTimeRemaining(remaining);

      setIsRunning(remaining > 0);

      if (remaining === 0) {
        void saveTimer({
          remainingSeconds: 0,
          isRunning: false,
          endAt: null,
        });
      }

      return;
    }

    setTimeRemaining(savedTimer.remainingSeconds);

    setIsRunning(false);
  }, [loaded, currentStepIndex, execution?.id]);

  useEffect(() => {
    if (!isRunning || !execution || !currentStep.timerSeconds) {
      return;
    }

    const timer = execution.timers[currentStep.id];

    if (!timer?.endAt) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateRemainingTime(timer.endAt as number);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setIsRunning(false);

        clearInterval(interval);

        void saveTimer({
          remainingSeconds: 0,
          isRunning: false,
          endAt: null,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentStep.id, execution?.id]);

  function calculateRemainingTime(endAt: number) {
    return Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  }

  function formatTime(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  async function saveTimer(timerState: TimerState) {
    if (!execution) {
      return;
    }

    const updated: ExecutionRecord = {
      ...execution,

      updatedAt: new Date().toISOString(),

      timers: {
        ...execution.timers,

        [currentStep.id]: timerState,
      },
    };

    setExecution(updated);

    await saveActiveExecution(updated);
  }

  async function startTimer() {
    if (!currentStep.timerSeconds || timeRemaining <= 0) {
      return;
    }

    const endAt = Date.now() + timeRemaining * 1000;

    const timerState: TimerState = {
      remainingSeconds: timeRemaining,

      isRunning: true,

      endAt,
    };

    await saveTimer(timerState);

    setIsRunning(true);
  }

  async function pauseTimer() {
    if (!execution) {
      return;
    }

    const currentTimer = execution.timers[currentStep.id];

    let remaining = timeRemaining;

    if (currentTimer?.endAt) {
      remaining = calculateRemainingTime(currentTimer.endAt);
    }

    setTimeRemaining(remaining);

    setIsRunning(false);

    await saveTimer({
      remainingSeconds: remaining,

      isRunning: false,

      endAt: null,
    });
  }

  async function resetTimer() {
    if (!currentStep.timerSeconds) {
      return;
    }

    setIsRunning(false);

    setTimeRemaining(currentStep.timerSeconds);

    await saveTimer({
      remainingSeconds: currentStep.timerSeconds,

      isRunning: false,

      endAt: null,
    });
  }

  async function saveNote(text: string) {
    if (!execution) {
      return;
    }

    const updated: ExecutionRecord = {
      ...execution,

      updatedAt: new Date().toISOString(),

      notes: {
        ...execution.notes,

        [currentStep.id]: text,
      },
    };

    setExecution(updated);

    await saveActiveExecution(updated);
  }

  async function changeStep(index: number) {
    if (!execution) {
      return;
    }

    if (index < 0 || index >= steps.length) {
      return;
    }

    const updated: ExecutionRecord = {
      ...execution,

      currentStepIndex: index,

      updatedAt: new Date().toISOString(),
    };

    setExecution(updated);

    setCurrentStepIndex(index);

    setShowNotes(false);

    await saveActiveExecution(updated);
  }

  async function nextStep() {
    if (currentStepIndex < steps.length - 1) {
      await changeStep(currentStepIndex + 1);

      return;
    }

    confirmFinish();
  }

  async function previousStep() {
    if (currentStepIndex > 0) {
      await changeStep(currentStepIndex - 1);
    }
  }

  function confirmFinish() {
    Alert.alert(
      "Finalizar protocolo?",
      "A execução será registrada no histórico do SciFlow.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },

        {
          text: "Finalizar",
          onPress: () => {
            void finishProtocol();
          },
        },
      ],
    );
  }

  async function finishProtocol() {
    if (!execution) {
      return;
    }

    const now = new Date().toISOString();

    const completed: ExecutionRecord = {
      ...execution,

      status: "completed",

      currentStepIndex: steps.length - 1,

      updatedAt: now,

      completedAt: now,
    };

    await addToHistory(completed);

    await clearActiveExecution();

    setExecution(null);

    router.replace("/history");
  }

  if (!loaded) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.loading}>Carregando protocolo...</Text>
      </View>
    );
  }

  if (!execution) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.noExecutionTitle}>Nenhuma execução ativa</Text>

        <Text style={styles.noExecutionText}>
          Inicie o protocolo de Produção de CFS antes de acessar esta tela.
        </Text>

        <Pressable
          style={styles.returnButton}
          onPress={() => router.replace("/protocols/cfs")}
        >
          <Text style={styles.returnButtonText}>ABRIR PROTOCOLO</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.logo}>SciFlow</Text>

            <Text style={styles.headerSubtitle}>Execução de protocolo</Text>
          </View>
        </View>

        <View style={styles.protocolHeader}>
          <View style={styles.statusRow}>
            <View style={styles.activeDot} />

            <Text style={styles.activeText}>PROTOCOLO EM EXECUÇÃO</Text>
          </View>

          <Text style={styles.protocolName}>Produção de CFS</Text>

          <Text style={styles.protocolCode}>PRT-001</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              ETAPA {currentStepIndex + 1} DE {steps.length}
            </Text>

            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
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
        </View>

        <View style={styles.stepCard}>
          <Text style={styles.stepNumber}>ETAPA {currentStepIndex + 1}</Text>

          <Text style={styles.stepTitle}>{currentStep.title}</Text>

          <Text style={styles.instruction}>{currentStep.instruction}</Text>

          {currentStep.parameters && currentStep.parameters.length > 0 && (
            <View style={styles.parameters}>
              {currentStep.parameters.map((parameter) => (
                <View key={parameter.label} style={styles.parameterCard}>
                  <Text style={styles.parameterValue}>{parameter.value}</Text>

                  <Text style={styles.parameterLabel}>{parameter.label}</Text>
                </View>
              ))}
            </View>
          )}

          {currentStep.timerSeconds && (
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>TEMPO RESTANTE</Text>

              <Text style={styles.timerValue}>{formatTime(timeRemaining)}</Text>

              <View style={styles.timerActions}>
                <Pressable
                  style={[styles.timerButton, isRunning && styles.pauseButton]}
                  onPress={() => {
                    if (isRunning) {
                      void pauseTimer();
                    } else {
                      void startTimer();
                    }
                  }}
                >
                  <Text style={styles.timerButtonText}>
                    {isRunning
                      ? "PAUSAR"
                      : timeRemaining === currentStep.timerSeconds
                        ? "INICIAR"
                        : "CONTINUAR"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.resetButton}
                  onPress={() => void resetTimer()}
                >
                  <Text style={styles.resetButtonText}>REINICIAR</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <Pressable
          style={styles.notesButton}
          onPress={() => setShowNotes(!showNotes)}
        >
          <Text style={styles.notesIcon}>＋</Text>

          <Text style={styles.notesButtonText}>ADICIONAR ANOTAÇÃO</Text>
        </Pressable>

        {showNotes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesLabel}>ANOTAÇÃO DA ETAPA</Text>

            <TextInput
              style={styles.notesInput}
              multiline
              textAlignVertical="top"
              value={execution.notes[currentStep.id] ?? ""}
              onChangeText={saveNote}
              placeholder="Registre observações, alterações ou resultados..."
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.notesHint}>
              As anotações são salvas automaticamente.
            </Text>
          </View>
        )}

        <View style={styles.navigation}>
          <Pressable
            disabled={currentStepIndex === 0}
            style={[
              styles.previousButton,

              currentStepIndex === 0 && styles.disabledButton,
            ]}
            onPress={() => void previousStep()}
          >
            <Text
              style={[
                styles.previousText,

                currentStepIndex === 0 && styles.disabledText,
              ]}
            >
              ← ANTERIOR
            </Text>
          </Pressable>

          <Pressable style={styles.nextButton} onPress={() => void nextStep()}>
            <Text style={styles.nextButtonText}>
              {currentStepIndex === steps.length - 1 ? "FINALIZAR" : "PRÓXIMA"}
            </Text>

            <Text style={styles.nextArrow}>
              {currentStepIndex === steps.length - 1 ? "✓" : "→"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.stepsSummary}>
          <Text style={styles.summaryTitle}>ETAPAS DO PROTOCOLO</Text>

          {steps.map((step, index) => {
            const completed = index < currentStepIndex;

            const active = index === currentStepIndex;

            return (
              <Pressable
                key={step.id}
                style={styles.summaryItem}
                onPress={() => void changeStep(index)}
              >
                <View
                  style={[
                    styles.summaryNumber,

                    completed && styles.summaryCompleted,

                    active && styles.summaryActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryNumberText,

                      (completed || active) && styles.summaryNumberActiveText,
                    ]}
                  >
                    {completed ? "✓" : index + 1}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.summaryStepName,

                    active && styles.summaryActiveText,
                  ]}
                >
                  {step.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  centerScreen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  loading: {
    color: colors.textSecondary,
  },

  noExecutionTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "700",
  },

  noExecutionText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  returnButton: {
    backgroundColor: colors.primary,
    borderRadius: 11,
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginTop: 20,
  },

  returnButtonText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "800",
  },

  container: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 27,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  backIcon: {
    color: colors.primary,
    fontSize: 34,
    lineHeight: 35,
  },

  logo: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 10,
  },

  protocolHeader: {
    marginBottom: 20,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
    marginRight: 7,
  },

  activeText: {
    color: colors.warning,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  protocolName: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "700",
  },

  protocolCode: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },

  progressCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 15,
    marginBottom: 16,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  progressLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  progressPercent: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
  },

  progressBackground: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    overflow: "hidden",
  },

  progressBar: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },

  stepCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    padding: 19,
    marginBottom: 14,
  },

  stepNumber: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  stepTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 11,
  },

  instruction: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
  },

  parameters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },

  parameterCard: {
    flexGrow: 1,
    minWidth: "29%",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 11,
    alignItems: "center",
  },

  parameterValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  parameterLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 4,
  },

  timerCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 17,
    marginTop: 18,
  },

  timerLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  timerValue: {
    color: colors.warning,
    fontSize: 34,
    fontWeight: "700",
    marginTop: 7,
    marginBottom: 15,
  },

  timerActions: {
    flexDirection: "row",
    gap: 9,
  },

  timerButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

  pauseButton: {
    backgroundColor: colors.warning,
  },

  timerButtonText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "800",
  },

  resetButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    justifyContent: "center",
  },

  resetButtonText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
  },

  notesButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  notesIcon: {
    color: colors.primary,
    fontSize: 20,
    marginRight: 7,
  },

  notesButtonText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  notesCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    padding: 15,
    marginBottom: 14,
  },

  notesLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 9,
  },

  notesInput: {
    minHeight: 110,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 12,
    color: colors.text,
    fontSize: 13,
  },

  notesHint: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 7,
  },

  navigation: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 25,
  },

  previousButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  previousText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
  },

  disabledButton: {
    borderColor: colors.border,
  },

  disabledText: {
    color: colors.textSecondary,
  },

  nextButton: {
    flex: 1.2,
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  nextButtonText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: "800",
  },

  nextArrow: {
    color: colors.background,
    fontSize: 17,
    fontWeight: "700",
  },

  stepsSummary: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 18,
  },

  summaryTitle: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 13,
  },

  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryNumber: {
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  summaryCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },

  summaryActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  summaryNumberText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  summaryNumberActiveText: {
    color: colors.background,
  },

  summaryStepName: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  summaryActiveText: {
    color: colors.text,
    fontWeight: "600",
  },
});
