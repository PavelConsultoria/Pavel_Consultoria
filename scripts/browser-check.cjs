// Verificação opcional com Chrome instalado; usa somente o protocolo nativo CDP.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const preview = path.join(root, '.preview');
fs.mkdirSync(preview, { recursive: true });
const chrome = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9223', `--user-data-dir=${path.join(preview, 'chrome-profile')}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
async function main() {
  let target;
  for (let i = 0; i < 50; i++) {
    try { target = (await (await fetch('http://127.0.0.1:9223/json')).json()).find(item => item.type === 'page'); if (target) break; } catch {}
    await pause(100);
  }
  assert(target, 'Chrome headless não iniciou');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let nextId = 0;
  const pending = new Map(), errors = [];
  let fixture = false, csvFailure = false, updatedCsv = false;
  let controlMode = '', controlValue = '08/10/2026 17:36:20';
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
    });
  }
  socket.onmessage = event => {
    const data = JSON.parse(event.data);
    if (data.id) {
      const promise = pending.get(data.id); pending.delete(data.id);
      if (data.error) promise.reject(new Error(data.error.message)); else promise.resolve(data.result);
    }
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails.text);
    if (data.method === 'Fetch.requestPaused') {
      const source = fs.readFileSync(path.join(root, 'assets/config.js'), 'utf8');
      if (data.params.request.url.includes('/agenda-control-test.csv')) {
        // Fonte sintetica somente no navegador de teste, nunca na configuracao real.
        const body = controlMode === 'invalid' ? 'Atualizacao,31/02/2026' : 'Atualizacao,' + controlValue;
        send('Fetch.fulfillRequest', {requestId:data.params.requestId,responseCode:controlMode==='failure'?503:200,responseHeaders:[{name:'Content-Type',value:'text/csv'},{name:'Access-Control-Allow-Origin',value:'*'}],body:Buffer.from(body).toString('base64')});return;
      }
      // Dados sintéticos exclusivos do teste, nunca gravados na configuração publicada.
      if (data.params.request.url.includes('output=csv')) {
        const controlUrl = source.match(/agendaControlCsvUrl:\s*'([^']*)'/)?.[1];
        if (controlUrl && data.params.request.url === controlUrl) { send('Fetch.continueRequest',{requestId:data.params.requestId});return; }
        if (csvFailure) { send('Fetch.failRequest',{requestId:data.params.requestId,errorReason:'Failed'});return; }
        if (!fixture) { send('Fetch.continueRequest',{requestId:data.params.requestId});return; }
        const header='ID,Treinamento,Formato,Datas (AAAA-MM-DD; separadas por ;),Horário,Carga horária,Modalidade,Situação,Link de inscrição,Observações';
        const csv=header+'\n'+'test-msp,MS Project,Turma de teste,2026-05-01,HORÁRIO DE TESTE,8h,MODALIDADE DE TESTE,Inscrições abertas,https://example.com/form,\n'+'test-p6,Primavera P6,Turma de teste,2026-05-01,TESTE,8h,TESTE,Inscrições abertas,,';
        send('Fetch.fulfillRequest',{requestId:data.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/csv'},{name:'Access-Control-Allow-Origin',value:'*'}],body:Buffer.from(updatedCsv ? csv.replaceAll('2026-05-01','2026-05-02') : csv).toString('base64')});return;
      }
      const extra = (fixture ? `window.TEST_NOW='2026-04-30T15:00:00Z';PAVEL_CONFIG.whatsappNumber='5511999999999';` : '') + (controlMode ? "PAVEL_CONFIG.agendaControlCsvUrl='https://example.com/agenda-control-test.csv';" : '');
      send('Fetch.fulfillRequest', { requestId: data.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/javascript; charset=utf-8' }], body: Buffer.from(source + extra).toString('base64') }).catch(console.error);
    }
  };
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', {source: `{
    const NativeDate=Date; window.TEST_NOW='2026-10-08T15:00:00Z';
    window.Date=class extends NativeDate {constructor(...args){super(...(args.length?args:[window.TEST_NOW]));} static now(){return new NativeDate(window.TEST_NOW).getTime();}};
  }`});
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/assets/config.js' },{urlPattern:'*output=csv*'},{urlPattern:'*/agenda-control-test.csv'}] });
  await send('Page.navigate', { url: 'http://localhost:4173' });
  for (let i = 0; i < 50; i++) { if (await evaluate("!!document.querySelector('.calendar table')")) break; await pause(100); }
  assert(await evaluate("!!document.querySelector('.calendar table')"), 'Calendário não renderizou');
  for(let i=0;i<170;i++){if(await evaluate("!document.querySelector('#class-list').textContent.includes('Carregando')"))break;await pause(100);}
  const liveResult=await evaluate(`(async()=>{try{const r=await fetch(PAVEL_CONFIG.agendaCsvUrl,{cache:'no-store',credentials:'omit'});const text=await r.text();return {status:r.status,type:r.type,rows:PAVEL_AGENDA_DATA.parse(text,PAVEL_CALENDAR).length};}catch(e){return {error:e.message};}})()`);
  console.log('CSV real no Chrome / CORS:',JSON.stringify(liveResult));
  assert.equal(liveResult.status,200,'CSV público indisponível no navegador');assert.equal(liveResult.type,'cors');assert.equal(liveResult.rows,5);
  const configuredControl = await evaluate("PAVEL_CONFIG.agendaControlCsvUrl");
  if(configuredControl){
    const controlResult=await evaluate("(async()=>{const r=await fetch(PAVEL_CONFIG.agendaControlCsvUrl,{cache:'no-store',credentials:'omit'});return {status:r.status,type:r.type,date:PAVEL_AGENDA_DATA.updatedDate(await r.text())};})()");
    console.log('CSV Controle real no Chrome / CORS:',JSON.stringify(controlResult));
    assert.equal(controlResult.status,200);assert.equal(controlResult.type,'cors');assert(controlResult.date);
    for(let i=0;i<160;i++){if(await evaluate("!document.querySelector('#agenda-updated').hidden"))break;await pause(100);}
    assert.equal(await evaluate("document.querySelector('#agenda-updated').textContent"),'Agenda atualizada em: '+controlResult.date);
  } else assert(await evaluate("document.querySelector('#agenda-updated').hidden"), 'Sem URL Controle: data oculta');
  assert.equal(await evaluate("document.querySelectorAll('.class-day').length"), 11, 'Datas históricas e nova turma vindas da planilha');
  assert.equal(await evaluate("document.querySelectorAll('.calendar table').length"), 2);
  assert.equal(await evaluate("document.querySelectorAll('.moon-marker').length"), 8);
  assert.equal(await evaluate("document.querySelectorAll('.holiday-marker').length"), 4);
  assert.equal(await evaluate("document.querySelector('[aria-current=date]').dataset.date"), '2026-10-08');
  assert(await evaluate("document.querySelector('.class-list-item[data-course=msp]').textContent.includes('24/10/2026') && !document.querySelector('.class-list-item[data-course=msp]').textContent.includes('17/10/2026') && document.querySelector('[data-cohort=P6-2026-10-N]') && document.querySelector('[data-cohort=P6-2026-10-S]')"));
  assert(await evaluate("getComputedStyle(document.querySelector('#turmas')).backgroundColor==='rgb(240, 243, 240)'"));
  assert(await evaluate(`[...document.querySelectorAll('.calendar table')].every(table=>{
    const rows=[...table.rows];return rows.length===7 && rows.every((row,i)=>[0,6].every(col=>getComputedStyle(row.cells[col]).backgroundColor===(i?'rgb(226, 229, 232)':'rgb(213, 217, 220)')));
  })`));
  assert(await evaluate("[...document.querySelectorAll('.class-day')].every(b=>getComputedStyle(b).color===(b.textContent==='MSP'?'rgb(22, 128, 74)':'rgb(189, 48, 56)') && b.closest('td').querySelector('.day-number'))"));
  assert.equal(await evaluate("document.querySelectorAll('.whatsapp-floating').length"), 0, 'WhatsApp flutuante removido somente da Home');
  assert.equal(await evaluate("document.querySelector('.header-whatsapp').href"), 'https://wa.me/5521995716270');
  assert(await evaluate("document.querySelector('.header-whatsapp').rel.includes('noopener') && document.querySelector('.header-whatsapp').target === '_blank'"));
  await evaluate("Promise.all(Array.from(document.images, img => { img.loading = 'eager'; return img.decode(); }))");
  assert(await evaluate("Array.from(document.images).every(img => img.naturalWidth > 0)"));
  assert(await evaluate("document.querySelector('.brand-image').src.endsWith('/assets/logo-pavel-dark.png') && getComputedStyle(document.querySelector('.brand-image')).filter === 'none'"), 'Logo para fundo escuro sem filtro global');
  assert(await evaluate("document.querySelector('.training-links a').getAttribute('href') === 'ms-project.html' && document.querySelector('.training-links li:last-child a').href.startsWith('https://wa.me/5521995716270')"), 'Destinos dos links de treinamento');
  assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('#menu a'),a=>a.textContent)"), ['Início','Áreas de Atuação','Conhecimento Aplicado','Tecnologia Pavel','Agenda','Sobre a Pavel']);
  assert(await evaluate(`Promise.all(['.hero-stage','.expertise','.training--msp','.training--p6','.simulator'].map(selector => {
    const el=document.querySelector(selector), style=getComputedStyle(el);
    const match=style.backgroundImage.match(/url\\("?([^"\\)]+)"?\\)/);
    if(!match || !style.backgroundSize.split(',').every(value=>value.trim()==='cover')) return false;
    return new Promise(resolve => { const img=new Image(); img.onload=()=>resolve(img.naturalWidth>0); img.onerror=()=>resolve(false); img.src=match[1]; });
  })).then(results=>results.every(Boolean))`), 'Fundos aprovados carregados');
  assert.equal(await evaluate("document.querySelectorAll('img[src$=\"-fundo.png\"]').length"), 0);
  assert(await evaluate(`(() => {
    const paragraphs = [...document.querySelectorAll('.service:first-child p'),document.querySelector('#analise-forense p')];
    const properties=['fontFamily','fontSize','fontWeight','color','lineHeight'];
    return properties.every(key=>paragraphs.every(p=>getComputedStyle(p)[key]===getComputedStyle(paragraphs[0])[key]));
  })()`), 'Tipografia dos parágrafos uniforme');
  for (const width of [1440, 1024, 768, 390, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 700 });
    await pause(100);
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Overflow horizontal em ${width}px`);
    assert(await evaluate(`['.service--consultoria','.training--msp','.training--p6','.simulator'].every(selector=>{
      const panel=document.querySelector(selector), box=panel.getBoundingClientRect();
      return [...panel.querySelectorAll('h2,h3,p,a')].filter(el=>!el.hidden).every(el=>{
        const rect=el.getBoundingClientRect();
        return rect.left>=box.left-1 && rect.right<=box.right+1 && rect.top>=box.top-1 && rect.bottom<=box.bottom+1;
      });
    })`), `Conteúdo contido nos painéis em ${width}px`);
    assert(await evaluate("[...document.querySelectorAll('#calendar-grid table')].every(t=>t.getBoundingClientRect().right<=innerWidth)"), `Calendários contidos em ${width}px`);
    await evaluate("document.documentElement.style.scrollBehavior='auto';document.querySelector('#turmas').scrollIntoView()");
    await pause(80);
    assert.equal(await evaluate("document.querySelector('#menu a[aria-current]').getAttribute('href')"), '#turmas');
    if ([1440,390].includes(width)) {
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
      fs.writeFileSync(path.join(preview,`agenda-${width}.png`),Buffer.from(shot.data,'base64'));
    }
    assert(await evaluate(`[...document.querySelectorAll('.calendar td[data-date]')].every(cell=>{
      const number=cell.querySelector('.day-number').getBoundingClientRect(), markers=cell.querySelector('.day-markers').getBoundingClientRect();
      return number.height<=18 && markers.top-number.bottom<=2 && markers.top>=number.bottom-1;
    })`), `Indicadores próximos ao dia em ${width}px`);
    assert.equal(await evaluate("document.querySelector('.footer-name').textContent"),'Karolina Poznyakov, MSc, PMP (retired), IPMA-D');
    const about = await evaluate(`(()=>{
      const section=document.querySelector('section#sobre'), box=section.getBoundingClientRect();
      const images=[...section.querySelectorAll('img')];
      return {background:getComputedStyle(section).backgroundColor,
        contained:[...section.querySelectorAll('h2,h3,h4,p,img,a')].every(el=>{const r=el.getBoundingClientRect();return r.left>=box.left-1 && r.right<=box.right+1;}),
        images:images.every(img=>img.naturalWidth>0 && Math.abs(img.getBoundingClientRect().width/img.getBoundingClientRect().height-img.naturalWidth/img.naturalHeight)<.01),
        noExtraContact:section.querySelectorAll('a, .about-signature').length===0,
        footer:document.querySelectorAll('footer').length,
        height:box.height,coverWidth:section.querySelector('.about-publication img').getBoundingClientRect().width,
        portrait:[section.querySelector('.about-portrait').getBoundingClientRect().top,section.querySelector('.about-leader-copy').getBoundingClientRect().top]};
    })()`);
    assert.equal(about.background,'rgb(32, 49, 45)');assert(about.contained && about.images && about.noExtraContact);assert.equal(about.footer,1);
    if(width===1440){assert(about.height<820, 'Sobre compacta no desktop');assert(about.coverWidth>=75 && about.coverWidth<=100);console.log('Altura Sobre a Pavel:',Math.round(about.height)+'px');}
    if(width<700)assert(about.portrait[1]>about.portrait[0], 'Foto e texto empilhados');
    await evaluate("document.documentElement.style.scrollBehavior='auto';document.querySelector('#menu a[href=\"#sobre\"]').click()");await pause(100);
    assert.equal(await evaluate("document.querySelector('#menu a[aria-current]').getAttribute('href')"),'#sobre');
    assert(await evaluate("(()=>{const target=document.querySelector('#sobre').getBoundingClientRect().top+scrollY-document.querySelector('.site-header').getBoundingClientRect().height;return Math.abs(scrollY-Math.min(target,document.documentElement.scrollHeight-innerHeight))<2;})()"));
    if([1440,390].includes(width)){
      const bounds=await evaluate("(()=>{const r=document.querySelector('#sobre').getBoundingClientRect();return {x:0,y:Math.round(r.top+scrollY),width:innerWidth,height:Math.ceil(r.height),scale:1};})()");
      const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:bounds});fs.writeFileSync(path.join(preview,`about-${width}.png`),Buffer.from(shot.data,'base64'));
    }
    const footerHeight = await evaluate("document.querySelector('.contact-section').getBoundingClientRect().height + document.querySelector('.footer').getBoundingClientRect().height");
    console.log(`Contato + rodapé em ${width}px: ${Math.round(footerHeight)}px`);
    assert(footerHeight < (width < 700 ? 470 : 340), `Encerramento compacto em ${width}px`);
    if ([1440, 390].includes(width)) {
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      fs.writeFileSync(path.join(preview, `home-${width}.png`), Buffer.from(screenshot.data, 'base64'));
      const header = await send('Page.captureScreenshot', { format: 'png', clip: {x:0,y:0,width,height:95,scale:1} });
      fs.writeFileSync(path.join(preview, `header-${width}.png`), Buffer.from(header.data, 'base64'));
    }
  }
  for (const [width,height] of [[1650,900],[1440,768],[1440,900],[1024,768]]) {
    await send('Emulation.setDeviceMetricsOverride', {width,height,deviceScaleFactor:1,mobile:false});
    await pause(150);
    const sizing = await evaluate(`(() => {
      const header=document.querySelector('.site-header').getBoundingClientRect().height;
      return {usable:innerHeight-header,expertise:document.querySelector('.expertise').getBoundingClientRect().height,training:document.querySelector('.training-section').getBoundingClientRect().height,
        about:document.querySelector('#sobre').getBoundingClientRect().height,hero:document.querySelector('.hero-stage').getBoundingClientRect().height,simulator:document.querySelector('.simulator').getBoundingClientRect().height,
        rows:[...document.querySelectorAll('.training')].map(el=>el.getBoundingClientRect().height)};
    })()`);
    if(width>=1440)assert(sizing.about<=sizing.usable, `Sobre em uma tela útil em ${width}x${height}`);
    assert(Math.abs(sizing.training-sizing.usable)<=2, `Dois painéis na mesma tela em ${width}x${height}: ${JSON.stringify(sizing)}`);
    assert(Math.abs(sizing.expertise-sizing.usable)<=2, `Áreas de atuação na altura útil em ${width}x${height}: ${JSON.stringify(sizing)}`);
    assert(Math.abs(sizing.hero-sizing.usable)<=2 && Math.abs(sizing.simulator-sizing.usable)<=2, 'Altura útil do hero e Simulator');
    await evaluate("document.documentElement.style.scrollBehavior='auto'; document.querySelector('#treinamentos').scrollIntoView()");
    assert(await evaluate("Math.abs(document.querySelector('#treinamentos').getBoundingClientRect().top-document.querySelector('.site-header').getBoundingClientRect().bottom)<2"), 'Destino abaixo do cabeçalho');
    if(width===1440 && height===768){const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(preview,'training-desktop.png'),Buffer.from(shot.data,'base64'));}
  }
  // Composição inteira em uma tela desktop e navegação ativa em cada destino.
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await pause(150);
  assert(await evaluate(`(()=>{const a=document.querySelector('.agenda-intro').getBoundingClientRect(), b=document.querySelector('.agenda-calendars').getBoundingClientRect();return Math.abs(a.width/(a.width+b.width)-.4)<.01 && document.querySelector('#turmas').getBoundingClientRect().height<=innerHeight-document.querySelector('.site-header').getBoundingClientRect().height+2;})()`));
  for (const id of ['inicio','atuacao','treinamentos','simulator','turmas','sobre','inicio']) {
    await evaluate(`document.querySelector('#menu a[href="#${id}"]').click()`); await pause(100);
    assert.equal(await evaluate("document.querySelectorAll('#menu a[aria-current]').length"),1);
    assert.equal(await evaluate("document.querySelector('#menu a[aria-current]').getAttribute('href')"),'#'+id);
  }
  await evaluate("document.documentElement.style.scrollBehavior='smooth';document.querySelector('#menu a[href=\"#turmas\"]').click()");
  for(let i=0;i<12;i++){await pause(70);assert.equal(await evaluate("document.querySelector('#menu a[aria-current]').getAttribute('href')"),'#turmas');}
  await evaluate("document.documentElement.style.scrollBehavior='auto'");
  for (const id of ['atuacao','treinamentos','simulator','turmas','inicio']) {
    await evaluate(`document.querySelector('#${id}').scrollIntoView()`);await pause(80);
    assert.equal(await evaluate("document.querySelector('#menu a[aria-current]').getAttribute('href')"),'#'+id);
  }
  await evaluate("window.TEST_NOW='2026-11-01T03:00:00Z'");
  await pause(1200);
  assert.equal(await evaluate("document.querySelector('#calendar-month').textContent"),'novembro de 2026','Virada automática sem evento de visibilidade');
  // Atualização da página já aberta na virada do mês e do ano.
  for (const [instant,current,next] of [['2026-11-01T03:00:00Z','novembro de 2026','dezembro de 2026'],['2026-12-31T23:00:00Z','dezembro de 2026','janeiro de 2027'],['2027-01-01T03:00:00Z','janeiro de 2027','fevereiro de 2027']]) {
    await evaluate(`window.TEST_NOW='${instant}';document.dispatchEvent(new Event('visibilitychange'))`);
    assert.equal(await evaluate("document.querySelector('#calendar-month').textContent"),current);
    assert.equal(await evaluate("document.querySelector('#calendar-next-month').textContent"),next);
    assert.equal(await evaluate("document.querySelector('#class-list').textContent"),'Novas datas em definição.');
    assert(await evaluate("!!document.querySelector('.agenda-demand a[href^=\"https://wa.me/\"]')"));
    assert.equal(await evaluate("document.querySelector('[aria-current=date]').dataset.date"),instant==='2026-12-31T23:00:00Z'?'2026-12-31':instant.slice(0,10));
  }
  await evaluate("window.TEST_NOW='2026-10-08T15:00:00Z';document.dispatchEvent(new Event('visibilitychange'))");
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:1000,deviceScaleFactor:1,mobile:true});
  await evaluate("document.querySelector('.menu-toggle').click()");
  assert.equal(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')"), 'true');
  await evaluate("document.querySelector('#menu a').click()");
  assert.equal(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')"), 'false');
  const month = await evaluate("document.querySelector('#calendar-month').textContent");
  await evaluate("document.querySelector('#next-month').click()");
  assert.notEqual(await evaluate("document.querySelector('#calendar-month').textContent"), month);
  await evaluate("document.querySelector('#previous-month').click()");
  assert.equal(await evaluate("document.querySelector('#calendar-month').textContent"), month);
  await evaluate("document.querySelector('a[href=\"ms-project.html\"]').click()");
  for (let i = 0; i < 50; i++) { if (await evaluate("!!document.querySelector('.course-hero') && document.querySelector('[data-whatsapp=\"msp\"]').href.includes('?text=')")) break; await pause(100); }
  assert(await evaluate("location.pathname.endsWith('/ms-project.html')"));
  assert.equal(await evaluate("document.querySelectorAll('main section').length"), 1);
  assert(await evaluate("document.querySelector('[data-whatsapp=\"msp\"]').href.includes('wa.me/5521995716270?text=')"));
  assert(await evaluate("document.querySelector('.whatsapp-floating').href.includes('wa.me/5521995716270?text=')"));
  await evaluate("Promise.all(Array.from(document.images, img => img.decode()))");
  assert(await evaluate("Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)"));
  for (const width of [1440, 1024, 768, 390, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 700 });
    await pause(100);
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `Overflow MS Project em ${width}px`);
    if ([1440, 390].includes(width)) {
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      fs.writeFileSync(path.join(preview, `ms-project-${width}.png`), Buffer.from(screenshot.data, 'base64'));
    }
  }
  await evaluate("document.querySelector('.menu-toggle').click()");
  assert.equal(await evaluate("document.querySelector('.menu-toggle').getAttribute('aria-expanded')"), 'true');
  await evaluate("document.querySelector('#menu a[href=\"index.html#treinamentos\"]').click()");
  for (let i = 0; i < 50; i++) { if (await evaluate("!!document.querySelector('.calendar table')")) break; await pause(100); }
  assert(await evaluate("location.pathname.endsWith('/index.html') && location.hash === '#treinamentos'"));
  // A fonte Controle e independente; recarregar nao troca a data pelo dia do navegador.
  async function reloadControl(mode, expected) {
    controlMode = mode;
    await send('Page.reload', {ignoreCache:true});
    for(let i=0;i<170;i++){
      if(await evaluate("document.querySelectorAll('.class-day').length===11 && " + (expected ? "document.querySelector('#agenda-updated').textContent==="+JSON.stringify(expected) : "document.querySelector('#agenda-updated').hidden")))break;
      await pause(100);
    }
    assert.equal(await evaluate("document.querySelectorAll('.class-day').length"),11,'Controle nao interfere nas turmas');
    if(expected)assert.equal(await evaluate("document.querySelector('#agenda-updated').textContent"),expected);
    else assert(await evaluate("document.querySelector('#agenda-updated').hidden"));
  }
  await reloadControl('valid','Agenda atualizada em: 08/10/2026');
  await reloadControl('valid','Agenda atualizada em: 08/10/2026');
  controlValue='09/10/2026 00:01:00';
  await reloadControl('valid','Agenda atualizada em: 09/10/2026');
  for(const width of [1440,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<700});
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'));
    assert(await evaluate("getComputedStyle(document.querySelector('#agenda-updated')).fontSize==='12px'"));
  }
  await reloadControl('invalid','');
  await reloadControl('failure','');
  controlMode='';
  console.log('OK: Controle B1 opcional, data persistente, alteracao da fonte, formato, mobile e falha isolada.');
  fixture = true;
  await send('Page.reload', { ignoreCache: true });
  for (let i = 0; i < 50; i++) { if (await evaluate("document.querySelectorAll('.class-day').length===2")) break; await pause(100); }
  assert.equal(await evaluate("document.querySelectorAll('.class-day').length"), 2);
  assert.equal(await evaluate("document.querySelectorAll('.class-list-item').length"), 2);
  assert(await evaluate("document.querySelector('.class-day').closest('td').querySelector('.day-number').textContent==='1' && document.querySelector('.class-day').closest('td').querySelector('.holiday-marker') && document.querySelector('.class-day').closest('td').querySelector('.moon-marker')"), 'Dia, duas turmas, Lua cheia e feriado coexistem');
  for (const width of [1440,390,320]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<700});await pause(80);
    assert(await evaluate(`(()=>{const cell=document.querySelector('.class-day').closest('td'), box=cell.getBoundingClientRect(), number=cell.querySelector('.day-number').getBoundingClientRect(), markers=[...cell.querySelector('.day-markers').children].map(el=>el.getBoundingClientRect());return markers.every(r=>r.top>=number.bottom-1 && r.bottom<=box.bottom+1 && r.left>=box.left-1 && r.right<=box.right+1) && markers.every((r,i)=>markers.slice(i+1).every(s=>r.right<=s.left+.5 || s.right<=r.left+.5 || r.bottom<=s.top+.5 || s.bottom<=r.top+.5));})()`), `Indicadores simultâneos sem sobreposição em ${width}px`);
    if(width===390){await evaluate("document.documentElement.style.scrollBehavior='auto';document.querySelector('.calendar').scrollIntoView()");await pause(100);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(preview,'calendar-compact-mobile.png'),Buffer.from(shot.data,'base64'));}
  }
  await evaluate("document.querySelector('.class-day').click()");
  assert(await evaluate("document.querySelector('#class-dialog').open"));
  assert(await evaluate("document.querySelector('#dialog-details').textContent.includes('HORÁRIO DE TESTE')"));
  assert.equal(await evaluate("document.querySelector('#dialog-actions .button').href"), 'https://example.com/form');
  assert(await evaluate("document.querySelector('#dialog-actions .text-link').href.includes('wa.me/5511999999999?text=')"));
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  assert.equal(await evaluate("document.querySelector('#class-dialog').open"), false);
  assert(await evaluate("document.querySelectorAll('.footer-socials a').length===3 && [...document.querySelectorAll('.footer-socials a')].every(a=>a.target==='_blank' && a.rel==='noopener noreferrer' && a.hasAttribute('aria-label') && a.querySelector('svg'))"));
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.footer-socials a')].map(a=>a.href)"),['https://www.instagram.com/pavelconsultoria/','https://br.linkedin.com/in/pavel-consultoria-karolina-poznyakov-msc-pmp-retired-ipma-d-46933913','https://www.facebook.com/share/1DtL7kJcTF/']);
  // Uma edição da resposta CSV é refletida na próxima carga, sem alteração de código.
  updatedCsv=true;await send('Page.reload',{ignoreCache:true});
  for(let i=0;i<80;i++){if(await evaluate("document.querySelector('td[data-date=\"2026-05-02\"] .class-day')"))break;await pause(100);}
  assert.equal(await evaluate("document.querySelectorAll('td[data-date=\"2026-05-02\"] .class-day').length"),2);
  assert.equal(await evaluate("document.querySelectorAll('td[data-date=\"2026-05-01\"] .class-day').length"),0);
  assert(await evaluate("document.querySelector('#class-list').textContent.includes('02/05/2026')"));
  csvFailure=true;await send('Page.reload',{ignoreCache:true});
  for(let i=0;i<80;i++){if(await evaluate("document.querySelector('#class-list')?.textContent.includes('Não foi possível')"))break;await pause(100);}
  assert(await evaluate("document.querySelector('#class-list').textContent.includes('Não foi possível')"));
  assert.equal(await evaluate("document.querySelectorAll('.class-day').length"),0,'Sem fallback histórico na falha');
  assert.equal(await evaluate("document.querySelectorAll('.calendar table').length"),2);
  assert(await evaluate("document.querySelectorAll('.moon-marker').length>0 && document.querySelectorAll('.holiday-marker').length>0"));
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('OK: Chrome real, 5 larguras (320–1440px), menu ativo e navegação suave, dois calendários, faixas de fim de semana, cores, fases e feriados, viradas de dia/mês/ano, turmas históricas/futuras, agenda vazia, diálogo, Escape, Forms e WhatsApp. Screenshots em .preview/.');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { socket?.close(); child.kill(); });
