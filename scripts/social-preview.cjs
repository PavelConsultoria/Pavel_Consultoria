const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const images = {
  'index.html': 'home',
  'ms-project.html': 'ms-project',
  'primavera.html': 'primavera',
  'agenda.html': 'agenda',
  'certificacao-pmp.html': 'certificacao-pmp'
};
const escape = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function tags(file, title, description) {
  if (!images[file]) return '';
  const image = `https://pavelconsultoria.com.br/assets/social/${images[file]}.png`;
  const url = `https://pavelconsultoria.com.br/${file === 'index.html' ? '' : file}`;
  const fullTitle = escape(`${title} | Pavel Consultoria`);
  const text = escape(description);
  return [
    `<meta property="og:description" content="${text}">`,
    `<meta property="og:image" content="${image}">`,
    '<meta property="og:image:type" content="image/png">',
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${fullTitle}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${fullTitle}">`,
    `<meta name="twitter:description" content="${text}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<meta name="twitter:image:alt" content="${fullTitle}">`,
    `<meta name="twitter:url" content="${url}">`
  ].join('\n');
}
module.exports = { tags };
if (require.main === module) {
  for (const file of Object.keys(images)) {
    const target = path.join(root, file);
    const html = fs.readFileSync(target, 'utf8');
    const title = html.match(/<title>(.*?) \| Pavel Consultoria<\/title>/)[1];
    const description = html.match(/<meta name="description" content="([^"]*)">/)[1];
    const marker = '<meta property="og:locale" content="pt_BR">';
    if (html.includes('name="twitter:card"')) throw new Error(`Already configured: ${file}`);
    fs.writeFileSync(target, html.replace(marker, marker + '\n' + tags(file, title, description)));
  }
}
