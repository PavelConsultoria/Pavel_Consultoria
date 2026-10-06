# Pavel Consultoria

Primeira versão visual da Home, orientada pelo `Pavel_Consultoria_Briefing_Mestre.md`. HTML, CSS e JavaScript estáticos, sem bibliotecas, fontes externas, backend ou etapa de build. Nenhum acesso ao repositório PavelPMPSimulator.

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
- `assets/config.js`: fonte única de turmas, horários, modalidades, status, links, telefone e mensagens de WhatsApp.
- `assets/app.js`: menu móvel, calendário, lista de turmas e detalhes acessíveis em diálogo.
- `scripts/serve.cjs`: servidor local; `scripts/check.cjs`: verificações; `scripts/browser-check.cjs`: teste opcional no Chrome real, sem dependências.
- `robots.txt`, `sitemap.xml` e `.nojekyll`: preparação para hospedagem estática e indexação.

Com o servidor em execução, `npm.cmd run check:browser` verifica larguras de 320, 390, 768, 1024 e 1440 px, menu móvel, navegação mensal, agenda vazia e detalhes/links com dados temporários exclusivos do teste. Requer Chrome instalado no caminho padrão do Windows (ou `CHROME_PATH` definido) e porta 9223 livre. Salva capturas e perfil descartável em `.preview/`, ignorado pelo Git. Esses dados de teste não são inseridos no site. A versão foi verificada nesse navegador; outros navegadores ainda precisam de revisão antes da publicação.

Para cadastrar uma turma real, adicione a `classes` um objeto com `date` (AAAA-MM-DD), `course` (`msp` ou `p6`), `time`, `modality` e `status`. Calendário, lista e diálogo usam esse mesmo registro. Datas civis e mês inicial respeitam São Paulo. No dia com turma, MSP/P6 substitui o número; registros simultâneos aparecem como botões distintos. A lista mostra apenas datas de hoje em diante; o calendário permite consultar outros meses.

O número de WhatsApp deve conter apenas dígitos, com país e DDD. Ao preenchê-lo, todos os CTAs usam mensagens contextuais automaticamente. Os Google Forms abrem em nova aba quando seus links forem preenchidos. Campos ausentes exibem pendências, sem enviar dados ou abrir destinos fictícios.

## Pendências reais

Logotipo oficial (a marca tipográfica está identificada como provisória), tom oficial do verde, número de WhatsApp, Forms, turmas confirmadas, link e screenshot real do Simulator e texto aprovado de apresentação de Karolina. A seção Sobre usa placeholder: o texto deve ser fornecido neste repositório, respeitando a proibição de acessar o projeto Simulator. Não há depoimentos, clientes, credenciais ou datas inventadas. A ilustração técnica do hero é conceitual, não um cronograma de cliente. Ementas, apostilas e Certifier pertencem às futuras páginas internas.

## GitHub Pages, posteriormente

O site funciona no domínio e também em um subdiretório de GitHub Pages: os caminhos dos ativos são relativos. Quando autorizada a publicação, selecione a branch e a pasta raiz em **Settings → Pages → Deploy from a branch**. Não é preciso instalar dependências ou gerar build. Não foram feitos deploy, ajustes de DNS ou configuração de domínio nesta etapa.

O `sitemap.xml` contém o domínio previsto no briefing. Antes de publicar no endereço temporário, altere sua URL para o endereço efetivo, acrescente `Sitemap: URL-ABSOLUTA/sitemap.xml` ao `robots.txt` e configure canonical e `og:url` no HTML. Após validar o endereço temporário, configure domínio/DNS e atualize esses metadados. Não há `CNAME` antecipado. Cadastrar no Search Console quando a publicação estiver pronta.

O menu aponta para seções reais da Home. Na próxima etapa, pode passar a apontar para páginas próprias, mantendo a Home como apresentação institucional.
