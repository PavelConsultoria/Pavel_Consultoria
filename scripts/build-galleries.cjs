// Existing MP4s are referenced in place. This generator never writes video files.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const escape = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const galleries = [
  { file:'galeria-msp.html', folder:'MSP', prefix:'MSP', name:'MS Project', labels:['01-CALENDÁRIO','02-CRIANDO FERIADOS RECORRENTES','03-RESTRIÇÕES DE TAREFA','04-ESTILOS DE BARRA','05-HISTOGRAMA DE RECURSOS','06-USO DA TAREFA','07-SEMANA DE TRABALHO','08-NIVELAMENTO POR PRIORIDADE','09-HISTOGRAMA','10-AGRUPAMENTO','11-FORMULAS-SINALIZADORES','12-COMPARTILHAMENTO DE TELA'] },
  { file:'galeria-p6.html', folder:'P6', prefix:'P6', name:'Primavera P6', labels:['01-PREFERENCIAS DO USUÁRIO','02-PREFERENCIAS DE ADMINISTRAÇÃO','03-COLUNAS','04-CRIAR PROJETO','05-OBS','06-WBS_EAP','07-ATIVIDADES','08-HISTOGRAMA','09-LINHA DE BASE','10-ATUALIZAÇÃO','11-RELATORIOS','12-CALENDÁRIOS'] }
];
// Validate the entire inventory before touching any page.
for (const gallery of galleries) {
  const folder = path.join(root, 'videos', 'galeria', gallery.folder);
  const found = fs.readdirSync(folder).filter(file => /\.mp4$/i.test(file)).sort();
  const expected = Array.from({length:12}, (_,i) => `${gallery.prefix}_${String(i+1).padStart(2,'0')}_FINAL.mp4`).sort();
  if (JSON.stringify(found) !== JSON.stringify(expected)) throw Error(`Inventário divergente: ${folder}\nEncontrados: ${found.join(', ')}`);
}
const originals = ['index.html','ms-project.html','primavera.html','certificacao-pmp.html','agenda.html','sobre.html'];
const navStyles = '<link rel="stylesheet" href="assets/gallery-navigation.css">';
for (const file of originals) {
  let html = read(file);
  html = html.replace(/<nav id="menu"[^>]*>[\s\S]*?<\/nav>/, nav => {
    nav = nav.replace(/\s*<a href="galeria-(?:msp|p6)\.html"[^>]*>[^<]*<\/a>/g, '');
    return nav.replace(/(<a href="sobre\.html")/, '<a href="galeria-msp.html">Galeria MSP</a>\n<a href="galeria-p6.html">Galeria P6</a>\n$1');
  });
  if (!html.includes('assets/gallery-navigation.css')) html = html.replace('</head>', `${navStyles}\n</head>`);
  if (html !== read(file)) fs.writeFileSync(path.join(root,file),html);
}
const reference = read('ms-project.html');
const sharedHeader = reference.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
const footer = reference.match(/<footer\b[\s\S]*?<\/footer>/)[0];
for (const gallery of galleries) {
  const title = `Galeria de Treinamentos – ${gallery.name}`;
  const header = sharedHeader.replace(/ aria-current="page"/g,'').replace(`href="${gallery.file}"`, `href="${gallery.file}" aria-current="page"`);
  const cards = gallery.labels.map((label,i) => {
    const number=String(i+1).padStart(2,'0');
    const displayLabel=label.replace(/^\d+[-_\s]*/, '');
    const src=`videos/galeria/${gallery.folder}/${gallery.prefix}_${number}_FINAL.mp4`;
    return `<figure class="gallery-item" aria-labelledby="video-${number}-title">
<video class="gallery-video" muted playsinline preload="metadata" disablepictureinpicture disableremoteplayback controlslist="nodownload nofullscreen noremoteplayback noplaybackrate" tabindex="-1" aria-label="${escape(displayLabel)} — demonstração sem áudio">
<source src="${src}" type="video/mp4">
Seu navegador não oferece reprodução de vídeo.
</video>
<button class="gallery-start" type="button" aria-label="Reproduzir ${escape(displayLabel)}"><span class="gallery-title-band"><span class="gallery-play-icon" aria-hidden="true">▶</span><span data-gallery-title>${escape(displayLabel)}</span></span></button>
<figcaption class="gallery-caption" id="video-${number}-title">${escape(displayLabel)}</figcaption>
<p class="gallery-error" role="status" hidden>Não foi possível carregar este vídeo.</p>
</figure>`;
  }).join('\n');
  const html=`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#1b252a">
<title>${title} | Pavel Consultoria</title>
<meta name="description" content="Conheça 12 demonstrações práticas do treinamento de ${gallery.name} da Pavel Consultoria.">
<link rel="canonical" href="https://pavelconsultoria.com.br/${gallery.file}">
<link rel="icon" href="assets/logo-pavel-dark.png" type="image/png">
<link rel="stylesheet" href="assets/styles.css">
<link rel="stylesheet" href="assets/site.css">
${navStyles}
<link rel="stylesheet" href="assets/training-gallery.css">
<script defer src="assets/config.js"></script>
<script defer src="assets/app.js"></script>
<script defer src="assets/site.js"></script>
<script defer src="assets/training-gallery.js"></script>
<script async data-goatcounter="https://pavelconsultoria.goatcounter.com/count" src="https://gc.zgo.at/count.js"></script>
<script defer src="assets/visits.js"></script>
</head>
<body class="internal gallery-page">
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
${header}
<main id="conteudo" class="gallery-main">
<section class="gallery-layout" aria-labelledby="gallery-title">
<div class="gallery-heading">
<h1 id="gallery-title">${title}</h1>
<span class="gallery-accent" aria-hidden="true"></span>
<div class="gallery-tools"><button class="gallery-music" type="button" aria-pressed="false" aria-label="Ativar trilha instrumental em volume baixo"><span aria-hidden="true">♫</span><span data-music-label>Ativar trilha</span></button><span class="gallery-music-status gallery-caption" role="status"></span></div>
</div>
<div class="gallery-grid">${cards}</div>
</section>
</main>
${footer}
</body>
</html>
`;
  fs.writeFileSync(path.join(root,gallery.file),html);
}
console.log('Galerias: 12 MP4 MSP + 12 MP4 P6 existentes; duas páginas e menu atualizados.');
