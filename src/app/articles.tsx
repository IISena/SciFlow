import { Text } from "react-native";
import { Page, Card, ui } from "@/components/protocol-ui";
import { protocolSteps } from "@/constants/cim-cbm-protocol";

export default function ArticlesScreen() {
  return <Page title="Fonte do protocolo" subtitle="POP fornecido pelos supervisores do projeto" active="protocols">
    <Card><Text selectable style={ui.heading}>POP – Determinação de CIM e CBM por microdiluição</Text>
      <Text style={ui.text}>Conteúdo de referência utilizado nesta versão do SciFlow. Autoria, data de revisão e referência bibliográfica não foram informadas no material recebido.</Text>
      <Text style={ui.muted}>Os valores e as condições descritos pertencem ao POP. Os registros e a avaliação do ensaio são preenchidos pelo responsável pela execução.</Text>
    </Card>
    {protocolSteps.map((step, index) => <Card key={step.id}><Text selectable style={ui.heading}>{index + 1}. {step.title}</Text><Text selectable style={ui.text}>{step.instruction}</Text></Card>)}
  </Page>;
}
