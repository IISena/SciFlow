import { useCallback, useState } from "react";
import { Text } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Page, Card, Button, ui } from "@/components/protocol-ui";
import { protocolSteps, resultFields } from "@/constants/cim-cbm-protocol";
import { ExecutionRecord, getActiveExecution, getHistory } from "@/services/storage";
import { mediumMass } from "@/utils/execution";

export default function HistoryScreen() {
  const [history, setHistory] = useState<ExecutionRecord[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  useFocusEffect(useCallback(() => {
    let mounted = true;
    void (async () => {
      await getActiveExecution();
      const records = await getHistory();
      if (mounted) { setHistory(records); setLoaded(true); setError(""); }
    })().catch(() => { if (mounted) setError("Não foi possível carregar o histórico. Tente novamente."); });
    return () => { mounted = false; };
  }, []));
  return <Page title="Histórico de execuções" subtitle="Execuções concluídas e registros anteriores preservados." active="history">
    {error !== "" && <Text style={ui.error}>{error}</Text>}
    <Text style={ui.kicker}>{history.length} REGISTROS LOCAIS</Text>
    {!loaded ? <Text style={ui.muted}>Carregando...</Text> : history.length === 0 ? <Card><Text style={ui.text}>Nenhuma execução no histórico.</Text><Button title="Abrir protocolo" onPress={() => router.push("/protocols")} /></Card> : history.map(record => {
      const preparation = record.preparation;
      return <Card key={record.id}>
        <Text style={ui.kicker}>{record.status === "completed" ? "CONCLUÍDO" : "ARQUIVADO • NÃO CONCLUÍDO"}</Text>
        <Text selectable style={ui.heading}>{record.protocolName}</Text>
        <Text selectable style={ui.muted}>Início: {new Date(record.startedAt).toLocaleString("pt-BR")}</Text>
        <Text selectable style={ui.muted}>{record.completedAt ? "Conclusão: " + new Date(record.completedAt).toLocaleString("pt-BR") : record.archivedAt ? "Arquivamento: " + new Date(record.archivedAt).toLocaleString("pt-BR") : ""}</Text>
        {record.protocolId !== "cim-cbm" && <Text style={ui.muted}>Protocolo de uma versão anterior. Conteúdo mantido para consulta.</Text>}
        {preparation ? <>
          <Text selectable style={ui.text}>Responsável: {preparation.operator}{"\n"}Bactéria / cepa: {preparation.bacteria}{"\n"}Composto: {preparation.compound}</Text>
          <Text selectable style={ui.text}>MHA: {preparation.mhaMl} mL • {mediumMass(preparation.mhaMl, preparation.mhaRate).toLocaleString("pt-BR", { maximumSignificantDigits: 10 })} g{"\n"}MHB: {preparation.mhbMl} mL • {mediumMass(preparation.mhbMl, preparation.mhbRate).toLocaleString("pt-BR", { maximumSignificantDigits: 10 })} g{"\n"}NaCl 0,85%: {preparation.salineMl} mL</Text>
        </> : <Text selectable style={ui.text}>Culturas: {record.numberOfCultures ?? "—"} • Volume por cultura: {record.volumePerCulture ?? "—"} mL • Volume total: {record.totalVolume ?? "—"} mL</Text>}
        {record.protocolId === "cim-cbm" && <><Text style={ui.heading}>Ficha do experimento</Text>
          {resultFields.map(([key, label]) => <Text selectable key={key} style={ui.text}>{label}: {record.results?.[key]?.trim() || "Não informado"}</Text>)}
        </>}
        {Object.entries(record.notes).filter(([, note]) => note.trim()).map(([key, note]) => <Text selectable key={key} style={ui.text}>{record.protocolId === "cim-cbm" ? protocolSteps.find(step => step.id === key)?.title ?? "Anotação" : "Anotação"}: {note}</Text>)}
      </Card>;
    })}
  </Page>;
}
