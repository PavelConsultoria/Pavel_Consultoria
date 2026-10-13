(() => {
  'use strict';
  const player = document.querySelector('#pmp-video');
  const offer = document.querySelector('#pmp-offer');
  const video = player?.querySelector('video');
  const trigger = document.querySelector('[data-pmp-preview]');
  if (!video || !offer || !trigger) return;
  let leaving = false;
  const syncScroll = () => document.body.classList.toggle('p6-modal-open', player.open || offer.open);
  async function showOffer() {
    if (!player.open || leaving || offer.open) return;
    video.pause();
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch {}
    }
    if (player.open && !leaving && !offer.open) offer.showModal();
    syncScroll();
  }
  function continueVideo() {
    offer.close();
    if (video.ended) video.currentTime = 0;
    video.play().catch(() => {});
  }
  function closePlayer() {
    leaving = true;
    offer.close();
    video.pause();
    player.close();
    syncScroll();
    trigger.focus();
    leaving = false;
  }
  trigger.addEventListener('click', () => {
    player.showModal();
    syncScroll();
    video.play().catch(() => {});
  });
  video.addEventListener('pause', showOffer);
  video.addEventListener('ended', showOffer);
  player.addEventListener('cancel', event => { event.preventDefault(); showOffer(); });
  offer.addEventListener('cancel', event => { event.preventDefault(); continueVideo(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !player.open) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (offer.open) continueVideo(); else showOffer();
  }, true);
  video.addEventListener('webkitendfullscreen', showOffer);
  let wasFullscreen = false;
  document.addEventListener('fullscreenchange', () => {
    const exited = wasFullscreen && !document.fullscreenElement;
    wasFullscreen = !!document.fullscreenElement;
    if (exited) showOffer();
  });
  player.querySelector('[data-pmp-exit]').addEventListener('click', closePlayer);
  offer.querySelectorAll('[data-pmp-continue]').forEach(button => button.addEventListener('click', continueVideo));
  offer.addEventListener('close', syncScroll);
})();
