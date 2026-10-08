(() => {
  'use strict';
  const grid = document.querySelector('#calendar-grid');
  if (!grid) return;
  const config = window.PAVEL_CONFIG, dates = window.PAVEL_CALENDAR;
  const classes = config.classes.filter(item => config.courses[item.course] &&
    Array.isArray(item.dates) && item.dates.length && item.dates.every(key => dates.parseDate(key)));
  const monthFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', month: 'long', year: 'numeric' });
  const dateFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'long' });
  const shortFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
  const dialog = document.querySelector('#class-dialog');
  let today = dates.dateKey(), offset = 0, listSignature = '';
  function element(tag, text, className) {
    const node = document.createElement(tag); node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function dateSummary(item) {
    return item.dates.map(key => shortFormat.format(dates.parseDate(key))).join(', ');
  }
  function contactLink(item, label) {
    const link = element('a', label, 'text-link');
    let form = '';
    try { const url = new URL(config.forms[item.course]); if (url.protocol === 'https:') form = url.href; } catch {}
    // Não anunciar inscrição em uma turma iniciada. O histórico permite consulta.
    const future = dates.upcoming([item]).length > 0;
    const message = `${config.messages[item.course] || config.messages.geral} Gostaria de consultar a ${item.variant.toLowerCase()}, com início em ${shortFormat.format(dates.parseDate(item.dates[0]))}.`;
    link.href = future && form ? form : `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    return link;
  }
  function openClass(item, selectedDate) {
    document.querySelector('#dialog-title').textContent = config.courses[item.course].name;
    const details = document.querySelector('#dialog-details');
    details.replaceChildren(...[
      item.variant, `Datas: ${dateSummary(item)}`, `Horário: ${item.time}`,
      `${item.duration} · ${item.modality}`,
      ...(selectedDate ? [`Aula selecionada: ${dateFormat.format(dates.parseDate(selectedDate))}`] : []),
      ...(!dates.upcoming([item]).length ? ['Esta turma já começou. Consulte outras opções de participação.'] : [])
    ].map(text => element('p', text)));
    const primary = contactLink(item, dates.upcoming([item]).length && config.forms[item.course] ? 'Fazer minha inscrição' : 'Consultar esta turma ↗');
    primary.className = 'button';
    const whatsapp = contactLink(item, 'Tenho uma dúvida ↗');
    whatsapp.href = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(`${config.messages[item.course]} Gostaria de informações sobre a ${item.variant.toLowerCase()} de ${dateSummary(item)}.`)}`;
    document.querySelector('#dialog-actions').replaceChildren(primary, whatsapp);
    dialog.showModal();
  }
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  function renderList(now = new Date()) {
    const upcoming = dates.upcoming(classes, now);
    const signature = upcoming.map(item => item.id).join('|');
    if (signature === listSignature && document.querySelector('#class-list').children.length) return;
    listSignature = signature;
    const list = document.querySelector('#class-list'); list.replaceChildren();
    if (!upcoming.length) { list.append(element('p', 'Novas datas em definição.', 'agenda-empty')); return; }
    Object.keys(config.courses).forEach(course => {
      const cohorts = upcoming.filter(item => item.course === course);
      if (!cohorts.length) return;
      const article = element('article', '', 'class-list-item'); article.dataset.course = course;
      article.append(element('h3', config.courses[course].name));
      cohorts.forEach(item => {
        const group = element('div', '', 'agenda-cohort'); group.dataset.cohort = item.id;
        group.append(element('p', `${item.variant}: ${dateSummary(item)}.`), element('p', `Horário: ${item.time}.`),
          contactLink(item, 'Inscrição ou consulta ↗'));
        article.append(group);
      });
      if (cohorts.length > 1) article.append(element('p', 'Turmas alternativas de participação.', 'agenda-alternatives'));
      article.append(element('p', `${cohorts[0].duration}, ${cohorts[0].modality.toLowerCase()}.`, 'agenda-modality'));
      list.append(article);
    });
  }
  function renderCalendar() {
    grid.replaceChildren();
    for (let index = 0; index < 2; index++) {
      const monthDate = dates.monthAt(today, offset + index);
      const year = monthDate.getUTCFullYear(), month = monthDate.getUTCMonth();
      const label = monthFormat.format(monthDate), calendar = element('div', '', 'calendar');
      const heading = element('h3', label); heading.id = index ? 'calendar-next-month' : 'calendar-month';
      calendar.append(heading);
      const table = document.createElement('table'); table.setAttribute('aria-labelledby', heading.id);
      const head = table.createTHead().insertRow();
      ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach((day, dayIndex) => {
        const th = element('th', day, dayIndex === 0 || dayIndex === 6 ? 'weekend' : ''); th.scope = 'col';
        th.setAttribute('aria-label', ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][dayIndex]); head.append(th);
      });
      const holidays = dates.holidays(year), moons = dates.moonPhases(year, month, window.Astronomy);
      const body = table.createTBody(), start = monthDate.getUTCDay();
      const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      // Seis linhas em ambos os meses: faixas verticais e alturas uniformes.
      for (let position = 0; position < 42; position++) {
        if (position % 7 === 0) body.insertRow();
        const cell = body.lastElementChild.insertCell();
        if (position % 7 === 0 || position % 7 === 6) cell.className = 'weekend';
        const day = position - start + 1;
        if (day < 1 || day > days) { cell.classList.add('calendar-empty'); continue; }
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        cell.dataset.date = key;
        const number = element('span', String(day), 'day-number'); cell.append(number);
        if (key === today) { cell.classList.add('today'); cell.setAttribute('aria-current', 'date'); }
        const markers = element('div', '', 'day-markers');
        classes.filter(item => item.dates.includes(key)).forEach(item => {
          const button = element('button', config.courses[item.course].acronym, `class-day course-${item.course}`);
          button.type = 'button'; button.setAttribute('aria-label', `${config.courses[item.course].name}, ${dateFormat.format(dates.parseDate(key))}. Ver detalhes.`);
          button.addEventListener('click', () => openClass(item, key)); markers.append(button);
        });
        if (holidays[key]) {
          const flag = element('span', '⚑', 'holiday-marker');
          flag.title = `Feriado nacional: ${holidays[key]}`; flag.setAttribute('role', 'img'); flag.setAttribute('aria-label', flag.title); markers.append(flag);
        }
        moons.filter(moon => moon.date === key).forEach(moon => {
          const icon = element('span', moon.icon, 'moon-marker'); icon.title = moon.name;
          icon.setAttribute('role', 'img'); icon.setAttribute('aria-label', moon.name); markers.append(icon);
        });
        cell.append(markers);
      }
      calendar.append(table); grid.append(calendar);
    }
  }
  function refresh() {
    const now = new Date(), current = dates.dateKey(now);
    if (today !== current) { today = current; offset = 0; renderCalendar(); }
    renderList(now);
  }
  document.querySelector('#previous-month').addEventListener('click', () => { offset--; renderCalendar(); });
  document.querySelector('#next-month').addEventListener('click', () => { offset++; renderCalendar(); });
  // Consulta frequente também retira uma turma da lista quando chega o horário de início.
  // O timeout UTC do próximo segundo cobre a virada exata do dia sem depender do fuso do dispositivo.
  function tick() { refresh(); window.setTimeout(tick, 1000 - Date.now() % 1000 + 20); }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
  window.addEventListener('pageshow', refresh);
  renderCalendar(); tick();
})();
