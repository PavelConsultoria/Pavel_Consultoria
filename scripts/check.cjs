const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs duplicados');
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'A Home deve ter um h1');
const services = [...html.matchAll(/<article class="service(?: service--consultoria)?"[\s\S]*?<h3>(.*?)<\/h3>/g)].map(match => match[1]);
assert.deepEqual(services, ['Treinamentos Especializados', 'Consultoria Empresarial', 'Certificação PMP', 'Análise Forense de Atrasos em Cronogramas']);
const sections = [...html.matchAll(/<p class="eyebrow">(\d{2}) \/ /g)].map(match => match[1]);
assert.deepEqual(sections, ['01', '02', '03', '04'], 'Numeração das seções');
assert(!html.includes('EXPERIÊNCIA E ATUAÇÃO'), 'Seção de experiência removida');
assert.equal((html.match(/id="calendar-grid"/g) || []).length, 1, 'Calendário único');
assert(html.indexOf('id="simulator"') < html.indexOf('id="turmas"'), 'Agenda após Simulator');
const homeCss = fs.readFileSync(path.join(root, 'assets/home.css'), 'utf8');
for (const name of ['msproject', 'primavera', 'pmp', 'consultoria']) {
  assert(homeCss.includes(`url('${name}-fundo.png')`), `Fundo aprovado ausente: ${name}`);
  assert(fs.existsSync(path.join(root, 'assets', `${name}-fundo.png`)));
  assert(!html.includes(`src="assets/${name}-fundo.png"`), 'Imagens aprovadas devem ser fundos CSS');
}
assert(!html.includes('class="tags"'), 'Palavras-chave decorativas removidas');
assert(html.includes('class="training-links"'), 'Links dos treinamentos preservados');
assert(!html.includes('class="brand-phone"'), 'Telefone removido do cabeçalho');
assert(html.includes('Karolina Poznyakov, MSc'), 'Nome profissional no rodapé');
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (value.startsWith('#')) assert(ids.includes(value.slice(1)), `Âncora sem destino: ${value}`);
  else if (!/^[a-z]+:/i.test(value)) assert(fs.existsSync(path.join(root, value)), `Arquivo ausente: ${value}`);
}
JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/config.js'), 'utf8'), context);
const config = context.window.PAVEL_CONFIG;
assert(Array.isArray(config.classes));
for (const item of config.classes) {
  assert(config.courses[item.course], 'Curso desconhecido');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(item.date), 'Formato de data inválido');
  const parsed = new Date(item.date + 'T12:00:00Z');
  assert(!isNaN(parsed) && parsed.toISOString().slice(0, 10) === item.date, 'Data inexistente');
  assert(item.time && item.modality && item.status, 'Informações da turma incompletas');
}
assert(!config.whatsappNumber || /^\d{10,15}$/.test(config.whatsappNumber), 'Número de WhatsApp inválido');
for (const url of [config.simulatorUrl, ...Object.values(config.forms), ...Object.values(config.samples)]) {
  if (url) assert.equal(new URL(url).protocol, 'https:', 'Links externos devem usar HTTPS');
}
console.log('OK: sintaxe, âncoras, arquivos locais, h1, IDs, JSON-LD e configuração.');
