/* Leitura CSV pública: campos citados, aspas duplicadas e quebras de linha. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PAVEL_AGENDA_DATA = api;
})(globalThis, function () {
  'use strict';
  function csv(text) {
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
    return rows.filter(row => row.some(value => value.trim()));
  }
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function https(value) {
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
  }
  function parse(text, calendar) {
    const rows = csv(text);
    const headers = ['ID','Treinamento','Formato','Datas (AAAA-MM-DD; separadas por ;)','Horário','Carga horária','Modalidade','Situação','Link de inscrição','Observações'];
    if (!rows.length || headers.some((title, i) => normalize(rows[0][i] || '') !== normalize(title))) throw new Error('Cabeçalhos da planilha incompatíveis.');
    const seen = new Set();
    return rows.slice(1).map((row, index) => {
      if (row.length !== headers.length) throw new Error(`Colunas incompletas na linha ${index + 2}.`);
      const [id, training, variant, rawDates, time, duration, modality, status, link, notes] = row.map(value => value.trim());
      const course = /ms\s*project/.test(normalize(training)) ? 'msp' : /primavera\s*p6/.test(normalize(training)) ? 'p6' : '';
      const dates = rawDates ? [...new Set(rawDates.split(';').map(value => value.trim()))].sort() : [];
      const statuses = ['inscricoes abertas','esgotada','cancelada','encerrada','em definicao'];
      if (!id || seen.has(id) || !course || !variant || !statuses.includes(normalize(status)) || dates.some(key => !calendar.parseDate(key))) throw new Error(`Dados inválidos na linha ${index + 2}.`);
      if (dates.length && (!time || !duration || !modality)) throw new Error(`Informações incompletas na linha ${index + 2}.`);
      seen.add(id);
      const match = time.match(/^(\d{1,2})(?:h|:)?(\d{2})?/i);
      const startTime = match && +match[1] < 24 && +(match[2] || 0) < 60 ? `${match[1].padStart(2,'0')}:${match[2] || '00'}` : '';
      return { id, course, training, variant, dates, time, duration, modality, status, statusKey: normalize(status), registrationUrl: https(link), notes, startTime };
    });
  }
  function upcoming(classes, calendar, now = new Date()) {
    return calendar.upcoming(classes.filter(item => item.dates.length && ['inscricoes abertas','esgotada'].includes(item.statusKey)), now);
  }
  return { csv, parse, https, upcoming };
});
