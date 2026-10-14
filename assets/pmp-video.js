(() => {
  'use strict';
  const dialog = document.querySelector('#pmp-video');
  const offer = document.querySelector('#pmp-offer');
  const player = dialog?.querySelector('[data-pmp-player]');
  const video = player?.querySelector('video');
  const trigger = document.querySelector('[data-pmp-preview]');
  if (!video || !offer || !trigger) return;
  let leaving = false;
  function showOffer() {
    if (!dialog.open || leaving || !offer.hidden) return;
    // Troca o conteúdo antes de pausar para evitar reentrada pelo evento pause.
    offer.hidden = false;
    player.hidden = true;
    video.pause();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    dialog.querySelector('#pmp-offer-title').focus();
  }
  function continueVideo() {
    offer.hidden = true;
    player.hidden = false;
    if (video.ended) video.currentTime = 0;
    video.focus();
    video.play().catch(() => {});
  }
  function closeDialog() {
    leaving = true;
    video.pause();
    dialog.close();
  }
  dialog.addEventListener('close', () => {
    document.body.classList.remove('p6-modal-open');
    trigger.focus();
  });
  trigger.addEventListener('click', () => {
    leaving = false;
    offer.hidden = true;
    player.hidden = false;
    dialog.showModal();
    document.body.classList.add('p6-modal-open');
    if (video.ended) video.currentTime = 0;
    video.play().catch(() => {});
  });
  video.addEventListener('pause', showOffer);
  video.addEventListener('ended', showOffer);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    if (offer.hidden) showOffer(); else closeDialog();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !dialog.open) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (offer.hidden) showOffer(); else closeDialog();
  }, true);
  video.addEventListener('webkitendfullscreen', showOffer);
  let wasFullscreen = false;
  document.addEventListener('fullscreenchange', () => {
    const exited = wasFullscreen && !document.fullscreenElement;
    wasFullscreen = !!document.fullscreenElement;
    if (exited) showOffer();
  });
  dialog.querySelector('[data-pmp-exit]').addEventListener('click', () => {
    if (offer.hidden) showOffer(); else closeDialog();
  });
  offer.querySelector('[data-pmp-continue]').addEventListener('click', continueVideo);
})();
