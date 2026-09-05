import { useCallback, useRef, useState } from "react";
import { Text } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Button, Card, Field, Page, ui } from "@/components/protocol-ui";
import { protocol, protocolSteps } from "@/constants/cim-cbm-protocol";
import { ExecutionRecord, getActiveExecution, startExecution } from "@/services/storage";
import { mediumMass, parsePositive } from "@/utils/execution";

export default function PreparationScreen() {
  const [bacteria, setBacteria] = useState("");
  const [operator, setOperator] = useState("");
  const [compound, setCompound] = useState("");
  const [volumes, setVolumes] = useState({ mhaMl: "", mhbMl: "", salineMl: "", mhaRate: "38", mhbRate: "21" });
  const [active, setActive] = useState<ExecutionRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  useFocusEffect(useCallback(() => {
    let mounted = true;
    void getActiveExecution().then(value => { if (mounted) { setActive(value); setLoaded(true); setError(""); } })
      .catch(() => { if (mounted) setError("Não foi possível carregar a execução local."); });
    return () => { mounted = false; };
  }, []));
  const parsed = {
    mhaMl: parsePositive(volumes.mhaMl), mhbMl: parsePositive(volumes.mhbMl), salineMl: parsePositive(volumes.salineMl),
    mhaRate: parsePositive(volumes.mhaRate), mhbRate: parsePositive(volumes.mhbRate),
  };
  const masses = [
    ["MHA", parsed.mhaMl && parsed.mhaRate ? mediumMass(parsed.mhaMl, parsed.mhaRate) : null],
    ["MHB", parsed.mhbMl && parsed.mhbRate ? mediumMass(parsed.mhbMl, parsed.mhbRate) : null],
    ["NaCl", parsed.salineMl ? mediumMass(parsed.salineMl, 8.5) : null],
  ] as const;
  async function start() {
    if (lock.current) return;
    if (!bacteria.trim() || !operator.trim() || !compound.trim()) { setError("Informe bactéria/cepa, responsável e composto."); return; }
    const { mhaMl, mhbMl, salineMl, mhaRate, mhbRate } = parsed;
    if (mhaMl === null || mhbMl === null || salineMl === null || mhaRate === null || mhbRate === null || masses.some(([, mass]) => mass === null || !Number.isFinite(mass))) {
      setError("Informe volumes e concentrações positivos e válidos para os meios e a solução salina."); return;
    }
    lock.current = true; setBusy(true); setError("");
    try {
      const now = new Date().toISOString();
      await startExecution({ id: now, protocolId: protocol.id, protocolName: protocol.name, status: "in_progress", startedAt: now, updatedAt: now, currentStepIndex: 0,
        preparation: { bacteria: bacteria.trim(), operator: operator.trim(), compound: compound.trim(), mhaMl, mhbMl, salineMl, mhaRate, mhbRate },
        notes: {}, timers: {}, completedSteps: [], results: { bacteria: bacteria.trim() },
      });
      router.push("/protocols/cim-cbm-execution");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível salvar a execução."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Page title={protocol.name} subtitle="Preparação do experimento" active="protocols">
    <Card><Text style={ui.kicker}>POP • {protocolSteps.length} SEÇÕES • PLACA DE 96 POÇOS</Text>
      <Text style={ui.text}>Organize os materiais, acompanhe as etapas e registre os resultados do protocolo fornecido pelos supervisores.</Text>
      <Button secondary title="Ler o passo a passo completo" onPress={() => router.push("/articles")} />
    </Card>
    {error !== "" && <Text accessibilityRole="alert" style={ui.error}>{error}</Text>}
    {!loaded ? <Text style={ui.muted}>Carregando registros...</Text> : active ? <Card>
      <Text style={ui.heading}>Existe uma execução em andamento</Text><Text style={ui.text}>{active.protocolName} • {active.preparation?.bacteria}</Text>
      <Button title="Retomar execução atual" onPress={() => router.push("/protocols/cim-cbm-execution")} />
    </Card> : <>
      <Card><Text style={ui.heading}>Identificação</Text>
        <Field label="Bactéria / cepa" value={bacteria} onChangeText={setBacteria} />
        <Field label="Responsável" value={operator} onChangeText={setOperator} />
        <Field label="Composto antimicrobiano" value={compound} onChangeText={setCompound} />
      </Card>
      <Card><Text style={ui.heading}>Materiais do POP</Text>
        <Text style={ui.text}>MHA, MHB, NaCl, água destilada, antimicrobiano e veículo quando aplicável; placas de Petri e microplaca estéril de 96 poços; recipientes estéreis e materiais de pipetagem; balança, autoclave, incubadora e espectrofotômetro para DO₆₀₀.</Text>
      </Card>
      <Card><Text style={ui.heading}>Planejar meios e solução salina</Text>
        <Text style={ui.muted}>Informe separadamente o volume total planejado de cada preparo. As concentrações iniciais são as formulações de referência do POP; confira o fabricante.</Text>
        {([
          ["mhaMl", "Volume total de MHA (mL)"], ["mhaRate", "Concentração de MHA do fabricante (g/L)"],
          ["mhbMl", "Volume total de MHB (mL)"], ["mhbRate", "Concentração de MHB do fabricante (g/L)"],
          ["salineMl", "Volume total de NaCl 0,85% (mL)"],
        ] as const).map(([key, label]) => <Field key={key} label={label} numeric value={volumes[key]} onChangeText={value => setVolumes(previous => ({ ...previous, [key]: value }))} />)}
        <Text style={ui.kicker}>QUANTIDADES CALCULADAS</Text>
        {masses.map(([name, mass]) => <Text selectable key={name} style={ui.text}>{name}: {mass !== null && Number.isFinite(mass) ? `${mass.toLocaleString("pt-BR", { maximumSignificantDigits: 10 })} g` : "informe o preparo"}</Text>)}
        <Text style={ui.muted}>Massa (g) = volume (mL) × concentração (g/L) ÷ 1.000. Os volumes devem ser definidos conforme o planejamento do experimento.</Text>
      </Card>
      <Button disabled={busy} title={busy ? "Salvando..." : "Iniciar protocolo"} onPress={() => void start()} />
    </>}
  </Page>;
}
