import { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button, Card, Field, Page, ui } from "@/components/protocol-ui";
import { protocolSteps, resultFields } from "@/constants/cim-cbm-protocol";
import { ExecutionRecord, finishExecution, getActiveExecution, updateExecution } from "@/services/storage";
import { formatTime, parsePositive, remainingSeconds } from "@/utils/execution";

function SavedField({ label, initial, save, multiline = false }: { label: string; initial: string; save: (value: string) => Promise<void>; multiline?: boolean }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(0);
  async function persist(next: string) {
    setPending(count => count + 1);
    try { await save(next); setError(false); } catch { setError(true); }
    finally { setPending(count => count - 1); }
  }
  return <View style={{ gap: 6 }}><Field label={label} value={value} multiline={multiline} onChangeText={next => { setValue(next); void persist(next); }} />
    <Text style={error ? ui.error : ui.muted}>{error ? "Falha ao salvar. Seu texto continua neste campo." : pending ? "Salvando..." : "Salvo neste dispositivo"}</Text>
    {error && <Button secondary title="Tentar salvar novamente" onPress={() => void persist(value)} />}
  </View>;
}

export default function ExecutionScreen() {
  const [execution, setExecution] = useState<ExecutionRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [minutes, setMinutes] = useState("");
  const [confirmFinish, setConfirmFinish] = useState(false);
  const finishing = useRef(false);
  useFocusEffect(useCallback(() => {
    let mounted = true;
    void getActiveExecution().then(record => { if (mounted) { setExecution(record); setLoaded(true); setError(""); } })
      .catch(() => { if (mounted) setError("Não foi possível abrir a execução. Volte ao início e tente novamente."); });
    return () => { mounted = false; };
  }, []));
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const step = execution ? protocolSteps[execution.currentStepIndex] : null;
  async function change(update: (record: ExecutionRecord) => ExecutionRecord) {
    if (!execution) return;
    setSaving(count => count + 1);
    try { const updated = await updateExecution(execution.id, update); setExecution(updated); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível salvar. Tente novamente."); throw reason; }
    finally { setSaving(count => count - 1); }
  }
  function perform(update: (record: ExecutionRecord) => ExecutionRecord) { void change(update).catch(() => undefined); }
  function configureTimer() {
    const duration = parsePositive(minutes);
    if (!step || duration === null || !Number.isSafeInteger(Math.round(duration * 60)) || duration * 60 < 1) { setError("Informe uma duração positiva em minutos (mínimo de 1 segundo)."); return; }
    const seconds = Math.round(duration * 60);
    perform(record => ({ ...record, timers: { ...record.timers, [step.id]: { remainingSeconds: seconds, isRunning: false, endAt: null } } }));
  }
  function toggleTimer() {
    if (!step) return;
    perform(record => {
      const timer = record.timers[step.id];
      if (!timer) return record;
      const remaining = remainingSeconds(timer);
      return { ...record, timers: { ...record.timers, [step.id]: { remainingSeconds: remaining, isRunning: !timer.isRunning && remaining > 0, endAt: !timer.isRunning && remaining > 0 ? Date.now() + remaining * 1000 : null } } };
    });
  }
  function move(delta: number) {
    if (!execution || !step) return;
    const next = execution.currentStepIndex + delta;
    if (next < 0 || next >= protocolSteps.length) return;
    setMinutes(""); setConfirmFinish(false);
    perform(record => ({ ...record, currentStepIndex: next }));
  }
  async function finish() {
    if (!execution || finishing.current) return;
    finishing.current = true; setSaving(count => count + 1);
    try { await finishExecution(execution.id); router.replace("/history"); }
    catch { setError("Não foi possível finalizar. Os dados foram preservados; tente novamente."); }
    finally { finishing.current = false; setSaving(count => count - 1); }
  }
  if (!loaded || !execution || !step) return <Page title="Execução" active="execution">
    {error ? <Text style={ui.error}>{error}</Text> : <Text style={ui.text}>{!loaded ? "Carregando..." : execution ? "Etapa indisponível para este registro." : "Nenhuma execução em andamento."}</Text>}
    <Button title="Abrir protocolo" onPress={() => router.replace("/protocols/cim-cbm")} />
  </Page>;
  const timer = execution.timers[step.id];
  const remaining = remainingSeconds(timer, now);
  const completed = execution.completedSteps ?? [];
  const allDone = protocolSteps.every(item => completed.includes(item.id));
  return <Page title="Execução de CIM e CBM" subtitle={`${execution.preparation?.bacteria ?? ""} • ${execution.preparation?.operator ?? ""}`} active="execution" resetKey={step.id}>
    <Text style={ui.kicker}>ETAPA {execution.currentStepIndex + 1} / {protocolSteps.length} • {completed.length} CONCLUÍDAS</Text>
    {error !== "" && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
    <Card><Text selectable style={ui.heading}>{step.title}</Text><Text selectable style={ui.text}>{step.instruction}</Text></Card>
    <Card><Text style={ui.heading}>Temporizador desta etapa</Text>
      <Text style={ui.muted}>Defina a duração de acordo com o POP e o planejamento do laboratório. Para intervalos de 18–24 h, informe o tempo escolhido. O término do temporizador não conclui a etapa automaticamente.</Text>
      {timer && <><Text selectable style={ui.timer}>{formatTime(remaining)}</Text><Text style={ui.kicker}>{remaining === 0 ? "TEMPO ENCERRADO" : timer.isRunning ? "EM ANDAMENTO" : "PAUSADO"}</Text></>}
      <Field label="Duração (minutos)" numeric value={minutes} onChangeText={setMinutes} />
      <Button secondary disabled={saving > 0 || Boolean(timer?.isRunning && remaining > 0)} title="Definir duração" onPress={configureTimer} />
      {timer && <Button disabled={saving > 0 || remaining === 0} title={timer.isRunning && remaining > 0 ? "Pausar temporizador" : "Iniciar / retomar temporizador"} onPress={toggleTimer} />}
      <Text style={ui.muted}>O tempo continua sendo contado ao sair da tela. Esta versão não emite notificações em segundo plano.</Text>
    </Card>
    <Card><Text style={ui.heading}>Anotações da etapa</Text><SavedField key={`${execution.id}-${step.id}`} label="Observações" initial={execution.notes[step.id] ?? ""} multiline save={value => change(record => ({ ...record, notes: { ...record.notes, [step.id]: value } }))} /></Card>
    {execution.currentStepIndex === 9 && <Card><Text style={ui.heading}>Ficha do experimento</Text><Text style={ui.muted}>Registre os valores observados e a avaliação dos controles. Finalizar o registro não declara a validade científica do ensaio.</Text>
      {resultFields.map(([key, label]) => <SavedField key={`${execution.id}-${key}`} label={label} initial={execution.results?.[key] ?? ""} multiline={key === "observations" || key === "controls"} save={value => change(record => ({ ...record, results: { ...record.results, [key]: value } }))} />)}
    </Card>}
    <Button secondary disabled={saving > 0} title={completed.includes(step.id) ? "✓ Etapa concluída — desmarcar" : "Marcar etapa como concluída"} onPress={() => perform(record => ({ ...record, completedSteps: completed.includes(step.id) ? (record.completedSteps ?? []).filter(id => id !== step.id) : [...new Set([...(record.completedSteps ?? []), step.id])] }))} />
    <View style={ui.row}><Button secondary disabled={saving > 0 || execution.currentStepIndex === 0} title="← Anterior" onPress={() => move(-1)} />
      {execution.currentStepIndex < 9 && <Button disabled={saving > 0} title="Próxima etapa →" onPress={() => move(1)} />}
    </View>
    {execution.currentStepIndex === 9 && <Card>
      {!allDone && <Text style={ui.muted}>Conclua as dez etapas antes de finalizar. Use a lista abaixo para revisar as pendentes.</Text>}
      <Button disabled={saving > 0 || !allDone} title="Finalizar execução" onPress={() => setConfirmFinish(true)} />
      {confirmFinish && <><Text style={ui.text}>Salvar a execução concluída no histórico? Os temporizadores serão encerrados.</Text><Button disabled={saving > 0} title="Confirmar finalização" onPress={() => void finish()} /><Button secondary title="Continuar revisando" onPress={() => setConfirmFinish(false)} /></>}
    </Card>}
    <Card><Text style={ui.heading}>Etapas do protocolo</Text>{protocolSteps.map((item, index) => <Button key={item.id} secondary disabled={saving > 0 || index === execution.currentStepIndex} title={`${completed.includes(item.id) ? "✓" : "○"} ${index + 1}. ${item.title}`} onPress={() => { setMinutes(""); setConfirmFinish(false); perform(record => ({ ...record, currentStepIndex: index })); }} />)}</Card>
  </Page>;
}
