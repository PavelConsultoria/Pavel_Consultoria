# Pavel Consultoria — Continuidade do projeto

## Atualização de 10/10/2026 — novo mockup e validação para publicação

Esta atualização prevalece sobre os estados históricos abaixo. Publicação técnica ainda depende de confirmação do workflow e testes no domínio após o push; aprovação visual final pertence à proprietária.

- Estado inicial: `main` local e remoto em `5fe8a36ff557425f37b79bc3afc09a786be98c8c`; somente PDF demonstrativo e referência visual estavam sem rastreamento. Word e este MD foram disponibilizados durante a sessão.
- Documentos lidos: este MD integralmente e texto, 16 imagens e anotações do `Mocup site.docx`. Renderizador alternativo permitiu visualizar todo o conteúdo, mas apresentou oito páginas com diferenças de paginação e páginas vazias; não é uma exportação nativa das sete páginas no Word.
- Implementadas seis páginas: Home, MS Project, Primavera, Certificação PMP, Agenda e Sobre. Cabeçalho e rodapé gerados de fonte única em `scripts/build-site.cjs`, com relógio de Brasília e contador real do GoatCounter.
- Menu na ordem do mockup; destaque azul-petróleo sem sublinhado; WhatsApp após Sobre. Home utiliza a imagem “Fale Conosco” extraída do Word, sem elemento flutuante; páginas internas mantêm botão discreto.
- Home: título e faixa inferior substituídos; conteúdos de cursos, Simulator, Agenda e Sobre organizados nas páginas internas; textos institucionais e destinos antigos por hash preservados.
- Cursos: distribuição comum com seis blocos, atalhos, material, investimento, certificado e depoimentos reais. MS Project preserva os tópicos aprovados do briefing atualizado de 06/10 e a prévia PDF existente. O PDF reduzido do Primavera foi disponibilizado após o primeiro push: sete páginas renderizadas e inspecionadas, tópicos da página 2 transcritos e prévia integrada, sem inventar ementa integral.
- Valores confirmados nesta sessão: MS Project R$ 460,00 somente a partir de novembro/2026; Primavera P6 Básico R$ 700,00; Simulator R$ 199,00 por 90 dias. Pagamentos não confirmados permanecem sob consulta.
- Agenda: CSVs e Apps Script preservados, somente leitura; compartilhamento retomado; PNG contém título, atualização, turmas, datas, horários, contato, dois calendários e legenda. Canvas restrito a essa exportação.
- GoatCounter: script oficial único por página; cliques comerciais registrados como eventos, sem duplicar visitas ao navegar por âncoras. Total público sem fallback fictício. Não houve acesso ao painel privado nem comprovação de conversões comerciais.
- Testes locais: `npm.cmd run build`, `npm.cmd run check` e Chrome real aprovados nas seis páginas em 320, 390, 768, 1024 e 1440 px. Agenda consultou CSVs reais; onze indicadores e duas grades, detalhes, navegação, download PNG de 1800 × 1110 e falha CSV simulada. Zero exceções JavaScript e zero respostas HTTP de erro para recursos internos após correção do favicon.
- HTTPS: Node inicialmente retornou `UNABLE_TO_VERIFY_LEAF_SIGNATURE` por interceptação do Avast. Utilizar `--use-system-ca` manteve TLS validado com confiança do Windows; não se ignorou verificação TLS. SSL Labs realizou inspeção independente em 10/10/2026 às 12:27 de Brasília: certificado original Let's Encrypt YR2 para domínio e www, válido de 09/10/2026 a 07/01/2027, cadeia SNI confiável em Mozilla/Apple/Android/Java/Windows nos quatro IPv4, TLS 1.2/1.3. Nota B, avisos sobre suites fracas, forward secrecy parcial e ausência de HSTS. Clientes sem SNI recebem certificado padrão de github.io, incompatível com domínio próprio. Configurações DNS e externas não foram alteradas.
- Pendências: ementas integrais não fornecidas, mantendo-se tópicos aprovados e tópicos do sumário demonstrativo do Primavera; confirmar condições de pagamento e eventual preço de outubro; aprovação visual da proprietária; auditoria do painel analytics e análise dos avisos TLS da hospedagem compartilhada. A pendência da prévia PDF do Primavera foi resolvida durante a sessão.
- Fontes visuais não usadas na aplicação (`Mocup site.docx`, `assets/referencia-visual-pavel.png`) serão preservadas sem inclusão no commit. Ferramentas, perfis e capturas temporários em `.preview/`, ignorado pelo Git. Alterações de código limitadas a este repositório; Simulator, DNS, planilha e Apps Script intocados.

O resultado pós-publicação será acrescentado após comprovar o deploy e verificar o conteúdo servido contra os hashes dos arquivos do commit.

### Revisão das primeiras capturas publicadas

