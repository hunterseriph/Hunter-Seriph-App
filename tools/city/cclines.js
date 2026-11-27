// every voiced line in Cum City Nights: the string literals in the game matched against the recorded keys, plus the lines
// the game puts together when it runs (mission talk with Cumhead's replies). Writes /home/claude/ck/ccn/lines.json
const fs = require('fs'), { chromium } = require('playwright');
const SRC = '/home/claude/hunter-seriph-app/www/games/cum-city-nights.html';
const WHO = ['lab', 'cumhead', 'greebo', 'spermaid', 'amy', 'saba', 'joff', 'beeb', 'harold', 'kaya', 'elden', 'ali', 'potbelly', 'pulsar', 'bonjo', 't', 'jessiah', 'natty', 'judge', 'fate', 'bates', 'blumhead', 'clown', 'tb', 'hs', 'bl', 'po', 'talk', 'news', 'traffic', 'weather', 'sports', 'pedM0', 'pedM1', 'pedM2', 'pedF0', 'pedF1', 'pedF2', 'cop', 'worker', 'knight', 'spooge'];
function key(who, text) { let h = 0x811c9dc5; const s = who + '|' + text; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return 'v' + h.toString(36); }
(async () => {
  const s = fs.readFileSync(SRC, 'utf8'), have = JSON.parse(fs.readFileSync('/home/claude/hunter-seriph-app/www/games/ccn-voice/voices.js', 'utf8').replace(/^window\.CCNVOICE = /, '').replace(/;\s*$/, ''));
  const strs = new Set(); const re = /'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g; let m;
  while ((m = re.exec(s))) { let t = m[1] !== undefined ? m[1] : m[2]; if (t.length < 2 || t.length > 400) continue; try { t = JSON.parse('"' + t.replace(/\\'/g, "'").replace(/"/g, '\\"').replace(/\\\\"/g, '\\"') + '"'); } catch (e) { continue; } strs.add(t); }
  const found = {}; for (const t of strs) for (const w of WHO) { const k = key(w, t); if (have[k]) found[k] = [w, t]; }
  // the lines made when the game runs
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.route(/^https?:\/\/(?!localhost)/, r => r.abort()); await p.goto('http://localhost:8123/cum-city-nights.html'); await p.waitForTimeout(2500);
  const run = await p.evaluate(() => { var out = []; MISSIONS.forEach(function (m) { (m.steps || []).forEach(function (st) { if (st.lines) st.lines.forEach(function (l) { if (Array.isArray(l) && typeof l[0] === 'string' && typeof l[1] === 'string') out.push([l[0], l[1]]); }); }); });
    Object.keys(CALLS).forEach(function (k) { CALLS[k].forEach(function (l) { out.push([l[0], l[1]]); }); }); Object.keys(ARRIVE).forEach(function (k) { out.push(['pedM0', ARRIVE[k]]); }); return out; });
  await b.close();
  const extra = []; for (const [w, t] of run) { const k = key(w, t); if (!found[k]) { found[k] = [w, t]; if (!have[k]) extra.push([w, t]); } }
  const lines = Object.values(found); fs.writeFileSync('/home/claude/ck/ccn/lines.json', JSON.stringify(lines));
  const by = {}; lines.forEach(l => by[l[0]] = (by[l[0]] || 0) + 1);
  console.log('recorded keys', Object.keys(have).length, 'matched', Object.keys(found).length - extra.length, 'new (not recorded yet)', extra.length); console.log(JSON.stringify(by));
  console.log(extra.slice(0, 8).map(l => l.join(': ')).join('\n'));
})();
