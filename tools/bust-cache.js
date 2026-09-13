/**
 * Re-stamps every asset reference in the site's HTML with ?v=<version>.
 *
 * Why this exists: GitHub Pages serves assets with Cache-Control: max-age=600.
 * After a push, a browser that visited within ten minutes gets the NEW html
 * with the OLD css/js — which renders as a broken hybrid rather than an
 * obvious failure, and gets reported as "your fix didn't work".
 *
 * Run it after ANY change to assets/css, assets/js, assets/data or assets/img.
 * Forgetting it is the single most common way a correct change looks wrong.
 *
 *   node tools/bust-cache.js            # stamps with today's date
 *   node tools/bust-cache.js 2026091404 # or an explicit version
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VER = process.argv[2] || new Date().toISOString().slice(0, 10).replace(/-/g, '');

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
let touched = 0, rewrites = 0;

for (const f of files) {
  const p = path.join(ROOT, f);
  let src = fs.readFileSync(p, 'utf8');
  const before = src;

  // assets/css/*.css, assets/js/*.js, assets/data/*.js — strip any existing ?v= then re-stamp
  src = src.replace(
    /(["'])(assets\/(?:css|js|data)\/[A-Za-z0-9._-]+\.(?:css|js))(?:\?v=[A-Za-z0-9.]+)?\1/g,
    (m, q, file) => { rewrites++; return q + file + '?v=' + VER + q; }
  );

  // images too: replacing a banner in place otherwise serves the cached one,
  // and the src never changes so nothing tells the browser to refetch
  src = src.replace(
    /(["'])(assets\/img\/[A-Za-z0-9._\/-]+\.(?:png|jpe?g|webp|svg))(?:\?v=[A-Za-z0-9.]+)?\1/g,
    (m, q, file) => { rewrites++; return q + file + '?v=' + VER + q; }
  );

  if (src !== before) { fs.writeFileSync(p, src, 'utf8'); touched++; }
}

console.log('version:', VER);
console.log('files touched:', touched, 'of', files.length);
console.log('asset refs stamped:', rewrites);
