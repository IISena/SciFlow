import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_EXECUTION_KEY = "@sciflow:active-execution";
const HISTORY_KEY = "@sciflow:history";

export type TimerState = {
  remainingSeconds: number;
  isRunning: boolean;
  endAt: number | null;
};

export type ExecutionRecord = {
  id: string;

  protocolId: string;
  protocolName: string;

  status: "in_progress" | "completed";

  startedAt: string;
  updatedAt: string;
  completedAt?: string;

  currentStepIndex: number;

  numberOfCultures: number;
  volumePerCulture: number;
  totalVolume: number;

  notes: Record<string, string>;

  timers: Record<string, TimerState>;
};

export async function saveActiveExecution(
  execution: ExecutionRecord,
): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_EXECUTION_KEY, JSON.stringify(execution));
  } catch (error) {
    console.error("Erro ao salvar execução ativa:", error);
  }
}

export async function getActiveExecution(): Promise<ExecutionRecord | null> {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_EXECUTION_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as ExecutionRecord;
  } catch (error) {
    console.error("Erro ao carregar execução ativa:", error);
    return null;
  }
}

export async function clearActiveExecution(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_EXECUTION_KEY);
  } catch (error) {
    console.error("Erro ao remover execução ativa:", error);
  }
}

export async function getHistory(): Promise<ExecutionRecord[]> {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data) as ExecutionRecord[];
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
    return [];
  }
}

export async function addToHistory(execution: ExecutionRecord): Promise<void> {
  try {
    const history = await getHistory();

    const historyWithoutDuplicate = history.filter(
      (item) => item.id !== execution.id,
    );

    const updatedHistory = [execution, ...historyWithoutDuplicate];

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
  }
}
