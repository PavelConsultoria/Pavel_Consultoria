(() => {
  'use strict';
  const config = window.PAVEL_CONFIG;
  const menu = document.querySelector('#menu');
  const toggle = document.querySelector('.menu-toggle');
  function closeMenu() { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('is-open')) { closeMenu(); toggle.focus(); } });
  matchMedia('(min-width: 1201px)').addEventListener('change', closeMenu);

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
  if (whatsappUrl('geral')) document.querySelector('#contato-pendente').hidden = true;
  const simulatorUrl = externalUrl(config.simulatorUrl);
  if (simulatorUrl) {
    const link = document.querySelector('[data-simulator]');
    link.href = simulatorUrl; link.target = '_blank'; link.rel = 'noopener noreferrer';
    document.querySelector('#simulator-pendente').hidden = true;
  }

  // Datas civis em São Paulo: não interpretar AAAA-MM-DD como UTC.
  const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' });
  const monthFormat = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  const todayKey = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  function parseDate(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const [year, month, day] = key.split('-').map(Number);
    const value = new Date(year, month - 1, day, 12);
    return value.getFullYear() === year && value.getMonth() === month - 1 && value.getDate() === day ? value : null;
  }
  const today = parseDate(todayKey);
  let shownMonth = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const classes = config.classes.filter(item => parseDate(item.date) && config.courses[item.course])
    .slice().sort((a, b) => a.date.localeCompare(b.date));
  const dialog = document.querySelector('#class-dialog');
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  } });
  function textElement(tag, text, className) {
    const element = document.createElement(tag); element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function openClass(item) {
    document.querySelector('#dialog-title').textContent = config.courses[item.course].name;
    const details = document.querySelector('#dialog-details'); details.replaceChildren();
    [dateFormat.format(parseDate(item.date)), `Horário: ${item.time || 'a confirmar'}`,
      `Modalidade: ${item.modality || 'a confirmar'}`, `Status: ${item.status || 'a confirmar'}`]
      .forEach(text => details.append(textElement('p', text)));
    const actions = document.querySelector('#dialog-actions'); actions.replaceChildren();
    const form = externalUrl(config.forms[item.course]);
    if (form) {
      const link = textElement('a', 'Fazer minha inscrição', 'button');
      link.href = form; link.target = '_blank'; link.rel = 'noopener noreferrer'; actions.append(link);
    } else actions.append(textElement('p', 'Placeholder: link de inscrição pendente.', 'placeholder'));
    const whatsapp = textElement('a', 'Tenho uma dúvida ↗', 'text-link');
    prepareWhatsapp(whatsapp, item.course); actions.append(whatsapp);
    dialog.showModal();
  }
  function renderCalendar() {
    const year = shownMonth.getFullYear(), month = shownMonth.getMonth();
    const label = monthFormat.format(shownMonth);
    document.querySelector('#calendar-month').textContent = label;
    const table = document.createElement('table'); table.setAttribute('aria-label', `Calendário de ${label}`);
    const head = table.createTHead().insertRow();
    ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach((day, index) => {
      const th = textElement('th', day); th.scope = 'col';
      th.setAttribute('aria-label', ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][index]); head.append(th);
    });
    const body = table.createTBody();
    const offset = shownMonth.getDay(), days = new Date(year, month + 1, 0, 12).getDate();
    for (let position = 0; position < Math.ceil((offset + days) / 7) * 7; position++) {
      if (position % 7 === 0) body.insertRow();
      const cell = body.lastElementChild.insertCell();
      const day = position - offset + 1;
      if (day < 1 || day > days) continue;
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const events = classes.filter(item => item.date === key);
      if (events.length) {
        events.forEach(item => {
          const button = textElement('button', config.courses[item.course].acronym, 'class-day');
          button.type = 'button'; button.setAttribute('aria-label', `${config.courses[item.course].name}, ${dateFormat.format(parseDate(key))}. Ver detalhes.`);
          button.addEventListener('click', () => openClass(item)); cell.append(button);
        });
      } else {
        const number = textElement('span', String(day));
        if (key === todayKey) { number.className = 'today'; number.setAttribute('aria-current', 'date'); }
        cell.append(number);
      }
    }
    document.querySelector('#calendar-grid').replaceChildren(table);
  }
  function renderList() {
    const upcoming = classes.filter(item => item.date >= todayKey);
    const list = document.querySelector('#class-list');
    if (!upcoming.length) {
      list.replaceChildren(textElement('p', 'Programação pendente. As próximas datas serão exibidas após confirmação.', 'placeholder')); return;
    }
    list.replaceChildren();
    upcoming.forEach(item => {
      const article = textElement('article', '', 'class-list-item');
      const time = textElement('time', dateFormat.format(parseDate(item.date))); time.dateTime = item.date;
      const button = textElement('button', `${config.courses[item.course].name} ↗`); button.type = 'button';
      button.addEventListener('click', () => openClass(item));
      article.append(time, button, textElement('p', `${item.time || 'Horário a confirmar'} · ${item.modality || 'Modalidade a confirmar'} · ${item.status || 'Status a confirmar'}`));
      list.append(article);
    });
  }
  document.querySelector('#previous-month').addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1, 12); renderCalendar(); });
  document.querySelector('#next-month').addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1, 12); renderCalendar(); });
  renderCalendar(); renderList();
})();
