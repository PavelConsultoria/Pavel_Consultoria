# Pavel Consultoria

Primeira versão visual da Home, orientada pelo `Pavel_Consultoria_Briefing_Mestre.md`. HTML, CSS e JavaScript estáticos, sem fontes externas, backend ou etapa de build. O cálculo lunar utiliza uma cópia local de Astronomy Engine (MIT). Nenhum acesso ao repositório PavelPMPSimulator.

## Visualizar localmente

Com Node.js instalado, execute na raiz:

```sh
npm.cmd start
```

Abra **http://localhost:4173**. Para encerrar, use `Ctrl+C`. Também é possível abrir `index.html` diretamente no navegador; o servidor local reproduz melhor a hospedagem.

```sh
npm.cmd run check
```

No Windows/PowerShell, `npm.cmd` evita o bloqueio do atalho `npm.ps1` pela política de execução. Em outros sistemas, use `npm start` e `npm run check`. O comando de verificação valida sintaxe JavaScript, arquivos referenciados, âncoras, IDs, título principal, dados estruturados e configuração. Não substitui revisão visual no navegador.

## Arquivos e manutenção

- `index.html`: conteúdo semântico da Home, metadados e dados estruturados.
- `assets/styles.css`: identidade visual, estados de foco e layouts responsivos. Verde provisório `#286746` em `--green`; substituir pelo tom oficial quando fornecido.
- `assets/config.js`: fonte única de turmas, datas das aulas, horários, modalidades, links, telefone e mensagens de WhatsApp.
- `assets/app.js`: menu móvel e seção ativa; `assets/agenda.js` e `assets/agenda.css`: dois calendários, próximas turmas e diálogo; `assets/calendar.js`: datas civis, feriados nacionais e fases lunares.
- `scripts/serve.cjs`: servidor local; `scripts/check.cjs`: verificações; `scripts/browser-check.cjs`: teste opcional no Chrome real, sem dependências.
- `robots.txt`, `sitemap.xml` e `.nojekyll`: preparação para hospedagem estática e indexação.

Com o servidor em execução, `npm.cmd run check:browser` verifica larguras de 320, 390, 768, 1024 e 1440 px, menu móvel, navegação mensal, agenda vazia e detalhes/links com dados temporários exclusivos do teste. Requer Chrome instalado no caminho padrão do Windows (ou `CHROME_PATH` definido) e porta 9223 livre. Salva capturas e perfil descartável em `.preview/`, ignorado pelo Git. Esses dados de teste não são inseridos no site. A versão foi verificada nesse navegador; outros navegadores ainda precisam de revisão antes da publicação.

Para cadastrar uma turma real em `assets/config.js`, adicione a `classes` um objeto com `id` único, `course` (`msp` ou `p6`), `variant`, `dates` (datas AAAA-MM-DD em ordem), `startTime` (HH:mm em São Paulo), `time`, `duration` e `modality`. Turmas noturnas e de sábado são registros independentes. Calendários, lista e diálogo usam esses mesmos dados. Preserve os registros históricos: a lista exclui a turma assim que começa sua primeira aula, mas todas as datas permanecem no calendário.

Os dois calendários mostram inicialmente o mês atual e o seguinte em `America/Sao_Paulo`, com navegação por setas e atualização automática na virada do dia, mês e ano. MSP/P6 aparece abaixo do número. Treinamentos, feriados nacionais e fases lunares podem coexistir. Sem futuras turmas, a lista mostra “Novas datas em definição.” e mantém o atendimento sob demanda. Sem formulário de inscrição, os CTAs usam o WhatsApp configurado e uma mensagem da turma.

O cálculo lunar funciona localmente com Astronomy Engine; origem, licença e fonte independente de validação (USNO) estão em `assets/vendor/README.md`. `scripts/calendar-check.cjs` verifica os instantes de outubro e novembro de 2026, conversão de fuso, meses futuros, feriados e início das turmas. Não há consultas a APIs no site publicado. Os feriados marcados são os nove declarados nacionais por lei federal; pontos facultativos e feriados instituídos por legislação estadual/municipal são excluídos.

O número de WhatsApp deve conter apenas dígitos, com país e DDD. Ao preenchê-lo, todos os CTAs usam mensagens contextuais automaticamente. Os Google Forms abrem em nova aba quando seus links forem preenchidos. Campos ausentes exibem pendências, sem enviar dados ou abrir destinos fictícios.

## Pendências reais

Logotipo oficial (a marca tipográfica está identificada como provisória), tom oficial do verde, número de WhatsApp, Forms, turmas confirmadas, link e screenshot real do Simulator e texto aprovado de apresentação de Karolina. A seção Sobre usa placeholder: o texto deve ser fornecido neste repositório, respeitando a proibição de acessar o projeto Simulator. Não há depoimentos, clientes, credenciais ou datas inventadas. A ilustração técnica do hero é conceitual, não um cronograma de cliente. Ementas, apostilas e Certifier pertencem às futuras páginas internas.

## GitHub Pages, posteriormente

O site funciona no domínio e também em um subdiretório de GitHub Pages: os caminhos dos ativos são relativos. Quando autorizada a publicação, selecione a branch e a pasta raiz em **Settings → Pages → Deploy from a branch**. Não é preciso instalar dependências ou gerar build. Não foram feitos deploy, ajustes de DNS ou configuração de domínio nesta etapa.

O `sitemap.xml` contém o domínio previsto no briefing. Antes de publicar no endereço temporário, altere sua URL para o endereço efetivo, acrescente `Sitemap: URL-ABSOLUTA/sitemap.xml` ao `robots.txt` e configure canonical e `og:url` no HTML. Após validar o endereço temporário, configure domínio/DNS e atualize esses metadados. Não há `CNAME` antecipado. Cadastrar no Search Console quando a publicação estiver pronta.

O menu aponta para seções reais da Home. Na próxima etapa, pode passar a apontar para páginas próprias, mantendo a Home como apresentação institucional.
