const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const calendar = require('../assets/calendar.js');
const astronomy = require('../assets/vendor/astronomy.browser.min.js');
// Turmas sintéticas exclusivas dos testes de início; não são fonte da Home.
const config = {classes: [
 {id:'msp-noturna-2026-10',course:'msp',dates:['2026-10-06','2026-10-08','2026-10-13','2026-10-15'],startTime:'19:30',time:'19h30 às 21h30',duration:'8 horas',modality:'Online ao vivo'},
 {id:'msp-sabado',course:'msp',dates:['2026-10-17'],startTime:'09:00',time:'9h às 17h',duration:'8 horas',modality:'Online ao vivo'},
 {id:'p6-noturna',course:'p6',dates:['2026-10-20','2026-10-22','2026-10-27','2026-10-29'],startTime:'19:30',time:'19h30 às 21h30',duration:'8 horas',modality:'Online ao vivo'},
 {id:'p6-sabado',course:'p6',dates:['2026-10-31'],startTime:'09:00',time:'9h às 17h',duration:'8 horas',modality:'Online ao vivo'}]};
// USNO, API v4.0.1, consulta 2026-10-08; instantes UTC, não dados da aplicação.
// https://aa.usno.navy.mil/api/moon/phases/date?date=2026-10-01&nump=10
const reference = [
  ['2026-10-03T13:25:00Z', 3], ['2026-10-10T15:50:00Z', 0],
  ['2026-10-18T16:12:00Z', 1], ['2026-10-26T04:12:00Z', 2],
  ['2026-11-01T20:28:00Z', 3], ['2026-11-09T07:02:00Z', 0],
  ['2026-11-17T11:48:00Z', 1], ['2026-11-24T14:53:00Z', 2]
];
const moons = [9, 10].flatMap(month => calendar.moonPhases(2026, month, astronomy));
assert.equal(moons.length, 8);
moons.forEach((moon, index) => {
  const [utc, quarter] = reference[index];
  assert.equal(moon.quarter, quarter);
  assert.equal(moon.date, calendar.dateKey(new Date(utc)));
  assert(Math.abs(moon.instant - new Date(utc)) < 120000, `Diferença astronômica superior a 2 minutos: ${utc}`);
});
assert.equal(calendar.dateKey(new Date('2026-11-01T02:59:59Z')), '2026-10-31');
assert.equal(calendar.dateKey(new Date('2026-11-01T03:00:00Z')), '2026-11-01');
assert.equal(calendar.monthAt('2026-12-31', 1).toISOString().slice(0, 10), '2027-01-01');
assert.equal(calendar.monthAt('2027-01-01', -1).toISOString().slice(0, 10), '2026-12-01');
assert.equal(calendar.parseDate('2026-02-30'), null);
assert(calendar.parseDate('2028-02-29'));
assert.equal(calendar.upcoming(config.classes, new Date('2026-10-08T15:00:00Z')).length, 3);
assert(!calendar.upcoming(config.classes, new Date('2026-10-08T15:00:00Z')).some(item => item.id === 'msp-noturna-2026-10'));
assert.equal(calendar.upcoming(config.classes, new Date('2026-10-17T11:59:59Z')).length, 3);
assert.equal(calendar.upcoming(config.classes, new Date('2026-10-17T12:00:00Z')).length, 2);
assert.equal(calendar.upcoming(config.classes, new Date('2026-11-01T12:00:00Z')).length, 0);
assert.deepEqual(Array.from(config.classes.filter(item => item.course === 'msp').flatMap(item => Array.from(item.dates))), ['2026-10-06','2026-10-08','2026-10-13','2026-10-15','2026-10-17']);
assert.deepEqual(Array.from(config.classes.filter(item => item.course === 'p6').flatMap(item => Array.from(item.dates))), ['2026-10-20','2026-10-22','2026-10-27','2026-10-29','2026-10-31']);
assert(config.classes.every(item => item.duration === '8 horas' && item.modality === 'Online ao vivo'));
assert(config.classes.filter(item => item.dates.length > 1).every(item => item.time === '19h30 às 21h30'));
assert(config.classes.filter(item => item.dates.length === 1).every(item => item.time === '9h às 17h'));
const holidays = calendar.holidays(2026);
for (const key of ['2026-10-12','2026-11-02','2026-11-15','2026-11-20']) assert(holidays[key]);
assert.equal(Object.keys(holidays).length, 9);
for (const key of ['2026-02-17','2026-04-03','2026-06-04','2026-07-09']) assert(!holidays[key]);
for (const [year, month] of [[2027,0],[2028,1],[2030,11]]) {
  const phases = calendar.moonPhases(year, month, astronomy);
  assert(phases.length >= 4 && phases.length <= 5);
  assert.equal(new Set(phases.map(moon => moon.quarter)).size, 4);
}
// Em dezembro de 2026 a Lua nova ocorre em 09/12 UTC, mas em 08/12 no Brasil.
assert(calendar.moonPhases(2026, 11, astronomy).some(moon => moon.date === '2026-12-08' && moon.quarter === 0));
console.log('OK: fases lunares vs. USNO, fuso brasileiro, virada de mês/ano, feriados, horários e turmas futuras/históricas.');
