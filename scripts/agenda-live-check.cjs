// Verifica a Home publicada e o CSV real, sem interceptar requisições.
const {spawn}=require('node:child_process');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const url=process.env.PAVEL_SITE_URL || 'https://pavelconsultoria.github.io/Pavel_Consultoria/';
const chrome=process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const child=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=9224',`--user-data-dir=${path.join(root,'.preview','chrome-live-profile')}`,'about:blank'],{stdio:'ignore',windowsHide:true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket;
async function main(){
 let target;
 for(let i=0;i<60;i++){try{target=(await(await fetch('http://127.0.0.1:9224/json')).json()).find(t=>t.type==='page');if(target)break;}catch{}await pause(100);}
 assert(target,'Chrome não iniciou');socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
 let id=0;const pending=new Map();
 const send=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});socket.send(JSON.stringify({id:next,method,params}));});
 socket.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){const p=pending.get(data.id);pending.delete(data.id);if(data.error)p.reject(Error(data.error.message));else p.resolve(data.result);}};
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 // Data de referência do incidente, somente no navegador de teste.
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`{const NativeDate=Date;window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2026-10-08T15:00:00Z']));}static now(){return new NativeDate('2026-10-08T15:00:00Z').getTime();}};}`});
 await send('Page.navigate',{url:url+'?check='+process.pid});
 for(let i=0;i<220;i++){if(await evaluate("!!document.querySelector('#class-list') && !document.querySelector('#class-list').textContent.includes('Carregando') && document.querySelector('#class-list').children.length>0"))break;await pause(100);}
 const result=await evaluate(`(async()=>{
  const response=await fetch(PAVEL_CONFIG.agendaCsvUrl,{cache:'no-store',credentials:'omit'});
  const text=await response.text();let classes,error;
  try{classes=PAVEL_AGENDA_DATA.parse(text,PAVEL_CALENDAR);}catch(e){error=e.message;}
  const rendered=[...document.querySelectorAll('.class-day')].map(b=>({date:b.closest('td').dataset.date,course:b.textContent}));
  const expected=classes?.filter(c=>c.statusKey!=='cancelada').flatMap(c=>c.dates.map(date=>({date,course:PAVEL_CONFIG.courses[c.course].acronym}))).filter(c=>document.querySelector('td[data-date="'+c.date+'"]'));
  return {url:location.href,status:response.status,type:response.type,error,rows:classes?.length,list:document.querySelector('#class-list').textContent,rendered,expected,
   future:classes?PAVEL_AGENDA_DATA.upcoming(classes,PAVEL_CALENDAR).map(c=>c.dates):[],calendars:document.querySelectorAll('.calendar table').length,
   newClass:classes?.find(c=>c.dates.includes('2026-10-24'))?.statusKey};
 })()`);
 console.log(JSON.stringify(result,null,2));
 assert.equal(result.status,200);assert.equal(result.type,'cors');assert(!result.error,result.error);
 assert.equal(result.rows,5);assert.equal(result.calendars,2);
 assert(!result.list.includes('Não foi possível'));assert(result.list.includes('24/10/2026'));
 assert(!result.list.includes('17/10/2026'));assert.equal(result.newClass,'inscricoes abertas');
 const sort=rows=>rows.map(row=>row.date+' '+row.course).sort();assert.deepEqual(sort(result.rendered),sort(result.expected));
 assert.equal(result.rendered.length,11);
 console.log('OK: GitHub Pages real, CSV/CORS, cinco turmas, nova turma de 24/10 e onze indicadores correspondentes à mesma fonte.');
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{socket?.close();child.kill();});
