# SciFlow 1.2.0

## Alterações

- A biblioteca oferece somente o POP de determinação de CIM e CBM por microdiluição.
- As dez seções do texto fornecido foram transcritas, incluindo ressalvas e fórmulas. A fonte recebida está em `pop-cim-cbm.txt`.
- A preparação identifica bactéria/cepa, responsável e composto e calcula as massas para os volumes planejados de MHA, MHB e NaCl 0,85%. As formulações de MHA e MHB podem ser ajustadas conforme o fabricante.
- A execução permite consultar, marcar e revisitar etapas, configurar temporizadores, anotar observações e preencher a ficha experimental.
- Os temporizadores usam o horário final salvo para acompanhar o tempo decorrido fora da tela. Não há notificações em segundo plano.
- Anotações de etapa e campos da ficha são salvos ao editar. Entradas do diário usam o botão Salvar anotação.
- Finalizar uma execução a coloca no histórico; esse estado não declara que o ensaio é cientificamente válido.
- Registros antigos são preservados. Uma execução ativa de outro protocolo é arquivada antes de liberar o novo fluxo, sem ser marcada como concluída.
- Rotas antigas de CFS redirecionam para o novo protocolo. Os cartões antigos, a referência do artigo anterior e os dados ilustrativos não aparecem no fluxo atual.
- Versão e runtimeVersion: 1.2.0. Android versionCode local: 3. O EAS está configurado para controlar versões remotamente; o código utilizado numa futura build deve ser conferido no EAS.

## Arquivos

Novos:

- `src/constants/cim-cbm-protocol.ts`: conteúdo das seções e campos de registro.
- `src/app/protocols/cim-cbm.tsx`: identificação e preparação.
- `src/app/protocols/cim-cbm-execution.tsx`: etapas, temporizadores e ficha experimental.
- `src/components/protocol-ui.tsx`: componentes nativos compartilhados com o visual BioDark.
- `src/utils/execution.ts`: números, quantidades e tempo restante.
- `scripts/test-protocol.cjs`: testes de conteúdo, cálculos, temporizadores e armazenamento.
- `eslint.config.js`: validação de código com a configuração oficial do Expo.
- `docs/pop-cim-cbm.txt` e este documento.

Modificados:

- `src/app/index.tsx`, `protocols.tsx`, `articles.tsx`, `notes.tsx` e `history.tsx`: telas integradas ao novo escopo e aos dados locais.
- `src/app/protocols/cfs.tsx` e `cfs-execution.tsx`: compatibilidade com links anteriores.
- `src/services/storage.ts`: operações serializadas, arquivamento e preservação de dados em falhas de gravação.
- `src/components/bio-shell.tsx`: navegação e indicação de armazenamento local.
- `src/hooks/use-color-scheme.web.ts`: hidratação compatível com as regras do React.
- `app.json`, `package.json` e `package-lock.json`: versão, comandos de verificação e ferramentas de lint.

## Verificação em 5 de setembro de 2026

- TypeScript: aprovado.
- Lint: aprovado.
- Oito testes automatizados: aprovados, incluindo preservação do POP, migração de CFS, gravações concorrentes e recuperação após falha de armazenamento.
- Bundle Android: gerado em `dist/android-cim-cbm`.
- Interface web: percurso pelas dez etapas com dados explicitamente simulados, retomada após recarga, temporizador, anotação, ficha e histórico. Inspeção visual em largura de 390 pixels.
- Expo Doctor: 20 de 21 verificações aprovadas. O único apontamento foi a disponibilidade de correções de três dependências do SDK 57: `@expo/ui` 57.0.15 → ~57.0.16; `expo` 57.0.19 → ~57.0.20; `expo-router` 57.0.18 → ~57.0.19. As versões de execução do repositório foram mantidas.

Não foi realizada validação em aparelho Android físico nem gerada uma build APK pelo EAS. O bundle verifica o empacotamento Android, mas não substitui o teste no aparelho. Não houve commit ou push.
