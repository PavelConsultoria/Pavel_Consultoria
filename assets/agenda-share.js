(() => {
  'use strict';
  const heading=document.querySelector('.agenda-heading'), grid=document.querySelector('#calendar-grid');
  if(!heading || !grid)return;
  const toolbar=document.createElement('div');toolbar.className='agenda-share';
  const linkButton=document.createElement('button');linkButton.type='button';linkButton.textContent='Compartilhar Agenda';
  const imageButton=document.createElement('button');imageButton.type='button';imageButton.textContent='Salvar Agenda completa (PNG)';imageButton.dataset.agendaExport='';
  const status=document.createElement('span');status.className='agenda-share-status';status.setAttribute('role','status');
  toolbar.append(linkButton,imageButton,status);heading.append(toolbar);
  // Mesmo endereço oficial já utilizado nos metadados; validação TLS consta no relatório técnico.
  const url='https://pavelconsultoria.com.br/agenda.html';
  linkButton.addEventListener('click',async()=>{
    try {
      if(navigator.share){await navigator.share({title:'Agenda de Treinamentos — Pavel Consultoria',url});status.textContent='Agenda compartilhada.';}
      else {await navigator.clipboard.writeText(url);status.textContent='Link copiado.';}
    } catch(error) {status.textContent=error.name==='AbortError'?'Compartilhamento cancelado.':`Copie o link: ${url}`;}
  });
  const sync=()=>{imageButton.disabled=grid.dataset.agendaState!=='ready';};
  new MutationObserver(sync).observe(grid,{attributes:true,attributeFilter:['data-agenda-state']});sync();
  imageButton.addEventListener('click',async()=>{
    if(imageButton.disabled)return;
    imageButton.disabled=true;status.textContent='Preparando imagem…';
    try {
      await document.fonts.ready;
      const canvas=document.createElement('canvas');canvas.width=1800;
      const list=[...document.querySelectorAll('#class-list h3,#class-list p')].map(el=>({text:el.textContent,title:el.tagName==='H3'}));
      const context=canvas.getContext('2d');
      function wrap(text,width,size){context.font=`${size}px Arial`;const lines=[];let line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(context.measureText(next).width>width && line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
      let listHeight=0;for(const item of list)listHeight+=wrap(item.text,470,item.title?26:22).length*(item.title?36:31)+18;
      canvas.height=Math.max(1110,listHeight+470);context.fillStyle='#f0f3f0';context.fillRect(0,0,canvas.width,canvas.height);
      const text=(value,x,y,size=24,color='#20363e',bold=false)=>{context.fillStyle=color;context.font=`${bold?'bold ':''}${size}px Arial`;context.fillText(value,x,y);};
      text('PAVEL CONSULTORIA',60,64,26,'#286746',true);text('Agenda de Treinamentos',60,126,45,'#20363e',true);
      const updated=document.querySelector('#agenda-updated');if(updated && !updated.hidden)text(updated.textContent,60,172,22);
      text('PRÓXIMAS TURMAS',60,230,23,'#286746',true);let y=282;
      for(const item of list){const size=item.title?26:22;for(const line of wrap(item.text,470,size)){text(line,60,y,size,'#20363e',item.title);y+=item.title?36:31;}y+=18;}
      for(const line of wrap('Inscrição e informações: (21) 99571-6270 · WhatsApp',470,22)){text(line,60,y,22,'#286746');y+=31;}
      const calendars=[...grid.querySelectorAll('.calendar')];
      calendars.forEach((calendar,index)=>{
        const x=590+index*580,w=550,top=215,rowHeight=90,col=w/7;
        context.fillStyle='#fff';context.fillRect(x,top,w,730);text(calendar.querySelector('h3').textContent,x+25,top+45,27,'#20363e',true);
        [...calendar.querySelectorAll('tr')].forEach((row,r)=>[...row.cells].forEach((cell,c)=>{
          const cy=top+70+r*rowHeight,cx=x+c*col;context.fillStyle=c===0||c===6?'#e2e5e8':'#fff';context.fillRect(cx,cy,col,rowHeight);
          if(r===0){text(cell.textContent,cx+16,cy+30,20);return;}
          const number=cell.querySelector('.day-number');if(number)text(number.textContent,cx+14,cy+27,21);
          const markers=[...cell.querySelectorAll('.class-day,.holiday-marker,.moon-marker')];markers.forEach((marker,m)=>text(marker.textContent,cx+12,cy+50+m*18,marker.classList.contains('class-day')?17:18,marker.classList.contains('course-msp')?'#16804a':marker.classList.contains('course-p6')?'#bd3038':'#20363e',marker.classList.contains('class-day')));
          if(cell.classList.contains('today')){context.strokeStyle='#16804a';context.lineWidth=2;context.strokeRect(cx+1,cy+1,col-2,rowHeight-2);}
        }));
      });
      text('MSP — MS Project',590,980,22,'#16804a');text('P6 — Primavera P6',870,980,22,'#bd3038');text('⚑ Feriado nacional · 🌙 Fases da Lua',1160,980,21);
      context.fillStyle='#1b252a';context.fillRect(0,canvas.height-68,1800,68);text(url,60,canvas.height-25,23,'#fff');
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Não foi possível gerar PNG')),'image/png'));
      const objectUrl=URL.createObjectURL(blob),download=document.createElement('a');download.href=objectUrl;download.download='pavel-agenda-completa.png';download.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),10000);
      status.textContent='Imagem gerada. Verifique os downloads do navegador.';
      window.goatcounter?.count?.({path:'evento/agenda-exportacao',title:'agenda-exportacao',event:true});
    }catch{status.textContent='Não foi possível exportar. Tente novamente.';}finally{sync();}
  });
})();
