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
  if (dialog.id === 'apostila') loadBook();
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
      document.querySelector('[data-msp-book-status]').textContent = 'Não foi possível carregar o livro. Abra a prévia em PDF pelo botão abaixo.';
      document.querySelector('[data-msp-pages]').textContent = 'Prévia em PDF'; loading = null;
    }
  })();
  return loading;
}
async function renderBook() {
  if (!pdf || rendering) return;
  rendering = true; previous.disabled = next.disabled = true;
  const end = Math.min(first + (mobile.matches ? 0 : 1), pdf.numPages);
  try {
    const fragment = document.createDocumentFragment();
    for (let n = first; n <= end; n++) {
      const page = await pdf.getPage(n), viewport = page.getViewport({scale:1.5});
      const wrap = document.createElement('div'); wrap.className = 'msp-book-page';
      const canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height;
      canvas.setAttribute('role','img'); canvas.setAttribute('aria-label',`Página ${n} da apostila`);
      await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
      wrap.append(canvas); fragment.append(wrap);
    }
    pages.replaceChildren(fragment); pages.classList.remove('is-turning'); void pages.offsetWidth; pages.classList.add('is-turning');
    document.querySelector('[data-msp-pages]').textContent = `${first === end ? 'Página '+first : 'Páginas '+first+'–'+end} de ${pdf.numPages}`;
  } finally { rendering = false; previous.disabled = first === 1; next.disabled = end === pdf.numPages; }
}
previous.addEventListener('click', () => { first = Math.max(1, first - (mobile.matches ? 1 : 2)); renderBook(); });
next.addEventListener('click', () => { first = Math.min(pdf.numPages, first + (mobile.matches ? 1 : 2)); renderBook(); });
mobile.addEventListener('change', () => { if (!mobile.matches) first = 1 + 2 * Math.floor((first - 1) / 2); renderBook(); });
