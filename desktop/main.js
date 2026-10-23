// Hunter Seriph for PC. A small Electron wrapper around the same www/ files the Android app uses.
// The page is served from http://localhost:47621 so Twitch embeds work (Twitch allows parent=localhost)
// and saves (localStorage) stay put between updates because the address never changes.
const { app, BrowserWindow, shell, session, Menu, ipcMain, net } = require('electron');
const os = require('os');
const { spawn } = require('child_process');
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


// ---------- in-app update ----------
// The PC app is one portable exe. To update: download the new exe next to it, quit, and let a tiny
// script swap the files and start the new one. Saves are in %APPDATA%\Hunter Seriph, so they carry over.
const EXE = process.env.PORTABLE_EXECUTABLE_FILE || '';
ipcMain.handle('update:can', () => !!EXE);
ipcMain.handle('update:install', async (ev, url) => {
  if (!EXE) { shell.openExternal(url); return 'browser'; }
  if (!/^https:\/\/github\.com\/hunterseriph\//i.test(url)) throw new Error('bad url');
  const dir = path.dirname(EXE), tmp = path.join(dir, 'Hunter-Seriph-PC.new.exe');
  const res = await net.fetch(url);
  if (!res.ok) throw new Error('download failed (' + res.status + ')');
  const total = +res.headers.get('content-length') || 0;
  const out = fs.createWriteStream(tmp), reader = res.body.getReader();
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    got += value.length;
    if (!out.write(Buffer.from(value))) await new Promise((r) => out.once('drain', r));
    if (total) ev.sender.send('update:progress', Math.floor(got * 100 / total));
  }
  await new Promise((r, j) => out.end((e) => (e ? j(e) : r())));
  if (total && got < total) throw new Error('download incomplete');
  const bat = path.join(os.tmpdir(), 'hunter-seriph-update.cmd');
  fs.writeFileSync(bat, [
    '@echo off', 'set n=0', ':wait', 'timeout /t 1 /nobreak >nul', 'set /a n+=1',
    'move /y "' + tmp + '" "' + EXE + '" >nul 2>&1 || (if %n% lss 60 goto wait)',
    'start "" "' + EXE + '"', 'del "%~f0"'
  ].join('\r\n'));
  spawn('cmd.exe', ['/c', bat], { detached: true, stdio: 'ignore', windowsHide: true }).unref();
  setTimeout(() => app.quit(), 300);
  return 'ok';
});

const isLocal = (u) => u.startsWith('http://localhost:' + PORT) || u.startsWith('http://127.0.0.1:' + PORT);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 760, minWidth: 380, minHeight: 600, backgroundColor: '#070405', title: 'Hunter Seriph', show: !SMOKE,
    icon: path.join(__dirname, 'icon.png'), autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, backgroundThrottling: false, preload: path.join(__dirname, 'preload.js') }
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
