// Chrome/CDP verification: no production tracking mocks or fabricated totals.
const {spawn} = require('node:child_process');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const base = process.env.PAVEL_SITE_URL || 'https://pavelconsultoria.com.br/';
const local = new URL(base).hostname === 'localhost' || new URL(base).hostname === '127.0.0.1';
const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9225', `--user-data-dir=${path.join(root, '.preview', 'goatcounter-check-profile')}`, 'about:blank'], {stdio: 'ignore', windowsHide: true});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
const deadline = setTimeout(() => {console.error('Verification timed out');process.exitCode=1;socket?.close();child.kill();}, 90000);
async function main() {
  let target;
  for (let i=0;i<60;i++) {
    try {target=(await(await fetch('http://127.0.0.1:9225/json')).json()).find(t=>t.type==='page');if(target)break;}catch{}
    await pause(100);
  }
  assert(target, 'Chrome did not start');
  socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let id=0;
  const pending=new Map(), requests=[], responses=[], errors=[];
  const send=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});socket.send(JSON.stringify({id:next,method,params}));});
  socket.onmessage=event=>{
    const data=JSON.parse(event.data);
    if(data.id){const p=pending.get(data.id);pending.delete(data.id);if(data.error)p.reject(Error(data.error.message));else p.resolve(data.result);}
    if(data.method==='Network.requestWillBeSent')requests.push(data.params.request);
    if(data.method==='Network.responseReceived')responses.push(data.params.response);
    if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.text);
  };
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
  const countRequests=()=>requests.filter(r=>r.url.startsWith('https://pavelconsultoria.goatcounter.com/count?'));
  const totalRequests=()=>requests.filter(r=>r.url==='https://pavelconsultoria.goatcounter.com/counter/TOTAL.json');
  await send('Page.navigate',{url:base});
  for(let i=0;i<220;i++){
    if(await evaluate("!!window.goatcounter?.get_data && document.querySelector('#calendar-grid')?.dataset.agendaState!=='loading' && !!document.querySelector('#site-visits')"))break;
    await pause(100);
  }
  await pause(1200);
  const home=await evaluate(`(()=>({
    total:document.querySelector('#site-visits')?.textContent,
    label:document.querySelector('.footer-visits')?.textContent,
    async:document.querySelector('script[data-goatcounter]')?.async,
    script:document.querySelector('script[data-goatcounter]')?.src,
    calendars:document.querySelectorAll('.calendar table').length,
    state:document.querySelector('#calendar-grid')?.dataset.agendaState,
    markers:document.querySelectorAll('.class-day').length,
    update:document.querySelector('#agenda-updated')?.textContent,
    channels:document.querySelectorAll('.footer-socials a').length,
    data:window.goatcounter?.get_data({})
  }))()`);
  console.log('HOME',JSON.stringify(home));
  assert.equal(home.async,true);assert.equal(home.script,'https://gc.zgo.at/count.js');
  assert.equal(home.calendars,2);assert.equal(home.state,'ready','Google Sheets did not load');assert(home.markers>0);
  assert.equal(home.channels,3);assert(home.label?.includes('Visitas:'));
  assert.equal(totalRequests().length,1,'Read total once on page load');
  if(local)assert.equal(countRequests().length,0,'Local development must not pollute analytics');
  else assert.equal(countRequests().length,1,'Official script sends one page visit');
  if(local){
    await evaluate("history.replaceState(null,'','/?utm_campaign=validation&utm_source=test');");
    const campaign = await evaluate("window.goatcounter.get_data({})");
    assert(campaign.q.includes('utm_campaign=validation') && campaign.q.includes('utm_source=test'), 'Campaign query retained');
    assert.equal(campaign.r, await evaluate('document.referrer'), 'Default traffic referrer retained');
    await evaluate("history.replaceState(null,'','/')");
    console.log('OK: campaign parameters and default referrer retained by official script (local test only).');
  }
  const beforeCount=countRequests().length, beforeTotal=totalRequests().length;
  await evaluate("document.querySelector('#menu a[href=\"#turmas\"]').click();document.querySelector('#next-month').click();document.querySelector('#previous-month').click();document.dispatchEvent(new Event('visibilitychange'))");
  await pause(1800);
  assert.equal(countRequests().length,beforeCount,'Section navigation/component refresh does not send visits');
  assert.equal(totalRequests().length,beforeTotal,'Component refresh does not reload total');
  const publicResponse=responses.find(r=>r.url==='https://pavelconsultoria.goatcounter.com/counter/TOTAL.json');
  console.log('PUBLIC TOTAL HTTP',publicResponse?.status ?? 'no response (timeout/network)');
  if(publicResponse?.status===200){
    assert(/^\d[\d\s,.'\u00a0\u202f]*$/.test(home.total),'Public real total displayed');
  }else{
    assert.equal(home.total,'indisponível');
    console.log('PENDING: enable Settings → Allow adding visitor counts on your website if HTTP 403.');
  }
  const initialResponses=responses.filter(r=>r.url.startsWith('https://pavelconsultoria.goatcounter.com/count?'));
  console.log('HOME TRACKING HTTP',initialResponses.map(r=>r.status));
  if(!local)assert(initialResponses.some(r=>r.status>=200&&r.status<300),'GoatCounter did not acknowledge Home tracking');
  await send('Page.navigate',{url:new URL('ms-project.html',base).href});
  for(let i=0;i<100;i++){if(await evaluate("!!window.goatcounter?.get_data"))break;await pause(100);}
  await pause(1200);
  const course=await evaluate("({title:document.title,path:window.goatcounter?.get_data({}).p,async:document.querySelector('script[data-goatcounter]')?.async,total:!!document.querySelector('#site-visits')})");
  console.log('COURSE',JSON.stringify(course));
  assert.equal(course.async,true);assert.equal(course.total,false);
  assert.equal(totalRequests().length,1,'Course has no footer counter fetch');
  if(!local){
    assert.equal(countRequests().length,2,'One tracking request per page');
    const accepted=responses.filter(r=>r.url.startsWith('https://pavelconsultoria.goatcounter.com/count?')&&r.status>=200&&r.status<300);
    assert.equal(accepted.length,2,'Both page visits acknowledged');
  }
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('OK: official async script, Home/course, single total read, no section/Agenda increments, real Google Sheets/calendars and honest unavailable state. Dashboard session settings and campaign reporting require owner verification.');
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{clearTimeout(deadline);socket?.close();child.kill();});
