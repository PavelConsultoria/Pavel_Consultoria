# Pavel Consultoria — validação da publicação em 10/10/2026

Publicado para inspeção e aprovação visual da proprietária em https://pavelconsultoria.com.br/. Publicação técnica não equivale a aprovação final para divulgação.

## Commit e deploy verificados

- Commit funcional validado: `17af33c72b1dee038a53eb54e4e22c64349febef`.
- Commit principal do mockup: `bc7a968b533b7596c9fbb7db7e64cf6d5487d41f` — Implementa novo mockup Pavel e revisa funcionalidades do site.
- Pushes para `origin/main` concluídos, sem force push. Atualizações complementares integraram o PDF real do Primavera e corrigiram problemas observados nas capturas públicas.
- GitHub Pages: **completed / success**, workflow [38067581798](https://github.com/PavelConsultoria/Pavel_Consultoria/actions/runs/38067581798), correspondente ao commit funcional acima.
- Rede verificada em 10/10/2026, 13:26:05; navegador finalizado em 10/10/2026, 13:26:31 (Brasília).
- Todos os 31 recursos consultados retornaram HTTP 200 e SHA-256 idêntico aos arquivos do commit: seis HTML, CSS, JavaScript, imagens e duas prévias PDF.
- O commit posterior de documentação inclui este relatório e as evidências, preservando os mesmos arquivos da aplicação. Seu hash é informado no relatório final da conversa.

## Mudanças implementadas

| Página | Resultado |
| --- | --- |
| Home | Título e faixa inferior novos; imagem Fale Conosco do Word clicável; WhatsApp flutuante removido; apresentação preservada e dois depoimentos reais; espaçamentos compactos no celular. |
| MS Project | Distribuição do mockup com seis blocos e atalhos; tópicos aprovados do briefing; prévia PDF real; R$ 460,00 somente a partir de novembro/2026; certificado e três depoimentos reais. |
| Primavera P6 Básico | Mesma distribuição visual; seis blocos baseados no sumário real da prévia fornecida; PDF de sete páginas; R$ 700,00; certificado e dois depoimentos específicos. |
| Certificação PMP | Apresentação do Simulator conforme material fornecido; assinatura R$ 199,00 por 90 dias; link oficial; nenhuma alteração no repositório do Simulator. |
| Agenda | Lista à esquerda e dois calendários à direita; CSVs Turmas/Controle preservados; inscrições contextuais; compartilhamento; PNG completo e legível com data, horários, turmas, calendário, legenda, contato e domínio oficial. |
| Sobre | Fotografia, conteúdo profissional e publicação preservados; identificação solicitada; fundo escuro e contraste corrigidos após inspeção pública. |
| Global | Cabeçalho e rodapé únicos gerados por fonte comum; menu na ordem do Word, destaque azul-petróleo sem sublinhado; WhatsApp depois de Sobre; relógio de Brasília, ícones sociais coloridos, contador real; faixa livre para WhatsApp no celular. |

O MD de continuidade foi lido integralmente. Texto, imagens e anotações do Word foram inspecionados; o renderizador alternativo apresentou oito páginas com diferenças de paginação, incluindo páginas vazias, e não substitui uma exportação nativa das sete páginas. Os depoimentos usados são literais; supressões aparecem como […]. Não foram criadas estrelas, datas ou fotos de alunos.

## Testes e evidências

| O que foi testado | Resultado | Evidência | Situação |
| --- | --- | --- | --- |
| Build local | Seis HTML estáticos gerados sem dependências da aplicação | npm.cmd run build; scripts/build-site.cjs | APROVADO |
| Verificações locais | Sintaxe, IDs, âncoras, recursos, preços, CSV, datas, astronomia, total público e tratamento de falhas | npm.cmd run check | APROVADO |
| Publicação efetiva | Workflow concluído e conteúdo servido idêntico ao commit | Workflow e SHA-256 em [network-report.json](docs/evidencias-10-10-2026/network-report.json) | APROVADO |
| Seis páginas públicas | HTTP 200; um título principal, cabeçalho e rodapé; imagens carregadas e item ativo correto | [browser-report.json](docs/evidencias-10-10-2026/browser-report.json) | APROVADO |
| Responsividade | 320, 390, 768, 1024 e 1440 px sem rolagem horizontal | Capturas e relatório Chrome | APROVADO |
| Menu e WhatsApp | Menu abre/fecha, Escape funciona, destaque sem sublinhado; número 5521995716270; margem livre no celular | Relatório Chrome; wa.me retornou 302 | APROVADO |
| Console e recursos | Zero exceções JavaScript e nenhum recurso interno com erro HTTP | browser-report.json e network-report.json | APROVADO |
| Agenda real | Dois calendários e onze indicadores; data do Controle; navegação mensal e detalhes reais | Captura da Agenda e relatório Chrome | APROVADO |
| Inscrições | Destinos do CSV respeitados; turmas sem Forms usam WhatsApp contextual | Links registrados no relatório Chrome; sem envio de cadastro/mensagens | APROVADO |
| Compartilhamento por cópia | URL oficial verificada com Clipboard API simulada, sem alterar clipboard da proprietária | Campo shareFallback do relatório Chrome | APROVADO |
| Compartilhamento nativo | Exige dispositivo compatível com Web Share API | Não exercitado no Chrome headless | PENDENTE |
| PNG completo | Download real, 1800 × 1110, 229959 bytes; legenda e turmas conferidas visualmente | [PNG exportado](docs/evidencias-10-10-2026/pavel-agenda-completa.png) | APROVADO |
| Falha temporária dos CSVs | Mensagem adequada; exportação desabilitada; sem turmas fictícias | Simulação somente no navegador de teste, registrada no relatório | APROVADO |
| Duas apostilas demonstrativas | HTTP 200 e hash idêntico ao commit; prévia Primavera renderizada e inspecionada em sete páginas | network-report.json | APROVADO |
| Certificado | Descrição solicitada presente; sem links individuais fictícios | MS Project e Primavera | APROVADO |
| GoatCounter | Script e total público HTTP 200; requisições de páginas e eventos da Agenda HTTP 200; API retornou {"count_unique":"3", "count":"3"} | Relatórios de navegador e rede | APROVADO |
| Analytics e conversões no painel | Sem acesso ao painel privado; nenhuma métrica comercial presumida | Limitação de acesso | PENDENTE |
| Simulator e Instagram | HTTP 200 | network-report.json | APROVADO |
| Facebook | Endereço fornecido retorna 302; conteúdo final/autenticado não confirmado | network-report.json | PENDENTE |
| LinkedIn | HTTP 999 para acesso automatizado; link preservado | network-report.json | PENDENTE |
| HTTPS e DNS públicos | Certificado independente, cadeia SNI confiável, registros e redirects confirmados | SSL Labs, DNS direto e DNS-over-HTTPS | APROVADO |
| Aprovação visual final | Cabe à proprietária inspecionar o site publicado | https://pavelconsultoria.com.br/ | PENDENTE |

## HTTPS, certificado e redirecionamentos

O Node inicialmente retornou **UNABLE_TO_VERIFY_LEAF_SIGNATURE** porque esta máquina usa interceptação HTTPS do Avast. `--use-system-ca` permitiu validar a cadeia confiável do Windows; nenhum teste desativou a validação TLS. O certificado do Avast observado localmente não foi usado como prova da cadeia pública original.

Prova independente: [Qualys SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=pavelconsultoria.com.br), inspeção iniciada em 10/10/2026, 12:27:03. [Resposta integral da API](docs/evidencias-10-10-2026/ssl-labs-full.json):

- Certificado original: CN=pavelconsultoria.com.br; emissor CN=YR2, O=Let's Encrypt, C=US.
- Cobertura: pavelconsultoria.com.br, www.pavelconsultoria.com.br.
- Validade: 09/10/2026, 14:48:56 a 07/01/2027, 14:48:55 (Brasília).
- SHA-256: `877286412d491460346f95feddbe62e2a7829e7e9878d3ae5b95a0399b6ce72d`.
- Cadeia com SNI confiável em Mozilla, Apple, Android, Java e Windows nos quatro IPv4; issues = 0; TLS 1.2 e 1.3.
- Nota **B** nos quatro endpoints, com avisos: suites TLS 1.2 marcadas fracas (TLS_RSA_WITH_AES_128_GCM_SHA256 e TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256), forward secrecy parcial e HSTS ausente. Estes aspectos da hospedagem compartilhada não foram alterados.
- Clientes sem SNI recebem certificado padrão de github.io, incompatível com o domínio próprio; essa condição está registrada na resposta SSL Labs. Os navegadores modernos testados usam SNI.
- O Chrome público não apresentou intersticial de certificado nem recurso HTTP misto; esta observação local é complementada pela avaliação independente, não a substitui.

Redirecionamentos verificados: HTTP sem www, HTTP com www, HTTPS com www e endereço GitHub Pages antigo retornaram **301 → 200**, terminando em https://pavelconsultoria.com.br/.

DNS: A = 185.199.108.153, 185.199.109.153, 185.199.110.153 e 185.199.111.153; CNAME www = pavelconsultoria.github.io. AAAA e CAA retornaram ENODATA, também confirmado por respostas DNS-over-HTTPS sem registros desses tipos. As primeiras consultas DNS no sandbox retornaram ETIMEOUT; a repetição autorizada fora dele resolveu os registros corretamente. Não houve alteração de DNS ou configuração externa.

## Desempenho observado e limites

Nesta consulta única, os seis HTML tiveram os seguintes tempos de resposta (incluem a rede e o Avast desta máquina; não são Core Web Vitals nem benchmark de celular):

- index.html: 1481 ms, 10371 bytes.
- ms-project.html: 388 ms, 11630 bytes.
- primavera.html: 1283 ms, 10855 bytes.
- certificacao-pmp.html: 644 ms, 7987 bytes.
- agenda.html: 1585 ms, 8905 bytes.
- sobre.html: 689 ms, 9877 bytes.

Imagens, CSS e JavaScript usados foram consultados sem erros; fotos e material de apoio usam dimensões explícitas e carregamento diferido quando cabível. PDFs são acessados por demanda. Não houve benchmark comparativo antes/depois nem medição formal de CLS/LCP. Imagens herdadas e os PDFs ainda têm tamanho relevante; otimizações adicionais podem ser avaliadas após aprovação visual, preservando a qualidade.

## Pendências e proteção do projeto

- Inspeção visual final da proprietária, especialmente páginas e margens no celular.
- Compartilhamento nativo em aparelho real; Safari/Firefox e formulário final com cadastro real não foram exercitados. Os CSVs atuais encaminham inscrições ao WhatsApp por não fornecerem links Forms.
- Ementas integrais e condições de pagamento não fornecidas; preço de MS Project em outubro permanece sob consulta. Prévia do Primavera resolvida.
- Validar LinkedIn manualmente e confirmar o destino final do Facebook em sessão normal.
- Examinar avisos de TLS da hospedagem, sem prometer segurança absoluta nem alterar configurações sensíveis.
- Auditoria do painel GoatCounter, UTMs/origens e conversões reais depende de acesso aos dados administrativos.
- Código alterado somente no Pavel_Consultoria; nenhum acesso de escrita ao Simulator, Supabase, DNS, planilha ou Apps Script. Stage auditado sem padrões de segredos, credenciais ou temporários; diff --check aprovado.
- Word e referência visual originais preservados sem rastreamento: Mocup site.docx e assets/referencia-visual-pavel.png. Ferramentas e perfis descartáveis em .preview, ignorado. Arquivos em docs/evidencias-10-10-2026 são evidências deliberadas da publicação, não arquivos temporários da aplicação.

## Capturas do site real

- [Home desktop](docs/evidencias-10-10-2026/index-1440.png)
- [Home celular](docs/evidencias-10-10-2026/index-390.png)
- [Agenda desktop com dados reais carregados](docs/evidencias-10-10-2026/agenda-1440.png)
- [Sobre no celular](docs/evidencias-10-10-2026/sobre-390.png)
- [Agenda PNG completa](docs/evidencias-10-10-2026/pavel-agenda-completa.png)

O site está publicado para revisão da proprietária. A aprovação final para divulgação permanece pendente.
