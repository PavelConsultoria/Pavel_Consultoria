(() => {
  'use strict';
  if(document.body.classList.contains('home')) {
    const legacy={turmas:'agenda.html',sobre:'sobre.html',simulator:'certificacao-pmp.html',treinamentos:'ms-project.html','primavera-p6':'primavera.html'};
    const destination=legacy[location.hash.slice(1)];if(destination){location.replace(destination);return;}
  }
  const clock = document.querySelector('#footer-clock');
  const format = new Intl.DateTimeFormat('pt-BR', {timeZone:'America/Sao_Paulo',weekday:'short',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  function updateClock() { const now = new Date(); clock.dateTime=now.toISOString(); clock.textContent=format.format(now).replace('.','').toUpperCase(); }
  if(clock){updateClock();setInterval(updateClock,30000);}
  // Eventos comerciais não contam como visitas; o script oficial coleta uma visita por página.
  document.addEventListener('click', event => {
    const link = event.target.closest('a,button'); if(!link || !window.goatcounter?.count)return;
    const href=link.getAttribute('href') || '';
    let action;
    if(href.startsWith('https://wa.me/'))action='whatsapp';
    else if(href.includes('pavelpmpsimulator.com.br'))action='simulator';
    else if(href==='ms-project.html')action='ms-project';
    else if(href==='primavera.html')action='primavera';
    else if(href==='agenda.html' || href.includes('docs.google.com/forms') || href.includes('forms.gle'))action='inscricao-agenda';
    else if(link.matches('.class-day'))action='agenda-detalhes';
    else if(link.id==='previous-month' || link.id==='next-month')action='agenda-navegacao';
    if(action)window.goatcounter.count({path:'evento/'+action,title:action,event:true});
  });
})();
