import { useState } from "react";

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

  text: "#F8FAFC",
  textSecondary: "#94A3B8",
};

export default function CFSProtocolScreen() {
  const [numberOfCultures, setNumberOfCultures] = useState("");

  const [volumePerCulture, setVolumePerCulture] = useState("");

  const [totalVolume, setTotalVolume] = useState<number | null>(null);

  function parseNumber(value: string) {
    return Number(value.replace(",", "."));
  }

  function calculateVolume() {
    const cultures = parseNumber(numberOfCultures);

    const volume = parseNumber(volumePerCulture);

    if (cultures <= 0 || volume <= 0) {
      Alert.alert("Dados incompletos", "Informe valores maiores que zero.");

      return;
    }

    setTotalVolume(cultures * volume);
  }

  async function createExecution(cultures: number, volume: number) {
    const now = new Date().toISOString();

    const execution: ExecutionRecord = {
      id: Date.now().toString(),

      protocolId: "cfs",

      protocolName: "Produção de CFS",

      status: "in_progress",

      startedAt: now,
      updatedAt: now,

      currentStepIndex: 0,

      numberOfCultures: cultures,

      volumePerCulture: volume,

      totalVolume: cultures * volume,

      notes: {},

      timers: {},
    };

    await saveActiveExecution(execution);

    router.push("/protocols/cfs-execution");
  }

  async function startProtocol() {
    const cultures = parseNumber(numberOfCultures);

    const volume = parseNumber(volumePerCulture);

    if (cultures <= 0 || volume <= 0) {
      Alert.alert(
        "Prepare o experimento",
        "Informe o número de culturas e o volume de TSB por cultura antes de iniciar.",
      );

      return;
    }

    const active = await getActiveExecution();

    if (active) {
      Alert.alert(
        "Já existe um protocolo em andamento",
        "Você pode continuar a execução atual ou iniciar uma nova execução.",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },

          {
            text: "Continuar atual",
            onPress: () => router.push("/protocols/cfs-execution"),
          },

          {
            text: "Iniciar nova",
            style: "destructive",

            onPress: () => {
              void createExecution(cultures, volume);
            },
          },
        ],
      );

      return;
    }

    await createExecution(cultures, volume);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>

          <Text style={styles.logo}>SciFlow</Text>
        </View>

        <View style={styles.protocolHeader}>
          <View style={styles.codeBadge}>
            <Text style={styles.code}>PRT-001</Text>
          </View>

          <Text style={styles.title}>Produção de CFS</Text>

          <Text style={styles.subtitle}>
            Produção de sobrenadante livre de células
          </Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.category}>PREPARO DE AMOSTRA</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SOBRE O PROTOCOLO</Text>

          <Text style={styles.description}>
            Produção de sobrenadante livre de células (CFS) a partir de culturas
            bacterianas de Xenorhabdus spp. e Photorhabdus spp. para utilização
            em ensaios de atividade antifúngica.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>CONDIÇÕES DE CULTIVO</Text>

        <View style={styles.conditions}>
          <View style={styles.conditionCard}>
            <Text style={styles.conditionValue}>27°C</Text>

            <Text style={styles.conditionLabel}>Temperatura</Text>
          </View>

          <View style={styles.conditionCard}>
            <Text style={styles.conditionValue}>150</Text>

            <Text style={styles.conditionUnit}>rpm</Text>

            <Text style={styles.conditionLabel}>Agitação</Text>
          </View>

          <View style={styles.conditionCard}>
            <Text style={styles.conditionValue}>144 h</Text>

            <Text style={styles.conditionLabel}>Incubação</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PROCESSAMENTO</Text>

          <Parameter name="Centrifugação" value="3067.34 RCF" />

          <Divider />

          <Parameter name="Temperatura" value="4°C" />

          <Divider />

          <Parameter name="Tempo" value="60 min" />

          <Divider />

          <Parameter name="Filtração" value="0,22 µm" />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>MATERIAIS PRINCIPAIS</Text>

          <Material
            number="01"
            name="Meio TSB"
            description="Tryptic Soy Broth"
          />

          <Material
            number="02"
            name="Cultura bacteriana"
            description="Xenorhabdus ou Photorhabdus"
          />

          <Material number="03" name="Recipientes para centrifugação" />

          <Material
            number="04"
            name="Filtro estéril"
            description="Porosidade 0,22 µm"
          />

          <Material
            number="05"
            name="Recipiente estéril"
            description="Coleta do sobrenadante"
          />
        </View>

        <View style={styles.calculatorCard}>
          <Text style={styles.sectionTitle}>PREPARAR EXPERIMENTO</Text>

          <Text style={styles.calculatorSubtitle}>
            Dimensione o volume de TSB para esta execução.
          </Text>

          <Text style={styles.inputLabel}>Número de culturas</Text>

          <TextInput
            value={numberOfCultures}
            onChangeText={setNumberOfCultures}
            style={styles.input}
            keyboardType="numeric"
            placeholder="Ex.: 4"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.inputLabel}>Volume de TSB por cultura</Text>

          <View style={styles.inputContainer}>
            <TextInput
              value={volumePerCulture}
              onChangeText={setVolumePerCulture}
              style={styles.inputWithUnit}
              keyboardType="decimal-pad"
              placeholder="Ex.: 300"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.inputUnit}>mL</Text>
          </View>

          <Pressable style={styles.calculateButton} onPress={calculateVolume}>
            <Text style={styles.calculateButtonText}>CALCULAR</Text>
          </Pressable>

          {totalVolume !== null && (
            <View style={styles.result}>
              <Text style={styles.resultLabel}>VOLUME TOTAL DE TSB</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultValue}>
                  {totalVolume.toLocaleString("pt-BR")}
                </Text>

                <Text style={styles.resultUnit}>mL</Text>
              </View>

              <Text style={styles.resultFormula}>
                {numberOfCultures} × {volumePerCulture} mL
              </Text>
            </View>
          )}
        </View>

        <View style={styles.referenceCard}>
          <Text style={styles.sectionTitle}>FONTE CIENTÍFICA</Text>

          <Text style={styles.referenceAuthors}>
            Chacón-Orozco et al., 2020
          </Text>

          <Text style={styles.referenceTitle}>
            Antifungal activity of Xenorhabdus spp. and Photorhabdus spp.
            against the soybean pathogenic Sclerotinia sclerotiorum.
          </Text>

          <Text style={styles.referenceJournal}>
            Scientific Reports, 10, 20649.
          </Text>

          <Text style={styles.doi}>DOI: 10.1038/s41598-020-77472-6</Text>
        </View>

        <Pressable style={styles.startButton} onPress={startProtocol}>
          <Text style={styles.startButtonText}>INICIAR PROTOCOLO</Text>

          <Text style={styles.startArrow}>→</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function Parameter({ name, value }: { name: string; value: string }) {
  return (
    <View style={styles.parameterRow}>
      <Text style={styles.parameterName}>{name}</Text>

      <Text style={styles.parameterValue}>{value}</Text>
    </View>
  );
}

