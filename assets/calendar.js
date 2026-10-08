/* Datas civis brasileiras e astronomia; sem consultas externas em tempo de execução. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PAVEL_CALENDAR = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const zone = 'America/Sao_Paulo';
  const civil = new Intl.DateTimeFormat('sv-SE', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const clock = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const phases = [ ['🌑', 'Lua nova'], ['🌓', 'Quarto crescente'], ['🌕', 'Lua cheia'], ['🌗', 'Quarto minguante'] ];
  function dateKey(date = new Date()) { return civil.format(date); }
  function parseDate(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    const date = new Date(`${key}T12:00:00Z`);
    return !isNaN(date) && date.toISOString().slice(0, 10) === key ? date : null;
  }
  function monthAt(key, offset = 0) {
    const [year, month] = key.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1 + offset, 1, 12));
  }
  function upcoming(classes, now = new Date()) {
    const today = dateKey(now), time = clock.format(now);
    return classes.filter(item => {
      const first = [...item.dates].sort()[0];
      return first > today || (first === today && (!item.startTime || item.startTime > time));
    }).sort((a, b) => a.dates[0].localeCompare(b.dates[0]));
  }
  function holidays(year) {
    // Lei 662/1949 (alterada pela 10.607/2002), 6.802/1980 e 14.759/2023.
    // Não inclui pontos facultativos nem feriados locais (inclusive Sexta-feira Santa,
    // cuja instituição municipal está prevista na Lei 9.093/1995, art. 2º).
    return Object.fromEntries([
      ['01-01', 'Confraternização Universal'], ['04-21', 'Tiradentes'],
      ['05-01', 'Dia do Trabalho'], ['09-07', 'Independência do Brasil'],
      ['10-12', 'Nossa Senhora Aparecida'], ['11-02', 'Finados'],
      ['11-15', 'Proclamação da República'], ['11-20', 'Dia Nacional de Zumbi e da Consciência Negra'],
      ['12-25', 'Natal']
    ].map(([day, name]) => [`${year}-${day}`, name]));
  }
  function moonPhases(year, month, astronomy) {
    // Busca começa antes da meia-noite local; filtra depois da conversão de UTC.
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const start = new Date(Date.UTC(year, month, 1) - 86400000);
    const end = new Date(Date.UTC(year, month + 1, 2));
    const result = [];
    for (let event = astronomy.SearchMoonQuarter(start); event.time.date < end; event = astronomy.NextMoonQuarter(event)) {
      const key = dateKey(event.time.date);
      if (key.startsWith(prefix)) result.push({ date: key, quarter: event.quarter,
        icon: phases[event.quarter][0], name: phases[event.quarter][1], instant: event.time.date });
    }
    return result;
  }
  return { zone, dateKey, parseDate, monthAt, upcoming, holidays, moonPhases };
});
