const assert = require('node:assert/strict');
const data = require('../assets/agenda-data.js');
const calendar = require('../assets/calendar.js');
const header = 'ID,Treinamento,Formato,Datas (AAAA-MM-DD; separadas por ;),Horário,Carga horária,Modalidade,Situação,Link de inscrição,Observações';
const rows = [
 'm1,MS Project,Noturno,2026-10-06;2026-10-08,19h30–21h30,8h,Online ao vivo,Inscrições abertas,,',
 'm2,MS Project,Sábado,2026-10-17,9h–17h,8h,Online ao vivo,Encerrada,,',
 'p1,Primavera P6,Noturno,2026-10-20;2026-10-22,19h30–21h30,8h,Online ao vivo,Inscrições abertas,https://example.com/form,"Texto, com ""aspas""\ne quebra"',
 'p2,Primavera P6,Sábado,2026-10-31,9h–17h,8h,Online ao vivo,Esgotada,,',
 'p3,Primavera P6,Noturno,2026-10-29,19h30–21h30,8h,Online ao vivo,Cancelada,,',
 'p4,Primavera P6,Sábado,,,8h,Online ao vivo,Em definição,,'
];
const classes = data.parse('\uFEFF'+header+'\r\n'+rows.join('\r\n')+'\r\n', calendar);
assert.equal(classes.length, 6);
assert.equal(classes[2].notes, 'Texto, com "aspas"\ne quebra');
assert.equal(classes[2].registrationUrl, 'https://example.com/form');
assert.equal(classes[0].registrationUrl, '');
assert.deepEqual(classes[0].dates, ['2026-10-06','2026-10-08']);
assert.equal(classes[0].startTime, '19:30');
assert.equal(classes[1].startTime, '09:00');
assert.deepEqual(data.upcoming(classes,calendar,new Date('2026-10-08T15:00:00Z')).map(c=>c.id),['p1','p2']);
assert.equal(data.upcoming(classes,calendar,new Date('2026-11-01T15:00:00Z')).length,0);
assert.equal(classes[5].dates.length,0);
assert.equal(data.parse(header,calendar).length,0);
assert.equal(data.https('javascript:alert(1)'), '');
assert.equal(data.https('https://user:pass@example.com'), '');
assert.throws(()=>data.csv('a,"não fechado'));
assert.throws(()=>data.parse('outro,cabeçalho',calendar));
assert.throws(()=>data.parse(header+'\n'+rows[0].replace('2026-10-06','2026-02-30'),calendar));
assert.throws(()=>data.parse(header+'\n'+rows[0]+'\n'+rows[0],calendar));
assert.deepEqual(data.csv('a,b,c\n"a,b","a\r\nb",\n'),[['a','b','c'],['a,b','a\r\nb','']]);
console.log('OK: CSV com aspas/vírgulas/quebras/vazios, datas, cursos, URLs, situações e turmas independentes.');
