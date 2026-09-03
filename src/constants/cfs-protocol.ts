export const cfsSteps = [
  { id: "prepare-culture", title: "Preparar Cultura Bacteriana", instruction: "Preparar a cultura bacteriana utilizando meio TSB em condições assépticas.", temp: "22.0", rpm: "—", od: "0.10", seconds: 0 },
  { id: "incubation", title: "Incubação sob Agitação Contínua", instruction: "Transferir frascos Erlenmeyer para a incubadora shaker calibrada a 30°C e 150 rpm por 48h para máxima expressão de metabólitos.", temp: "30.0", rpm: "150", od: "0.82", seconds: 48 * 3600 },
  { id: "centrifugation", title: "Centrifugação Refrigerada", instruction: "Centrifugar a cultura para separar as células bacterianas do sobrenadante.", temp: "4.0", rpm: "3067", od: "—", seconds: 3600 },
  { id: "supernatant", title: "Recuperar Sobrenadante", instruction: "Recuperar cuidadosamente o sobrenadante, evitando o sedimento celular.", temp: "4.0", rpm: "—", od: "—", seconds: 0 },
  { id: "filtration", title: "Filtração Estéril", instruction: "Filtrar o sobrenadante em membrana de 0,22 µm para obter o CFS.", temp: "22.0", rpm: "—", od: "—", seconds: 0 },
] as const;

export const cfsProtocolShortcut = {
  id: "cfs",
  code: "PRT-001",
  name: "Produção de CFS",
  route: "/protocols/cfs",
} as const;
