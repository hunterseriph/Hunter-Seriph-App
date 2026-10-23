// Copies the app fonts (Pirata One, Archivo Narrow, Press Start 2P) from npm into www/fonts
// so the app works fully offline. Run automatically by the build workflow.
const fs = require('fs'), path = require('path');
const out = path.join('www', 'fonts');
fs.mkdirSync(out, { recursive: true });
const fams = [
  ['pirata-one', 'Pirata One', [400]],
  ['archivo-narrow', 'Archivo Narrow', [500, 600, 700]],
  ['press-start-2p', 'Press Start 2P', [400]],
];
let css = '';
for (const [pkg, name, weights] of fams) {
  for (const w of weights) {
    const file = `${pkg}-latin-${w}-normal.woff2`;
    const src = path.join('node_modules', '@fontsource', pkg, 'files', file);
    if (!fs.existsSync(src)) { console.warn('WARNING: font file missing, skipping:', src); continue; }
    fs.copyFileSync(src, path.join(out, file));
    css += `@font-face{font-family:'${name}';font-style:normal;font-weight:${w};font-display:swap;src:url(${file}) format('woff2')}\n`;
  }
}
fs.writeFileSync(path.join(out, 'fonts.css'), css);
console.log('fonts ready:', fs.readdirSync(out).length, 'files');