function Material({
  number,
  name,
  description,
}: {
  number: string;
  name: string;
  description?: string;
}) {
  return (
    <View style={styles.materialItem}>
      <View style={styles.materialNumber}>
        <Text style={styles.materialNumberText}>{number}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.materialName}>{name}</Text>

        {description && (
          <Text style={styles.materialDescription}>{description}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 60,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  backIcon: {
    color: colors.primary,
    fontSize: 34,
    lineHeight: 35,
  },

  logo: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "700",
  },

  protocolHeader: {
    marginBottom: 22,
  },

  codeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#33260A",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginBottom: 11,
  },

  code: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: "700",
  },

  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 12,
  },

  category: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    padding: 17,
    marginBottom: 18,
  },

  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 11,
  },

  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 9,
  },

  description: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 21,
  },

  conditions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },

  conditionCard: {
    flex: 1,
    minHeight: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  conditionValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  conditionUnit: {
    color: colors.primary,
    fontSize: 9,
  },

  conditionLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 5,
  },

  parameterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  parameterName: {
    color: colors.text,
    fontSize: 13,
  },

  parameterValue: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 13,
  },

  materialItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
  },

  materialNumber: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  materialNumberText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "700",
  },

  materialName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500",
  },

  materialDescription: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },

  calculatorCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#256D86",
    borderRadius: 17,
    padding: 17,
    marginBottom: 18,
  },

  calculatorSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: -4,
    marginBottom: 17,
  },

  inputLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 6,
  },

  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    color: colors.text,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 14,
  },

  inputContainer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    alignItems: "center",
    marginBottom: 16,
  },

  inputWithUnit: {
    flex: 1,
    color: colors.text,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },

  inputUnit: {
    color: colors.textSecondary,
    paddingRight: 14,
  },

  calculateButton: {
    backgroundColor: colors.primary,
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
  },

  calculateButtonText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  result: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    padding: 15,
    marginTop: 16,
  },

  resultLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  resultRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },

  resultValue: {
    color: colors.warning,
    fontSize: 30,
    fontWeight: "700",
  },

  resultUnit: {
    color: colors.warning,
    marginLeft: 5,
  },

  resultFormula: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  referenceCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    padding: 17,
    marginBottom: 22,
  },

  referenceAuthors: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  referenceTitle: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  referenceJournal: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 7,
  },

  doi: {
    color: colors.textSecondary,
    fontSize: 9,
    marginTop: 4,
  },

  startButton: {
    backgroundColor: colors.warning,
    borderRadius: 13,
    paddingHorizontal: 17,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  startButtonText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  startArrow: {
    color: colors.background,
    fontSize: 21,
  },
});
