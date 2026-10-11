(() => {
  'use strict';
  const card = document.querySelector('.home-testimonial');
  if (!card) return;
  const slides = [
    ['Ricardo Delarue', 'Karolina é uma profissional excelente.'],
    ['Afonso Vieira Braida', 'Super recomendo, excelente didática e clareza.'],
    ['Rubens Santos', 'De fato, foi excelente o aprendizado que obtive contigo e com a Pavel Consultoria.'],
    ['Melquisedeque Lima', 'Muito obrigado [...] pela dedicação e por compartilhar seu conhecimento!']
  ];
  const content = card.querySelector('.home-testimonial-content');
  const quote = card.querySelector('.home-testimonial-quote');
  const author = card.querySelector('.home-testimonial-author');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, timer = null, animation = null, generation = 0, hovered = false, departed = false;
  const render = () => { author.textContent = slides[index][0]; quote.textContent = slides[index][1]; };
  function stop() {
    if (timer !== null) clearInterval(timer);
    timer = null;
    generation++;
    animation?.cancel();
    animation = null;
  }
  async function advance() {
    const current = generation;
    try {
      if (!reduced.matches) {
        animation = content.animate([{opacity: 1}, {opacity: 0}], {duration: 200, fill: 'forwards'});
        await animation.finished;
      }
      if (current !== generation) return;
      index = (index + 1) % slides.length;
      render();
      if (!reduced.matches) {
        animation?.cancel();
        animation = content.animate([{opacity: 0}, {opacity: 1}], {duration: 200});
        await animation.finished;
      }
    } catch { /* Cancelamento ao pausar ou sair da página. */ }
    finally { if (current === generation) { animation?.cancel(); animation = null; } }
  }
  function synchronize() {
    const paused = departed || document.hidden || card.hidden || getComputedStyle(card).display === 'none' || hovered || card.contains(document.activeElement);
    if (paused) stop();
    else if (timer === null) timer = setInterval(advance, 5000);
  }
  function place() {
    card.hidden = innerWidth <= 1200;
    if (!card.hidden) {
      const hero = card.closest('.hero'), box = hero.getBoundingClientRect();
      const seal = hero.querySelector('.institutional-seal').getBoundingClientRect();
      const top = seal.top - box.top - 23 - 125;
      card.style.top = `${top}px`;
      card.style.bottom = 'auto';
      // Reserva também os 3 px da flutuação nas duas extremidades.
      const region = {left: box.right - 265, right: box.right, top: box.top + top - 3, bottom: box.top + top + 128};
      const elements = [...hero.querySelectorAll('h1, .hero-description, .home-whatsapp, .institutional-seal, .hero-disciplines')];
      const conflict = elements.some(element => {
        const r = element.getBoundingClientRect();
        return !(region.right <= r.left - 20 || region.left >= r.right + 20 || region.bottom <= r.top - 20 || region.top >= r.bottom + 20);
      });
      card.hidden = region.top < box.top + 20 || region.bottom > box.bottom || region.left < box.left + box.width / 2 || conflict;
    }
    synchronize();
  }
  card.addEventListener('mouseenter', () => { hovered = true; synchronize(); });
  card.addEventListener('mouseleave', () => { hovered = false; synchronize(); });
  card.addEventListener('focusin', synchronize);
  card.addEventListener('focusout', () => queueMicrotask(synchronize));
  addEventListener('resize', place);
  document.addEventListener('visibilitychange', synchronize);
  addEventListener('pagehide', () => { departed = true; stop(); });
  addEventListener('pageshow', () => { departed = false; place(); });
  reduced.addEventListener('change', () => { stop(); synchronize(); });
  document.fonts.ready.then(place);
  render();
  place();
})();
