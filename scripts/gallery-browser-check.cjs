const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),output=path.join(root,'.preview/gallery-click-check');
fs.mkdirSync(output,{recursive:true});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const base=process.env.PAVEL_GALLERY_URL||'http://127.0.0.1:4187/';
const local=new URL(base).hostname==='127.0.0.1';
// Range-aware test server: match static hosting's seek behavior without touching
// the site's existing server or any production functionality.
const server=local?http.createServer((request,response)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,base).pathname));
 if(path.relative(root,file).startsWith('..')){response.writeHead(403).end();return;}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){response.writeHead(404).end();return;}
  const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4'};
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
  const match=/^bytes=(\d*)-(\d*)$/.exec(request.headers.range||'');
  const start=match?(match[1]?Number(match[1]):Math.max(0,stat.size-Number(match[2]))):0;
  const end=match&&match[1]&&match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;
  if(start>end||start>=stat.size){response.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}
  if(match)headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
  headers['Content-Length']=end-start+1;response.writeHead(match?206:200,headers);
  if(request.method==='HEAD'){response.end();return;}
  fs.createReadStream(file,{start,end}).on('error',()=>response.destroy()).pipe(response);
 });
}).listen(4187,'127.0.0.1'):null;
const chrome=spawn(process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9237','--user-data-dir='+path.join(output,'chrome'),'about:blank'],{stdio:'ignore',windowsHide:true});
const report={base,pages:[],errors:[],mediaResponses:[]};
let socket;
const deadline=setTimeout(()=>{chrome.kill();server?.closeAllConnections();server?.close();socket?.close();console.error('Tempo limite das galerias');process.exitCode=1;},180000);
async function run(){
 let target;
 for(let n=0;n<100;n++){try{await fetch(base);target=(await(await fetch('http://127.0.0.1:9237/json')).json()).find(t=>t.type==='page');if(target)break;}catch{}await wait(100);}
 assert(target,'Chrome/servidor indisponível');
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
 let id=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});socket.send(JSON.stringify({id:key,method,params}));});
 socket.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){const item=pending.get(data.id);pending.delete(data.id);data.error?item.reject(Error(data.error.message)):item.resolve(data.result);}if(data.method==='Runtime.exceptionThrown')report.errors.push(data.params.exceptionDetails.exception?.description||data.params.exceptionDetails.text);if(data.method==='Network.responseReceived'&&data.params.response.url.includes('/videos/galeria/'))report.mediaResponses.push({url:data.params.response.url,status:data.params.response.status});};
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 const until=async(expression,message)=>{for(let n=0;n<100;n++){if(await evaluate(expression))return;await wait(50);}report.failureState=await evaluate(`[...document.querySelectorAll('video')].map(v=>({time:v.currentTime,paused:v.paused,ended:v.ended,seeking:v.seeking,ready:v.readyState,network:v.networkState,error:v.error?.message,hidden:v.closest('.gallery-item').querySelector('.gallery-start').hidden,buffered:[...Array(v.buffered.length)].map((_,i)=>[v.buffered.start(i),v.buffered.end(i)])}))`);throw Error(message);};
 const click=async(index,corner=false)=>{const point=await evaluate(`(()=>{const item=document.querySelectorAll('.gallery-start')[${index}];item.scrollIntoView({block:'center'});const r=item.getBoundingClientRect();return{x:r.left+${corner?'8':'r.width/2'},y:r.top+${corner?'8':'r.height/2'}}})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});};
 const allStopped=`[...document.querySelectorAll('.gallery-video')].every(v=>v.paused&&v.currentTime===0)&&[...document.querySelectorAll('.gallery-start')].every(b=>!b.hidden)`;
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__galleryAudio=[];if(window.AudioContext){const Original=window.AudioContext;window.AudioContext=class extends Original{constructor(...args){super(...args);window.__galleryAudio.push(this)}}}`});
 for(const file of ['galeria-msp.html','galeria-p6.html']){
  await send('Emulation.setDeviceMetricsOverride',{width:1672,height:941,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:new URL(file,base).href});
  await until(`location.pathname.endsWith('${file}')&&document.querySelectorAll('.gallery-start').length===12&&!!document.querySelector('#footer-clock')?.textContent`,'Página não carregou');
  await wait(1000);assert(await evaluate(allStopped),'Autoplay inicial');
  const info=await evaluate(`({title:document.querySelector('h1').textContent,titles:[...document.querySelectorAll('[data-gallery-title]')].map(t=>t.textContent),sources:[...document.querySelectorAll('video source')].map(s=>s.src),flags:[...document.querySelectorAll('video')].map(v=>({autoplay:v.autoplay,loop:v.loop,controls:v.controls,muted:v.muted,inline:v.playsInline})),active:document.querySelector('#menu [aria-current]')?.getAttribute('href')})`);
  assert.equal(info.active,file);assert.equal(info.sources.length,new Set(info.sources).size);assert(info.flags.every(v=>!v.autoplay&&!v.loop&&!v.controls&&v.muted&&v.inline));assert(info.titles.every(t=>!/^\d/.test(t)));
  for(const width of [1672,1440,1280,1024,768,390,320]){
   await send('Emulation.setDeviceMetricsOverride',{width,height:width<700?844:941,deviceScaleFactor:1,mobile:width<700});await wait(100);
   const layout=await evaluate(`(()=>{const grid=document.querySelector('.gallery-grid'),item=document.querySelector('.gallery-item').getBoundingClientRect(),band=document.querySelector('.gallery-title-band').getBoundingClientRect(),style=getComputedStyle(document.querySelector('.gallery-title-band'));return{columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth,ratio:item.width/item.height,centerX:Math.abs((band.left+band.width/2)-(item.left+item.width/2)),centerY:Math.abs((band.top+band.height/2)-(item.top+item.height/2)),color:style.color,background:style.backgroundColor,footer:document.querySelector('footer').getBoundingClientRect().bottom}})()`);
   assert.equal(layout.columns,width>=1024?4:width>600?2:1);assert(!layout.overflow,`Overflow: ${width}`);assert(Math.abs(layout.ratio-16/9)<0.01);assert(layout.centerX<1&&layout.centerY<1,'Título não centralizado');assert.equal(layout.color,'rgb(255, 255, 255)');
   if(width>=1024)assert(layout.footer<=942,`Grade fora da tela: ${width}`);
   assert(await evaluate(allStopped),'Resize iniciou vídeo');
   if([1672,390].includes(width)){
    await evaluate('scrollTo(0,0)');const metrics=await send('Page.getLayoutMetrics');const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:metrics.cssContentSize.height,scale:1}});fs.writeFileSync(path.join(output,`${file.replace('.html','')}-${width}.png`),Buffer.from(shot.data,'base64'));
   }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1672,height:941,deviceScaleFactor:1,mobile:false});
  await click(0);await until(`!document.querySelectorAll('video')[0].paused&&document.querySelectorAll('video')[0].currentTime>0.05`,'Clique não reproduziu');
  await click(1,true);await until(`!document.querySelectorAll('video')[1].paused&&document.querySelectorAll('video')[1].currentTime>0.05`,'Quadro não reproduziu');
  assert(await evaluate(`document.querySelectorAll('video')[0].paused&&document.querySelectorAll('video')[0].currentTime===0&&!document.querySelectorAll('.gallery-start')[0].hidden`),'Anterior não reiniciou');
  const completed=[];
  for(let index=0;index<12;index++){
   await click(index,index%2===1);
   await until(`!document.querySelectorAll('video')[${index}].paused&&document.querySelectorAll('video')[${index}].currentTime>0.05`,'Reprodução falhou: '+index);
   assert(await evaluate(`[...document.querySelectorAll('video')].every((v,i)=>i===${index}?!v.paused:v.paused&&v.currentTime===0)&&document.querySelectorAll('.gallery-start')[${index}].hidden`),'Mais de um vídeo ou sobreposição visível');
   const video=await evaluate(`(()=>{const v=document.querySelectorAll('video')[${index}];return{duration:v.duration,width:v.videoWidth,height:v.videoHeight,muted:v.muted,volume:v.volume}})()`);assert.equal(video.duration,15);assert.equal(video.width,1920);assert.equal(video.height,1080);assert(video.muted&&video.volume===0);
   await evaluate(`document.querySelectorAll('video')[${index}].currentTime=14.85`);
   await until(allStopped,'Final não restaurou primeiro quadro: '+index);
   completed.push(index+1);
  }
  await evaluate(`document.querySelector('.gallery-music').click()`);await until(`document.querySelector('.gallery-music').getAttribute('aria-pressed')==='true'&&window.__galleryAudio[0]?.state==='running'`,'Música não ativou');assert(await evaluate(allStopped),'Música iniciou vídeos');
  await click(0);await until(`!document.querySelector('video').paused`,'Música bloqueou vídeo');
  await evaluate(`document.querySelector('.gallery-music').click()`);await until(`window.__galleryAudio[0]?.state==='suspended'`,'Música não pausou');assert(await evaluate(`!document.querySelector('video').paused`),'Música pausou vídeo');
  await evaluate(`window.dispatchEvent(new PageTransitionEvent('pagehide'));window.dispatchEvent(new PageTransitionEvent('pageshow'))`);await wait(200);assert(await evaluate(allStopped),'Retorno iniciou vídeos');
  info.completed=completed;report.pages.push(info);console.log(`OK: ${file}: 12 cliques, exclusividade, fim/reinício, títulos centrais, 7 larguras e música independente.`);
 }
 assert.equal(report.errors.length,0,report.errors.join('\n'));assert(report.mediaResponses.length>=24);assert(report.mediaResponses.every(response=>response.status<400));report.result='APROVADO';
}
run().catch(error=>{report.result='FALHOU';report.failure=error.stack;console.error(error);process.exitCode=1;}).finally(()=>{fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));clearTimeout(deadline);socket?.close();chrome.kill();server?.closeAllConnections();server?.close();});
