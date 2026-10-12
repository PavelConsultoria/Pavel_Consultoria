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
let pdf, loading, book, pageImages = [], pageRatio = 1, layoutKey = '', resizeFrame;
const renderedPages = new Map();
const mobile = matchMedia('(max-width:760px)'), pages = document.querySelector('.msp-book-pages');
const previous = document.querySelector('[data-msp-previous]'), next = document.querySelector('[data-msp-next]');
function syncBook(state) {
  if (!book) return;
  const index = book.getCurrentPageIndex();
  const first = book.getOrientation() === 'portrait' ? index + 1 : 2 * Math.floor(index / 2) + 1;
  const end = Math.min(first + (book.getOrientation() === 'portrait' ? 0 : 1), pdf.numPages);
  const currentState = typeof state === 'string' ? state : book.getState();
  const busy = currentState !== 'read';
  previous.disabled = busy || first === 1;
  next.disabled = busy || end === pdf.numPages;
  pages.dataset.flipState = currentState;
  pages.dataset.visiblePages = `${first}-${end}`;
  if (!busy) document.querySelector('[data-msp-pages]').textContent = `${first === end ? 'Página '+first : 'Páginas '+first+'–'+end} de ${pdf.numPages}`;
}
function fitBook() {
  const dialog = document.getElementById('apostila');
  if (!dialog.open || !pageImages.length) return;
  const style = getComputedStyle(dialog);
  const heading = dialog.querySelector('.msp-modal-heading');
  const controls = dialog.querySelector('.msp-book-controls');
  const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const availableHeight = Math.max(1, Math.min(parseFloat(style.maxHeight), window.innerHeight - 32) - paddingY - heading.getBoundingClientRect().height - parseFloat(getComputedStyle(heading).marginBottom) - controls.getBoundingClientRect().height - parseFloat(getComputedStyle(controls).marginBottom) - 24);
  const availableWidth = dialog.clientWidth - paddingX - 16;
  const width = Math.max(1, Math.floor(Math.min(availableWidth / (mobile.matches ? 1 : 2), availableHeight * pageRatio)));
  const height = Math.floor(width / pageRatio);
  const key = `${width}:${height}:${mobile.matches}`;
  if (key === layoutKey && book) return;
  // Redimensiona a instância existente; a navegação não recria o livro nem as páginas.
  pages.style.width = `${width * (mobile.matches ? 1 : 2)}px`;
  pages.style.height = `${height}px`;
  if (book) {
    const settings = book.getSettings();
    Object.assign(settings, { width, height, usePortrait: mobile.matches });
    const mount = pages.querySelector('.msp-book-mount');
    mount.style.minWidth = pages.style.width;
    mount.style.minHeight = pages.style.height;
    layoutKey = key; book.getUI().update(); book.update(); syncBook(); return;
  }
  const mount = document.createElement('div'); mount.className = 'msp-book-mount'; pages.append(mount);
  book = new window.St.PageFlip(mount, {
    width, height, size:'fixed', startPage:0, usePortrait:mobile.matches,
    showCover:false, drawShadow:true, maxShadowOpacity:.65, flippingTime:1600,
    autoSize:false, mobileScrollSupport:false, showPageCorners:true, useMouseEvents:true
  });
  book.on('init',syncBook); book.on('flip',syncBook); book.on('changeState',event => syncBook(event.data)); book.on('changeOrientation',syncBook);
  // Canvas desenha folhas flexíveis e sombras dentro de uma única superfície.
  book.loadFromImages(pageImages); layoutKey = key; syncBook();
}
function loadPageFlip() {
  if (window.St?.PageFlip) return Promise.resolve();
  return new Promise((resolve,reject) => {
    const script = document.createElement('script'); script.src = new URL('./vendor/msp-page-flip.js',import.meta.url).href;
    script.onload = resolve; script.onerror = reject; document.head.append(script);
  });
}
async function loadBook() {
  if (book) { fitBook(); return; }
  if (loading) return loading;
  loading = (async () => {
    try {
      const [lib] = await Promise.all([import('./vendor/msp-pdf.js'), loadPageFlip()]);
      lib.GlobalWorkerOptions.workerSrc = new URL('./vendor/msp-pdf.worker.js', import.meta.url).href;
      pdf ??= await lib.getDocument({url:new URL('./apostila-msproject-previa.pdf', import.meta.url).href}).promise;
      const images = new Array(pdf.numPages);
      let nextPage = 1;
      const renderPages = async () => {
        while (nextPage <= pdf.numPages) {
          const number = nextPage++;
          if (!renderedPages.has(number)) {
            const rendered = (async () => {
              const page = await pdf.getPage(number), viewport = page.getViewport({scale:1.5});
              const canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height;
              pageRatio = viewport.width / viewport.height;
              try {
                await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
                const blob = await new Promise((resolve,reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PDF page encoding failed')), 'image/png'));
                return URL.createObjectURL(blob);
              } finally {
                canvas.width = canvas.height = 0;
                page.cleanup();
              }
            })();
            renderedPages.set(number, rendered);
            rendered.catch(() => renderedPages.delete(number));
          }
          images[number - 1] = await renderedPages.get(number);
        }
      };
      // Two workers preserve page order and reuse cached images on reopening or retry.
      await Promise.all([renderPages(), renderPages()]);
      pageImages = images;
      document.querySelector('[data-msp-book-status]').hidden = true;
      fitBook();
    } catch (error) {
      console.error('Prévia MS Project:', error);
      document.querySelector('[data-msp-book-status]').textContent = 'Não foi possível carregar a prévia. Feche a janela e tente novamente.';
      document.querySelector('[data-msp-pages]').textContent = 'Prévia em PDF'; loading = null;
    }
  })();
  return loading;
}
previous.addEventListener('click', () => { if (book && !previous.disabled) book.flipPrev('bottom'); });
next.addEventListener('click', () => { if (book && !next.disabled) book.flipNext('bottom'); });
window.addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(fitBook); });
