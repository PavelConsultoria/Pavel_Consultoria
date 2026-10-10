(() => {
  'use strict';
  const config = window.PAVEL_CONFIG;
  // Posição fixa inicial dentro da faixa de especialidades, na extremidade direita.
  const floatingWhatsapp = document.querySelector('.whatsapp-floating');
  const heroCover = document.querySelector('.hero-cover img');
  function positionFloatingWhatsapp() {
    if (!matchMedia('(min-width: 961px)').matches) {
      floatingWhatsapp.style.removeProperty('--whatsapp-side-size');
      floatingWhatsapp.style.removeProperty('--whatsapp-side-right');
      floatingWhatsapp.style.removeProperty('--whatsapp-region-top');
      floatingWhatsapp.style.removeProperty('--whatsapp-band-right');
      floatingWhatsapp.style.removeProperty('--whatsapp-band-center');
      return;
    }
    const gap = Math.max(0, document.documentElement.clientWidth - heroCover.getBoundingClientRect().right);
    // Mantém 64px quando há espaço e margens de segurança no desktop estreito.
    const size = Math.min(64, Math.max(16, gap - 8));
    floatingWhatsapp.style.setProperty('--whatsapp-side-size', `${size}px`);
    const band = document.querySelector('.hero-disciplines').getBoundingClientRect();
    floatingWhatsapp.style.setProperty('--whatsapp-band-right', `${document.documentElement.clientWidth - band.right + 16}px`);
    const center = (band.top + band.bottom) / 2 + window.scrollY;
    floatingWhatsapp.style.setProperty('--whatsapp-band-center', `${center}px`);
  }
  if (heroCover && floatingWhatsapp) {
    new ResizeObserver(positionFloatingWhatsapp).observe(document.querySelector('.hero-cover'));
    window.addEventListener('resize', positionFloatingWhatsapp, { passive: true });
    heroCover.addEventListener('load', positionFloatingWhatsapp);
    positionFloatingWhatsapp();
  }
  const menu = document.querySelector('#menu');
  const toggle = document.querySelector('.menu-toggle');
  // A altura útil acompanha a marca, o menu e o zoom reais do navegador.
  if (document.body.classList.contains('home')) {
    const header = document.querySelector('.site-header');
    const updateHeaderHeight = () => document.documentElement.style.setProperty('--header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    new ResizeObserver(updateHeaderHeight).observe(header);
    updateHeaderHeight();
  }
  function closeMenu() { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });
  matchMedia('(min-width: 1201px)').addEventListener('change', closeMenu);


  // Um único item ativo, com bloqueio durante a navegação suave iniciada por clique.
  if (document.body.classList.contains('home')) {
    const links = [...menu.querySelectorAll('a[href^="#"]')];
    const targets = links.map(link => document.querySelector(link.getAttribute('href')));
    let locked = null, frame = 0, lastY = window.scrollY, stable = 0;
    function activate(index) {
      links.forEach((link, i) => {
        if (i === index) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }
    function destination(index) {
      const header = document.querySelector('.site-header').getBoundingClientRect().height;
      return Math.min(targets[index].getBoundingClientRect().top + window.scrollY - header,
        document.documentElement.scrollHeight - innerHeight);
    }
    function track() {
      frame = 0;
      const header = document.querySelector('.site-header').getBoundingClientRect().height;
      if (locked !== null) {
        stable = Math.abs(lastY - window.scrollY) < .5 ? stable + 1 : 0;
        lastY = window.scrollY;
        if (Math.abs(window.scrollY - destination(locked)) < 2 || stable > 90) locked = null;
        else { frame = requestAnimationFrame(track); return; }
      }
      let index = 0;
      targets.forEach((target, i) => { if (target.getBoundingClientRect().top <= header + 12) index = i; });
      if (window.scrollY > 0 && window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2) index = links.length - 1;
      activate(index);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(track); }
    links.forEach((link, index) => link.addEventListener('click', () => {
      locked = index; stable = 0; lastY = window.scrollY; activate(index); schedule();
    }));
    ['wheel', 'touchstart', 'keydown'].forEach(type => window.addEventListener(type, () => { locked = null; schedule(); }, { passive: true }));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('hashchange', schedule);
    window.addEventListener('load', schedule);
    schedule();
  }

  function externalUrl(value) {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
  }
  function whatsappUrl(key) {
    return /^\d{10,15}$/.test(config.whatsappNumber)
      ? `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(config.messages[key] || config.messages.geral)}` : '';
  }
  function prepareWhatsapp(link, key) {
    const url = whatsappUrl(key);
    if (url) { link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
    else {
      link.href = '#contato-pendente';
      link.classList.add('pending-link');
      link.title = 'Placeholder: número de WhatsApp pendente';
      link.addEventListener('click', () => {
        const dialog = link.closest('dialog');
        if (dialog?.open) dialog.close();
        document.querySelector('#contato-pendente').focus();
      });
    }
  }
  document.querySelectorAll('[data-whatsapp]').forEach(link => prepareWhatsapp(link, link.dataset.whatsapp));
  const pendingContact = document.querySelector('#contato-pendente');
  if (whatsappUrl('geral') && pendingContact) pendingContact.hidden = true;
  const simulatorUrl = externalUrl(config.simulatorUrl);
  if (simulatorUrl && document.querySelector('[data-simulator]')) {
    const link = document.querySelector('[data-simulator]');
    link.href = simulatorUrl; link.target = '_blank'; link.rel = 'noopener noreferrer';
    const pendingSimulator = document.querySelector('#simulator-pendente');
    if (pendingSimulator) pendingSimulator.hidden = true;
  }

})();
