/* ORONZO F01 — fullscreen control isolated from career/gameplay state. */
(() => {
  'use strict';

  const toggle = document.getElementById('fullscreen-toggle');
  const feedback = document.getElementById('ui-toast');
  if (!toggle) return;

  let pending = false;

  function sync() {
    const active = Boolean(document.fullscreenElement);
    toggle.setAttribute('aria-pressed', String(active));
    toggle.setAttribute('aria-label', active
      ? 'Esci dalla modalità a schermo intero'
      : 'Attiva la modalità a schermo intero');
    toggle.title = active ? 'Esci dallo schermo intero' : 'Schermo intero';
    toggle.textContent = active ? '⛶ ESCI SCHERMO INTERO' : '⛶ SCHERMO INTERO';
    toggle.classList.toggle('is-fullscreen', active);
  }

  function notify(message) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.hidden = false;
    window.setTimeout(() => {
      // Do not hide a newer career status message.
      if (feedback.textContent === message) feedback.hidden = true;
    }, 3800);
  }

  async function toggleFullscreen(event) {
    event.preventDefault();
    if (pending) return;
    pending = true;
    try {
      if (document.fullscreenElement) {
        if (typeof document.exitFullscreen !== 'function')
          throw new Error('exitFullscreen unavailable');
        await document.exitFullscreen();
      } else {
        if (document.fullscreenEnabled === false ||
            typeof document.documentElement.requestFullscreen !== 'function')
          throw new Error('requestFullscreen unavailable');
        // Must run inside the user's actual tap/click, never on page load.
        await document.documentElement.requestFullscreen();
      }
    } catch (_) {
      notify('Schermo intero non consentito da questo browser.');
    } finally {
      pending = false;
      sync();
    }
  }

  toggle.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', sync);
  document.addEventListener('fullscreenerror', () => {
    notify('Impossibile attivare lo schermo intero.');
    sync();
  });
  window.addEventListener('pageshow', sync);
  sync();
})();
