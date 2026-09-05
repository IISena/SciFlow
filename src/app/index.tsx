import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Page, Card, Button, ui } from "@/components/protocol-ui";
import { protocol, protocolSteps } from "@/constants/cim-cbm-protocol";
import { ExecutionRecord, getActiveExecution } from "@/services/storage";
import { formatTime, remainingSeconds } from "@/utils/execution";

export default function HomeScreen() {
  const [active, setActive] = useState<ExecutionRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  useFocusEffect(useCallback(() => {
    let mounted = true;
    void getActiveExecution().then(record => { if (mounted) { setActive(record); setError(""); setLoaded(true); } })
      .catch(() => { if (mounted) setError("Não foi possível carregar os registros locais. Tente novamente."); });
    return () => { mounted = false; };
  }, []));
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const step = active ? protocolSteps[active.currentStepIndex] : null;
  const progress = Math.round((active?.completedSteps?.length ?? 0) / protocolSteps.length * 100);
  return <Page title="Painel de bancada" subtitle="SciFlow • CIM e CBM • Armazenamento local" active="home">
    {error ? <Text style={ui.error}>{error}</Text> : !loaded ? <Text style={ui.muted}>Carregando execução...</Text> : active && step ? <Card>
      <Text style={ui.kicker}>EXECUÇÃO EM ANDAMENTO • {progress}% CONCLUÍDO</Text>
      <Text selectable style={ui.heading}>{active.protocolName}</Text>
      <Text style={ui.text}>Etapa {active.currentStepIndex + 1}/{protocolSteps.length}: {step.title}</Text>
      <Text selectable style={ui.muted}>{active.preparation?.bacteria} • {active.preparation?.operator}</Text>
      <Button title="Retomar execução" onPress={() => router.push("/protocols/cim-cbm-execution")} />
    </Card> : <Card>
      <Text style={ui.heading}>Bancada disponível</Text>
      <Text style={ui.text}>Prepare uma execução de {protocol.name}.</Text>
      <Button title="Preparar experimento" onPress={() => router.push("/protocols/cim-cbm")} />
    </Card>}
    {active && protocolSteps.filter(item => active.timers[item.id]).map(item => {
      const timer = active.timers[item.id];
      const remaining = remainingSeconds(timer, now);
      return <Card key={item.id}><Text style={ui.heading}>{item.title}</Text><Text selectable style={ui.timer}>{formatTime(remaining)}</Text><Text style={ui.kicker}>{remaining === 0 ? "TEMPO ENCERRADO" : timer.isRunning ? "EM ANDAMENTO" : "PAUSADO"}</Text></Card>;
    })}
    <View style={{ gap: 10 }}>
      <Button secondary title="Consultar protocolo" onPress={() => router.push("/protocols")} />
      <Button secondary title="Diário de bancada" onPress={() => router.push("/notes")} />
      <Button secondary title="Histórico de execuções" onPress={() => router.push("/history")} />
      <Button secondary title="Fonte e POP completo" onPress={() => router.push("/articles")} />
    </View>
  </Page>;
}
