const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/visits.js'), 'utf8');
async function run(response, expected, exists = true) {
  const node = {textContent: 'indisponível'};
  const calls = [];
  const context = {
    document: {querySelector: () => exists ? node : null},
    AbortSignal,
    fetch: async (url, options) => {
      calls.push({url, options});
      if (response instanceof Error) throw response;
      return response;
    }
  };
  vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(node.textContent, expected);
  assert.equal(calls.length, exists ? 1 : 0);
  if (exists) {
    assert.equal(calls[0].url, 'https://pavelconsultoria.goatcounter.com/counter/TOTAL.json');
    assert.equal(calls[0].options.credentials, 'omit');
    assert(calls[0].options.signal instanceof AbortSignal);
  }
}
(async () => {
  for (const count of ['0', '123', '1,234', '1.234']) {
    await run({ok: true, json: async () => ({count})}, count);
  }
  for (const count of [null, undefined, 12, '', '-1', '<script>1</script>', 'NaN']) {
    await run({ok: true, json: async () => ({count})}, 'indisponível');
  }
  for (const response of [new Error('offline'), new DOMException('timeout', 'TimeoutError'),
    {ok: false, status: 403}, {ok: false, status: 503},
    {ok: true, json: async () => {throw new SyntaxError('invalid JSON');}}]) {
    await run(response, 'indisponível');
  }
  await run(null, 'indisponível', false);
  for (const page of ['index.html', 'ms-project.html']) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.equal((html.match(/data-goatcounter=/g) || []).length, 1);
    assert(html.includes('<script async data-goatcounter="https://pavelconsultoria.goatcounter.com/count" src="https://gc.zgo.at/count.js"></script>'));
  }
  const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal((home.match(/id="site-visits"/g) || []).length, 1);
  assert(home.includes('Visitas: <span id="site-visits"'));
  console.log('OK: total público, formatos, zero real, 403/503/offline/timeout/JSON inválido, ausência de rodapé e script oficial único/async nas duas páginas.');
})().catch(error => {console.error(error);process.exitCode = 1;});
