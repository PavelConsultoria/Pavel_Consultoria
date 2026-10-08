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

A Agenda é administrada pela aba **Turmas** da planilha pública Google Sheets. O endpoint CSV de leitura fica em `assets/config.js` (`agendaCsvUrl`); o endereço de edição não é utilizado. Cada carregamento da Home faz uma nova consulta com `cache: no-store`, sem credenciais. Alterações publicadas aparecem após atualizar a página, sujeitas ao cache da publicação do Google.

Para cadastrar uma turma, acrescente uma linha com as dez colunas, mantendo os cabeçalhos:

| Coluna | Preenchimento |
| --- | --- |
| ID | Identificador único da turma |
| Treinamento | MS Project ou Primavera P6 |
| Formato | Noturno ou Sábado (cada alternativa é uma linha independente) |
| Datas (AAAA-MM-DD; separadas por ;) | Todas as datas da mesma turma, separadas por ponto e vírgula; vazio se não confirmadas |
| Horário | Ex.: 19h30–21h30 ou 9h–17h, em America/Sao_Paulo |
| Carga horária | Ex.: 8h |
| Modalidade | Ex.: Online ao vivo |
| Situação | Inscrições abertas, Esgotada, Cancelada, Encerrada ou Em definição |
| Link de inscrição | URL HTTPS real; vazio usa consulta contextual no WhatsApp |
| Observações | Informação adicional, exibida nos detalhes |

A lista mostra turmas futuras com inscrições abertas ou esgotadas (identificadas como esgotadas, com consulta, sem CTA de inscrição). Ao começar a primeira aula, a turma inteira sai de Próximas Turmas, inclusive se possui encontros futuros. Encerradas ficam apenas como histórico nos calendários; canceladas não recebem indicadores. Em definição e registros sem datas não são anunciados como inscrições futuras. Os detalhes de turmas históricas, encerradas ou esgotadas oferecem consulta, sem formulário de inscrição. Carga horária e modalidade iguais aparecem uma vez por curso; se diferirem entre turmas, cada combinação é preservada.

Os calendários e a lista consomem o mesmo CSV validado, inclusive campos citados, vírgulas, aspas e quebras de linha. Sem futuras turmas, aparece “Novas datas em definição.”. Na falha de conexão, cabeçalhos incompatíveis ou dados inválidos, aparece uma mensagem amigável, sem fallback de datas históricas. O atendimento sob demanda continua disponível. A página mostra carregamento enquanto consulta o Google.

Mantenha a aba publicada em **Arquivo → Compartilhar → Publicar na Web**, formato CSV. Publicação permite leitura pública; não conceda permissão de edição a visitantes. Evite dados pessoais, credenciais ou informações privadas na aba publicada. A página não usa login, tokens nem chaves.

Os dois calendários preservam navegação mensal, feriados nacionais, fases lunares e atualização do dia em São Paulo. O cálculo lunar continua local com Astronomy Engine; origem/licença em `assets/vendor/README.md`. Os testes `scripts/calendar-check.cjs` e `scripts/agenda-data-check.cjs` verificam astronomia, fuso, datas, parser, situações e turmas independentes. As turmas sintéticas existem somente nos testes.

O número de WhatsApp deve conter apenas dígitos, com país e DDD. Ao preenchê-lo, todos os CTAs usam mensagens contextuais automaticamente. Os Google Forms abrem em nova aba quando seus links forem preenchidos. Campos ausentes exibem pendências, sem enviar dados ou abrir destinos fictícios.

## Pendências reais

Logotipo oficial (a marca tipográfica está identificada como provisória), tom oficial do verde, número de WhatsApp, Forms, turmas confirmadas, link e screenshot real do Simulator e texto aprovado de apresentação de Karolina. A seção Sobre usa placeholder: o texto deve ser fornecido neste repositório, respeitando a proibição de acessar o projeto Simulator. Não há depoimentos, clientes, credenciais ou datas inventadas. A ilustração técnica do hero é conceitual, não um cronograma de cliente. Ementas, apostilas e Certifier pertencem às futuras páginas internas.

## GitHub Pages, posteriormente

O site funciona no domínio e também em um subdiretório de GitHub Pages: os caminhos dos ativos são relativos. Quando autorizada a publicação, selecione a branch e a pasta raiz em **Settings → Pages → Deploy from a branch**. Não é preciso instalar dependências ou gerar build. Não foram feitos deploy, ajustes de DNS ou configuração de domínio nesta etapa.

O `sitemap.xml` contém o domínio previsto no briefing. Antes de publicar no endereço temporário, altere sua URL para o endereço efetivo, acrescente `Sitemap: URL-ABSOLUTA/sitemap.xml` ao `robots.txt` e configure canonical e `og:url` no HTML. Após validar o endereço temporário, configure domínio/DNS e atualize esses metadados. Não há `CNAME` antecipado. Cadastrar no Search Console quando a publicação estiver pronta.

O menu aponta para seções reais da Home. Na próxima etapa, pode passar a apontar para páginas próprias, mantendo a Home como apresentação institucional.
