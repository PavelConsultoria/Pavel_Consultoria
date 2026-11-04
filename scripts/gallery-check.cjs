const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const links=['index.html','ms-project.html','primavera.html','certificacao-pmp.html','agenda.html','galeria-msp.html','galeria-p6.html','sobre.html'];
const footer=read('ms-project.html').match(/<footer\b[\s\S]*?<\/footer>/)[0];
const header=read('ms-project.html').match(/<header\b[\s\S]*?<\/header>/)[0].replace(/ aria-current="page"/g,'');
let bytes=0;
for(const [file,folder,prefix] of [['galeria-msp.html','MSP','MSP'],['galeria-p6.html','P6','P6']]){
 const html=read(file),videos=[...html.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/g)];
 assert.equal(videos.length,12);assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.equal(html.match(/<footer\b[\s\S]*?<\/footer>/)[0],footer);
 assert.equal(html.match(/<header\b[\s\S]*?<\/header>/)[0].replace(/ aria-current="page"/g,''),header);
 videos.forEach((video,i)=>{
  for(const flag of ['muted','playsinline'])assert(new RegExp(`(?:^|\\s)${flag}(?:\\s|$)`).test(video[1]),`${file}: ${flag}`);
  for(const flag of ['autoplay','loop'])assert(!new RegExp(`(?:^|\\s)${flag}(?:\\s|$)`).test(video[1]),`${file}: ${flag} proibido`);
  assert(!/(?:^|\s)controls(?:\s|=|$)/.test(video[1]));
  const src=video[2].match(/src="([^"]+)"/)[1];
  assert.equal(src,`videos/galeria/${folder}/${prefix}_${String(i+1).padStart(2,'0')}_FINAL.mp4`);
  bytes+=fs.statSync(path.join(root,src)).size;
 });
 assert(!/<audio\b/.test(html));assert(html.includes('data-music-label'));
 assert.equal((html.match(/class="gallery-start"/g)||[]).length,12);
 const titles=[...html.matchAll(/data-gallery-title>([^<]+)</g)].map(m=>m[1]);
 assert.equal(titles.length,12);assert(titles.every(title=>!/^\d/.test(title)),'Títulos sem numeração');
 console.log(`OK: ${file}: 12 caminhos reais, vídeos sem controles, cabeçalho/rodapé compartilhados.`);
}
for(const file of links){
 const html=read(file),nav=html.match(/<nav id="menu"[\s\S]*?<\/nav>/)[0];
 assert.deepEqual([...nav.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),links);
 assert(nav.includes(`href="${file}" aria-current="page"`));
}
const baselinePath=path.join(root,'.preview/gallery-baseline.json');
if(fs.existsSync(baselinePath)){
 const before=JSON.parse(read('.preview/gallery-baseline.json').replace(/^\uFEFF/,''));
 const normalize=html=>html.replace(/<nav id="menu"[\s\S]*?<\/nav>/,'NAV').replace(/<link rel="stylesheet" href="assets\/gallery-navigation.css">\r?\n?/,'').replace(/\r\n/g,'\n');
 for(const file of links.filter(file=>!file.startsWith('galeria-')))assert.equal(normalize(read(file)),normalize(before[file]),`${file}: alteração fora da navegação`);
 for(const file of ['assets/styles.css','assets/site.css','assets/home.css','assets/home-adjustments.css'])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').toUpperCase(),before[file],`${file}: estilo global alterado`);
 assert.equal(read('templates/home.html'),before['templates/home.html']);
 const media=JSON.parse(read('.preview/gallery-media-before.json').replace(/^\uFEFF/,''));
 media.forEach(file=>assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file.Path)).digest('hex').toUpperCase(),file.SHA256,'MP4 alterado'));
 console.log('OK: páginas existentes intactas fora do menu; estilos globais e 24 MP4 idênticos à origem.');
}
console.log(`OK: 24 vídeos, ${(bytes/1048576).toFixed(2)} MiB.`);
