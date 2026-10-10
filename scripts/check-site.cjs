const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const pages=['index.html','ms-project.html','primavera.html','certificacao-pmp.html','agenda.html','sobre.html'];
let sharedFooter;
for(const file of pages){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,`${file}: IDs duplicados`);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: h1 único`);
 assert.equal((html.match(/<header class="site-header"/g)||[]).length,1);
 assert.equal((html.match(/<footer\b/g)||[]).length,1);
 const footer=html.match(/<footer[\s\S]*?<\/footer>/)[0];if(sharedFooter)assert.equal(footer,sharedFooter,'Rodapé idêntico');else sharedFooter=footer;
 assert.equal((html.match(/data-goatcounter=/g)||[]).length,1);
 assert.equal((html.match(/id="site-visits"/g)||[]).length,1);
 const menu=html.match(/<nav id="menu"[\s\S]*?<\/nav>/)[0];
 assert.deepEqual([...menu.matchAll(/<a [^>]+>([^<]+)<\/a>/g)].map(m=>m[1]),['Início','MS Project','Primavera','Certificação PMP','Agenda de Treinamentos','Sobre a Pavel']);
 assert.equal((menu.match(/aria-current=/g)||[]).length,1);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  const value=match[1];if(value.startsWith('#'))assert(ids.includes(value.slice(1)),`${file}: âncora ${value}`);
  else if(!/^[a-z]+:/i.test(value))assert(fs.existsSync(path.join(root,value)),`${file}: arquivo ${value}`);
  else assert(!value.startsWith('http:'),`${file}: conteúdo misto`);
 }
 JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert(html.includes(`https://pavelconsultoria.com.br/${file==='index.html'?'':file}`));
 assert.equal(html.includes('class="whatsapp-floating"'),file!=='index.html');
}
const pmp=fs.readFileSync(path.join(root,'certificacao-pmp.html'),'utf8');assert(pmp.includes('R$ 199,00'));assert(!pmp.includes('260'));assert(pmp.includes('90 dias'));
const msp=fs.readFileSync(path.join(root,'ms-project.html'),'utf8');assert(msp.includes('novembro de 2026'));assert(msp.includes('R$ 460,00'));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/config.js'),'utf8'),context);const config=context.window.PAVEL_CONFIG;
assert.equal(new URL(config.agendaCsvUrl).hostname,'docs.google.com');assert(!config.classes);assert.equal(config.whatsappNumber,'5521995716270');
for(const url of [config.simulatorUrl,...Object.values(config.forms),...Object.values(config.samples)])if(url)assert.equal(new URL(url).protocol,'https:');
console.log('OK: seis páginas, recursos, âncoras, h1, IDs, menu ativo, rodapé único, WhatsApp, preços, metadados e ausência de HTTP nos recursos.');
