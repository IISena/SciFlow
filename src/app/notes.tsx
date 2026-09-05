import { useCallback, useRef, useState } from "react";
import { Text } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Page, Card, Field, Button, ui } from "@/components/protocol-ui";
import { protocolSteps } from "@/constants/cim-cbm-protocol";
import { ExecutionRecord, getActiveExecution, getHistory, updateExecution } from "@/services/storage";

export default function NotesScreen() {
  const [active, setActive] = useState<ExecutionRecord | null>(null);
  const [history, setHistory] = useState<ExecutionRecord[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useFocusEffect(useCallback(() => {
    let mounted = true;
    void (async () => {
      const record = await getActiveExecution();
      const records = await getHistory();
      if (mounted) { setActive(record); setHistory(records); setLoaded(true); setError(""); }
    })().catch(() => { if (mounted) setError("Não foi possível carregar as anotações."); });
    return () => { mounted = false; };
  }, []));
  async function save() {
    if (!active || lock.current) return;
    if (!draft.trim()) { setError("Escreva uma observação antes de salvar."); return; }
    lock.current = true; setBusy(true);
    try {
      const text = draft.trim();
      const key = "entry:" + new Date().toISOString();
      const updated = await updateExecution(active.id, record => ({ ...record, notes: { ...record.notes, [key]: text } }));
      setActive(updated); setDraft(""); setError("");
    } catch { setError("Não foi possível salvar. Seu texto permanece no campo para tentar novamente."); }
    finally { setBusy(false); lock.current = false; }
  }
  const records = [...(active ? [active] : []), ...history.filter(record => record.id !== active?.id)];
  return <Page title="Diário de bancada" subtitle="Anotações reais das execuções, salvas neste dispositivo." active="notes">
    {error !== "" && <Text style={ui.error}>{error}</Text>}
    {!loaded ? <Text style={ui.muted}>Carregando...</Text> : active ? <Card>
      <Text style={ui.heading}>Novo registro</Text><Text style={ui.muted}>{active.protocolName} • {active.preparation?.bacteria}</Text>
      <Field label="Anotação" value={draft} onChangeText={setDraft} multiline editable={!busy} />
      <Button disabled={busy} title={busy ? "Salvando..." : "Salvar anotação"} onPress={() => void save()} />
    </Card> : <Card><Text style={ui.text}>Inicie uma execução para adicionar anotações.</Text><Button title="Abrir protocolo" onPress={() => router.push("/protocols/cim-cbm")} /></Card>}
    {records.map(record => {
      const entries = Object.entries(record.notes).filter(([, text]) => text.trim());
      if (!entries.length) return null;
      return <Card key={record.id}>
        <Text selectable style={ui.heading}>{record.protocolName}</Text>
        <Text style={ui.kicker}>{record.status === "in_progress" ? "EXECUÇÃO ATIVA" : record.status === "archived" ? "REGISTRO ANTERIOR ARQUIVADO" : "EXECUÇÃO CONCLUÍDA"} • {new Date(record.startedAt).toLocaleDateString("pt-BR")}</Text>
        {entries.map(([key, text]) => <Card key={key}>
          <Text style={ui.kicker}>{key.startsWith("entry:") ? new Date(key.slice(6)).toLocaleString("pt-BR") : (record.protocolId === "cim-cbm" ? protocolSteps.find(step => step.id === key)?.title : null) ?? "Anotação do protocolo anterior"}</Text>
          <Text selectable style={ui.text}>{text}</Text>
        </Card>)}
      </Card>;
    })}
    {loaded && records.every(record => !Object.values(record.notes).some(text => text.trim())) && <Text style={ui.muted}>Nenhuma anotação salva.</Text>}
  </Page>;
}
