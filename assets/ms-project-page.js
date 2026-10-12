const close = dialog => dialog.close();
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const dialog = document.querySelector('.msp-modal[open]');
    if (dialog) { event.preventDefault(); close(dialog); }
  }
});
document.querySelectorAll('[data-msp-modal]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const dialog = document.getElementById(link.dataset.mspModal);
  dialog.showModal(); document.body.classList.add('msp-modal-open');
  if (dialog.id === 'apostila') { loadBook(); fitBook(); }
}));
document.querySelectorAll('.msp-modal').forEach(dialog => {
  dialog.querySelector('[data-msp-close]').addEventListener('click', () => close(dialog));
  dialog.addEventListener('close', () => document.body.classList.remove('msp-modal-open'));
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) close(dialog);
  });
});
const quotes = [
  ['Melquisedeque Lima', 'Foi um treinamento excelente e que, sem dúvida, valeu muito a pena. Os exemplos e a condução das aulas tornaram o aprendizado mais prático e aplicável ao dia a dia.'],
  ['Afonso Vieira Braida', 'Super recomendo, excelente didática e clareza.'],
  ['Rubens Santos', 'O treinamento do MS Project reforçou conhecimentos em cronogramas, dependências, recursos, linha de base, acompanhamento e análise de desvios entre planejado e realizado.'],
  ['Melquisedeque Lima', 'Foram noites dedicadas ao aprendizado, aprimoramento e troca de experiências sobre uma ferramenta tão importante para o planejamento e gerenciamento de projetos.'],
  ['Kristina Moraes', 'Recomendo! Se você está procurando aprimorar seus conhecimentos, o da Pavel, sem dúvida, é o ideal.']
];
const box = document.querySelector('.msp-testimonial'), quote = box.querySelector('.msp-testimonial-quote'), author = box.querySelector('.msp-testimonial-author');
let round = [], last = -1;
function nextQuote() {
  if (!round.length) {
    round = quotes.map((_, i) => i);
    for (let i = round.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [round[i], round[j]] = [round[j], round[i]]; }
    if (round[0] === last) [round[0], round[1]] = [round[1], round[0]];
  }
  last = round.shift(); author.textContent = quotes[last][0]; quote.textContent = quotes[last][1];
}
nextQuote(); box.hidden = false;
setInterval(() => {
  const content = box.querySelector('.msp-testimonial-content');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { nextQuote(); return; }
  content.animate([{opacity:1},{opacity:0}], {duration:200,fill:'forwards'}).finished.then(() => {
    nextQuote(); content.animate([{opacity:0},{opacity:1}], {duration:200,fill:'forwards'});
  });
}, 5000);
let pdf, loading, first = 1, rendering = false;
const mobile = matchMedia('(max-width:760px)'), pages = document.querySelector('.msp-book-pages');
const previous = document.querySelector('[data-msp-previous]'), next = document.querySelector('[data-msp-next]');
const pageCache = new Map();
let pageRatio = 1;
function fitBook() {
  const dialog = document.getElementById('apostila');
  if (!dialog.open) return;
  const style = getComputedStyle(dialog);
  const heading = dialog.querySelector('.msp-modal-heading');
  const controls = dialog.querySelector('.msp-book-controls');
  const availableHeight = Math.max(80, parseFloat(style.maxHeight) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - heading.getBoundingClientRect().height - parseFloat(getComputedStyle(heading).marginBottom) - controls.getBoundingClientRect().height - parseFloat(getComputedStyle(controls).marginBottom) - 4);
  const availableWidth = dialog.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  pages.style.setProperty('--msp-book-width', `${Math.min(availableWidth, availableHeight * pageRatio * (mobile.matches ? 1 : 2))}px`);
}
async function pageCanvas(number) {
  if (!pageCache.has(number)) {
    const page = await pdf.getPage(number), viewport = page.getViewport({scale:1.5});
    const canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height;
    pageRatio = viewport.width / viewport.height;
    canvas.setAttribute('role','img'); canvas.setAttribute('aria-label',`Página ${number} da apostila`);
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    pageCache.set(number, canvas);
  }
  const original = pageCache.get(number), copy = original.cloneNode();
  copy.getContext('2d').drawImage(original,0,0);
  return copy;
}
function pageWrap(canvas) {
  const wrap = document.createElement('div'); wrap.className = 'msp-book-page'; wrap.append(canvas); return wrap;
}
async function flipLeaf(oldPages, newPages, direction) {
  const single = mobile.matches;
  const leaf = document.createElement('div'); leaf.className = 'msp-book-leaf' + (direction < 0 ? ' is-backward' : '');
  const front = document.createElement('div'), back = document.createElement('div');
  front.className = 'msp-book-face'; back.className = 'msp-book-face is-back';
  // Keep the stationary page in place while the sheet turns around the spine.
  front.append(oldPages[single || direction < 0 ? 0 : 1].firstElementChild.cloneNode());
  const oldCanvas = oldPages[single || direction < 0 ? 0 : 1].firstElementChild;
  front.firstChild.getContext('2d').drawImage(oldCanvas,0,0);
  const newCanvas = newPages[single || direction > 0 ? 0 : 1].firstElementChild;
  back.append(newCanvas.cloneNode()); back.firstChild.getContext('2d').drawImage(newCanvas,0,0);
  if (single) pages.replaceChildren(newPages[0].cloneNode(true));
  else if (direction > 0) pages.replaceChildren(oldPages[0], newPages[1]);
  else pages.replaceChildren(newPages[0], oldPages[1]);
  // A cloned canvas needs its bitmap copied explicitly.
  if (single) pages.firstChild.firstChild.getContext('2d').drawImage(newCanvas,0,0);
  const shades = [front,back].map(face => { const shade = document.createElement('div'); shade.className = 'msp-book-shade'; face.append(shade); return shade; });
  leaf.append(front,back); pages.append(leaf);
  const options = {duration:850,easing:'cubic-bezier(.35,.05,.25,1)',fill:'forwards'};
  shades.forEach(shade => shade.animate([{opacity:0},{opacity:.65,offset:.5},{opacity:0}],options));
  await leaf.animate([{transform:'rotateY(0deg)'},{transform:`rotateY(${direction > 0 ? -180 : 180}deg)`}],options).finished;
  leaf.remove();
}
async function loadBook() {
  if (pdf) return;
  if (loading) return loading;
  loading = (async () => {
    try {
      const lib = await import('./vendor/msp-pdf.js');
      lib.GlobalWorkerOptions.workerSrc = new URL('./vendor/msp-pdf.worker.js', import.meta.url).href;
      pdf = await lib.getDocument({url:new URL('./apostila-msproject-previa.pdf', import.meta.url).href}).promise;
      document.querySelector('[data-msp-book-status]').hidden = true;
      await renderBook();
    } catch (error) {
      console.error('Prévia MS Project:', error);
      document.querySelector('[data-msp-book-status]').textContent = 'Não foi possível carregar a prévia. Feche a janela e tente novamente.';
      document.querySelector('[data-msp-pages]').textContent = 'Prévia em PDF'; loading = null;
    }
  })();
  return loading;
}
async function renderBook(direction = 0, target = first) {
  if (!pdf || rendering) return;
  rendering = true; previous.disabled = next.disabled = true;
  const end = Math.min(target + (mobile.matches ? 0 : 1), pdf.numPages);
  try {
    const spread = [];
    for (let n = target; n <= end; n++) spread.push(pageWrap(await pageCanvas(n)));
    pages.classList.toggle('is-single',mobile.matches); fitBook();
    const oldPages = [...pages.children];
    if (direction && oldPages.length === spread.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) await flipLeaf(oldPages,spread,direction);
    pages.replaceChildren(...spread); first = target;
    document.querySelector('[data-msp-pages]').textContent = `${first === end ? 'Página '+first : 'Páginas '+first+'–'+end} de ${pdf.numPages}`;
  } finally { rendering = false; previous.disabled = first === 1; next.disabled = end === pdf.numPages; }
}
previous.addEventListener('click', () => renderBook(-1,Math.max(1, first - (mobile.matches ? 1 : 2))));
next.addEventListener('click', () => renderBook(1,Math.min(pdf.numPages, first + (mobile.matches ? 1 : 2))));
mobile.addEventListener('change', () => renderBook(0,mobile.matches ? first : 1 + 2 * Math.floor((first - 1) / 2)));
window.addEventListener('resize', fitBook);