O primeiro deploy do novo mockup foi concluído em `bc7a968`; a prévia real do Primavera foi publicada em `9f3edce`. A inspeção das capturas públicas identificou duas regressões por estilos antigos restritos à Home: fundo de Sobre ausente e largura da Agenda reduzida. Os escopos foram corrigidos em `assets/site.css`, junto com os espaços da Home no celular e o contraste do contato. O teste passou a conferir o fundo de Sobre e a largura disponível da Agenda, e as capturas aguardam os CSVs reais. O compartilhamento por cópia foi verificado com Clipboard API simulada apenas no navegador de teste, sem substituir a área de transferência da proprietária. Novos testes locais foram aprovados antes da publicação dessas correções.

---

**Fechamento:** 08/10/2026
**Retomada prevista:** 09/10/2026, em novo chat

> Este documento complementa o briefing mestre existente. Não substitui o conteúdo anterior.

## 1. Estado atual do site

- Repositório institucional: `PavelConsultoria/Pavel_Consultoria`, branch `main`.
- Endereço provisório funcional: https://pavelconsultoria.github.io/Pavel_Consultoria/
- Domínio próprio registrado: **pavelconsultoria.com.br**, no Registro.br.
- Repositório do PMP Simulator é **outro projeto**: `PavelConsultoria/PavelPMPSimulator`. Não modificar seu código, hospedagem ou banco de dados durante o desenvolvimento do site institucional.
- A Home, a Agenda de Treinamentos, a seção Sobre a Pavel, a área de contato e o rodapé estão implementados.
- **Sobre a Pavel e o rodapé foram aprovados visualmente**. Não redesenhar sem solicitação.

## 2. Agenda de Treinamentos — funcionamento confirmado

- A Agenda lê as turmas da planilha Google Sheets **Pavel Consultoria — Agenda de Treinamentos**, aba `Turmas`.
- Planilha: https://docs.google.com/spreadsheets/d/1SR40dgmJpjlwDocdxrHQpB-t-WUrb7UL1PshecFOt5U/edit
- CSV público de `Turmas` (gid `613259854`):
  https://docs.google.com/spreadsheets/d/e/2PACX-1vSdq2OSQfJlUYm4p1IhGubApJDU2qmh_RoSA0EVt6gHmpR7w9ntbQAvZOvYT4pdO8mkZ6zaJgQiekZe/pub?gid=613259854&single=true&output=csv
- Colunas: A ID; B Treinamento; C Formato; D Datas; E Horário; F Carga horária; G Modalidade; H Situação; I Link de inscrição; J Observações.
- Uma aba adicional, **Controle**, foi criada. A célula `B1` recebe o horário da última alteração relevante da aba `Turmas`.
- Google Apps Script `onEdit(e)` registra alterações nas colunas **B a I**, em linhas de dados da aba `Turmas`, sem atualizar a data simplesmente porque alguém visitou o site.
- O script foi testado; a célula de controle atualizou e o histórico de execuções exibiu status **Concluído**.
- CSV público de `Controle` (gid `608855431`):
  https://docs.google.com/spreadsheets/d/e/2PACX-1vSdq2OSQfJlUYm4p1IhGubApJDU2qmh_RoSA0EVt6gHmpR7w9ntbQAvZOvYT4pdO8mkZ6zaJgQiekZe/pub?gid=608855431&single=true&output=csv
- O Codex integrou a leitura desse CSV por meio de `agendaControlCsvUrl` em `assets/config.js` e publicou a mudança.
- **Conferido no site:** indicação discreta `Agenda atualizada em: 08/10/2026`.
- A republicação do CSV pelo Google pode não ser instantânea.

## 3. Compartilhamento da Agenda — funciona, mas precisa ser ajustado

- Botão discreto **Compartilhar Agenda** aparece na parte superior direita da seção.
- A opção de compartilhar link funciona.
- A exportação de PNG também funciona, mas **o resultado atual não foi aprovado**.
- Problema 1: a imagem exportada contém apenas os dois calendários, sem a relação de turmas e seus horários. Para um destinatário que vê pela primeira vez, **não é autoexplicativa**.
- **Correção solicitada:** exportar uma imagem da **seção inteira da Agenda**, com título, data de atualização, relação de turmas, datas, horários, informações de inscrição, dois calendários e legenda. Preservar identidade Pavel e legibilidade.
- Problema 2: a imagem e/ou compartilhamento mostram `pavelconsultoria.github.io/Pavel_Consultoria/`, aparência que a proprietária não deseja.
- **Correção solicitada:** após configurar e validar o domínio próprio, usar `https://pavelconsultoria.com.br/` como endereço público, inclusive em imagens exportadas e links compartilhados.
- **Canvas:** uso autorizado **somente excepcionalmente** para essa exportação PNG; não assumir autorização geral para outras funcionalidades.
- Manter a Agenda atual com layout aprovado: próximas turmas à esquerda, dois calendários à direita.

## 4. Domínio próprio — ponto exato da interrupção

