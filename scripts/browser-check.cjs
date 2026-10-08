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
  let fixture = false;
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
      // Dados sintéticos exclusivos do teste, nunca gravados na configuração publicada.
      const extra = fixture ? `\nPAVEL_CONFIG.classes = [{ date: new Intl.DateTimeFormat('sv-SE', {timeZone:'America/Sao_Paulo'}).format(new Date()), course:'msp', time:'HORÁRIO DE TESTE', modality:'MODALIDADE DE TESTE', status:'TESTE' },{date:new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date()),course:'p6',time:'TESTE',modality:'TESTE',status:'TESTE'}]; PAVEL_CONFIG.whatsappNumber='5511999999999'; PAVEL_CONFIG.forms.msp='https://example.com/form';` : '';
      send('Fetch.fulfillRequest', { requestId: data.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'text/javascript; charset=utf-8' }], body: Buffer.from(source + extra).toString('base64') }).catch(console.error);
    }
  };
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  await send('Page.enable'); await send('Runtime.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/assets/config.js' }] });
  await send('Page.navigate', { url: 'http://localhost:4173' });
  for (let i = 0; i < 50; i++) { if (await evaluate("!!document.querySelector('.calendar table')")) break; await pause(100); }
  assert(await evaluate("!!document.querySelector('.calendar table')"), 'Calendário não renderizou');
  assert.equal(await evaluate("document.querySelectorAll('.class-day').length"), 0, 'Turmas fictícias na Home');
  assert.equal(await evaluate("document.querySelectorAll('.whatsapp-floating').length"), 0, 'WhatsApp flutuante removido somente da Home');
  assert.equal(await evaluate("document.querySelector('.header-whatsapp').href"), 'https://wa.me/5521995716270');
  assert(await evaluate("document.querySelector('.header-whatsapp').rel.includes('noopener') && document.querySelector('.header-whatsapp').target === '_blank'"));
  await evaluate("Promise.all(Array.from(document.images, img => { img.loading = 'eager'; return img.decode(); }))");
  assert(await evaluate("Array.from(document.images).every(img => img.naturalWidth > 0)"));
  assert(await evaluate("document.querySelector('.brand-image').src.endsWith('/assets/logo-pavel-dark.png') && getComputedStyle(document.querySelector('.brand-image')).filter === 'none'"), 'Logo para fundo escuro sem filtro global');
  assert(await evaluate("document.querySelector('.training-links a').getAttribute('href') === 'ms-project.html' && document.querySelector('.training-links li:last-child a').href.startsWith('https://wa.me/5521995716270')"), 'Destinos dos links de treinamento');
  assert(await evaluate(`Promise.all(['.service--consultoria','.training--msp','.training--p6','.simulator'].map(selector => {
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
    const footerHeight = await evaluate("document.querySelector('.contact-section').getBoundingClientRect().height + document.querySelector('.footer').getBoundingClientRect().height");
    console.log(`Contato + rodapé em ${width}px: ${Math.round(footerHeight)}px`);
    assert(footerHeight < (width < 700 ? 410 : 300), `Encerramento compacto em ${width}px`);
    if ([1440, 390].includes(width)) {
      const screenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      fs.writeFileSync(path.join(preview, `home-${width}.png`), Buffer.from(screenshot.data, 'base64'));
      const header = await send('Page.captureScreenshot', { format: 'png', clip: {x:0,y:0,width,height:95,scale:1} });
      fs.writeFileSync(path.join(preview, `header-${width}.png`), Buffer.from(header.data, 'base64'));
    }
  }
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
  fixture = true;
  await send('Page.reload', { ignoreCache: true });
  for (let i = 0; i < 50; i++) { if (await evaluate("document.querySelectorAll('.class-day').length===2")) break; await pause(100); }
  assert.equal(await evaluate("document.querySelectorAll('.class-day').length"), 2);
  assert.equal(await evaluate("document.querySelectorAll('.class-list-item').length"), 2);
  assert.equal(await evaluate("document.querySelector('.class-day').parentElement.querySelectorAll('span').length"), 0, 'Acrônimo deve substituir o número');
  await evaluate("document.querySelector('.class-day').click()");
  assert(await evaluate("document.querySelector('#class-dialog').open"));
  assert(await evaluate("document.querySelector('#dialog-details').textContent.includes('HORÁRIO DE TESTE')"));
  assert.equal(await evaluate("document.querySelector('#dialog-actions .button').href"), 'https://example.com/form');
  assert(await evaluate("document.querySelector('#dialog-actions .text-link').href.includes('wa.me/5511999999999?text=')"));
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  assert.equal(await evaluate("document.querySelector('#class-dialog').open"), false);
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('OK: Chrome real, 5 larguras (320–1440px), menu, agenda vazia, navegação mensal, turmas simultâneas, lista, diálogo, Escape, Forms e WhatsApp. Screenshots em .preview/.');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { socket?.close(); child.kill(); });
