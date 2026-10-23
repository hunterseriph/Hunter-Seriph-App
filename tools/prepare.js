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

// Stamp the build number into the app so it can tell when a newer build is out (see the update check in index.html).
const build = parseInt(process.env.GITHUB_RUN_NUMBER || '0', 10) || 0;
fs.writeFileSync(path.join('www', 'version.js'), 'window.HS_BUILD=' + build + ';\n');
console.log('build number:', build);

// List every upload on the channel (videos, streams, shorts) so the Videos tab can show all of them.
// Uses yt-dlp on the build machine; the app also reads the public RSS feed for anything newer.
// If this fails the build still works, the app just falls back to the RSS feed.
(function listVideos() {
  const { execFileSync } = require('child_process');
  const run = (cmd, args, ms) => execFileSync(cmd, args, { timeout: ms || 120000, maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  const py = ['python3', 'python'].find((c) => { try { run(c, ['--version'], 20000); return true; } catch (e) { return false; } });
  if (!py) { console.warn('video list: no python, skipping'); return; }
  let ok = false;
  for (const extra of [[], ['--break-system-packages'], ['--user', '--break-system-packages']]) {
    try { run(py, ['-m', 'pip', 'install', '-q', '--disable-pip-version-check', '-U', 'yt-dlp'].concat(extra), 240000); ok = true; break; } catch (e) {}
  }
  if (!ok) { console.warn('video list: could not install yt-dlp, skipping'); return; }
  const seen = new Set(), all = [];
  for (const [tab, k] of [['videos', 'v'], ['streams', 'l'], ['shorts', 's']]) {
    try {
      const j = JSON.parse(run(py, ['-m', 'yt_dlp', '--flat-playlist', '-J', '--no-warnings', '--extractor-args', 'youtubetab:approximate_date',
        'https://www.youtube.com/@hunterseriph/' + tab], 300000));
      let n = 0;
      (j.entries || []).forEach((e, i) => {
        if (!e || !e.id || !e.title || seen.has(e.id)) return;
        seen.add(e.id); n++;
        all.push({ id: e.id, t: e.title, d: Math.round(e.duration || 0), v: e.view_count || 0, k: k, ts: e.timestamp || e.release_timestamp || 0, o: i });
      });
      console.log('video list:', tab, n);
    } catch (e) { console.warn('video list: could not read', tab, String(e.message || e).split('\n')[0]); }
  }
  if (!all.length) return;
  // newest first; items without a date keep their place in their own tab's order
  all.sort((a, b) => (b.ts - a.ts) || (a.o - b.o));
  all.forEach((x) => { delete x.o; });
  fs.writeFileSync(path.join('www', 'videos.js'), 'window.HS_VIDEOS=' + JSON.stringify({ built: Date.now(), videos: all }) + ';\n');
  console.log('video list: saved', all.length, 'videos');
})();