- Domínio: **pavelconsultoria.com.br**.
- Registro.br indicou domínio **Publicado**, com expiração em **05/10/2027**.
- Ao tentar abrir `pavelconsultoria.com.br`, o navegador exibiu `DNS_PROBE_FINISHED_NXDOMAIN`.
- Na área DNS do Registro.br, constava que o domínio utilizava os servidores DNS do próprio Registro.br.
- Foi acessado **Configurar endereçamento → Modo avançado**.
- Após essa ação, a interface informou que os servidores DNS estavam **em transição**, com estimativa de aproximadamente **2 horas** na captura das 18h56 de 08/10/2026; essa estimativa não garante conclusão exata.
- A tela passou a apresentar **Configurar zona DNS**.
- **Até o encerramento:** não foram adicionados registros A/AAAA/CNAME e não foi concluída a configuração de domínio personalizado no GitHub Pages.
- **Primeira tarefa amanhã:** verificar se a transição terminou e examinar a zona DNS existente. Não trocar servidores DNS para externos por engano.
- Depois: configurar registros DNS adequados ao GitHub Pages; configurar o domínio em **GitHub → repositório `Pavel_Consultoria` → Settings → Pages → Custom domain**; verificar propagação, HTTPS e acesso real.
- Cuidado: a mudança de URL com caminho `/Pavel_Consultoria/` para domínio na raiz exige testar caminhos de imagens, CSS, JavaScript, âncoras e links internos.
- Só depois de validar o domínio: atualizar compartilhamento, PNG, metadados sociais, URLs canônicas e demais endereços públicos.
- **Não é necessário contratar outra hospedagem apenas por ter comprado o domínio**: o site pode continuar no GitHub Pages com domínio personalizado.

## 5. Contador de visitas — PENDENTE, NÃO IMPLEMENTADO

- **STATUS EM 08/10/2026: NÃO IMPLEMENTADO.** Não há contador funcional nem número de visitas no site. Não apresentar como concluído.
- Desejado: contador **público**, **gratuito**, **real e acumulativo**, discretamente no rodapé.
- Visitas repetidas em sessões diferentes devem contar, mas clicar nas seções da mesma página não deve incrementar a contagem.
- GitHub Pages é estático e não oferece contador persistente nativo. Selecionar solução gratuita confiável, sem números fictícios e sem expor segredos.
- Não comprometer o visual aprovado do rodapé. Manter telefone e ícones coloridos de WhatsApp, Instagram, LinkedIn e Facebook.

## 6. Seções e páginas para finalizar

### MS Project

- Página de treinamento **MS Project — do Básico ao Avançado**, com conteúdo e ementa definidos, carga de 8 horas, modalidades de turma e inscrições.
- Apostila e prévia demonstrativa integradas à própria página.
- Depoimentos reais, quando fornecidos/aprovados.
- Certificado digital de conclusão verificado no Certifier.
- Integração com formulário de inscrição do Google Forms e contato WhatsApp.
- Manter linguagem de consultoria especializada, não aparência de panfleto.

### Primavera P6

- Página de **Primavera P6 Básico**, com ementa, 8 horas, agenda e inscrição.
- Apostila e prévia, depoimentos reais e certificado digital verificado no Certifier.
- Respeitar a distinção entre o curso Básico e a futura oferta Avançada; não divulgar ementa avançada como se estivesse pronta.

### Pavel PMP Simulator

- Concluir a seção institucional que apresenta o produto e encaminha ao simulador existente.
- Endereço comercial conhecido: https://pavelpmpsimulator.com.br/
- Não alterar o repositório, Supabase, licenças ou funcionalidades do Simulator sem pedido específico.

## 7. Ordem de retomada — 09/10/2026

1. **Finalizar DNS e domínio próprio** `pavelconsultoria.com.br`, incluindo HTTPS e testes.
2. **Corrigir compartilhamento da Agenda**, agora com imagem da seção inteira e domínio oficial.
3. **Implementar do zero o contador real de visitas**, ainda inexistente, no rodapé, após aprovar solução gratuita.
4. **Finalizar MS Project**.
5. **Finalizar Primavera P6**.
6. **Finalizar a apresentação do PMP Simulator** no site.

## 8. Regras de trabalho

- Uma ação por vez, especialmente em DNS e GitHub Pages.
- Conferir telas antes de salvar alterações sensíveis.
- Não alterar partes já aprovadas sem pedido.
- Só preparar prompts para o Codex quando a proprietária solicitar explicitamente.
- Quando houver prompt para Codex: limitar alterações ao repositório certo; testar; conferir `git status`; fazer commit e push para `main`; relatar o resultado.
- Priorizar soluções gratuitas, simples, profissionais e fáceis de manter.

---

**Para iniciar o novo chat:** “Vamos continuar o site da Pavel pelo MD de continuidade de 08/10/2026 que estou anexando. Primeiro vamos verificar o DNS do Registro.br e concluir a configuração de pavelconsultoria.com.br no GitHub Pages, uma ação por vez. Depois corrigiremos o compartilhamento da Agenda para gerar uma imagem da seção completa e usar o domínio próprio. Atenção: o contador público de visitas ainda NÃO foi implementado e precisa ser criado. Em seguida, vamos finalizar MS Project, Primavera P6 e a apresentação do PMP Simulator, sem modificar o repositório do simulador. Preserve as partes já aprovadas e só crie comandos para o Codex quando eu pedir.”
