(() => {
  'use strict';
  const videos = [...document.querySelectorAll('.gallery-video')];
  if (!videos.length) return;
  const root = document.documentElement;
  const measure = () => {
    for (const [selector, variable] of [['.site-header','header'],['.footer','footer'],['.gallery-heading','heading']]) {
      root.style.setProperty(`--gallery-${variable}-height`, `${Math.ceil(document.querySelector(selector).getBoundingClientRect().height)}px`);
    }
  };
  const resize = new ResizeObserver(measure);
  ['.site-header','.footer','.gallery-heading'].forEach(selector => resize.observe(document.querySelector(selector)));
  measure();

  const visible = new Set();
  const play = video => {
    if (document.hidden || !visible.has(video)) return;
    video.play().catch(() => { /* A subsequent visibility event can retry autoplay. */ });
  };
  videos.forEach(video => {
    const mute = () => {
      if (!video.muted) video.muted = true;
      if (video.volume !== 0) video.volume = 0;
    };
    video.defaultMuted = true;
    mute();
    video.addEventListener('volumechange', mute);
    video.addEventListener('contextmenu', event => event.preventDefault());
    const error = () => { video.closest('.gallery-item').querySelector('.gallery-error').hidden = false; };
    video.addEventListener('error', error);
    video.querySelector('source').addEventListener('error', error);
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      if (isIntersecting) { visible.add(target); play(target); }
      else { visible.delete(target); target.pause(); }
    });
  }, {threshold:0.1});
  videos.forEach(video => observer.observe(video));

  // Original instrumental, synthesized locally on request: soft mallet melody,
  // major-seventh chords and gentle bass. No third-party audio or video changes.
  let context, source, gain, buffer, musicEnabled = false;
  const button = document.querySelector('.gallery-music');
  const label = button.querySelector('[data-music-label]');
  const status = document.querySelector('.gallery-music-status');
  const createMusic = () => {
    const rate = 22050, beat = 0.6, duration = 64 * beat;
    const audio = context.createBuffer(2, Math.ceil(duration * rate), rate);
    const channels = [audio.getChannelData(0), audio.getChannelData(1)];
    const note = (midi, at, length, level, pan = 0, softness = 1) => {
      const frequency = 440 * 2 ** ((midi-69)/12);
      const offset = Math.round(at * rate), samples = Math.min(Math.round(length*rate),audio.length-offset);
      for (let n=0;n<samples;n++) {
        const t=n/rate;
        const envelope=(1-Math.exp(-t*80))*Math.exp(-t*(softness===1?3.8:1.5))*Math.min(1,(samples-n)/(rate*0.06));
        const wave=Math.sin(2*Math.PI*frequency*t)+0.16*Math.sin(4*Math.PI*frequency*t)*Math.exp(-t*6);
        const value=wave*envelope*level;
        channels[0][offset+n]+=value*(1-pan*0.25);
        channels[1][offset+n]+=value*(1+pan*0.25);
      }
    };
    const chords=[[48,60,64,67,71],[43,59,62,67,69],[45,60,64,69,71],[41,57,60,64,67]];
    const melodies=[[76,79,81,79,76,74,72,74],[74,76,79,76,74,72,71,74],[76,81,79,76,74,76,79,76],[72,76,77,76,74,72,74,76]];
    for(let bar=0;bar<16;bar++) {
      const chord=chords[bar%4], start=bar*4*beat;
      note(chord[0],start,2.2,0.12,0,2);
      chord.slice(1).forEach((pitch,index)=>note(pitch,start+index*0.07,2.1,0.04,(index-1.5)/2,2));
      for(let step=0;step<8;step++) note(melodies[bar%4][(step+(bar>=8?2:0))%8],start+step*beat/2,0.55,step%2?0.035:0.065,step%2?0.4:-0.4);
    }
    const fade=Math.round(rate*0.03);
    channels.forEach(channel => { for(let i=0;i<fade;i++){channel[i]*=i/fade;channel[channel.length-1-i]*=i/fade;} });
    return audio;
  };
  const updateButton = () => {
    button.setAttribute('aria-pressed',String(musicEnabled));
    label.textContent = musicEnabled ? 'Pausar trilha' : 'Ativar trilha';
    button.setAttribute('aria-label',musicEnabled?'Pausar trilha instrumental':'Ativar trilha instrumental em volume baixo');
  };
  button.addEventListener('click',async () => {
    try {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw Error('Áudio indisponível');
        context=new AudioContext(); gain=context.createGain(); gain.gain.value=0.22; gain.connect(context.destination);
        buffer=createMusic(); source=context.createBufferSource(); source.buffer=buffer; source.loop=true; source.connect(gain); source.start();
      }
      musicEnabled=!musicEnabled;
      if(musicEnabled) await context.resume(); else await context.suspend();
      status.textContent=''; updateButton();
    } catch {
      musicEnabled=false;updateButton();status.textContent='A trilha não está disponível neste navegador.';
    }
  });
  document.addEventListener('visibilitychange',() => {
    if(document.hidden){videos.forEach(video=>video.pause());if(context)context.suspend().catch(()=>{});}
    else {visible.forEach(play);if(context&&musicEnabled)context.resume().catch(()=>{});}
  });
  window.addEventListener('pagehide',()=>{videos.forEach(video=>video.pause());if(context)context.suspend().catch(()=>{});});
  window.addEventListener('pageshow',()=>{visible.forEach(play);if(context&&musicEnabled)context.resume().catch(()=>{});});
})();
