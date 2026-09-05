import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_EXECUTION_KEY = "@sciflow:active-execution";
const HISTORY_KEY = "@sciflow:history";
const LAST_VISITED_PROTOCOL_KEY = "@sciflow:last-visited-protocol";

export type ProtocolShortcut = { id: string; code: string; name: string; route: string };
export type TimerState = { remainingSeconds: number; isRunning: boolean; endAt: number | null };
export type Preparation = { bacteria: string; operator: string; compound: string; mhaMl: number; mhbMl: number; salineMl: number; mhaRate: number; mhbRate: number };
export type ExecutionRecord = {
  id: string; protocolId: string; protocolName: string;
  status: "in_progress" | "completed" | "archived";
  startedAt: string; updatedAt: string; completedAt?: string; archivedAt?: string;
  currentStepIndex: number;
  // Optional legacy values keep previous CFS records readable.
  numberOfCultures?: number; volumePerCulture?: number; totalVolume?: number;
  preparation?: Preparation;
  results?: Record<string, string>;
  completedSteps?: string[];
  notes: Record<string, string>;
  timers: Record<string, TimerState>;
};

// Serialize read-modify-write operations across the timer, notes and results screens.
let pending: Promise<unknown> = Promise.resolve();
function serial<T>(operation: () => Promise<T>): Promise<T> {
  const next = pending.then(operation);
  pending = next.catch(() => undefined);
  return next;
}
async function readActive(): Promise<ExecutionRecord | null> {
  const data = await AsyncStorage.getItem(ACTIVE_EXECUTION_KEY);
  return data ? JSON.parse(data) as ExecutionRecord : null;
}
async function readHistory(): Promise<ExecutionRecord[]> {
  const data = await AsyncStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) as ExecutionRecord[] : [];
}
async function writeHistory(record: ExecutionRecord) {
  const history = await readHistory();
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([record, ...history.filter(item => item.id !== record.id)]));
}

export function getActiveExecution(): Promise<ExecutionRecord | null> {
  return serial(async () => {
    const active = await readActive();
    if (active && active.protocolId !== "cim-cbm") {
      // Archive first: any failure leaves the original active record intact.
      await writeHistory({ ...active, status: "archived", archivedAt: new Date().toISOString() });
      await AsyncStorage.removeItem(ACTIVE_EXECUTION_KEY);
      return null;
    }
    return active;
  });
}
export function getHistory(): Promise<ExecutionRecord[]> { return serial(readHistory); }
export function startExecution(record: ExecutionRecord): Promise<void> {
  return serial(async () => {
    if (await readActive()) throw new Error("Já existe uma execução ativa. Retome-a antes de iniciar outra.");
    await AsyncStorage.setItem(ACTIVE_EXECUTION_KEY, JSON.stringify(record));
  });
}
export function updateExecution(id: string, change: (record: ExecutionRecord) => ExecutionRecord): Promise<ExecutionRecord> {
  return serial(async () => {
    const active = await readActive();
    if (!active || active.id !== id) throw new Error("A execução ativa mudou. Abra novamente a tela.");
    const updated = { ...change(active), updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(ACTIVE_EXECUTION_KEY, JSON.stringify(updated));
    return updated;
  });
}
export function finishExecution(id: string): Promise<void> {
  return serial(async () => {
    const active = await readActive();
    if (!active || active.id !== id) throw new Error("Execução não encontrada.");
    const now = new Date().toISOString();
    const timers = Object.fromEntries(Object.entries(active.timers).map(([key, timer]) => [key, {
      remainingSeconds: timer.isRunning && timer.endAt !== null ? Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000)) : timer.remainingSeconds,
      isRunning: false, endAt: null,
    }]));
    await writeHistory({ ...active, timers, status: "completed", completedAt: now, updatedAt: now });
    await AsyncStorage.removeItem(ACTIVE_EXECUTION_KEY);
  });
}
export async function saveLastVisitedProtocol(protocol: ProtocolShortcut): Promise<void> {
  await AsyncStorage.setItem(LAST_VISITED_PROTOCOL_KEY, JSON.stringify(protocol));
}
