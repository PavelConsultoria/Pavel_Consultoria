(() => {
  'use strict';
  const total = document.querySelector('#site-visits');
  if (!total) return;

  // Reading this total never records a visit. The official script handles
  // collection and GoatCounter deduplicates sessions on the server.
  async function loadTotal() {
    try {
      const response = await fetch('https://pavelconsultoria.goatcounter.com/counter/TOTAL.json', {
        credentials: 'omit',
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) throw new Error('Contador indisponível');
      const data = await response.json();
      // The public API returns a formatted string, not an integer.
      if (typeof data.count !== 'string' || !/^\d[\d\s,.'\u00a0\u202f]*$/.test(data.count)) {
        throw new Error('Total inválido');
      }
      total.textContent = data.count;
    } catch {
      total.textContent = 'indisponível';
    }
  }
  loadTotal();
})();
