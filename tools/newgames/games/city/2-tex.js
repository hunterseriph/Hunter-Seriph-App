/* ---------- Cum City's own paint: ground, roads, every kind of wall and roof, signs, adverts (32 px painters, 64 px hi paints) ---------- */
(function () {
  function win(p, x, y, w, h, glass, frame, lit) { p.rect(x - 1, y - 1, w + 2, h + 2, frame); p.rect(x, y, w, h, glass); p.rect(x, y, w, 1, shade(glass, 1.4)); p.rect(x + 1, y + 1, 1, Math.max(1, h - 3), shade(glass, 1.6)); if (lit) p.rect(x + 2, y + h - 3, w - 3, 2, lit); }
  var A = {
    asphalt: function (p) { p.fill('#2a2a2c'); p.speck(['#232325', '#323236', '#3a3a3e', '#1c1c1e'], 420); for (var i = 0; i < 3; i++) p.rect(Math.floor(p.rnd() * 28), Math.floor(p.rnd() * 30), 4 + Math.floor(p.rnd() * 6), 1, '#1a1a1c'); },
    asphaltw: function (p) { p.fill('#2e2c30'); p.speck(['#262428', '#383640', '#3e3c44'], 380); }, // wetter, darker for the red light district
    pave: function (p) { p.fill('#7a7470'); for (var y = 0; y < 32; y += 8) for (var x = 0; x < 32; x += 8) { p.rect(x, y, 8, 1, '#5a5450'); p.rect(x, y, 1, 8, '#5a5450'); p.rect(x + 1, y + 1, 6, 6, shade('#7a7470', 0.9 + p.rnd() * 0.2)); } p.speck(['#4a4440', '#8a8480'], 60); },
    paver: function (p) { p.fill('#5a4a4a'); for (var y = 0; y < 32; y += 4) for (var x = (y % 8 ? 4 : 0) - 8; x < 32; x += 8) { p.rect(x, y, 8, 1, '#3a2a2c'); p.rect(x, y, 1, 4, '#3a2a2c'); } p.speck(['#6a5050', '#4a3a3a'], 80); },
    grass: function (p) { p.fill('#3e6a2c'); p.speck(['#365e26', '#4a7a34', '#2e5222', '#58883c', '#406e2e'], 520); for (var i = 0; i < 18; i++) p.rect(Math.floor(p.rnd() * 31), Math.floor(p.rnd() * 30), 1, 2, '#5a8c3e'); },
    forest: function (p) { p.fill('#2a3e1e'); p.speck(['#3a2a18', '#24361a', '#344a24', '#4a3a1e', '#1e2c16'], 560); for (var i = 0; i < 10; i++) p.rect(Math.floor(p.rnd() * 30), Math.floor(p.rnd() * 31), 3, 1, '#5a4224'); },
    field: function (p) { p.fill('#6a7234'); for (var y = 0; y < 32; y += 4) p.rect(0, y, 32, 1, '#565e28'); p.speck(['#7a8240', '#5a622a', '#8a8a44'], 260); },
    sand: function (p) { p.fill('#d4bc8c'); p.speck(['#c8ae7c', '#e0caa0', '#bca070', '#e8d6b0'], 440); },
    rockg: function (p) { p.fill('#6a625c'); p.speck(['#5a524c', '#7a726a', '#4a4440', '#8a827a'], 420); for (var i = 0; i < 6; i++) { var x = Math.floor(p.rnd() * 26), y = Math.floor(p.rnd() * 28); p.rect(x, y, 6, 1, '#3e3834'); p.rect(x, y + 1, 5, 1, '#8a827a'); } },
    dirt: function (p) { p.fill('#7a5c40'); p.speck(['#6a4c32', '#8a6c4c', '#5a4028', '#9a7c58'], 480); },
    bone: function (p) { p.fill('#8a7a64'); p.speck(['#a8987a', '#6a5a46', '#c8b898'], 300); for (var i = 0; i < 5; i++) { var x = Math.floor(p.rnd() * 26), y = Math.floor(p.rnd() * 28); p.rect(x, y, 5, 2, '#e0d4b8'); p.px(x - 1, y, '#e0d4b8'); p.px(x + 5, y + 1, '#e0d4b8'); } },
    runway: function (p) { p.fill('#3a3a3e'); p.speck(['#343438', '#424246', '#2e2e32'], 360); },
    gravegrass: function (p) { p.fill('#34482a'); p.speck(['#2c3e24', '#3e5432', '#26341e', '#4a4030'], 520); },
    pier: function (p) { p.fill('#6a4a2a'); for (var x = 0; x < 32; x += 6) { p.rect(x, 0, 1, 32, '#3a2412'); p.rect(x + 1, 0, 5, 32, shade('#6a4a2a', 0.85 + p.rnd() * 0.3)); } p.speck(['#4a3018', '#7a5a34'], 80); p.px(3, 4, '#aaa'); p.px(3, 28, '#aaa'); },
    concrete: function (p) { p.fill('#7a7a76'); p.speck(['#6a6a66', '#8a8a86', '#5e5e5a'], 380); p.rect(0, 0, 32, 1, '#5a5a56'); p.rect(0, 0, 1, 32, '#5a5a56'); },
    cream: function (p) { p.fill('#ecdcb0'); for (var y = 2; y < 32; y += 6) for (var x = 0; x < 32; x++) p.px(x, y + Math.round(Math.sin(x * 0.4 + y) * 1.2), '#fff2d0'); p.speck(['#d8c898', '#fff8e0'], 80); },
    water: function (p) { p.fill('#1a3050'); for (var y = 1; y < 32; y += 5) for (var x = 0; x < 32; x++) if ((x + y * 3) % 9 < 5) p.px(x, y + Math.round(Math.sin(x * 0.5 + y) * 1), '#2a4a70'); p.speck(['#14284a', '#3a5a80'], 60); },
    kerb: function (p) { p.fill('#9a948e'); p.rect(0, 0, 32, 2, '#c0bab4'); p.rect(0, 28, 32, 4, '#6a6460'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 1, 32, '#5a5450'); },
    // walls: one tile = one bay (4 m) by one storey (3.5 m)
    w_down: function (p) { p.fill('#3a3c44'); win(p, 3, 4, 26, 20, '#1e2a3a', '#26282e'); p.rect(0, 27, 32, 5, '#2a2c32'); p.rect(15, 4, 2, 20, '#26282e'); },
    w_down2: function (p) { p.fill('#5a5048'); win(p, 4, 6, 10, 18, '#22303e', '#3a3028'); win(p, 18, 6, 10, 18, '#22303e', '#3a3028'); p.rect(0, 28, 32, 4, '#4a4038'); p.rect(0, 0, 32, 2, '#6a6058'); },
    w_glass: function (p) { p.fill('#1a2838'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 1, 32, '#4a5a6a'); p.rect(0, 30, 32, 2, '#4a5a6a'); p.speck(['#2a4058', '#22344a'], 60); for (var i = 0; i < 4; i++) p.rect(1 + i * 8, 2, 2, 24, '#3a5068'); },
    w_brick: function (p) { p.fill('#5a2a24'); for (var r = 0; r < 8; r++) for (var b = -1; b < 5; b++) { var x = b * 8 + (r % 2 ? 4 : 0); p.rect(x, r * 4, 7, 3, shade('#6a3028', 0.8 + p.rnd() * 0.4)); } win(p, 6, 7, 8, 14, '#1a1418', '#2a1814'); win(p, 18, 7, 8, 14, '#1a1418', '#2a1814'); },
    w_redbrick: function (p) { p.fill('#2a1418'); for (var r = 0; r < 8; r++) for (var b = -1; b < 5; b++) { var x = b * 8 + (r % 2 ? 4 : 0); p.rect(x, r * 4, 7, 3, shade('#4a1a20', 0.8 + p.rnd() * 0.4)); } win(p, 5, 6, 9, 16, '#3a0a14', '#12040a'); win(p, 18, 6, 9, 16, '#3a0a14', '#12040a'); p.rect(5, 20, 9, 2, '#ff2a6a'); },
    w_cafe: function (p) { p.fill('#8a6a4a'); for (var r = 0; r < 8; r++) for (var b = -1; b < 5; b++) { var x = b * 8 + (r % 2 ? 4 : 0); p.rect(x, r * 4, 7, 3, shade('#9a7450', 0.85 + p.rnd() * 0.3)); } win(p, 5, 6, 9, 15, '#2a2018', '#f1e7d0'); win(p, 18, 6, 9, 15, '#2a2018', '#f1e7d0'); p.rect(4, 22, 11, 2, '#3a5a2a'); p.rect(17, 22, 11, 2, '#3a5a2a'); },
    w_shop: function (p) { p.fill('#2a2024'); win(p, 2, 6, 28, 22, '#3a3020', '#12040a'); p.rect(0, 0, 32, 5, '#c4121c'); p.rect(0, 4, 32, 1, '#12040a'); },
    w_house: function (p) { p.fill('#c8b8a0'); for (var y = 0; y < 32; y += 3) p.rect(0, y, 32, 1, '#a8987e'); win(p, 9, 8, 14, 13, '#2a3440', '#f1e7d0'); p.rect(8, 21, 16, 2, '#f1e7d0'); },
    w_house2: function (p) { p.fill('#7a3a30'); for (var r = 0; r < 8; r++) for (var b = -1; b < 5; b++) { var x = b * 8 + (r % 2 ? 4 : 0); p.rect(x, r * 4, 7, 3, shade('#8a4434', 0.8 + p.rnd() * 0.3)); } win(p, 9, 8, 14, 13, '#2a3440', '#f1e7d0'); },
    w_shed: function (p) { p.fill('#5a5e62'); for (var x = 0; x < 32; x += 4) { p.rect(x, 0, 2, 32, '#6a6e72'); p.rect(x + 2, 0, 1, 32, '#4a4e52'); } p.speck(['#7a4a2a', '#8a5a30'], 50); p.rect(0, 28, 32, 4, '#3a3e42'); },
    w_lab: function (p) { p.fill('#d8dcdc'); p.rect(0, 0, 32, 1, '#b8bcbc'); win(p, 2, 8, 28, 10, '#2a4a58', '#a8acac'); p.rect(0, 26, 32, 2, '#3ad0c0'); p.speck(['#c8cccc'], 40); },
    w_dock: function (p) { p.fill('#4a3a30'); for (var x = 0; x < 32; x += 8) p.rect(x, 0, 1, 32, '#2a201a'); p.rect(0, 14, 32, 2, '#2a201a'); p.speck(['#5a4a3a', '#3a2a20', '#6a4a2a'], 140); },
    w_frame: function (p) { p.clear(); p.rect(0, 0, 32, 3, '#8a6a2a'); p.rect(0, 0, 3, 32, '#8a6a2a'); p.rect(29, 0, 3, 32, '#8a6a2a'); p.rect(0, 29, 32, 3, '#5a5a5a'); for (var i = 3; i < 29; i += 2) p.px(i, i, '#6a5020'); },
    stone: function (p) { p.fill('#6a6460'); for (var r = 0; r < 4; r++) for (var b = -1; b < 3; b++) { var x = b * 16 + (r % 2 ? 8 : 0); p.rect(x, r * 8, 15, 7, shade('#7a746e', 0.78 + p.rnd() * 0.36)); p.rect(x, r * 8, 15, 1, '#8a847e'); } p.speck(['#4a4a3a', '#5a6a4a'], 50); },
    darkstone: function (p) { p.fill('#1a1418'); for (var r = 0; r < 4; r++) for (var b = -1; b < 3; b++) { var x = b * 16 + (r % 2 ? 8 : 0); p.rect(x, r * 8, 15, 7, shade('#2a2228', 0.75 + p.rnd() * 0.4)); p.rect(x, r * 8, 15, 1, '#3a2a34'); } p.speck(['#5a1a3a', '#3a0a2a'], 60); },
    roof: function (p) { p.fill('#4a4a4c'); p.speck(['#3a3a3c', '#5a5a5c', '#424244', '#2e2e30'], 520); },
    roofr: function (p) { p.fill('#7a2a20'); for (var y = 0; y < 32; y += 4) for (var x = (y % 8 ? 3 : 0) - 6; x < 32; x += 6) { p.rect(x, y, 5, 3, shade('#8a3428', 0.8 + p.rnd() * 0.3)); p.rect(x, y + 3, 6, 1, '#4a1a14'); } },
    roofs: function (p) { p.fill('#3a3e44'); for (var y = 0; y < 32; y += 4) p.rect(0, y, 32, 1, '#2a2e34'); p.speck(['#4a4e54'], 80); },
    garage: function (p) { p.fill('#8a8a86'); for (var y = 2; y < 32; y += 4) p.rect(2, y, 28, 1, '#5a5a56'); p.rect(0, 0, 2, 32, '#4a4a46'); p.rect(30, 0, 2, 32, '#4a4a46'); },
    hedge: function (p) { p.fill('#2a4a1e'); p.speck(['#3a5a2a', '#1e3a16', '#4a6a34'], 500); },
    leaves: function (p) { p.fill('#3a6a2a'); p.speck(['#2e5a22', '#4a7a34', '#24481a', '#5a8a3e', '#3a6028'], 600); },
    pine: function (p) { p.fill('#1e3e22'); p.speck(['#18321a', '#2a4e2c', '#14281a'], 540); },
    bark: function (p) { p.fill('#4a3424'); for (var x = 0; x < 32; x += 3) p.rect(x, 0, 1, 32, '#3a2618'); p.speck(['#5a4430'], 60); },
    metal: function (p) { p.fill('#8a8c90'); p.speck(['#7a7c80', '#9a9ca0'], 200); p.rect(0, 0, 32, 1, '#babcc0'); },
    paint: function (p) { p.fill('#ffffff'); },
    tyre: function (p) { p.fill('#1a1a1c'); for (var y = 0; y < 32; y += 4) p.rect(0, y, 32, 1, '#2a2a2e'); },
    container: function (p) { p.fill('#8a2a20'); for (var x = 0; x < 32; x += 4) { p.rect(x, 0, 1, 32, '#5a1a14'); p.rect(x + 1, 0, 1, 32, '#a83a2c'); } p.rect(0, 0, 32, 2, '#5a1a14'); p.rect(0, 30, 32, 2, '#5a1a14'); },
    stripes: function (p) { for (var x = -32; x < 32; x += 8) for (var y = 0; y < 32; y++) { p.rect(x + y, y, 4, 1, '#ffe36a'); p.rect(x + y + 4, y, 4, 1, '#12040a'); } },
    carpet: function (p) { p.fill('#5a0a14'); p.speck(['#4a0810', '#6a1420', '#3a0610'], 400); },
    tilefloor: function (p) { for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) p.rect(x * 8, y * 8, 8, 8, (x + y) % 2 ? '#d8d0c0' : '#2a2a2a'); },
    plank: function (p) { p.fill('#7a5634'); for (var y = 0; y < 32; y += 6) { p.rect(0, y, 32, 1, '#4a321c'); p.rect(Math.floor(p.rnd() * 24), y + 1, 1, 5, '#4a321c'); } p.speck(['#8a6640', '#6a4a2a'], 90); },
    snow: function (p) { p.fill('#e8eef4'); p.speck(['#d0d8e4', '#ffffff', '#c4ccd8'], 300); }
  };
  for (var k in A) PAINT[k] = A[k];
  /* lit windows for the night, the road paint, signs */
  function sign(txt, bg, fg, font, sz, sub) { return function (g) { g.fillStyle = bg; g.fillRect(0, 8, 64, 48); g.fillStyle = '#12040a'; g.fillRect(0, 8, 64, 2); g.fillRect(0, 54, 64, 2); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    var L = txt.split('\n'); L.forEach(function (l, i) { var s = sz; g.font = (font === 'p' ? s + 'px "Pirata One", serif' : 'bold ' + s + 'px "Archivo Narrow", sans-serif'); while (g.measureText(l).width > 60 && s > 6) { s--; g.font = (font === 'p' ? s + 'px "Pirata One", serif' : 'bold ' + s + 'px "Archivo Narrow", sans-serif'); } g.fillText(l, 32, 32 + (i - (L.length - 1) / 2) * (s + 1) + (sub ? -5 : 0)); });
    if (sub) { g.font = 'bold 7px "Archivo Narrow", sans-serif'; g.fillStyle = shade(fg.length === 7 ? fg : '#f1e7d0', 0.8); g.fillText(sub, 32, 50); } }; }
  var HI = {
    litwin: function (g) { g.fillStyle = '#ffd890'; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(6, 6, 20, 52); },
    litwin2: function (g) { g.fillStyle = '#ff8aa8'; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(8, 6, 14, 52); },
    litwin3: function (g) { g.fillStyle = '#a8d8ff'; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(40, 6, 14, 52); },
    dash: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = '#f1e7d0'; g.fillRect(28, 0, 8, 40); },
    yline: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = '#e8c040'; g.fillRect(24, 0, 6, 64); g.fillRect(34, 0, 6, 64); },
    zebra: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = '#f1e7d0'; for (var x = 2; x < 64; x += 16) g.fillRect(x, 0, 9, 64); },
    rwline: function (g) { g.clearRect(0, 0, 64, 64); g.fillStyle = '#f6f6f0'; g.fillRect(26, 0, 12, 34); },
    neon_girls: sign('GIRLS\nGIRLS', '#12040a', '#ff3aa0', 'a', 16), neon_xxx: sign('XXX', '#12040a', '#ff2630', 'p', 30), neon_open: sign('OPEN\n24/7', '#12040a', '#7aff6a', 'a', 15),
    neon_cum: sign('CUM\nCITY', '#12040a', '#f1e7d0', 'p', 22), neon_live: sign('LIVE\nSHOWS', '#12040a', '#4adfff', 'a', 14), neon_bar: sign('BAR', '#12040a', '#ffe36a', 'p', 28),
    neon_heart: function (g) { g.fillStyle = '#12040a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#ff2a6a'; g.beginPath(); g.moveTo(32, 54); g.bezierCurveTo(2, 30, 14, 4, 32, 20); g.bezierCurveTo(50, 4, 62, 30, 32, 54); g.fill(); },
    sign_ali: sign("ALI'S\nGARLIC GRUB", '#2a4a1e', '#f1e7d0', 'p', 15), sign_harold: sign("HAROLD'S MAD\nTEA PARTY", '#5a0a14', '#ffe36a', 'p', 13), sign_jessiah: sign("JESSIAH'S", '#3a2a1a', '#f1e7d0', 'p', 18),
    sign_natty: sign('NATTYBORO\nENCHANTING', '#1a0a2a', '#c48aff', 'p', 13), sign_judge: sign('JUDGEMENT\nSPELLS', '#f1e7d0', '#3a2a10', 'p', 14), sign_fate: sign("STACKED\nFATE'S TABLE", '#0a1a0a', '#7aff6a', 'p', 13),
    sign_bates: sign('MASTER BATES\nEMPORIUM', '#3a1a3a', '#ffe36a', 'p', 13), sign_motors: sign('CUM\nMOTORS', '#12040a', '#ff2630', 'p', 20), sign_estate: sign('LOAD\nESTATES', '#f1e7d0', '#12040a', 'p', 18),
    sign_wash: sign('THE CREAM\nWASH', '#f1e7d0', '#c4121c', 'p', 16, 'LOSE THE HEAT'), sign_wash2: sign('THE CREAM\nWASH', '#f1e7d0', '#c4121c', 'p', 16, 'LOSE THE HEAT'), sign_cops: sign('CUM CITY\nPOLICE', '#1a2a5a', '#f1e7d0', 'a', 14),
    sign_hosp: sign('HOSPITAL', '#f1e7d0', '#c4121c', 'a', 15), sign_gym: sign('IRON LOADS\nGYM', '#12040a', '#ffe36a', 'a', 13), sign_bank: sign('BANK OF\nCUM CITY', '#1a3a2a', '#ffe36a', 'p', 14), sign_tattoo: sign('INKED\nLOADS', '#12040a', '#ff2630', 'p', 18),
    sign_home: sign('FOR SALE', '#f1e7d0', '#c4121c', 'a', 16, 'LOAD ESTATES'),
    // billboards and posters: the adverts (his Twitch, YouTube, merch, the other games)
    bb_twitch: sign('TWITCH.TV/\nHUNTERSERIPH', '#3a1a6a', '#f1e7d0', 'a', 11, 'SOULS-LIKES LIVE'), bb_yt: sign('YOUTUBE\n@HUNTERSERIPH', '#c4121c', '#f1e7d0', 'a', 12, 'SUBSCRIBE, YOU LOAD'),
    bb_merch: sign('THE ARMOURY', '#12040a', '#ffe36a', 'p', 16, 'HUNTER SERIPH MERCH'), bb_kart: sign('CUMHEAD\nKART', '#c4121c', '#ffe36a', 'p', 18, 'IN THE APP NOW'), bb_ll: sign('LOAD\nLEGACY', '#12040a', '#c4121c', 'p', 20, 'EVERY HEIR DIES'),
    bb_dark: sign('DARK\nLOADS', '#1a1418', '#f1e7d0', 'p', 20, 'TRY FINGER, BUT HOLE'), bb_psycho: sign('PSYCHO\nNIGHTMARE', '#12040a', '#7aff6a', 'p', 15, 'TAKE YOUR PILLS'), bb_cq: sign("CUMHEADS\nQUEST", '#2a0a10', '#ffe36a', 'p', 16, '50 FLOORS DEEP'),
    bb_steve: sign('EJACULAND', '#12040a', '#ff2630', 'p', 20, 'MUST BE THIS LOADED'), bb_cuppa: sign('CUMPUCCINO', '#6a3a1a', '#f1e7d0', 'p', 16, "KAYA & ELDEN'S"), bb_pizza: sign('PINEAPPLE\nBELONGS', '#ffe36a', '#12040a', 'a', 14, 'ON PIZZA. FIGHT ME'),
    bb_hitless: sign('HITLESS\nRUNS ONLY', '#2a4a1e', '#f1e7d0', 'a', 14, "SABA'S"), bb_tb: sign("TB'S\nSUCK N' FUCK", '#12040a', '#ff2a6a', 'p', 15, "DON'T MIND THE STAINS"),
    sun: function (g) { var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(0.3, 'rgba(255,240,200,0.9)'); gr.addColorStop(0.5, 'rgba(255,200,140,0.3)'); gr.addColorStop(1, 'rgba(255,180,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); },
    moon: function (g) { var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,90,80,1)'); gr.addColorStop(0.42, 'rgba(220,40,40,1)'); gr.addColorStop(0.5, 'rgba(200,30,30,0.35)'); gr.addColorStop(1, 'rgba(160,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(120,10,10,0.5)'; g.beginPath(); g.arc(26, 26, 5, 0, 6.3); g.arc(38, 36, 4, 0, 6.3); g.arc(30, 40, 3, 0, 6.3); g.fill(); },
    cloud: function (g) { g.fillStyle = 'rgba(255,255,255,0.9)'; [[20, 36, 14], [32, 30, 16], [44, 36, 13], [30, 40, 14]].forEach(function (c) { g.beginPath(); g.arc(c[0], c[1], c[2], 0, 6.3); g.fill(); }); },
    star: function (g) { g.fillStyle = '#fff'; g.fillRect(30, 30, 4, 4); },
    rain: function (g) { g.strokeStyle = 'rgba(200,220,255,0.7)'; g.lineWidth = 1.5; for (var i = 0; i < 9; i++) { var x = (i * 23) % 64, y = (i * 37) % 64; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 14); g.stroke(); } },
    flake: function (g) { g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(32, 32, 9, 0, 6.3); g.fill(); },
    leaf: function (g) { g.fillStyle = '#d0702a'; g.beginPath(); g.ellipse(32, 32, 16, 8, 0.6, 0, 6.3); g.fill(); g.strokeStyle = '#7a3a10'; g.beginPath(); g.moveTo(18, 42); g.lineTo(46, 22); g.stroke(); },
    petal: function (g) { g.fillStyle = '#ffb8d0'; g.beginPath(); g.ellipse(32, 32, 12, 8, 0.4, 0, 6.3); g.fill(); },
    marker: function (g) { var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,227,106,0.95)'); gr.addColorStop(0.6, 'rgba(255,200,60,0.4)'); gr.addColorStop(1, 'rgba(255,160,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); },
    tracer: function (g) { g.fillStyle = '#fff6c0'; g.fillRect(0, 28, 64, 8); },
    fire: function (g) { var gr = g.createRadialGradient(32, 40, 2, 32, 34, 30); gr.addColorStop(0, 'rgba(255,255,200,1)'); gr.addColorStop(0.3, 'rgba(255,180,40,0.95)'); gr.addColorStop(0.7, 'rgba(220,40,10,0.6)'); gr.addColorStop(1, 'rgba(120,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); },
    beam: function (g) { var gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(0.5, 'rgba(255,240,200,0.5)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); },
    plate: function (g) { g.fillStyle = '#f1e7d0'; g.fillRect(0, 16, 64, 32); g.fillStyle = '#12040a'; g.font = 'bold 18px "Archivo Narrow", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LOAD 69', 32, 32); },
    star5: function (g) { g.fillStyle = '#ffe36a'; g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 12 : 28; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.fill(); },
    package: function (g) { g.fillStyle = '#f1e7d0'; g.beginPath(); g.arc(32, 36, 20, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(16, 30); g.quadraticCurveTo(32, -4, 48, 30); g.fill(); g.fillStyle = '#12040a'; g.font = '16px "Pirata One", serif'; g.textAlign = 'center'; g.fillText('?', 32, 44); }
  };
  for (var h in HI) HIPAINT[h] = HI[h];
})();
var BILLS = ['bb_twitch', 'bb_yt', 'bb_merch', 'bb_kart', 'bb_ll', 'bb_dark', 'bb_psycho', 'bb_cq', 'bb_steve', 'bb_cuppa', 'bb_pizza', 'bb_hitless', 'bb_tb'];
