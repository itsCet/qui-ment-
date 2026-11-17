// Génère les icônes PNG du PWA à partir d'un SVG local (Chromium via Playwright).
// Usage : node scripts/generate-icons.cjs
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const glyph = (scale) => `
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <rect x="120" y="88" width="272" height="336" rx="44" fill="#131c33" stroke="#f2b544" stroke-width="16"/>
    <path d="M206 214c0-30 22-52 52-52s52 20 52 48c0 34-38 38-38 70" fill="none" stroke="#f2b544" stroke-width="30" stroke-linecap="round"/>
    <circle cx="272" cy="342" r="19" fill="#f2b544"/>
  </g>`;
const svg = (rounded, scale) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="#0a1020"/>${glyph(scale)}</svg>`;

const targets = [
  { file: 'pwa-192.png', size: 192, svg: svg(false, 1) },
  { file: 'pwa-512.png', size: 512, svg: svg(false, 1) },
  { file: 'pwa-maskable-512.png', size: 512, svg: svg(false, 0.72) },
  { file: 'apple-touch-icon.png', size: 180, svg: svg(false, 0.9) },
];

(async () => {
  const browser = await chromium.launch();
  for (const t of targets) {
    const page = await browser.newPage({ viewport: { width: t.size, height: t.size }, deviceScaleFactor: 1 });
    await page.setContent(
      `<html><body style="margin:0;background:#0a1020">${t.svg.replace('width="512" height="512"', `width="${t.size}" height="${t.size}"`)}</body></html>`,
    );
    await page.screenshot({ path: path.join(__dirname, '..', 'public', t.file), omitBackground: false });
    await page.close();
  }
  await browser.close();
  console.log('Icônes générées :', targets.map((t) => t.file).join(', '));
})();
