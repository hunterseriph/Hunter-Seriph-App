// Hunter Seriph for PC. A small Electron wrapper around the same www/ files the Android app uses.
// The page is served from http://localhost:47621 so Twitch embeds work (Twitch allows parent=localhost)
// and saves (localStorage) stay put between updates because the address never changes.
const { app, BrowserWindow, shell, session, Menu } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 47621;
const ROOT = path.join(__dirname, 'www');
const SMOKE = process.argv.includes('--smoke');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.mp4': 'video/mp4'
};

function serve() {
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      if (p === '/' || p === '') p = '/index.html';
      const file = path.normalize(path.join(ROOT, p));
      if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        res.end(data);
      });
    });
    srv.on('error', reject);
    srv.listen(PORT, '127.0.0.1', () => resolve(srv));
  });
}

// On Android, Capacitor lets the page read the YouTube feed and Twitch title; do the same here.
function allowFeeds() {
  const urls = ['https://www.youtube.com/feeds/*', 'https://decapi.me/*'];
  session.defaultSession.webRequest.onHeadersReceived({ urls }, (d, cb) => {
    const h = d.responseHeaders || {};
    Object.keys(h).forEach((k) => { if (k.toLowerCase() === 'access-control-allow-origin') delete h[k]; });
    h['Access-Control-Allow-Origin'] = ['*'];
    cb({ responseHeaders: h });
  });
}

const isLocal = (u) => u.startsWith('http://localhost:' + PORT) || u.startsWith('http://127.0.0.1:' + PORT);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 760, minWidth: 380, minHeight: 600, backgroundColor: '#070405', title: 'Hunter Seriph', show: !SMOKE,
    icon: path.join(__dirname, 'icon.png'), autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, backgroundThrottling: false }
  });
  // links to the shop, YouTube or Twitch open in the normal browser
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url) && !isLocal(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!isLocal(url)) { e.preventDefault(); if (/^(https?|twitch):/.test(url)) shell.openExternal(url).catch(() => {}); } });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.key === 'F5') { win.webContents.reload(); e.preventDefault(); }
    if (input.key === 'F12') { win.webContents.toggleDevTools(); e.preventDefault(); }
  });
  win.loadURL('http://localhost:' + PORT + '/index.html');
  return win;
}

// --smoke: load the app and every game in a hidden window, fail on any script error (used by the build)
async function smoke() {
  const win = createWindow(), errors = [];
  win.webContents.on('console-message', (e, level, msg, line, src) => { if (level >= 3 && !/Failed to load resource|ERR_|net::|youtube|twitch|decapi|favicon/i.test(msg + src)) errors.push(msg + ' @ ' + src + ':' + line); });
  const pages = ['index.html'].concat(fs.readdirSync(path.join(ROOT, 'games')).filter((f) => f.endsWith('.html')).map((f) => 'games/' + f));
  for (const p of pages) {
    await win.loadURL('http://localhost:' + PORT + '/' + p);
    await new Promise((r) => setTimeout(r, 2500));
    const ok = await win.webContents.executeJavaScript('document.readyState');
    console.log('checked', p, ok);
  }
  if (errors.length) { console.error('SMOKE FAILED\n' + errors.join('\n')); app.exit(1); } else { console.log('SMOKE OK'); app.exit(0); }
}

if (!SMOKE && !app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
  app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    try { await serve(); } catch (e) { console.error('Could not start the local server on port ' + PORT + ': ' + e.message); }
    allowFeeds();
    if (SMOKE) smoke(); else createWindow();
  });
  app.on('window-all-closed', () => app.quit());
}
