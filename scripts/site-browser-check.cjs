// Chrome real, local ou publicado. Capturas e evidências ficam em .preview, fora do commit.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),base=process.env.PAVEL_SITE_URL || 'http://localhost:4173/';
const live=!['localhost','127.0.0.1'].includes(new URL(base).hostname);
const output=path.join(root,'.preview',live?'published':'local');fs.mkdirSync(output,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const child=spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9228','--user-data-dir='+path.join(root,'.preview',live?'site-live-chrome':'site-local-chrome'),'about:blank'],{stdio:'ignore',windowsHide:true});
let socket;const report={base,live,started:new Date().toISOString(),pages:[],errors:[],responses:[],security:[],functional:[]};
const deadline=setTimeout(()=>{console.error('Tempo limite do navegador');child.kill();socket?.close();process.exitCode=1;},240000);
async function run(){
 let target;for(let i=0;i<100;i++){try{target=(await(await fetch('http://127.0.0.1:9228/json')).json()).find(t=>t.type==='page');if(target)break;}catch{}await pause(100);}assert(target,'Chrome não iniciou');
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});let id=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});socket.send(JSON.stringify({id:next,method,params}));});
 socket.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){const p=pending.get(data.id);pending.delete(data.id);data.error?p.reject(Error(data.error.message)):p.resolve(data.result);}if(data.method==='Runtime.exceptionThrown')report.errors.push(data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);if(data.method==='Network.responseReceived'){const r=data.params.response;report.responses.push({url:r.url,status:r.status,mimeType:r.mimeType,securityDetails:r.securityDetails});}if(data.method==='Security.visibleSecurityStateChanged')report.security.push(data.params);if(data.method==='Fetch.requestPaused')send('Fetch.failRequest',{requestId:data.params.requestId,errorReason:'Failed'});};
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Security.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:output});
 const files=['index.html','ms-project.html','primavera.html','certificacao-pmp.html','agenda.html','sobre.html'];
 for(const file of files){
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  const nav=await send('Page.navigate',{url:new URL(file,base).href});assert(!nav.errorText,`${file}: ${nav.errorText}`);
  for(let i=0;i<150;i++){if(await evaluate(`document.readyState==='complete' && location.pathname.endsWith('${file}') && !!document.querySelector('#footer-clock')`))break;await pause(100);}
  await evaluate('Promise.all([...document.images].map(img=>{img.loading="eager";return img.decode().catch(()=>null)}))');
  const page=await evaluate(`({url:location.href,title:document.title,h1:document.querySelector('h1')?.textContent,images:[...document.images].map(i=>({url:i.src,width:i.naturalWidth})),active:[...document.querySelectorAll('#menu a[aria-current]')].map(a=>a.getAttribute('href')),whatsapp:[...document.querySelectorAll('a[href^="https://wa.me/"]')].map(a=>a.href),clock:document.querySelector('#footer-clock').textContent,visits:document.querySelector('#site-visits').textContent,footer:document.querySelectorAll('footer').length})`);
  assert(page.h1);assert.equal(page.footer,1);assert.deepEqual(page.active,[file]);assert(page.images.every(i=>i.width>0),`${file}: imagem quebrada`);assert(page.whatsapp.every(u=>u.startsWith('https://wa.me/5521995716270')));assert(page.clock.length>10);
  assert.equal(await evaluate('document.querySelectorAll(".whatsapp-floating").length'),file==='index.html'?0:1);
  assert(await evaluate('getComputedStyle(document.querySelector("#menu a[aria-current]")).textDecorationLine === "none"'));
  for(const width of [1440,1024,768,390,320]){
   await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<700});await pause(80);
   const overflow=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})');assert(overflow.scroll<=overflow.width,`${file}: overflow ${width}: ${JSON.stringify(overflow)}`);
   if(width===390){await evaluate('document.querySelector(".menu-toggle").click()');assert(await evaluate('document.querySelector("#menu").classList.contains("is-open")'));await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});assert(await evaluate('!document.querySelector("#menu").classList.contains("is-open")'));}
   if([1440,390].includes(width)){
    const metrics=await send('Page.getLayoutMetrics');const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:metrics.cssContentSize.height,scale:1}});fs.writeFileSync(path.join(output,`${file.replace('.html','')}-${width}.png`),Buffer.from(shot.data,'base64'));
   }
  }
  if(file==='ms-project.html')assert(await evaluate('document.querySelector("#investimento").textContent.includes("novembro de 2026")'));
  if(file==='primavera.html')assert(await evaluate('[...document.querySelectorAll("#apostila a")].some(a=>a.href.endsWith("apostila-p6-reduzida.pdf"))'));
  if(file==='certificacao-pmp.html')assert(await evaluate('document.body.textContent.includes("R$ 199,00") && document.body.textContent.includes("90 dias")'));
  if(file==='agenda.html'){
   for(let i=0;i<200;i++){if(await evaluate('document.querySelector("#calendar-grid").dataset.agendaState !== "loading"'))break;await pause(100);}
   const agenda=await evaluate(`({state:document.querySelector('#calendar-grid').dataset.agendaState,calendars:document.querySelectorAll('.calendar table').length,updated:document.querySelector('#agenda-updated').textContent,list:document.querySelector('#class-list').textContent,markers:document.querySelectorAll('.class-day').length,links:[...document.querySelectorAll('#class-list a')].map(a=>a.href)})`);page.agenda=agenda;assert.equal(agenda.state,'ready','CSV real indisponível');assert.equal(agenda.calendars,2);assert(agenda.markers>0);
   const month=await evaluate('document.querySelector(".calendar h3").textContent');await evaluate('document.querySelector("#next-month").click()');assert.notEqual(await evaluate('document.querySelector(".calendar h3").textContent'),month);await evaluate('document.querySelector("#previous-month").click()');assert.equal(await evaluate('document.querySelector(".calendar h3").textContent'),month);
   await evaluate('document.querySelector(".class-day").click()');assert(await evaluate('document.querySelector("#class-dialog").open'));page.dialog=await evaluate('({text:document.querySelector("#dialog-details").textContent,links:[...document.querySelectorAll("#dialog-actions a")].map(a=>a.href)})');await evaluate('document.querySelector("#close-dialog").click()');assert(await evaluate('!document.querySelector("#class-dialog").open'));
   const pngPath=path.join(output,'pavel-agenda-completa.png');if(fs.existsSync(pngPath))fs.unlinkSync(pngPath);
   await evaluate('document.querySelector("[data-agenda-export]").click()');for(let i=0;i<100;i++){if(fs.existsSync(pngPath))break;await pause(100);}assert(fs.existsSync(pngPath),'Download PNG não concluído');const png=fs.readFileSync(pngPath);assert.equal(png.readUInt32BE(16),1800);assert(png.readUInt32BE(20)>=1110);page.png={bytes:png.length,width:png.readUInt32BE(16),height:png.readUInt32BE(20)};
   report.functional.push('Agenda real: CSV, calendários, navegação, detalhes, destinos de inscrição e download PNG completo.');
  }
  report.pages.push(page);console.log('OK:',file,'desktop/mobile, imagens, menu, WhatsApp e rodapé');
 }
 // Falha temporária simulada apenas no navegador de teste; nenhuma escrita no Google.
 await send('Fetch.enable',{patterns:[{urlPattern:'*output=csv*'}]});await send('Page.navigate',{url:new URL('agenda.html',base).href});for(let i=0;i<150;i++){if(await evaluate('document.querySelector("#calendar-grid")?.dataset.agendaState === "error"'))break;await pause(100);}assert(await evaluate('document.querySelector("#class-list").textContent.includes("Não foi possível") && document.querySelector("[data-agenda-export]").disabled'));await send('Fetch.disable');report.functional.push('Falha CSV simulada: mensagem correta e exportação desabilitada.');
 assert.equal(report.errors.length,0,'Exceções JavaScript');
 const broken=report.responses.filter(r=>r.status>=400 && new URL(r.url).origin===new URL(base).origin);assert.equal(broken.length,0,'Recursos internos com erro HTTP');
 report.result='APROVADO';
}
run().catch(e=>{report.result='FALHOU';report.failure=e.message;console.error(e);process.exitCode=1;}).finally(()=>{report.finished=new Date().toISOString();fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify(report,null,2));clearTimeout(deadline);socket?.close();child.kill();});
