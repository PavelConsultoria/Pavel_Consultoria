# Pavel Consultoria

Site institucional estático do repositório `PavelConsultoria/Pavel_Consultoria`, publicado no GitHub Pages em https://pavelconsultoria.com.br/. Não usa backend, credenciais ou acesso ao repositório do Simulator.

## Desenvolvimento

```powershell
npm.cmd run build
npm.cmd run check
npm.cmd start
```

O servidor local abre em http://localhost:4173/. `npm.cmd` evita o bloqueio do atalho PowerShell no Windows. O build não exige dependências: `scripts/build-site.cjs` gera as seis páginas HTML com cabeçalho e rodapé compartilhados. O GitHub Pages publica os HTML já gerados, sem depender de um build remoto.

## Páginas e referências

- `index.html`: Home, nova imagem clicável do WhatsApp, apresentação e dois depoimentos reais.
- `ms-project.html`: seis blocos de conteúdo, tópicos aprovados da ementa, PDF demonstrativo, investimento e três depoimentos.
- `primavera.html`: mesma distribuição visual, tópicos transcritos do sumário da prévia real, PDF demonstrativo e depoimentos.
- `certificacao-pmp.html`: apresentação do Simulator e assinatura de R$ 199,00 por 90 dias.
- `agenda.html`: lista e dois calendários, Google Sheets somente leitura, compartilhamento e PNG completo.
- `sobre.html`: conteúdo institucional e fotografia preservados.

Os componentes globais e o conteúdo dos cursos ficam em `scripts/build-site.cjs`. `templates/home.html` preserva a fonte dos textos institucionais e da Agenda. Edite as fontes e execute o build antes de publicar. `assets/site.css` aplica o novo mockup sobre os estilos existentes; `assets/site.js` mantém o relógio de Brasília, destinos antigos por hash e eventos comerciais do GoatCounter.

Documentos fornecidos em 10/10/2026: `Mocup site.docx` e `Pavel_Consultoria_Continuidade_08-10-2026.md` (este último sem “(2)” no nome). As fontes visuais não precisam ser publicadas no repositório público. Texto, imagens incorporadas e anotações do Word foram inspecionados. O renderizador alternativo produziu oito páginas com divergências de paginação, incluindo páginas vazias; suas capturas não equivalem a uma exportação nativa de sete páginas do Word.

## Valores confirmados pela proprietária

- MS Project: R$ 460,00, para turmas a partir de novembro de 2026. Outubro exige consulta, sem preço inventado.
- Primavera P6 Básico: R$ 700,00.
- Pavel PMP Simulator: R$ 199,00 por 90 dias.

Condições de pagamento não confirmadas são encaminhadas ao WhatsApp. Não se anunciam preços de outras modalidades do Simulator.

## Agenda e materiais

`assets/config.js` mantém telefone, mensagens, link do Simulator e os CSVs públicos das abas Turmas e Controle. O navegador não altera a planilha nem o Apps Script. Cada turma usa seu link de inscrição quando fornecido pelo CSV; campos vazios usam WhatsApp contextual. A data de atualização vem exclusivamente da aba Controle. Erros temporários exibem mensagem e bloqueiam a exportação, sem turmas fictícias de fallback.

`assets/agenda-share.js` exporta título, atualização, relação de turmas, datas, horários, contato, calendários, legenda e domínio oficial. O Canvas é utilizado somente nessa exportação. As prévias reais ficam em `assets/apostila-msproject-previa.pdf` e `assets/apostila-p6-reduzida.pdf`; os materiais completos não são publicados. O PDF do Primavera foi disponibilizado durante a sessão: suas sete páginas foram renderizadas e inspecionadas, e os tópicos da página 2 servem de fonte para o conteúdo, sem inventar ementa integral.

## Testes e publicação

Com o servidor local ativo:

```powershell
npm.cmd run check:browser
```

Requer Chrome instalado. Verifica seis páginas nas larguras 320, 390, 768, 1024 e 1440; imagens, menu móvel, destaque ativo, WhatsApp, preços, rodapés, CSV real, detalhes e navegação da Agenda, download PNG e falha CSV simulada. A simulação acontece apenas no navegador de teste. Capturas, perfil descartável, PNG e relatório JSON ficam em `.preview/`, ignorado pelo Git.

Depois do push e da conclusão do workflow Pages:

```powershell
$env:PAVEL_SITE_URL='https://pavelconsultoria.com.br/'
node scripts/site-browser-check.cjs
node --use-system-ca scripts/published-check.cjs
```

O segundo teste verifica recursos publicados por HTTP e hash, redirecionamentos, DNS, destinos externos, workflow e certificado original por SSL Labs. `--use-system-ca` mantém validação TLS com a cadeia confiável do Windows; é necessário neste ambiente por causa da interceptação do Avast. Nenhuma verificação ignora erros de certificado. Evidências publicadas ficam em `.preview/published/`.

O contador usa somente o endpoint público GoatCounter `counter/TOTAL.json`; indisponibilidade aparece como “indisponível”. Não há números simulados. O script oficial conta as páginas; cliques comerciais são eventos, sem inventar conversões ou alegar acesso ao painel privado.

Publicação técnica não significa aprovação visual da proprietária ou autorização final para divulgação. Consulte o MD de continuidade e o relatório de validação para resultados, limitações e pendências.
