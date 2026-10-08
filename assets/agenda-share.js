(() => {
  'use strict';
  const section = document.querySelector('#turmas');
  const grid = section?.querySelector('#calendar-grid');
  const heading = section?.querySelector('.agenda-heading');
  if (!grid || !heading) return;
  const shareUrl = 'https://pavelconsultoria.github.io/Pavel_Consultoria/#turmas';
  const control = document.createElement('div');
  control.className = 'agenda-share';
  control.innerHTML = '<button class="agenda-share-toggle" type="button" aria-label="Compartilhar Agenda" title="Compartilhar Agenda" aria-haspopup="menu" aria-expanded="false" aria-controls="agenda-share-menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg><span>Compartilhar Agenda</span></button><div class="agenda-share-menu" id="agenda-share-menu" role="menu" aria-label="Compartilhar Agenda" hidden><button type="button" role="menuitem" data-agenda-share="link">Compartilhar link</button><button type="button" role="menuitem" data-agenda-share="png" disabled>Salvar imagem da Agenda (PNG)</button></div><div class="agenda-share-feedback" hidden><span role="status" aria-live="polite"></span></div>';
  heading.append(control);
  const toggle = control.querySelector('.agenda-share-toggle');
  const menu = control.querySelector('.agenda-share-menu');
  const linkButton = menu.querySelector('[data-agenda-share="link"]');
  const pngButton = menu.querySelector('[data-agenda-share="png"]');
  const feedback = control.querySelector('.agenda-share-feedback');
  const status = feedback.querySelector('[role="status"]');
  let busy = false, feedbackTimer;
  function setOpen(open, focus = false) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) feedback.hidden = true;
    if (focus) (open ? linkButton : toggle).focus();
  }
  function message(text, manualCopy = false) {
    window.clearTimeout(feedbackTimer);
    feedback.querySelector('input')?.remove();
    feedback.hidden = false;
    status.textContent = text;
    if (manualCopy) {
      const input = document.createElement('input');
      input.value = shareUrl; input.readOnly = true;
      input.setAttribute('aria-label', 'Link da Agenda para copiar');
      feedback.append(input); input.focus(); input.select();
    } else feedbackTimer = window.setTimeout(() => { feedback.hidden = true; }, 6000);
  }
  function syncExport() {
    pngButton.disabled = busy || grid.dataset.agendaState !== 'ready';
    pngButton.title = grid.dataset.agendaState === 'loading' ? 'Aguarde o carregamento da Agenda.' : grid.dataset.agendaState === 'error' ? 'A programa\u00e7\u00e3o precisa carregar antes de gerar a imagem.' : '';
  }
  new MutationObserver(syncExport).observe(grid, { attributes: true, attributeFilter: ['data-agenda-state'] });
  syncExport();
  toggle.addEventListener('click', () => setOpen(menu.hidden, true));
  toggle.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true, true); }
  });
  menu.addEventListener('keydown', event => {
    const items = [...menu.querySelectorAll('button:not(:disabled)')];
    const index = items.indexOf(document.activeElement);
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      items[event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    }
  });
  control.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false, true); feedback.hidden = true; }
  });
  document.addEventListener('click', event => { if (!control.contains(event.target)) { setOpen(false); feedback.hidden = true; } });
  control.addEventListener('focusout', event => { if (!control.contains(event.relatedTarget)) setOpen(false); });
  function legacyCopy() {
    const input = document.createElement('textarea');
    input.value = shareUrl; input.readOnly = true;
    input.style.cssText = 'position:fixed;left:-9999px;top:0';
    const focus = document.activeElement;
    document.body.append(input); input.select();
    let copied = false;
    try { copied = typeof document.execCommand === 'function' && document.execCommand('copy'); } catch {}
    input.remove(); focus?.focus();
    return copied;
  }
  linkButton.addEventListener('click', async () => {
    setOpen(false, true);
    if (typeof navigator.share === 'function') {
      try { await navigator.share({title:'Agenda de Treinamentos \u2014 Pavel Consultoria', url:shareUrl}); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    let copied = false;
    try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareUrl); copied = true; } } catch {}
    if (!copied) copied = legacyCopy();
    message(copied ? 'Link copiado!' : 'N\u00e3o foi poss\u00edvel copiar automaticamente. Copie o link abaixo:', !copied);
  });
  function snapshot() {
    if (grid.dataset.agendaState !== 'ready') throw new Error('Agenda indisponivel');
    const calendars = [...grid.querySelectorAll('.calendar')].map(calendar => {
      const table = calendar.querySelector('table');
      const first = table.querySelector('td[data-date]');
      const cells = [...table.tBodies[0].rows].flatMap(row => [...row.cells].map(cell => ({
        day:cell.querySelector('.day-number')?.textContent || '',
        today:cell.getAttribute('aria-current') === 'date',
        markers:[...cell.querySelectorAll('.day-markers > *')].map(marker => ({
          kind:marker.classList.contains('class-day') ? marker.textContent === 'MSP' ? 'msp' : 'p6' : marker.classList.contains('holiday-marker') ? 'holiday' : 'moon',
          label:marker.textContent, name:marker.title
        }))
      })));
      return {title:calendar.querySelector('h3').textContent, key:first?.dataset.date.slice(0,7), weekdays:[...table.tHead.rows[0].cells].map(cell=>cell.textContent), cells};
    });
    if (calendars.length !== 2 || calendars.some(calendar => !calendar.key || calendar.cells.length !== 42)) throw new Error('Calendarios incompletos');
    const updated = section.querySelector('#agenda-updated');
    return {calendars, updated:updated && !updated.hidden ? updated.textContent : ''};
  }
  function filename(calendars) {
    const names = ['Janeiro','Fevereiro','Mar\u00e7o','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const parts = calendars.map(calendar => {const [year,month]=calendar.key.split('-');return {year,month:names[+month-1]};});
    return 'Pavel-Agenda-' + (parts[0].year===parts[1].year ? parts.map(part=>part.month).join('-')+'-'+parts[0].year : parts.map(part=>part.month+'-'+part.year).join('-')) + '.png';
  }
  function paint(data) {
    // Vector shapes and system fonts keep the Canvas independent of external assets/CORS.
    const maxMarkers = Math.max(0,...data.calendars.flatMap(calendar=>calendar.cells.map(cell=>cell.markers.length)));
    let width = 1600, slots, rowHeight, height;
    const header = data.updated ? 164 : 138, margin = 40, gap = 24;
    do {
      const cellWidth = (width-2*margin-gap)/14;
      slots = Math.max(1,Math.floor((cellWidth-12+4)/40));
      rowHeight = Math.max(94,44+Math.ceil(maxMarkers/slots)*28);
      height = header+56+36+6*rowHeight+190;
      if(height>width*.8) width = Math.ceil(width*1.25);
      else break;
    } while(width<8000);
    const canvas = document.createElement('canvas');
    canvas.width=width*2; canvas.height=height*2;
    const ctx=canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponivel');
    ctx.scale(2,2);
    function text(value,x,y,size=18,color='#263C31',align='left',weight=400){ctx.font=weight+' '+size+'px Arial, sans-serif';ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(value,x,y);}
    function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
    function moon(name,x,y){
      circle(x,y,9,'#F1C96A');
      if(/nova/i.test(name))circle(x,y,9,'#303E36');
      else if(/crescente|minguante/i.test(name)){
        ctx.beginPath();const right=/minguante/i.test(name);ctx.arc(x,y,9,right?-Math.PI/2:Math.PI/2,right?Math.PI/2:3*Math.PI/2);ctx.closePath();ctx.fillStyle='#303E36';ctx.fill();
      }
      ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.strokeStyle='#52645A';ctx.lineWidth=.7;ctx.stroke();
    }
    function flag(x,y){ctx.strokeStyle='#287D50';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-6,y+8);ctx.lineTo(x-6,y-9);ctx.stroke();ctx.fillStyle='#287D50';ctx.fillRect(x-5,y-8,14,9);}
    ctx.fillStyle='#F0F3F0';ctx.fillRect(0,0,width,height);
    ctx.fillStyle='#20312D';ctx.fillRect(0,0,width,header-20);
    text('Agenda de Treinamentos',margin,57,34,'#FFFFFF','left',600);
    text('PAVEL CONSULTORIA',width-margin,53,22,'#79C694','right',600);
    text(data.calendars.map(calendar=>calendar.title.replace(/^./,char=>char.toUpperCase())).join(' \u00b7 '),margin,94,20,'#E0E9E2');
    if(data.updated)text(data.updated,margin,126,16,'#E0E9E2');
    const panelWidth=(width-margin*2-gap)/2, panelHeight=56+36+6*rowHeight;
    data.calendars.forEach((calendar,index)=>{
      const x=margin+index*(panelWidth+gap), y=header, cellWidth=panelWidth/7;
      ctx.fillStyle='#FFFFFF';ctx.fillRect(x,y,panelWidth,panelHeight);
      text(calendar.title.replace(/^./,char=>char.toUpperCase()),x+panelWidth/2,y+36,25,'#263C31','center',600);
      calendar.weekdays.forEach((day,col)=>{
        const cellX=x+col*cellWidth;
        if(col===0||col===6){ctx.fillStyle='#E2E5E8';ctx.fillRect(cellX,y+56,cellWidth,panelHeight-56);ctx.fillStyle='#D5D9DC';ctx.fillRect(cellX,y+56,cellWidth,36);}
        text(day,cellX+cellWidth/2,y+81,16,'#52645A','center',500);
      });
      calendar.cells.forEach((cell,i)=>{
        const cx=x+(i%7)*cellWidth, cy=y+92+Math.floor(i/7)*rowHeight;
        if(cell.today){ctx.strokeStyle='#287D50';ctx.lineWidth=1.5;ctx.strokeRect(cx+3,cy+3,cellWidth-6,rowHeight-6);}
        if(!cell.day)return;
        text(cell.day,cx+cellWidth/2,cy+29,23,'#263C31','center',500);
        for(let start=0;start<cell.markers.length;start+=slots){
          const group=cell.markers.slice(start,start+slots);
          group.forEach((marker,j)=>{
            const mx=cx+cellWidth/2+(j-(group.length-1)/2)*40, my=cy+51+Math.floor(start/slots)*28;
            if(marker.kind==='msp'||marker.kind==='p6')text(marker.label,mx,my+6,16,marker.kind==='msp'?'#16804A':'#BD3038','center',700);
            else if(marker.kind==='holiday')flag(mx,my);
            else moon(marker.name,mx,my);
          });
        }
      });
      ctx.strokeStyle='#B9C9BF';ctx.lineWidth=1;ctx.strokeRect(x,y,panelWidth,panelHeight);
    });
    const legendY=header+panelHeight+40;
    text('MSP',margin,legendY,18,'#16804A','left',700);text('\u2014 MS Project',margin+46,legendY,18);
    text('P6',margin+255,legendY,18,'#BD3038','left',700);text('\u2014 Primavera P6',margin+287,legendY,18);
    flag(margin+535,legendY-6);text('Feriado nacional',margin+552,legendY,18);
    ['Lua nova','Quarto crescente','Lua cheia','Quarto minguante'].forEach((name,index)=>{const x=margin+index*235;moon(name,x+9,legendY+32);text(name,x+27,legendY+38,16);});
    text('pavelconsultoria.github.io/Pavel_Consultoria/',width-margin,height-37,18,'#52645A','right');
    return canvas;
  }
  pngButton.addEventListener('click', async () => {
    if (pngButton.disabled) return;
    setOpen(false,true); busy=true;syncExport();
    try {
      const data=snapshot(), canvas=paint(data);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG indisponivel')),'image/png'));
      const url=URL.createObjectURL(blob), download=document.createElement('a');
      download.href=url;download.download=filename(data.calendars);download.hidden=true;
      document.body.append(download);download.click();download.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),60000);
      message('PNG preparado para download. No celular, use a op\u00e7\u00e3o de salvar do navegador, se necess\u00e1rio.');
    } catch {message('N\u00e3o foi poss\u00edvel gerar a imagem. Atualize a Agenda e tente novamente.');}
    finally {busy=false;syncExport();}
  });
})();
