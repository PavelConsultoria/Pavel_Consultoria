/* Leitura CSV pública: campos citados, aspas duplicadas e quebras de linha. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PAVEL_AGENDA_DATA = api;
})(globalThis, function () {
  'use strict';
  function csv(text, preserveEmptyRows = false) {
    const rows = []; let row = [], field = '', quoted = false, closed = false;
    text = text.replace(/^\uFEFF/, '');
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (quoted) {
        if (char === '"' && text[i + 1] === '"') { field += '"'; i++; }
        else if (char === '"') { quoted = false; closed = true; }
        else field += char;
      } else if (char === '"' && !field && !closed) quoted = true;
      else if (char === ',') { row.push(field); field = ''; closed = false; }
      else if (char === '\r' || char === '\n') {
        row.push(field); rows.push(row); row = []; field = ''; closed = false;
        if (char === '\r' && text[i + 1] === '\n') i++;
      } else {
        if (closed || char === '"') throw new Error('CSV inválido: aspas.');
        field += char;
      }
    }
    if (quoted) throw new Error('CSV inválido: campo sem fechamento.');
    if (field || row.length || closed) { row.push(field); rows.push(row); }
    return preserveEmptyRows ? rows : rows.filter(row => row.some(value => value.trim()));
  }
  function updatedDate(text) {
    // B1 e uma posicao, nao o primeiro campo nao vazio da publicacao.
    const value = (csv(text, true)[0]?.[1] || '').trim();
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!match) return '';
    const [, day, month, year, hour = '0', minute = '0', second = '0'] = match;
    const date = new Date(0);
    date.setUTCFullYear(+year, +month - 1, +day);
    if (+year < 1000 || date.getUTCFullYear() !== +year || date.getUTCMonth() !== +month - 1 || date.getUTCDate() !== +day || +hour > 23 || +minute > 59 || +second > 59) return '';
    // Usa os componentes registrados, sem converter para o fuso do navegador.
    return day.padStart(2, '0') + '/' + month.padStart(2, '0') + '/' + year;
  }
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function https(value) {
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
  }
  function parse(text, calendar) {
    const rows = csv(text);
    const headers = ['ID','Treinamento','Formato','Datas (AAAA-MM-DD; separadas por ;)','Horário','Carga horária','Modalidade','Situação','Link de inscrição','Observações'];
    if (!rows.length || headers.some((title, i) => normalize(rows[0][i] || '') !== normalize(title))) throw new Error('Cabeçalhos da planilha incompatíveis.');
    // O ID da planilha é um rótulo administrativo. Repeti-lo não deve apagar
    // todas as turmas; cada linha continua independente, inclusive suas datas.
    const totals = new Map(), occurrences = new Map();
    rows.slice(1).forEach(row => { const id = (row[0] || '').trim(); totals.set(id, (totals.get(id) || 0) + 1); });
    return rows.slice(1).map((row, index) => {
      if (row.length !== headers.length) throw new Error(`Colunas incompletas na linha ${index + 2}.`);
      const [sourceId, training, variant, rawDates, time, duration, modality, status, link, notes] = row.map(value => value.trim());
      const course = /ms\s*project/.test(normalize(training)) ? 'msp' : /primavera\s*p6/.test(normalize(training)) ? 'p6' : '';
      const dates = rawDates ? [...new Set(rawDates.split(';').map(value => value.trim()))].sort() : [];
      const statuses = ['inscricoes abertas','esgotada','cancelada','encerrada','em definicao'];
      if (!sourceId || !course || !variant || !statuses.includes(normalize(status)) || dates.some(key => !calendar.parseDate(key))) throw new Error(`Dados inválidos na linha ${index + 2}.`);
      if (dates.length && (!time || !duration || !modality)) throw new Error(`Informações incompletas na linha ${index + 2}.`);
      const identity = JSON.stringify([sourceId, course, variant, dates, time, duration, modality, status, link, notes]);
      const occurrence = (occurrences.get(identity) || 0) + 1; occurrences.set(identity, occurrence);
      // Namespace separado garante que nenhum ID fornecido colida com chaves geradas.
      const id = totals.get(sourceId) > 1 ? JSON.stringify(['row', identity, occurrence]) : JSON.stringify(['id', sourceId]);
      const match = time.match(/^(\d{1,2})(?:h|:)?(\d{2})?/i);
      const startTime = match && +match[1] < 24 && +(match[2] || 0) < 60 ? `${match[1].padStart(2,'0')}:${match[2] || '00'}` : '';
      return { id, sourceId, course, training, variant, dates, time, duration, modality, status, statusKey: normalize(status), registrationUrl: https(link), notes, startTime };
    });
  }
  function upcoming(classes, calendar, now = new Date()) {
    return calendar.upcoming(classes.filter(item => item.dates.length && ['inscricoes abertas','esgotada'].includes(item.statusKey)), now);
  }
  return { csv, parse, https, upcoming, updatedDate };
});
