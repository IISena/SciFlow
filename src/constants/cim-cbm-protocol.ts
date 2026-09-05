// Content transcribed from docs/pop-cim-cbm.txt supplied by the project supervisors.
export const protocol = { id: 'cim-cbm', code: 'POP-CIM-CBM', name: 'CIM e CBM por microdiluição', route: '/protocols/cim-cbm' } as const;

export const protocolSteps: { id: string; title: string; instruction: string }[] = [
  {
    "id": "cim-cbm-1",
    "title": "Preparo dos meios e soluções",
    "instruction": "1.1. Mueller-Hinton Agar (MHA)\n\n1. Preparar conforme a concentração indicada pelo fabricante. Para formulação de 38 g/L:\n   - 100 mL: 3,8 g;\n   - 500 mL: 19 g;\n   - 1 L: 38 g.\n2. Suspender o pó em água destilada e completar para o volume desejado.\n3. Aquecer até completa dissolução.\n4. Autoclavar a 121 °C por 15 min ou conforme fabricante.\n5. Resfriar até aproximadamente 45–50 °C e distribuir em placas de Petri estéreis.\n6. Deixar solidificar e armazenar as placas invertidas.\n\n1.2. Mueller-Hinton Broth (MHB)\n\n1. Preparar conforme fabricante. Para formulação de 21 g/L:\n   - 100 mL: 2,1 g;\n   - 500 mL: 10,5 g;\n   - 1 L: 21 g.\n2. Dissolver em água destilada.\n3. Completar o volume.\n4. Autoclavar a 121 °C por 15 min ou conforme fabricante.\n5. Resfriar antes do uso.\n\n1.3. NaCl 0,85%\n\n1. Pesar 0,85 g de NaCl para cada 100 mL de solução.\n2. Dissolver em aproximadamente 80% do volume final de água destilada.\n3. Completar para o volume desejado.\n4. Autoclavar a 121 °C por 15 min.\n5. Resfriar e manter em recipiente estéril fechado."
  },
  {
    "id": "cim-cbm-2",
    "title": "Cultivo inicial da bactéria",
    "instruction": "1. Semear a bactéria em MHA pelo método de esgotamento para obtenção de colônias isoladas.\n2. Incubar a placa invertida a 37 °C por 18–24 h.\n3. Confirmar crescimento de colônias isoladas e morfologicamente homogêneas.\n4. Selecionar 4–5 colônias isoladas para preparação do inóculo."
  },
  {
    "id": "cim-cbm-3",
    "title": "Obtenção da cultura em fase exponencial",
    "instruction": "1. Transferir as 4–5 colônias selecionadas para MHB estéril.\n2. Incubar a 37 °C, nas condições de aeração previamente estabelecidas para a cepa.\n3. Acompanhar o crescimento pela DO₆₀₀.\n4. Zerar o espectrofotômetro utilizando MHB estéril como branco.\n5. Homogeneizar a cultura antes de cada leitura.\n6. Para E. coli, utilizar a cultura quando atingir aproximadamente DO₆₀₀ = 0,6, desde que esse ponto corresponda à fase exponencial na curva de crescimento previamente estabelecida.\n7. Registrar a DO e o horário da coleta.\n\n«Importante: DO₆₀₀ = 0,6 indica o ponto de coleta definido pela curva de crescimento e não deve ser utilizada diretamente como estimativa de UFC/mL.»"
  },
  {
    "id": "cim-cbm-4",
    "title": "Preparo do inóculo",
    "instruction": "1. A partir da cultura em DO₆₀₀ ≈ 0,6, preparar a suspensão de trabalho utilizando NaCl 0,85% estéril.\n2. Diluir conforme a relação DO/UFC previamente determinada para a cepa, visando aproximadamente 4–5 × 10⁶ UFC/mL.\n3. Homogeneizar.\n4. Utilizar a suspensão imediatamente.\n5. Confirmar posteriormente a concentração real por contagem de UFC."
  },
  {
    "id": "cim-cbm-5",
    "title": "Preparo da microplaca",
    "instruction": "1. Utilizar placa estéril de 96 poços.\n2. Preparar diluições seriadas do antimicrobiano, preferencialmente em razão 2.\n3. Distribuir 100 µL da solução do antimicrobiano em cada poço.\n4. Adicionar 10 µL do inóculo aos poços experimentais.\n5. A concentração bacteriana final deve ficar próxima de 4–5 × 10⁵ UFC/mL.\n6. Incluir:\n   - controle de crescimento: meio + bactéria;\n   - controle de esterilidade: somente meio;\n   - controle de veículo: veículo + bactéria, quando aplicável.\n\n«Considerar a diluição provocada pela adição do inóculo ao calcular a concentração final do antimicrobiano.»"
  },
  {
    "id": "cim-cbm-6",
    "title": "Verificação do inóculo",
    "instruction": "Imediatamente após a inoculação:\n\n1. Fazer diluições seriadas do controle de crescimento em NaCl 0,85%.\n2. Semear uma diluição adequada em MHA, em duplicata.\n3. Incubar a 37 °C.\n4. Contar as colônias e calcular:\n\nUFC/mL = nº de colônias / (volume semeado em mL × diluição)\n\n5. Confirmar que o inóculo utilizado ficou próximo da concentração planejada."
  },
  {
    "id": "cim-cbm-7",
    "title": "Incubação e determinação da CIM",
    "instruction": "1. Incubar a microplaca a 37 °C por 18–24 h para E. coli.\n2. Confirmar:\n   - crescimento no controle positivo;\n   - ausência de crescimento no controle de esterilidade.\n3. Avaliar visualmente os poços.\n4. Definir a CIM como a menor concentração sem crescimento bacteriano visível."
  },
  {
    "id": "cim-cbm-8",
    "title": "Determinação da CBM",
    "instruction": "1. Selecionar o poço correspondente à CIM e todos os poços de concentrações superiores sem crescimento.\n2. Homogeneizar cada poço cuidadosamente.\n3. Retirar 100 µL.\n4. Semear em MHA.\n5. Incubar a 37 °C pelo período adequado à bactéria.\n6. Contar as colônias recuperadas.\n\nCalcular o limite correspondente a 0,1% de sobrevivência:\n\nL = N₀ × 0,1 × 0,001\n\nonde N₀ é o inóculo inicial confirmado em UFC/mL.\n\nA CBM será a menor concentração que apresentar redução de ≥99,9% das células viáveis."
  },
  {
    "id": "cim-cbm-9",
    "title": "Critérios de validade",
    "instruction": "O ensaio será considerado válido quando:\n\n- o controle de crescimento apresentar crescimento;\n- o controle de esterilidade permanecer sem crescimento;\n- a cultura estiver pura;\n- o controle de veículo estiver adequado;\n- a contagem confirmar o inóculo esperado;\n- os controles de qualidade utilizados estiverem dentro dos limites estabelecidos."
  },
  {
    "id": "cim-cbm-10",
    "title": "Registro",
    "instruction": "Registrar para cada experimento:\n\nParâmetro| Resultado\nBactéria/cepa| \nDO₆₀₀ no momento da coleta| \nUFC/mL inicial| \nCIM| \nLimite de UFC para CBM| \nCBM| \nControles adequados?| \nObservações| \n\nNota: para outras bactérias Gram-positivas ou Gram-negativas, manter o princípio do ensaio, mas ajustar meio, temperatura, tempo de incubação e ponto da fase exponencial conforme as características da espécie."
  }
];

export const resultFields = [
  ['bacteria', 'Bactéria / cepa'],
  ['od', 'DO₆₀₀ no momento da coleta'],
  ['collectionTime', 'Horário da coleta'],
  ['initialCfu', 'UFC/mL inicial confirmado'],
  ['mic', 'CIM (informar valor e unidade)'],
  ['mbcLimit', 'Limite de UFC para CBM'],
  ['mbc', 'CBM (informar valor e unidade)'],
  ['controls', 'Controles adequados? Registrar avaliação'],
  ['observations', 'Observações'],
] as const;
