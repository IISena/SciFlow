import { Text } from "react-native";
import { router } from "expo-router";
import { Page, Card, Button, ui } from "@/components/protocol-ui";
import { protocol, protocolSteps } from "@/constants/cim-cbm-protocol";

export default function ProtocolsScreen() {
  return <Page title="Protocolo" subtitle="1 protocolo disponível nesta versão" active="protocols">
    <Card>
      <Text style={ui.kicker}>{protocol.code} • MICROBIOLOGIA</Text>
      <Text selectable style={ui.heading}>{protocol.name}</Text>
      <Text style={ui.text}>Determinação da Concentração Inibitória Mínima e da Concentração Bactericida Mínima em placa de 96 poços.</Text>
      <Text style={ui.muted}>{protocolSteps.length} seções • Materiais • Temporizadores • Registros locais</Text>
      <Button title="Preparar execução →" onPress={() => router.push("/protocols/cim-cbm")} />
    </Card>
    <Card><Text style={ui.heading}>Passo a passo</Text>{protocolSteps.map((step, index) => <Text selectable key={step.id} style={ui.text}>{index + 1}. {step.title}</Text>)}</Card>
    <Button secondary title="Consultar POP completo" onPress={() => router.push("/articles")} />
  </Page>;
}
