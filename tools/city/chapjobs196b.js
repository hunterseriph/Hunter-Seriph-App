/* ---------- update 196b (his ask: "they need like 5 - 10 missions per character in each chapter, also the further you are in
   the game the more money you make and the longer the mission is"): every character has five jobs in each chapter, one after
   another (the next opens when the last is done). Each job pays more and runs longer than the one before it, and each chapter
   pays more and runs longer than the one before it. ---------- */
(function () {
  var REQ = { zombie: 'z1', robot: 'r1', blum: 'b1' }, KIND = { zombie: 'zombie', robot: 'robot', blum: 'goon' }, NOUN = { zombie: 'zombies', robot: 'robots', blum: 'goons' };
  var BASE = { zombie: 2400, robot: 3800, blum: 5400 }, LONG = { zombie: 1, robot: 1.12, blum: 1.25 };
  var PN = { coaster: 'the coaster', ferris: 'the big wheel', carousel: 'the carousel', flume: 'the Load Flume', mirrors: 'the hall of mirrors', gate: 'the Ejaculand gate', clock: 'the clock tower', crane: 'the docks',
    dome: 'the Spunk Brain dome', lighthouse: 'the lighthouse', volcano: 'the volcano', mast: 'the radio mast', windmill: 'the windmill', runway: 'the airport runway', terminal: 'the airport terminal', hangar: 'the airport hangar',
    dodgems: 'the dodgems', bigtop: 'the big top', ghost: 'the ghost train', farm: 'the farm', jetty: 'the fishing jetty', view: 'the view point', lookout: 'the Ranger Lookout', cabin: 'the hunting cabin', picnic: 'the picnic spot' };
  var VN = { hatch: 'car', saloon: 'car', muscle: 'car', van: 'van', scooter: 'scooter', limo: 'limo', truck: 'lorry', ambulance: 'ambulance', icecream: 'ice cream van' };
  function the(s) { return s ? s.replace(/^The /, 'the ') : 'there'; }
  function nm(at) { var a = at.split(':');
    if (a[0] === 'shop') return SHOPS[a[1]] ? the(SHOPS[a[1]].name) : 'there';
    if (a[0] === 'poi') { if (a[2]) return a[2]; if (PN[a[1]]) return PN[a[1]]; var p = POIS.filter(function (q) { return q.k === a[1]; })[0]; return the(p && p.name); }
    if (a[0] === 'dist') { var d = DIST[DISTID[a[1]]]; return the(d && d.name); }
    return 'there'; }
  function lazy(s, f) { Object.defineProperty(s, 'msg', { get: f, enumerable: true, configurable: true }); return s; }
  var CH = 'zombie', WHO = 'lab', K0 = 1;
  function home() { return WHO === 'steve' ? 'poi:gate' : 'shop:' + (CAST[WHO] && CAST[WHO].shop || 'club'); }
  function r(at) { return at.indexOf('dist:') === 0 ? 60 : 26; }
  function go(at) { return lazy({ t: 'go', to: at, r: r(at) }, function () { return 'Get to ' + nm(at) + '.'; }); }
  /* kill: n of the chapter's monsters at a place (o.hp and o.what for one big one) */
  function K(n, at, o) { o = o || {}; var kind = KIND[CH], n2 = o.hp ? n : Math.round(n * LONG[CH]);
    return [go(at), lazy({ t: 'kill', spawn: [{ kind: kind, n: n2, at: at, spread: at.indexOf('dist:') === 0 ? 30 : 20, wpn: kind === 'goon' ? 'pistol' : null, hp: o.hp || null }] },
      function () { return o.what ? 'Take down ' + o.what + '.' : 'Clear the ' + NOUN[CH] + ' at ' + nm(at) + '.'; })]; }
  function S(t, at) { return [go(at), lazy({ t: 'survive', time: Math.round(t * LONG[CH]), kind: KIND[CH], at: at }, function () { return 'Hold out against the ' + NOUN[CH] + ' at ' + nm(at) + '.'; })]; }
  function G(veh, at) { at = at || 'road:' + home(); return { t: 'getin', type: veh, at: at, msg: 'Get in the ' + (VN[veh] || 'car') + '.' }; }
  function D(n, around, what, veh) { var L = veh ? [G(veh)] : []; L.push(lazy({ t: 'drops', n: n, around: around, spread: around.indexOf('dist:') === 0 ? 150 : 110, car: 1 }, function () { return what + ' round ' + nm(around) + '.'; })); return L; }
  function C(n, around, what) { var to = home(); return [lazy({ t: 'collect', n: n, around: around, spread: around.indexOf('dist:') === 0 ? 120 : 90, time: 200 + n * 30, tile: 'crate' }, function () { return 'Pick up ' + what + ' round ' + nm(around) + '.'; }),
    lazy({ t: 'go', to: to }, function () { return 'Bring ' + what + ' back to ' + (CAST[WHO] ? CAST[WHO].name : 'them') + '.'; })]; }
  function X(n, type, around, what, sp) { return [lazy({ t: 'destroy', n: n, type: type, around: around, spread: sp || 90, moving: 1, robots: CH === 'robot' ? 1 : 0 }, function () { return 'Wreck ' + what + ' round ' + nm(around) + '.'; })]; }
  function CS(type, at, what, hp) { var s = { t: 'chase', type: type, at: at, hp: hp || 140, stall: 1, msg: 'Stop ' + what + '.' }; if (CH === 'blum') s.crew = 'goon'; return [s]; }
  function V(to, what) { return [lazy({ t: 'deliver', to: to, car: 1, time: 200 + Math.round(60 * LONG[CH]), minHp: 30, horde: KIND[CH] }, function () { return 'Get ' + what + ' to ' + nm(to) + '.'; })]; }
  function N() { return [{ t: 'night' }]; }
  function lines(x) { if (typeof x === 'string') x = [x]; return x.map(function (l) { return typeof l === 'string' ? [WHO, l] : l; }); }
  function W(ch, who) { CH = ch; WHO = who; K0 = 1; }
  function J(title, intro, outro) { K0++; var steps = [TALK.apply(null, lines(intro))]; for (var i = 3; i < arguments.length; i++) steps = steps.concat(arguments[i]); steps.push(TALK.apply(null, lines(outro)));
    var pre = 'c' + CH[0] + '_' + WHO; MI({ id: pre + K0, who: WHO, title: title, at: home(), chap: CH, req: [REQ[CH], K0 === 2 ? pre : pre + (K0 - 1)], steps: steps, chapJob: 1, jobK: K0 }); }
  var TB = function (t) { return ['lab', t]; }, TBQ = ['tb', T2], ST = ['steve', '...'];
  var BLC = "poi:castle:Blumhead's Castle";

  /* ======================= Chapter Two: Dead Loads ======================= */
  W('zombie', 'lab');
  J("Roadblock", "Mister Mayor, I am setting up roadblocks to keep the dead out of Clubhouse Row. The dead are not respecting the roadblocks.", "Roadblock holding. I have put up a sign. It says NO DEAD. I am confident.",
    K(12, 'dist:club'), S(50, 'dist:club'));
  J("Evacuation", ["The ferry is taking survivors off the mainland. We need a bus. We have no bus. We have a van.", "Pick the survivors up round the Red Light District, one at a time."], "Everyone is on the ferry. Some of them are crying. The ones crying are the police.",
    D(5, 'dist:red', 'Pick up each survivor', 'van'), V('poi:jetty', 'the survivors'), K(10, 'poi:jetty'));
  J("Sheriff of the Dead", ["Bad news. The old sheriff has turned. He still has his badge. He is still writing tickets.", "He is at the cemetery with his deputies. Put him to rest."], "He gave me one last ticket. For loitering. I am going to frame it.",
    N(), K(12, 'dist:cemetery'), K(1, 'poi:chapel', { hp: 420, what: 'the old sheriff' }), S(45, 'poi:chapel'));
  J("Last Stand at the Clubhouse", ["This is it, Mister Mayor. The biggest horde yet is coming up Clubhouse Row, and everyone we saved is inside.", "Hold the door. I will hold the other door. There is only one door. I will hold you."], "We held. The Clubhouse stands. I am buying everyone a drink. With your money.",
    K(14, 'dist:club'), S(60, 'shop:club'), K(16, 'shop:club'), S(60, 'shop:club'));

  W('zombie', 'tb');
  J("Gimp Rescue", [TBQ, TB("TB says not all his gimps turned. Three are hiding in a crate at the docks. He wants them back. Alive. Ish.")], [TBQ, TB("He is hugging them. They are hugging him. Nobody is enjoying it.")],
    D(3, 'dist:docks', 'Pick up each gimp', 'van'), V('shop:tb', 'the gimps'));
  J("Pill Mill", [TBQ, TB("The dead broke into TB's pill store at the Blood Factory. They are eating the pills. The pills are making them faster.")], [TBQ, TB("The pills are safe. TB has taken some to celebrate. Do not look at his eyes.")],
    K(12, 'dist:factory'), C(5, 'dist:factory', 'the pill crates'), K(10, 'shop:tb'));
  J("Ice Cream of the Dead", [TBQ, TB("TB has an ice cream van. He says the chimes call the dead out of the cemetery. He is right. He wants you to drive it. He cannot drive. Look at him.")], [TBQ, TB("He says that was the best gig of his life. He was not even there.")],
    G('icecream', 'road:dist:cemetery'), V('poi:chapel', 'the ice cream van'), S(60, 'poi:chapel'), K(12, 'poi:chapel'));
  J("Brothers Load: Dead Tour", [TBQ, TB("Brothers Load are playing a gig for the survivors at the Drive-In. TB is on the bill again. The dead heard the soundcheck."), TBQ], [TBQ, TB("Shot Rope to a crowd of the living and the dead. TB says it was his best crowd. He cried again.")],
    G('limo'), V('poi:drivein', 'TB'), S(70, 'poi:drivein'), K(16, 'poi:drivein'), S(60, 'poi:drivein'));

  W('zombie', 'greebo');
  J("Bait Pies", ["The dead like my pies more than people do. So I have made bait pies. Do not ask what is in them.", "Drop them round the Cafe Streets to pull the horde away from the shelters."], "They ate the bait. Now they are full. A full zombie is a lazy zombie.",
    D(5, 'dist:cafe', 'Drop a bait pie at each spot', 'van'), K(12, 'dist:cafe'));
  J("The Secret Ingredient", "The secret ingredient is kept in a lock-up at the docks. The dead have found it. I cannot say what it is. They seem to know.", "Back safe and still a secret. Even the zombies would not tell.",
    K(12, 'dist:docks'), C(4, 'dist:docks', 'the secret ingredient'), K(10, 'shop:greebo'));
  J("Pie Van Run", "Every shelter in town wants pies, and the dead are on every road. Ten drops, then back here in one piece.", "Not one pie lost. Some of the van was lost. Pies come first.",
    G('van'), D(6, 'dist:club', 'Drop a pie at each shelter'), D(4, 'dist:red', 'Drop a pie at each shelter'), V('shop:greebo', 'the van'));
  J("Grotto of the Dead", ["My grotto. My old grotto. The dead have moved in and they are eating the decorations.", "Clear them out. Every one. And bring back my rolling pins."], "My grotto is mine again. I am going to bake in it. Forever.",
    K(14, 'poi:grotto'), S(60, 'poi:grotto'), C(3, 'dist:grotto', 'the rolling pins'), K(14, 'shop:greebo'));

  W('zombie', 'spermaid');
  J("Holy Water", "Sweetie, the shelters are running out of holy cream. I keep bottles of it at the lighthouse. Fetch them for me?", "Every shelter blessed. You are an angel, a sticky one.",
    K(10, 'poi:lighthouse'), C(5, 'poi:lighthouse', 'the bottles of holy cream'));
  J("Beach of the Dead", "Sweetie, the dead are washing up on Seamen Beach. Hundreds of them. My sisters cannot get to the water.", "The beach is clear and the sea is ours again. Shall we swim? Later. Much later.",
    K(12, 'dist:beach'), S(50, 'dist:beach'), K(10, 'dist:beach'));
  J("The Drowned Choir", "The dead have gathered at Pirate Cove and they are singing, sweetie. Badly. It must stop.", "Silence. Lovely, holy silence.",
    N(), K(12, 'poi:cove'), S(55, 'poi:cove'), K(12, 'poi:cove'));
  J("Sanctum Under Siege", "Sweetie, this is the big one. Every corpse in Cum City is walking to my Sanctum. My sisters are ready. Are you?", "We held, my hero. The Sanctum is safe. Come here, you have earned a holy kiss.",
    S(60, 'shop:sanct'), K(14, 'shop:sanct'), S(70, 'shop:sanct'), K(16, 'shop:sanct'));

  W('zombie', 'amy');
  J("Chilli Bombs", ["Mild, hot or dynamite?", "Dynamite chilli bombs. Throw one at a zombie and it goes up like bonfire night. Test them at the building site, then the Blood Factory."], "Tested. Messy. I am calling them Amy's Specials.",
    K(12, 'dist:site'), K(12, 'dist:factory'));
  J("Hot Delivery", "Every shelter wants a pot of chilli to keep the dead off the doorstep. Five round Cum Hills, five round the Red Light District.", "Ten pots, ten doorsteps, ten happy shelters. Mild, hot or dynamite? Dynamite.",
    G('hatch'), D(5, 'dist:hills', 'Drop a pot of chilli at each shelter'), D(5, 'dist:red', 'Drop a pot of chilli at each shelter'));
  J("Pepper Farm", "My peppers grow out at the farm. The dead are eating them. They are eating dynamite peppers. They are on fire and they are still eating.", "Peppers saved. The farm smells like a war. A spicy war.",
    K(12, 'poi:farm'), C(6, 'poi:farm', 'the crates of peppers'), K(10, 'shop:amy'));
  J("Cook-Off of the Dead", "The Ejaculand Chilli Cook-Off is going ahead. Apocalypse or not. The dead are invited. As the meat.", "I won. Again. Nobody else entered. They were all dead. I still won.",
    G('saloon'), V('poi:gate', 'the chilli pot'), K(14, 'poi:gate'), S(60, 'poi:gate'), K(14, 'poi:gate'));

  W('zombie', 'saba');
  J("Hitless Cemetery", "The cemetery is full of them, my friend. They are climbing out of their graves in rows. Hitless, please.", "Very clean. The dead are jealous.",
    N(), K(14, 'dist:cemetery'), K(12, 'poi:chapel'));
  J("Speedrun", "Three hordes, my friend. The docks, the Blood Factory and the building site. All of them. Fast. The chat is watching.", "New record. I will put it on the leaderboard. There is one entry. It is you.",
    K(12, 'dist:docks'), K(12, 'dist:factory'), K(12, 'dist:site'));
  J("No Damage Run", "Hold the Bone Pit while the survivors climb out, my friend. Do not get hit. If you get hit, do not tell me.", "I saw nothing. Hitless.",
    K(12, 'poi:quarry'), S(60, 'poi:quarry'), K(14, 'poi:quarry'));
  J("The Final Boss", "The biggest zombie in Cum City, my friend. Bigger than a bus. It is at the asylum, and its friends are with it.", "GG, my friend. GG.",
    K(14, 'poi:asylum'), K(1, 'poi:asylum', { hp: 650, what: 'the giant zombie' }), S(60, 'poi:asylum'), K(16, 'poi:asylum'));

  W('zombie', 'joff');
  J("Pizza Blockade", "The doctors at the hospital want pizza. Pineapple. They are doctors, they know what is healthy. The dead are blocking the road.", "Delivered hot. A doctor said it saved her life. I am saying it too.",
    G('scooter'), V('shop:hosp', 'the pizzas'), K(12, 'shop:hosp'));
  J("Pineapple Wall", ["If the dead hate garlic they must hate pineapple too. I have tested this. They do not. But I have a lot of pineapple.", "Get the crates from the docks, then deliver pizzas round Cum Hills."], "Everyone fed. Pineapple everywhere. My dream.",
    C(5, 'dist:docks', 'the crates of pineapple'), G('scooter'), D(5, 'dist:hills', 'Deliver a pizza to each house'));
  J("Night Shift", "Night deliveries. The dead are worse at night. The tips are better.", "Twelve tips. Most of them were teeth. Still counts.",
    N(), G('scooter'), D(6, 'dist:red', 'Deliver a pizza to each door'), K(12, 'dist:red'));
  J("The Big Order", ["A shelter at the building site ordered two hundred pizzas. Two hundred. They have a lot of people and nothing to eat.", "Get the pizza van to them, and do not let anything bite the cheese."], "Two hundred pizzas. Two hundred people. Pineapple on every one. Best day of my life.",
    G('van'), V('dist:site', 'the pizza van'), S(60, 'dist:site'), K(14, 'dist:site'), D(4, 'dist:site', 'Hand out the last pizzas'));

  W('zombie', 'beeb');
  J("Beer Run", "We are running dry, lad. A brewery lorry crashed at the Blood Factory. Get the barrels.", "Barrels in. Taps on. Life goes on, lad.",
    K(10, 'dist:factory'), C(5, 'dist:factory', 'the barrels'));
  J("Regulars", "Three of my regulars did not come in tonight, lad. Thirty years they have come in. Go and find them.", "All three, at the bar, telling me they were never in danger. Same as always.",
    N(), D(3, 'dist:hills', 'Pick up each regular', 'hatch'), V('shop:beebs', 'the regulars'), S(50, 'shop:beebs'));
  J("Pub Quiz of the Dead", "Quiz night, lad. The apocalypse is no excuse. The dead want in. They do not know any answers.", "Quiz won by Table Four. Table Four is three blokes and a door.",
    S(60, 'shop:beebs'), K(12, 'shop:beebs'), S(60, 'shop:beebs'));
  J("Lock-In", "The last lock-in, lad. Everyone left in Cum City is in my pub. And everything dead in Cum City is outside it.", "Sun is up, lad. They are gone. We are still here. Same again?",
    N(), S(70, 'shop:beebs'), K(16, 'shop:beebs'), S(70, 'shop:beebs'), K(16, 'shop:beebs'));

  W('zombie', 'harold');
  J("Field Trial", "Splendid! I have a cure that might work. Might. Test it on the dead round the cemetery. Do take notes.", "It made three of them sneeze and one of them explode. Progress!",
    K(12, 'dist:cemetery'), K(10, 'poi:chapel'));
  J("Rare Leaves", "I need tea leaves from the Forest. Rare ones. The dead are guarding them. Do not ask me how they know.", "Splendid leaves! I shall make a pot. Not for you. For science.",
    K(12, 'dist:forest'), C(5, 'dist:forest', 'the tea leaves'));
  J("Spunk Brain Files", ["The labs have the original files on the tea. If I read them, I can fix it properly.", "The building is full of what was once the staff."], "Oh dear. It says do not add to tea. In red. Underlined. Oh dear, oh dear.",
    K(12, 'dist:brain'), C(4, 'dist:brain', 'the lab files'), K(10, 'shop:harold'));
  J("Teatime", "The cure is ready. Truly ready. But I must brew it at the dome, and it takes time. A long time. Tea always does.", "Splendid! The cure is brewing and the dead are napping. A cup of tea fixes everything.",
    G('ambulance'), V('poi:dome', 'the cure'), S(70, 'poi:dome'), K(14, 'poi:dome'), S(60, 'poi:dome'));

  W('zombie', 'kaya');
  J("Barista Barricade", "The dead keep coming through the cafe window! I will make coffee, you make them go away!", "Window fixed, coffee made! Teamwork!",
    S(55, 'shop:cafe'), K(12, 'shop:cafe'));
  J("Milk Run", "We are out of milk! The farm has a whole van of it. Please do not let a zombie curdle it!", "Fresh milk! Lattes for everyone!",
    G('van', 'road:poi:farm'), V('shop:cafe', 'the milk van'), K(10, 'shop:cafe'));
  J("Coffee for Heroes", "The people holding the barricades need coffee to stay awake! Five round Clubhouse Row, five round the Red Light District!", "Every barricade buzzing! Nobody falls asleep on my watch!",
    G('hatch'), D(5, 'dist:club', 'Drop a coffee at each barricade'), D(5, 'dist:red', 'Drop a coffee at each barricade'));
  J("Open Mic Night", "We are holding an open mic night to keep everyone's spirits up! Pulsar is playing. The dead love Pulsar. That is the problem.", "Best open mic night ever! Elden even clapped. Once.",
    N(), S(60, 'shop:cafe'), K(14, 'shop:cafe'), S(60, 'shop:cafe'), K(14, 'shop:cafe'));

  W('zombie', 'elden');
  J("Meat Run", ["Out of meat.", "Butcher at the docks. The dead got there first."], "Good meat.",
    K(12, 'dist:docks'), C(4, 'dist:docks', 'the meat'));
  J("Knives Out", ["Knives went missing. The dead took them. Somehow.", "Get them back."], "Sharp. Good.",
    K(10, 'dist:cafe'), C(5, 'dist:cafe', 'the knives'), K(10, 'shop:cafe'));
  J("Grill Out", ["Cooking at the picnic spot. The smoke pulls the dead away from town.", "Keep them off the grill."], "Burgers done. So are they.",
    G('van'), V('poi:picnic', 'the grill'), S(60, 'poi:picnic'), K(12, 'poi:picnic'));
  J("Last Service", ["Feeding the whole city tonight.", "Get it there. Keep them alive. Keep it hot."], "Service.",
    G('van'), D(6, 'dist:club', 'Drop a hot meal at each shelter'), D(6, 'dist:cafe', 'Drop a hot meal at each shelter'), K(14, 'shop:cafe'), S(60, 'shop:cafe'));

  W('zombie', 'ali');
  J("Garlic Bread", "Garlic bread for every shelter. It feeds them and it keeps the dead away. Everything is better with garlic.", "Every shelter smells of garlic. The dead are crying.",
    G('hatch'), D(6, 'dist:cafe', 'Drop garlic bread at each shelter'));
  J("Vampire Rumour", ["Someone said the dead are vampires now. They are not. But I have stocked up anyway.", "The asylum has the last of the stakes. Bring them back."], "Stakes and garlic. I am ready for anything. Except pineapple.",
    K(12, 'poi:asylum'), C(4, 'poi:asylum', 'the stakes'));
  J("Garlic Smoke", ["Burn garlic at the docks and the smoke blows across the whole town. The dead will hate it.", "Fetch the garlic from the farm, then hold the fire while it burns."], "All of Cum City smells of my kitchen. As it should.",
    C(5, 'poi:farm', 'the garlic crates'), S(60, 'poi:crane'), K(12, 'poi:crane'));
  J("The Great Garlic Wall", "I am building a garlic wall round the whole Cafe Streets. It needs every bulb in Cum City. And it needs you to stop them chewing it.", "The wall stands. It is beautiful. It stinks. I am going to cry.",
    C(6, 'poi:farm', 'the last garlic crates'), G('van'), D(6, 'dist:cafe', 'Lay garlic for the wall'), S(60, 'dist:cafe'), K(14, 'dist:cafe'));

  W('zombie', 'potbelly');
  J("Power Cut", "Kid, the power is going. No power, no cabinets. No cabinets, no calm. The generator parts are at the Blood Factory.", "Lights on, cabinets on. High score, kid.",
    K(12, 'dist:factory'), C(4, 'dist:factory', 'the generator parts'));
  J("Token Run", "Kid, the shelters want games. I have six little cabinets. Free to play, obviously.", "Every shelter has a game. Nobody is thinking about the dead now. Just high scores.",
    G('van'), D(6, 'dist:hills', 'Drop a cabinet at each shelter'));
  J("Boss Rush", "Kid, the dead are coming in waves. Like an arcade game. So play it like one. Three waves.", "All waves cleared. Insert coin to continue? No. Go home, kid.",
    K(10, 'shop:arcade'), K(12, 'shop:arcade'), K(14, 'shop:arcade'));
  J("Final Credits", "Kid, the big horde is heading for the arcade. Every single one of them. Thirty people inside. I have never closed early. I am not starting now.", "Credits rolling, kid. Everyone made it. Game over for them, not us.",
    S(60, 'shop:arcade'), K(14, 'shop:arcade'), S(70, 'shop:arcade'), K(16, 'shop:arcade'));

  W('zombie', 'pulsar');
  J("Bass Bait", "Friend. More bass. The speaker van is at the docks. Drive it through the Red Light District and the dead will follow you out to the Bone Pit.", "They followed the van like a conga line. The best conga line. Free of charge.",
    G('van', 'road:dist:docks'), V('dist:red', 'the speaker van'), V('poi:quarry', 'the speaker van'), K(12, 'poi:quarry'));
  J("Eight Arms", "Friend. I play with eight arms. The dead keep grabbing seven of them. Hold them off at the carousel while I play.", "Seven arms back, one on the kebab. Vibes restored.",
    S(60, 'poi:carousel'), K(12, 'poi:carousel'));
  J("Radio Free Cum City", "Friend. I am broadcasting to every shelter from the radio mast. Good vibes for the living. Bad vibes for the dead.", "Every shelter heard it. Even the dead were nodding.",
    S(60, 'poi:mast'), K(12, 'poi:mast'), S(50, 'poi:mast'));
  J("The Drop", "Friend. The biggest set of my life, at the Ejaculand gate. The bass will pull every dead thing in the city to one place. Then we drop.", "That was the drop, friend. The whole city felt it. Free of charge, always.",
    N(), S(60, 'poi:gate'), K(14, 'poi:gate'), S(70, 'poi:gate'), K(16, 'poi:gate'));

  W('zombie', 'bonjo');
  J("Leather Armour", "Welcome, welcome. Zombie teeth cannot get through good leather. Fetch my hides from the farm and I will dress the survivors.", "Everyone in leather. Everyone safe. Everyone looking marvellous.",
    K(10, 'poi:farm'), C(5, 'poi:farm', 'the hides'));
  J("Fashion Victims", "Welcome, welcome. My models were doing a shoot at the Drive-In when the dead arrived. Get them out.", "Not a scratch on them. Or on the leather. Lovely job.",
    G('limo'), V('poi:drivein', 'the limo'), K(12, 'poi:drivein'), V('shop:bonjo', 'the models'));
  J("Looters Again", "Welcome, welcome. The looters are back. They have a lorry this time. They are getting greedy.", "All my leather back. And their lorry. I will make it into a jacket.",
    CS('truck', 'road:dist:red', "the looters' lorry", 150), K(10, 'dist:red'));
  J("Runway of the Dead", "Welcome, welcome. A fashion show. Tonight. On the airport runway. The dead will come. They always want the front row.", "Standing ovation. Half of them could not stand. Still counts.",
    G('limo'), V('poi:runway', 'the limo'), S(60, 'poi:runway'), K(14, 'poi:runway'), S(50, 'poi:runway'));

  W('zombie', 't');
  J("House Calls", "Darling, my regulars are scared to come out. So the girls are going to them. Drive them round Cum Hills.", "Every house visited. Every client calm. Business as usual, darling.",
    G('limo'), D(5, 'dist:hills', 'Drop a girl at each house'));
  J("Bodyguard", "Darling, one of my girls is walking home through the cemetery. In those heels. Watch her back.", "Home safe. She says you have nice arms. I agree.",
    N(), K(12, 'dist:cemetery'), S(50, 'dist:cemetery'));
  J("Motel Rescue", "Darling, four of my girls are stuck at the Sticky Sheets Motel and the dead are knocking. Not the good kind of knocking.", "All of them home. I owe you, darling. I will pay you back. One way or another.",
    G('limo'), V('poi:motel', 'the limo'), K(12, 'poi:motel'), V('shop:t', 'the girls'));
  J("Red Light Defence", "Darling, the dead want my street. My street. Every girl is out with a weapon and they need a man at the front.", "The red lights are still on. And so are we, darling.",
    N(), K(14, 'dist:red'), S(60, 'shop:t'), K(14, 'dist:red'), S(60, 'shop:t'));

  W('zombie', 'jessiah');
  J("Clean Water", "Soup needs water. The water must be clean. The pumps at the Cream Sewers are overrun.", "Clean water. Good soup follows.",
    K(12, 'poi:outfall'), S(50, 'poi:outfall'));
  J("Pilgrimage", "The survivors in Little Load have walked for days. Bring them to my kitchen.", "They are fed. They will walk again tomorrow. Stronger.",
    D(5, 'poi:village', 'Pick up each survivor', 'van'), V('shop:jessiah', 'the survivors'));
  J("Soup Kitchen", "The queue goes round the block. The dead have joined the queue. Hold the line while I serve.", "Every bowl served. Not one to the dead.",
    S(60, 'shop:jessiah'), K(12, 'shop:jessiah'), S(60, 'shop:jessiah'));
  J("Sermon on the Mount", "I will speak at St Spunk's tonight. Everyone left alive will come. So will the dead. Protect the flock, droplet.", "The flock is safe. The word is spoken. Go with God.",
    N(), G('van'), V('poi:church', 'the van'), S(70, 'poi:church'), K(16, 'poi:church'));

  W('zombie', 'natty');
  J("Whetstone", "A dull blade is a death sentence now. Bring me whetstones from the Bone Pit.", "Every blade in the city is sharp again. Good.",
    K(12, 'poi:quarry'), C(4, 'dist:bone', 'the whetstones'));
  J("Trial by Blade", "Show me your blade has learned. Clear the Forest. Then the logging camp.", "Your blade is learning. It is almost worthy.",
    K(12, 'dist:forest'), K(12, 'poi:logging'));
  J("Armoury", "The police armoury has blades worth saving. The dead are guarding them like they know.", "Fine steel. Wasted on police.",
    K(12, 'shop:cops'), C(5, 'shop:cops', 'the blades'), K(10, 'shop:natty'));
  J("The Thousand Cuts", "A blade must be tested against many. The Spunkhenge Stones. Tonight. As many as the night gives you.", "Your blade has drunk deep. It will sleep well. So should you.",
    N(), K(14, 'poi:stones'), S(60, 'poi:stones'), K(16, 'poi:stones'), S(60, 'poi:stones'));

  W('zombie', 'fate');
  J("The Tower", "The deck gave me The Tower. The clock tower. The dead are climbing it.", "The Tower stands. The card lied, for once.",
    N(), K(12, 'poi:clock'), S(45, 'poi:clock'));
  J("The Hanged Man", "The Hanged Man. Upside down. A survivor is hanging upside down at the scrapyard. Literally.", "Right way up. The card is happy.",
    K(12, 'poi:scrapyard'), S(45, 'poi:scrapyard'), K(10, 'poi:scrapyard'));
  J("The Wheel of Fortune", "The Wheel of Fortune. The big wheel at Ejaculand. The dead are riding it round and round.", "The wheel has stopped. Fortune has turned. For us.",
    N(), K(12, 'poi:ferris'), S(50, 'poi:ferris'), K(12, 'poi:ferris'));
  J("The World", "The last card. The World. The dead are everywhere at once. So you must be too.", "The World. Reversed, then upright again. You did that. The cards will never forget you.",
    K(12, 'dist:cemetery'), K(12, 'dist:asylum'), K(12, 'dist:forest'), K(14, 'poi:chapel'));

  W('zombie', 'judge');
  J("Light", "Light, today. The hospital must be cleansed. The patients turned in their beds.", "Cleansed. The light paid.",
    K(12, 'shop:hosp'), S(45, 'shop:hosp'));
  J("Shadow", "Shadow, tonight. The hunting cabin in the Forest. Something hungry lives there now.", "The shadow is fed. Walk in the light again.",
    N(), K(12, 'poi:cabin'), K(1, 'poi:cabin', { hp: 520, what: 'the thing in the cabin' }), K(10, 'poi:cabin'));
  J("Balance", "Light and shadow must balance. Clear the cemetery by night, then the asylum.", "Balanced. For now.",
    N(), K(14, 'dist:cemetery'), K(14, 'poi:asylum'), S(50, 'poi:asylum'));
  J("The Final Judgement", "The dead have gathered at the Crimson Moon Altar under a red moon. Judge them. All of them.", "Judgement is passed. Their sentence is served.",
    N(), K(14, 'poi:altar'), S(60, 'poi:altar'), K(1, 'poi:altar', { hp: 720, what: 'the dead priest' }), K(16, 'poi:altar'));

  W('zombie', 'bates');
  J("Breathing Exercise", "One must breathe, even while the dead come for one. The Ranger Lookout, then the view point. Breathe at both.", "One breathed. One ran. One is calm.",
    S(45, 'poi:lookout'), S(45, 'poi:view'));
  J("Zen Garden", "One's garden at the picnic spot has been trampled by the dead. One must restore the peace.", "Peace restored. One may rake again.",
    K(12, 'poi:picnic'), C(4, 'poi:picnic', 'the garden stones'));
  J("Meditation Under Fire", "One must meditate at the windmill for a full minute. The dead will try to interrupt. One must not let them.", "A full minute. One is enlightened. Slightly.",
    S(60, 'poi:windmill'), K(12, 'poi:windmill'), S(50, 'poi:windmill'));
  J("Mind Over Matter", "One must climb Crimson Peak and clear one's head at the top. The path is full of the dead. One must proceed.", "One has reached the top. One's head is clear. Cum City is quiet. One proceeds.",
    K(12, 'dist:peak'), S(60, 'dist:peak'), K(14, 'dist:peak'), S(60, 'poi:view'));

  W('zombie', 'steve');
  J("Round and Round", [ST, TB("The dead are on the carousel, going round and round. Steve finds it very upsetting.")], [ST, TB("He is riding it now. Alone. Grinning.")],
    K(12, 'poi:carousel'), S(45, 'poi:carousel'));
  J("Ghost Train", [ST, TB("Steve says the ghost train has real ghosts now. Real dead ones. He wants them off his ride.")], [ST, TB("He gave you a free ride token. It is the highest honour in Ejaculand.")],
    N(), K(12, 'poi:ghost'), S(50, 'poi:ghost'), K(10, 'poi:ghost'));
  J("Flume of the Dead", [ST, TB("The dead fell in the Load Flume. They keep coming down the drop, one at a time, forever. Steve wants it to stop.")], [ST, TB("The flume is clear. Steve went down it four times to check.")],
    K(12, 'poi:flume'), S(50, 'poi:flume'), K(12, 'poi:flume'));
  J("Ejaculand Lives", [ST, TB("Steve wants to reopen Ejaculand for the survivors. The dead are already queuing. They do not have tickets.")], [ST, TB("Ejaculand is open. The survivors are on the rides. Steve has not stopped grinning for an hour. It is frightening.")],
    K(14, 'poi:gate'), K(12, 'poi:coaster'), K(12, 'poi:ferris'), S(60, 'poi:gate'));

  /* ======================= Chapter Three: Rise of the Machines ======================= */
  W('robot', 'lab');
  J("Propaganda", ["Mister Mayor, the robots have put up posters saying CLEAN IS GOOD. I have drawn on them. Now they want me.", "Their poster vans are going round the Red Light District. Wreck them."], "Every poster has a willy on it now. The resistance is strong.",
    X(4, 'van', 'dist:red', 'the robot poster vans'), K(10, 'dist:red'));
  J("Jailbreak", "They have locked up half the city in the police station for being untidy. Untidy! I am the untidiest man alive and I am still free.", "Everyone out. Everyone untidy. Freedom smells terrible.",
    K(12, 'shop:cops'), S(50, 'shop:cops'), K(10, 'shop:cops'));
  J("Pirate Radio", "The resistance needs to talk, Mister Mayor. Pulsar has a transmitter. We need to hide it in the airport hangar.", "We are on air. First broadcast: the sheriff's top ten jokes. Morale will be destroyed. Theirs.",
    G('van'), V('poi:hangar', 'the transmitter'), K(12, 'poi:hangar'), S(60, 'poi:hangar'));
  J("Mess Them Up", "The big push, Mister Mayor. We hit Spunk Brain Labs, where they build them. Everyone is coming. Bring your worst.", "The labs are a mess. A glorious, filthy mess. I am so proud I could spill something.",
    K(12, 'dist:brain'), X(4, 'van', 'dist:brain', 'the robot vans'), K(14, 'poi:dome'), S(60, 'poi:dome'));

  W('robot', 'tb');
  J("Lotion Bombs", [TBQ, TB("TB has made lotion bombs. Lotion gets in their joints. He made them with his own lotion. Please wear gloves.")], [TBQ, TB("He says that was the best use of lotion ever. I do not want to know the other uses.")],
    D(5, 'dist:factory', 'Drop a lotion bomb at each spot', 'van'), K(10, 'dist:factory'));
  J("Gimp Disguise", [TBQ, TB("The robots think the gimps are robots, because of the suits. TB wants to use this. The gimps need to get into Spunk Brain Labs.")], [TBQ, TB("The gimps are in. The robots welcomed them. TB is jealous.")],
    D(4, 'dist:brain', 'Drop a gimp at each door', 'van'), K(10, 'dist:brain'));
  J("The Dirtiest Man Alive", [TBQ, TB("The robots have put a price on TB's head. For being too dirty. He is very proud. Now they are coming for him at the docks."), TBQ], [TBQ, TB("He is still dirty. He is still free. He is still proud. It is a lot.")],
    G('limo'), V('dist:docks', 'TB'), S(60, 'dist:docks'), K(12, 'dist:docks'));
  J("Brothers Load: Unplugged", [TBQ, TB("Brothers Load are playing an acoustic gig for the resistance at the Drive-In, so the robots cannot hear it. TB is on the tambourine. Badly. Loudly.")], [TBQ, TB("The robots heard it. Of course they did. Shot Rope on a tambourine. I cried again.")],
    G('limo'), V('poi:drivein', 'TB'), S(60, 'poi:drivein'), K(14, 'poi:drivein'), S(60, 'poi:drivein'));

  W('robot', 'greebo');
  J("Underground Pies", "They banned my pies. So I sell them under the counter. Five customers round Cum Hills. Do not get scanned.", "Illegal pies. Somehow tastier.",
    D(5, 'dist:hills', 'Drop an illegal pie at each house', 'van'), K(8, 'dist:hills'));
  J("Clogged", "Robots run on clean oil. My pie grease is not clean oil. Pour it in their fuel at Pump n Dump.", "They drank my grease. Now they are as slow as my customers.",
    K(10, 'poi:petrol'), D(4, 'poi:petrol', 'Pour pie grease in each pump', 'van'), K(10, 'poi:petrol'));
  J("Grotto Bakery", "I am baking in the grotto where they cannot find me. They have found me. They have found the grotto.", "The oven is safe. The grotto is safe. The pies are unsafe. As always.",
    K(12, 'poi:grotto'), S(60, 'poi:grotto'), K(10, 'poi:grotto'));
  J("Pie Revolution", "Every shelter in the city wants pies. The robots will try to stop every van. Drive it like you stole it. You did steal it.", "The city has pies. The revolution has pies. Viva la pie.",
    X(3, 'van', 'dist:cafe', 'the robot vans'), G('van'), D(6, 'dist:club', 'Drop a pie at each shelter'), D(5, 'dist:red', 'Drop a pie at each shelter'), K(10, 'shop:greebo'));

  W('robot', 'spermaid');
  J("Salt Water", "Sweetie, I have barrels of sea water. Salt rusts them. Roll them out to the building site where they are working.", "Rusty robots. Lovely colour on them.",
    D(5, 'dist:site', 'Drop a barrel of sea water at each spot', 'van'), K(10, 'dist:site'));
  J("The Beach Cleaners", "Sweetie, they are cleaning Seamen Beach. All of it. Every shell. Every bit of seaweed. Stop them.", "The beach is messy again. Perfect.",
    K(12, 'dist:beach'), X(3, 'van', 'dist:beach', 'the robot cleaning vans', 30), K(10, 'dist:beach'));
  J("Lighthouse Signal", "Sweetie, my sisters out at sea need the lighthouse to guide them home. The robots keep switching it off.", "The light is on and my sisters are home. You are my lighthouse, sweetie.",
    N(), K(12, 'poi:lighthouse'), S(60, 'poi:lighthouse'), K(10, 'poi:lighthouse'));
  J("Holy War", "Sweetie, they want to clean the holy font. Clean it! It is meant to be sticky! Every sister is fighting. So are you.", "The font is sticky. The Sanctum is safe. My hero. Again.",
    S(60, 'shop:sanct'), K(14, 'shop:sanct'), S(60, 'shop:sanct'), K(14, 'shop:sanct'));

  W('robot', 'amy');
  J("Spice Grenades", ["Mild, hot or dynamite?", "Robots have sensors. Sensors hate chilli powder. Test my grenades at the Blood Factory and the docks."], "Their sensors are sneezing. Robots should not be able to sneeze.",
    K(10, 'dist:factory'), K(10, 'dist:docks'));
  J("Hot Sauce Smuggling", "The robots have banned hot sauce. Too messy. Five bottles to five homes round the Red Light District.", "Contraband chilli. My favourite kind.",
    G('hatch'), D(5, 'dist:red', 'Drop a bottle of hot sauce at each home'), X(2, 'van', 'dist:red', 'the robot patrol vans'));
  J("Meltdown", ["Mild, hot or dynamite?", "Bring me the valves off their cooling tanks at the Blood Factory. I fill them with dynamite chilli, the whole place melts down."], "Boom. That was the factory. Dynamite every time.",
    K(12, 'dist:factory'), C(4, 'dist:factory', 'the cooling tank valves'), K(10, 'shop:amy'));
  J("Hottest Day", "The robots are taking the heat out of the city. So we make it hotter. A chilli bonfire at the Ejaculand gate. The biggest in history.", "You can see the bonfire from the moon. You can smell it from the moon.",
    C(5, 'poi:farm', 'the crates of chillies'), G('saloon'), V('poi:gate', 'the chillies'), S(60, 'poi:gate'), K(14, 'poi:gate'));

  W('robot', 'saba');
  J("Precision", "Machines are precise, my friend. Be more precise. The airport is full of them.", "Precise. Beautiful.",
    K(12, 'dist:airport'), K(10, 'poi:terminal'));
  J("Glitchless", "Robot vans, my friend. Wreck them without a scratch on your car. Glitchless run.", "There is a scratch. I will call it a feature.",
    G('muscle'), X(4, 'van', 'dist:club', 'the robot vans'), X(3, 'van', 'dist:cafe', 'the robot vans'));
  J("Turret Defence", "They are coming to the gun shop, my friend. They want my guns. Hold the shop. Hitless.", "The guns stay with me. And with you, my friend.",
    S(60, 'shop:saba'), K(12, 'shop:saba'), S(60, 'shop:saba'));
  J("The Mega Robot", "There is a giant robot at the building site, my friend. It is building more of itself. A boss fight. Let us do it hitless.", "GG, my friend. The chat is going wild.",
    K(12, 'dist:site'), K(1, 'dist:site', { hp: 900, what: 'the giant robot' }), S(60, 'dist:site'), K(14, 'dist:site'));

  W('robot', 'joff');
  J("Pizza Drones", "The robots deliver food by drone now. Beige cubes. I deliver pizza by scooter. Faster. Hotter. Pineapple.", "Beat the drones. Beat the cubes. Pineapple wins.",
    G('scooter'), D(6, 'dist:hills', 'Deliver a pizza to each house'));
  J("Pineapple Plantation", "The robots are burning my pineapples at the farm. Too sticky, they say. Of course they are sticky.", "Pineapples saved. All of them. I am going to eat one whole.",
    K(12, 'poi:farm'), C(5, 'poi:farm', 'the pineapples'));
  J("Cheese Jam", "Melted cheese in their wheels. It is the stickiest thing in the world after Spermaid. Five patrol routes round the Cafe Streets.", "They are stuck. Stuck in cheese. Like a pizza.",
    G('scooter'), D(5, 'dist:cafe', 'Pour melted cheese on each patrol route'), X(3, 'van', 'dist:cafe', 'the stuck robot vans'));
  J("Delivery to the Machine", "I am delivering a pizza to the robot leader at Spunk Brain. Inside it is not pizza. It is a bomb. Also pizza.", "The leader opened it, said pineapple, and went boom. Best review ever.",
    G('scooter'), V('poi:dome', 'the pizza bomb'), K(12, 'poi:dome'), S(60, 'poi:dome'), K(12, 'dist:brain'));

  W('robot', 'beeb');
  J("Home Brew", "They shut the brewery, lad. So I brew in the cellar. I need hops from the farm.", "Home brew. Tastes like resistance, lad.",
    K(10, 'poi:farm'), C(5, 'poi:farm', 'the sacks of hops'));
  J("Pub Crawl", "The robots raided the other pubs, lad. Every one. Get the regulars out and bring them here.", "All in, lad. Packed. Like the old days.",
    D(5, 'dist:red', 'Pick up each regular', 'van'), V('shop:beebs', 'the regulars'));
  J("Sticky Floors", "They are coming to mop, lad. They will not get past the door. Thirty years of sticky floors.", "Not one mop got through, lad. The floor is safe.",
    S(60, 'shop:beebs'), K(12, 'shop:beebs'), S(60, 'shop:beebs'));
  J("Last Orders, Again", "Lad, the robots are sending everything they have at the pub. The biggest raid yet. Every regular has a pint and a stool leg.", "Still standing, lad. All of us. The robots are scrap and the beer is warm. Perfect.",
    N(), S(60, 'shop:beebs'), K(14, 'shop:beebs'), S(70, 'shop:beebs'), K(14, 'shop:beebs'));

  W('robot', 'harold');
  J("Field Test", "Splendid! The rust tea needs field testing. On robots. There are plenty at the docks.", "They rusted! Some of them rusted in a rather lovely pattern.",
    K(12, 'dist:docks'), K(10, 'poi:crane'));
  J("Rare Copper", "A better tea needs copper. The scrapyard has plenty. The robots have more. Splendid!", "Copper tea! Do not drink it. It is for them.",
    K(12, 'poi:scrapyard'), C(5, 'poi:scrapyard', 'the copper coils'));
  J("Tea Bombs", "Tea bombs! Drop them where the robots charge, round Spunk Brain. Mind your fingers. Splendid!", "Every charging station steaming. A proper brew.",
    D(5, 'dist:brain', 'Drop a tea bomb at each charging station', 'hatch'), K(12, 'dist:brain'));
  J("The Great Brew", "The biggest pot of rust tea ever made, at the windmill. The wind will blow it over the whole city. It takes time to brew.", "Splendid! The whole city is having a cup. And the robots are seizing up all over.",
    C(5, 'poi:farm', 'the water barrels'), G('van'), V('poi:windmill', 'the brew'), S(70, 'poi:windmill'), K(14, 'poi:windmill'));

  W('robot', 'kaya');
  J("Secret Cafe", "The robots closed the cafe for being messy! We are opening a secret one in the hills! Bring the coffee machine!", "Secret cafe open! The password is latte!",
    G('van'), V('dist:hills', 'the coffee machine'), K(10, 'dist:hills'));
  J("Hot Coffee", "Spill hot coffee on a robot and it shorts out! Five spills round Clubhouse Row! Do not waste the good stuff!", "Five robots shorted! Five cups wasted. Worth it!",
    G('hatch'), D(5, 'dist:club', 'Spill a hot coffee at each patrol spot'), K(10, 'dist:club'));
  J("Bean Raid", "The robots took every coffee bean in Cum City to the airport! We need them back!", "Beans back! Everyone gets a double shot!",
    K(12, 'dist:airport'), C(5, 'dist:airport', 'the sacks of beans'), K(10, 'shop:cafe'));
  J("Coffee Revolution", "Nobody can fight without coffee! We are taking it to every resistance post. The robots will try to stop us!", "The resistance is wired! Elden smiled! He did!",
    G('van'), D(5, 'dist:club', 'Drop coffee at each resistance post'), D(5, 'dist:cafe', 'Drop coffee at each resistance post'), X(3, 'van', 'dist:cafe', 'the robot patrol vans'), K(10, 'shop:cafe'));

  W('robot', 'elden');
  J("Spares", ["Need parts for the grill.", "The robots have them."], "Fixed.",
    K(12, 'dist:factory'), C(4, 'dist:factory', 'the grill parts'));
  J("Kitchen Raid", ["Robots in the kitchen. Cleaning.", "Stop them."], "Dirty again. Good.",
    K(10, 'shop:cafe'), S(50, 'shop:cafe'), K(10, 'shop:cafe'));
  J("Cleaver", ["The cleaver works on robots.", "Prove it. Airport."], "Works.",
    K(12, 'dist:airport'), K(12, 'poi:hangar'), K(10, 'poi:terminal'));
  J("Feed the Resistance", ["Hot food for every post.", "They will try to stop you. Do not let them."], "Fed.",
    G('van'), D(6, 'dist:club', 'Drop hot food at each post'), D(5, 'dist:red', 'Drop hot food at each post'), K(12, 'shop:club'), S(50, 'shop:club'));

  W('robot', 'ali');
  J("Garlic Gas", "Garlic gas! It gets in their vents. Everything is better with garlic. Even gas.", "Their vents are full of garlic. They will never smell clean again.",
    K(10, 'dist:docks'), D(4, 'dist:docks', 'Drop a garlic gas canister at each vent', 'hatch'), K(10, 'dist:docks'));
  J("Smuggler", "The robots have banned garlic. Banned it! Five kitchens need it. Get it past their scanners.", "Every kitchen has garlic. The scanners can smell it from space.",
    G('hatch'), D(5, 'dist:cafe', 'Drop a bag of garlic at each kitchen'), X(2, 'van', 'dist:cafe', 'the robot scanner vans'));
  J("Airport Sabotage", "More garlic oil on the runways. They keep landing new ones. Five more spots.", "They are sliding off the runway like butter. Garlic butter.",
    G('hatch'), D(5, 'dist:airport', 'Pour garlic oil at each landing spot'), K(12, 'poi:runway'));
  J("The Garlic Bomb", "The biggest garlic bomb in history, delivered to the Spunk Brain dome. Do not open the windows.", "The dome stinks. The robots are fleeing. I have never been happier.",
    C(6, 'poi:farm', 'the garlic crates'), G('van'), V('poi:dome', 'the garlic bomb'), S(60, 'poi:dome'), K(12, 'poi:dome'));

  W('robot', 'potbelly');
  J("Hidden Cabinets", "Kid, I hid three cabinets round Cum Hills before they took the rest. Bring them back.", "Three cabinets. Free to play. The resistance has games.",
    K(8, 'dist:hills'), C(3, 'dist:hills', 'the hidden cabinets'));
  J("Glitch", "Kid, robots glitch like an old game. Smash enough of them at once and they crash. The building site, three waves.", "Glitched. Like a cartridge you blew on.",
    K(10, 'dist:site'), K(12, 'dist:site'), K(12, 'dist:site'));
  J("Lorry Again", "Kid, they took the cabinets again. Another lorry. They never learn.", "Back again. Free again.",
    CS('truck', 'road:dist:factory', 'the lorry full of cabinets', 180), K(10, 'dist:factory'));
  J("Arcade Uprising", "Kid, they want the arcade for a cleaning depot. Thirty people inside are playing to stay sane. Hold it.", "The arcade lives, kid. Insert no coin. Always.",
    S(60, 'shop:arcade'), K(14, 'shop:arcade'), S(70, 'shop:arcade'), K(14, 'shop:arcade'));

  W('robot', 'pulsar');
  J("Static", "Friend. Static from the speaker van scrambles them. Drive it round the Cafe Streets.", "Scrambled. Like eggs. Vibes.",
    D(5, 'dist:cafe', 'Blast static at each patrol spot', 'van'), K(10, 'dist:cafe'));
  J("Underground Rave", "Friend. A rave in the Cream Sewers, where the robots cannot scan. The sewers are guarded.", "The rave is on. Free entry. Always.",
    K(12, 'poi:outfall'), S(60, 'poi:outfall'));
  J("Bass Drop", "Friend. The drop from the observatory dish shakes them apart. They will come running.", "Shook them to bits, friend. Literally.",
    N(), S(60, 'poi:observatory'), K(12, 'poi:observatory'), S(50, 'poi:observatory'));
  J("Power Chord", "Friend. The big one. Every speaker in the city, one chord, from the radio mast. Keep them off me for as long as it takes.", "That chord broke every robot in earshot. Free of charge.",
    G('van'), V('poi:mast', 'the speakers'), S(70, 'poi:mast'), K(14, 'poi:mast'), S(60, 'poi:mast'));

  W('robot', 'bonjo');
  J("Leather Restock", "Welcome, welcome. They burned half my leather for being unhygienic. Fetch new hides from the farm.", "Fresh leather. Hygiene has no power here.",
    K(10, 'poi:farm'), C(5, 'poi:farm', 'the hides'));
  J("Underground Fashion", "Welcome, welcome. An underground fashion show at the Drive-In. Get my models there without being scanned.", "Fabulous. Defiant. Leather.",
    D(4, 'dist:red', 'Pick up each model', 'limo'), V('poi:drivein', 'the models'), K(10, 'poi:drivein'));
  J("Polish Van", "Welcome, welcome. They have a polishing van. It polishes leather to a shine. I cannot allow it.", "No more shine. Only character.",
    CS('van', 'road:dist:club', 'the polishing van', 160), X(3, 'van', 'dist:club', 'the robot vans'));
  J("Leather Resistance", "Welcome, welcome. Leather jackets for the whole resistance. The robots will try to stop it. They hate a good jacket.", "Everyone in leather. The resistance has never looked better.",
    G('van'), D(6, 'dist:club', 'Drop a leather jacket at each post'), D(5, 'dist:hills', 'Drop a leather jacket at each post'), K(12, 'shop:bonjo'));

  W('robot', 't');
  J("Disguises", "Darling, the robots scan faces. So my girls need wigs. A van full of them crashed at the docks.", "New wigs, new faces. The scanners are confused, darling.",
    K(10, 'dist:docks'), C(4, 'dist:docks', 'the boxes of wigs'));
  J("Private Clients", "Darling, my clients are scared of the scanners. Drive the girls to them round Cum Hills, quietly.", "Every client happy. Every scanner fooled.",
    G('limo'), D(5, 'dist:hills', 'Drop a girl at each house'), X(2, 'van', 'dist:hills', 'the robot scanner vans'));
  J("Motel Raid", "Darling, the robots raided the Sticky Sheets Motel. They are cleaning the sheets. Some things must stay sticky.", "The sheets are sticky again. Thank you, darling.",
    K(12, 'poi:motel'), S(55, 'poi:motel'), K(10, 'poi:motel'));
  J("Red Light Rebellion", "Darling, they want to switch off the red lights. Every one. My girls are on the street and they are not leaving.", "The lights stay red, darling. Forever.",
    N(), K(14, 'dist:red'), X(3, 'van', 'dist:red', 'the robot vans'), S(60, 'shop:t'), K(14, 'dist:red'));

  W('robot', 'jessiah');
  J("Real Bread", "Man cannot live on beige cubes. Flour from the windmill. Bring it.", "Real bread. The body remembers.",
    K(10, 'poi:windmill'), C(5, 'poi:windmill', 'the sacks of flour'));
  J("Soup Run", "Soup for the families hiding in Little Load. The robots must not follow.", "They ate. They are hidden. They are strong.",
    D(5, 'poi:village', 'Drop soup at each hiding place', 'van'), X(2, 'van', 'dist:hills', 'the robot vans following you'));
  J("Sanctuary", "They come to clean my kitchen of people. My kitchen keeps its people.", "The kitchen stands. Go with God, droplet.",
    S(60, 'shop:jessiah'), K(12, 'shop:jessiah'), S(60, 'shop:jessiah'));
  J("The Feast", "A feast for the whole resistance at St Spunk's. The machines will come. Let them see what real food does to a man.", "They came. They saw. They were scrapped. The feast goes on.",
    G('van'), V('poi:church', 'the feast'), S(60, 'poi:church'), K(14, 'poi:church'), S(60, 'poi:church'));

  W('robot', 'natty');
  J("Tempered", "A blade tempered in their oil cuts through their steel. Their oil is at the Blood Factory.", "Tempered. Now it hates them too.",
    K(12, 'dist:factory'), C(4, 'dist:factory', 'the drums of oil'));
  J("Steel Test", "Your blade must meet steel. The scrapyard, then the docks.", "Your blade did not break. Neither did you.",
    K(12, 'poi:scrapyard'), K(12, 'dist:docks'));
  J("Forge", "My forge is at the volcano. They want to cool it. They cannot. They will try.", "The forge burns. The blades will be born.",
    K(12, 'poi:volcano'), S(60, 'poi:volcano'), K(10, 'poi:volcano'));
  J("The Last Blade", "One blade to end their leader, forged tonight at the Spunkhenge Stones. Hold them back while it cools.", "The last blade is ready. So are you.",
    N(), K(12, 'poi:stones'), S(60, 'poi:stones'), K(14, 'poi:stones'), S(60, 'poi:stones'));

  W('robot', 'fate');
  J("Blank Card", "A blank card. The machines are erasing the future. They are at the clock tower, stopping time.", "The clock ticks. The cards speak again.",
    K(12, 'poi:clock'), S(45, 'poi:clock'));
  J("The Chariot", "The Chariot. Their vans. Wreck them before they carry the future away.", "The Chariot is broken. Good.",
    X(4, 'van', 'dist:hills', 'the robot vans'), X(3, 'van', 'dist:club', 'the robot vans'));
  J("The Star", "The Star. The observatory again. They are reprogramming the stars. Stop them.", "The stars are wild again.",
    N(), K(12, 'poi:observatory'), S(55, 'poi:observatory'), K(12, 'poi:observatory'));
  J("The Last Draw", "I drew the last card for the machines. The Tower, falling. Their tower is at Spunk Brain. Make it fall.", "Their tower falls. The deck is mine again. And yours.",
    K(12, 'dist:brain'), X(3, 'van', 'dist:brain', 'the robot vans'), K(14, 'poi:dome'), S(60, 'poi:dome'));

  W('robot', 'judge');
  J("Blind Them", "Shadow, tonight. Their scanners are on the Ranger Lookout. Blind them.", "Blind. In the dark, where they belong.",
    N(), K(12, 'poi:lookout'), S(45, 'poi:lookout'));
  J("Burn Bright", "Light, today. Their cleaning vans burn bright. Burn them brighter.", "Burned.",
    X(4, 'van', 'dist:cafe', 'the robot cleaning vans'), K(10, 'dist:cafe'));
  J("Court", "They have made a court in the police station. They judge people for mess. Only I judge.", "Their court is closed. Mine is open.",
    K(12, 'shop:cops'), X(3, 'police', 'shop:cops', 'the robot police cars'), S(50, 'shop:cops'));
  J("Sentence", "Their leader hides in the airport hangar. Light and shadow both come for it tonight.", "Judged. Sentenced. Scrapped.",
    N(), K(12, 'dist:airport'), K(14, 'poi:hangar'), K(1, 'poi:hangar', { hp: 900, what: 'the robot leader' }), S(60, 'poi:hangar'));

  W('robot', 'bates');
  J("Unplugging", "One must unplug. Their charging posts in the Cafe Streets hum. One must remove the hum.", "The hum is gone. One breathes.",
    D(5, 'dist:cafe', 'Cut the cable at each charging post', 'hatch'), K(10, 'dist:cafe'));
  J("Digital Detox", "One must take the city off the grid. Their relay at the radio mast first, then the observatory.", "Off the grid. One is lighter already.",
    K(12, 'poi:mast'), K(12, 'poi:observatory'));
  J("Stillness", "One must sit still at the windmill while they search for one. Stillness defeats scanners.", "They did not find one. One was very still. One is proud.",
    S(60, 'poi:windmill'), K(12, 'poi:windmill'), S(55, 'poi:windmill'));
  J("Silence", "One must silence them all. The airport, where the new ones land. One proceeds.", "Silence. One proceeds. Finally.",
    K(12, 'dist:airport'), K(12, 'poi:runway'), S(60, 'poi:runway'), K(14, 'poi:terminal'));

  W('robot', 'steve');
  J("Paint It Red", [ST, TB("The robots have painted the coaster white. Steve wants it red again. The robots guarding the paint have to go.")], [ST, TB("It is red again. Steve did the painting himself. With his face.")],
    K(12, 'poi:coaster'), S(45, 'poi:coaster'));
  J("Dodgems", [ST, TB("The robots took over the dodgems. They drive very safely. Steve finds this disgusting.")], [ST, TB("The dodgems are unsafe again. Steve is delighted.")],
    K(12, 'poi:dodgems'), S(50, 'poi:dodgems'));
  J("Hall of Mirrors", [ST, TB("The robots are lost in the hall of mirrors. There are hundreds of them. Or ten and a lot of mirrors. Steve wants them out.")], [ST, TB("He looked in a mirror. He grinned at himself. It grinned back.")],
    K(12, 'poi:mirrors'), S(50, 'poi:mirrors'), K(10, 'poi:mirrors'));
  J("Ejaculand Forever", [ST, TB("The robots want to bulldoze Ejaculand for a car park. Clean, safe, empty. Steve is not grinning. Steve is angry. I have never seen it.")], [ST, TB("Ejaculand stays. Steve is grinning again. I have never been so relieved.")],
    K(12, 'poi:gate'), X(3, 'truck', 'poi:gate', 'the robot bulldozer lorries', 35), K(12, 'poi:ferris'), S(60, 'poi:gate'));

  /* ======================= Chapter Four: Blumhead's Plan ======================= */
  W('blum', 'lab');
  J("Deprogramming", ["Mister Mayor, we have caught three of Blumhead's goons and tied them to chairs. They keep saying Hail Blumhead. I keep saying no.", "Their friends are coming to break them out."], "Still tied up. Still hailing. I put my sheriff hat on one of them. He has stopped.",
    S(60, 'shop:club'), K(12, 'shop:club'));
  J("Goo Spill", "The goo is spreading across Clubhouse Row, Mister Mayor. And it is moving. On its own. With goons riding it.", "Spill contained. My boots are ruined. My spirit is not.",
    K(12, 'dist:club'), X(3, 'truck', 'dist:club', 'the goo tankers'), K(10, 'dist:club'));
  J("Infiltration", "We need to know his plan. I have a goon robe. It does not fit you. Wear it anyway, go to his castle and look.", "An egg. A giant egg. He is going to hatch something over the whole city. I need a drink. A large one.",
    G('limo'), V(BLC, 'the limo'), S(60, BLC), K(14, BLC));
  J("The Sheriff Stands", "Mister Mayor, they are coming for the Clubhouse. All of them. Goons, goo and things with too many legs. The sheriff will not run.", "The sheriff did not run. The sheriff was very scared. But the sheriff did not run.",
    N(), K(14, 'dist:club'), S(60, 'shop:club'), K(16, 'shop:club'), S(70, 'shop:club'));

  W('blum', 'tb');
  J("Purple Pills", [TBQ, TB("TB says the goo pills turn you purple and make you love Blumhead. He took one. He is fine. He is slightly purple. He wants the rest gone from the docks.")], [TBQ, TB("He is less purple. He says thank you. In purple.")],
    K(12, 'dist:docks'), C(4, 'dist:docks', 'the goo pills'));
  J("Gimp Goons", [TBQ, TB("Blumhead turned TB's gimps into goons. TB says nobody turns his gimps but him. They are at the Blood Factory.")], [TBQ, TB("The gimps are gimps again. TB is so happy he gave them the day off. Ten minutes of it.")],
    K(12, 'dist:factory'), S(50, 'dist:factory'), K(10, 'dist:factory'));
  J("TB vs Blumhead", [TBQ, TB("TB has challenged Blumhead to a fight. Blumhead sent goons. TB is waiting at the Crimson Moon Altar. Get there before he gets hurt. Or hurts himself.")], [TBQ, TB("TB says he won. He did not fight. You did. He is still celebrating.")],
    G('limo'), V('poi:altar', 'TB'), K(14, 'poi:altar'), S(55, 'poi:altar'));
  J("Brothers Load: Final Show", [TBQ, TB("Brothers Load are playing the end of the world at the Ejaculand gate. The last gig ever, they say. They always say that. The goons want to stop it."), TBQ], [TBQ, TB("Shot Rope at the end of the world. TB sang. I cried. The goons cried. Even the goo cried.")],
    G('limo'), V('poi:gate', 'TB'), S(60, 'poi:gate'), K(14, 'poi:gate'), S(70, 'poi:gate'));

  W('blum', 'greebo');
  J("Purple Pies", "Someone is selling purple pies in my name. Goo pies. My name! Their vans are round the Red Light District.", "Only one man makes pies that bad in this city. Me.",
    K(12, 'dist:red'), X(2, 'van', 'dist:red', 'the goo pie vans'));
  J("Grotto Eggs", "Eggs in my grotto. Purple eggs. They are pulsing. They are not mine. The goons guarding them have to go.", "Cleared. I am not baking with those. Probably.",
    K(12, 'poi:grotto'), S(55, 'poi:grotto'), K(12, 'poi:grotto'));
  J("Pie Shelter", "People are hiding in their homes. They are hungry. The goons are outside. Pies, one at a time, both sides of town.", "Every house fed. Pies against the end of the world. It works.",
    G('van'), D(5, 'dist:hills', 'Drop a pie at each house'), D(5, 'dist:red', 'Drop a pie at each house'), K(10, 'shop:greebo'));
  J("The Last Pie", "One pie. The best I have ever made, laced with holy cream. If his goons eat it they snap out of it. Clean flour first, then his castle.", "They ate it. They cried. They asked for seconds. They are free.",
    C(4, 'poi:farm', 'the clean flour'), G('van'), V('dist:blumc', 'the last pie'), S(60, 'dist:blumc'), K(14, 'dist:blumc'));

  W('blum', 'spermaid');
  J("Holy Cream Shield", "Sweetie, holy cream burns the goo. Take bottles round Cum Hills so people can protect their doors.", "Every door blessed. You are a saint, a sticky saint.",
    G('van'), D(6, 'dist:hills', 'Drop a bottle of holy cream at each door'));
  J("Tentacles in the Sea", "Sweetie, there are tentacles coming out of the sea at Pirate Cove. Long ones. With goons riding them.", "The sea is ours again, sweetie. The tentacles are calamari. Tell Elden.",
    N(), K(12, 'poi:cove'), S(55, 'poi:cove'), K(10, 'poi:cove'));
  J("Turned Sisters", "Sweetie, the goo got two of my sisters. They are at the lighthouse with his goons, singing his name. Bring them home.", "They are home and they remember who they are. Thank you, my love.",
    K(12, 'poi:lighthouse'), S(55, 'poi:lighthouse'), D(2, 'poi:lighthouse', 'Pick up each sister', 'hatch'), V('shop:sanct', 'the sisters'));
  J("The Font of Life", "Sweetie, the font is the only thing that can cleanse the egg. Every goon in the city is coming to destroy it. Hold them. Please.", "The font is safe, my hero. The egg will be cleansed. And you will get a very holy kiss.",
    S(60, 'shop:sanct'), K(14, 'shop:sanct'), S(70, 'shop:sanct'), K(16, 'shop:sanct'));

  W('blum', 'amy');
  J("Chilli Purge", ["Mild, hot or dynamite?", "Dynamite on the goons. They are mostly goo inside, and goo boils. The Blood Factory is full of them."], "Boiled goons. Not on the menu.",
    K(14, 'dist:factory'), K(10, 'dist:docks'));
  J("Spice Wall", "A ring of chilli round the Cafe Streets keeps the goo out. Five spots. Dynamite strength.", "The goo touched the line and went home. Smart goo.",
    G('hatch'), D(5, 'dist:cafe', 'Pour a pot of dynamite chilli at each spot'), K(12, 'dist:cafe'));
  J("Hot Head", ["Blumhead's head is full of goo. Wreck his tankers, then bring me chillies. Mild, hot or dynamite?", "Dynamite."], "Somewhere in a castle, a big purple head just sneezed.",
    X(3, 'truck', 'dist:factory', 'the goo tankers'), C(4, 'poi:farm', 'the chilli crates'), K(12, 'shop:amy'));
  J("The Chilli Apocalypse", "The hottest chilli ever made, poured into the goo beam at his castle. Either it stops the beam or it melts the city.", "It stopped the beam. For a bit. And I cannot feel my face. Dynamite.",
    C(5, 'poi:farm', 'the chilli crates'), G('saloon'), V('dist:blumc', 'the chilli'), S(60, 'dist:blumc'), K(14, 'dist:blumc'));

  W('blum', 'saba');
  J("Hitless Cult", "The goons are holding a ceremony at the Bone Pit, my friend. Break it up. Hitless.", "No hits. The goons are confused. Good.",
    K(14, 'poi:quarry'), S(45, 'poi:quarry'));
  J("Arms Race", "Blumhead's goons have been stealing guns from my shop. My guns, my friend. Their van is getting away.", "My guns are back. The goons have nothing. Clean.",
    CS('van', 'road:shop:saba', "the goons' van", 150), K(12, 'shop:saba'));
  J("Goo Beast", "A huge goo beast has come up at the building site, my friend, with goons all round it. Boss fight. Hitless.", "GG. The beast is gone. The chat says you are cracked.",
    K(12, 'dist:site'), K(1, 'dist:site', { hp: 900, what: 'the goo beast' }), S(60, 'dist:site'), K(14, 'dist:site'));
  J("The Final Run", "The last run, my friend. Every goon in Cum City between us and his castle. All of it. Hitless.", "Run complete, my friend. The best run I have ever watched.",
    K(12, 'dist:club'), K(12, 'dist:cafe'), K(14, 'dist:blumc'), S(60, 'dist:blumc'), K(16, 'dist:blumc'));

  W('blum', 'joff');
  J("Pineapple Cure", "Pineapple is the cure. Nobody believes me. Five deliveries round the Red Light District. If a goon eats it, they wake up.", "Two woke up. Three asked for no pineapple. They are lost forever.",
    G('scooter'), D(5, 'dist:red', 'Deliver a pineapple pizza to each door'), K(10, 'dist:red'));
  J("Purple Cheese", "The goo got into the cheese. Purple cheese. It whispers. The dairy at the farm is still clean.", "Clean cheese. Quiet cheese. Good cheese.",
    K(12, 'poi:farm'), C(5, 'poi:farm', 'the cheese wheels'));
  J("Night Delivery", "Night deliveries in the goo. The tips are terrible. Do it anyway.", "One tip. It was a tentacle. I am keeping it.",
    N(), G('scooter'), D(6, 'dist:cafe', 'Deliver a pizza to each door'), K(12, 'dist:cafe'));
  J("Pizza for the Final Battle", "The fighters at his castle need feeding before the last push. Pizza. Forty of them. Pineapple on every one.", "Forty pizzas, forty fighters. Pineapple wins the war.",
    G('van'), V('dist:blumc', 'the pizza van'), S(60, 'dist:blumc'), K(14, 'dist:blumc'), D(3, 'dist:blumc', 'Hand out the last pizzas'));

  W('blum', 'beeb');
  J("Clean Beer", "The goo is in the beer, lad. Purple beer. I would not serve it to TB. There are clean barrels at the docks.", "Clean beer, lad. The only thing I trust now.",
    K(12, 'dist:docks'), C(5, 'dist:docks', 'the barrels'));
  J("Lost Regulars", "Three regulars went purple, lad. They are at the cemetery with the goons. A pint will bring them back.", "They are at the bar. Bit purple. Still regulars.",
    N(), K(12, 'dist:cemetery'), D(3, 'dist:cemetery', 'Pick up each regular', 'hatch'), V('shop:beebs', 'the regulars'));
  J("Hail Beeb", "They are chanting outside, lad. Hail Blumhead. In my car park. I will not have chanting that is not football.", "Quiet again, lad. Just the way I like it.",
    S(60, 'shop:beebs'), K(14, 'shop:beebs'), S(60, 'shop:beebs'));
  J("The Last Pint", "Lad, this might be the last night of the world. Every regular is in. Every goon is outside. We are not closing.", "Last pint poured, lad. And it will not be the last. Same again tomorrow.",
    N(), S(70, 'shop:beebs'), K(16, 'shop:beebs'), S(70, 'shop:beebs'), K(16, 'shop:beebs'));

  W('blum', 'harold');
  J("Goo Samples", "Splendid! I need goo. Fresh goo, from the pools round his castle. Do bring a jar.", "Fascinating! It is ninety percent Blumhead. Ugh.",
    K(12, 'dist:blumc'), C(5, 'dist:blumc', 'the jars of goo'));
  J("Test Subjects", "The tea works on goons! I think. Test it on the ones at the cemetery. Splendid!", "Four woke up. One turned into a teapot. Progress!",
    N(), K(14, 'dist:cemetery'), S(45, 'poi:chapel'));
  J("The Antidote", "The antidote needs glowing moss, holy cream and a lot of tea. Fetch the moss. I shall put the kettle on.", "Splendid! The antidote is ready. Now to use it.",
    C(5, 'dist:grotto', 'the glowing moss'), K(12, 'shop:harold'), S(50, 'shop:harold'));
  J("Tea for Everyone", "The antidote, sprayed from the Spunk Brain dome over the whole city. It takes time. The goons will try to stop it.", "Splendid! The city is having a cup of tea. And half the goons have remembered their names.",
    G('ambulance'), V('poi:dome', 'the antidote'), S(70, 'poi:dome'), K(14, 'poi:dome'), S(60, 'poi:dome'));

  W('blum', 'kaya');
  J("Stay Awake", "The goo gets you when you sleep! Coffee to every house round Cum Hills!", "Everyone awake! Very awake! Maybe too awake!",
    G('hatch'), D(6, 'dist:hills', 'Drop a coffee at each house'));
  J("Cafe Siege", "Goons outside the cafe! They want Elden for the goo! Nobody takes Elden!", "Elden is safe! He said thanks! That is a speech, for him!",
    S(60, 'shop:cafe'), K(14, 'shop:cafe'));
  J("Bean Rescue", "The goons took the beans to his castle! They want the whole city to fall asleep! Get them back!", "Beans back! Triple shots all round!",
    K(12, 'dist:blumc'), C(5, 'dist:blumc', 'the sacks of beans'), K(10, 'shop:cafe'));
  J("Espresso Army", "Everyone fighting at the castle has to stay awake for the final night! We are bringing the whole cafe!", "The army is awake and buzzing! Go and get him!",
    G('van'), D(5, 'dist:club', 'Drop coffee at each post'), V('dist:blumc', 'the coffee'), S(60, 'dist:blumc'), K(14, 'dist:blumc'));

  W('blum', 'elden');
  J("Tentacle Hunt", ["More tentacles. Pirate Cove.", "I want them all."], "Good haul.",
    K(12, 'poi:cove'), C(4, 'poi:cove', 'the tentacles'));
  J("Goo in the Kitchen", ["Goo in the kitchen.", "Out."], "Clean.",
    K(12, 'shop:cafe'), S(50, 'shop:cafe'), K(10, 'shop:cafe'));
  J("Cleaver Night", ["Goons at the cemetery. Tonight.", "Bring the cleaver back clean."], "Not clean. Fine.",
    N(), K(14, 'dist:cemetery'), K(12, 'poi:chapel'), S(45, 'poi:chapel'));
  J("Last Supper", ["Feeding the fighters at the castle.", "They try to stop it, they get the cleaver."], "Fed. Go win.",
    G('van'), D(5, 'dist:club', 'Drop hot food at each post'), V('dist:blumc', 'the food'), K(14, 'dist:blumc'), S(60, 'dist:blumc'));

  W('blum', 'ali');
  J("Garlic Spray", "Garlic spray! Goons hate it. Spray it round the Red Light District. Everything is better with garlic.", "Every goon on that street is crying. Garlic tears.",
    G('hatch'), D(5, 'dist:red', 'Spray garlic at each corner'), K(12, 'dist:red'));
  J("Garlic Rescue", "A family is hiding in a garlic cellar in Little Load. The goons cannot get in. They cannot get out. Get them.", "Safe. They smell incredible.",
    K(12, 'poi:village'), D(3, 'poi:village', 'Pick up each of the family', 'van'), V('shop:ali', 'the family'));
  J("Garlic Mines", "Garlic bombs under the roads round his castle. When the goons march, boom. Garlic boom.", "Boom. Then garlic. Then more boom.",
    G('van'), D(5, 'dist:blumc', 'Plant a garlic mine at each spot'), K(14, 'dist:blumc'));
  J("The Garlic Crusade", "Every bulb left in Cum City, to his castle. If the goo hates garlic, let us give it all of it.", "The castle stinks. The goo is retreating. Everything is better with garlic. Everything.",
    C(6, 'poi:farm', 'the garlic crates'), G('van'), V('dist:blumc', 'the garlic'), S(60, 'dist:blumc'), K(16, 'dist:blumc'));

  W('blum', 'potbelly');
  J("High Score", "Kid, the goons stole the high score board. They put Blumhead at the top. He has never played. Get it back.", "High score board back. Blumhead wiped off. You are top now, kid.",
    K(12, 'dist:red'), C(3, 'dist:red', 'the bits of the high score board'));
  J("Cabinet Shelter", "Kid, the shelters want cabinets to stay sane while the goo spreads. Five of them, round Cum Hills.", "Five shelters, five games. Free to play.",
    D(5, 'dist:hills', 'Drop a cabinet at each shelter', 'van'), K(10, 'dist:hills'));
  J("Two Player", "Kid, they are coming in waves again. Three waves. This time I am playing too. Watch my belly.", "Three waves. My belly is fine. Thanks, kid.",
    K(12, 'shop:arcade'), K(14, 'shop:arcade'), K(14, 'shop:arcade'));
  J("Game Over, Blumhead", "Kid, the goons are bringing goo to the arcade to turn everyone inside. Thirty people. I have never closed early.", "Game over for the goo, kid. Insert no coin.",
    S(60, 'shop:arcade'), K(14, 'shop:arcade'), S(70, 'shop:arcade'), K(16, 'shop:arcade'));

  W('blum', 'pulsar');
  J("Counter Hum", "Friend. The goo hums. I hum back. Drive the speaker van round the Cafe Streets.", "The goo stopped humming. Vibes win.",
    D(5, 'dist:cafe', 'Play the counter hum at each spot', 'van'), K(10, 'dist:cafe'));
  J("Sewer Set", "Friend. The goo comes up from the Cream Sewers. A set down there will shake it loose.", "Loose goo. Gross vibes. But it worked.",
    K(12, 'poi:outfall'), S(60, 'poi:outfall'));
  J("Moon Frequency", "Friend. The moon is part of his plan. I play to the moon from the observatory. Hold them off.", "The moon heard me, friend. It winked.",
    N(), S(60, 'poi:observatory'), K(14, 'poi:observatory'));
  J("The Last Drop", "Friend. The final frequency, from the radio mast, just as the egg starts to crack. Keep me playing.", "The drop of my life. The goo let go of the city. Free of charge, friend.",
    G('van'), V('poi:mast', 'the speakers'), S(70, 'poi:mast'), K(14, 'poi:mast'), S(70, 'poi:mast'));

  W('blum', 'bonjo');
  J("Robes", "Welcome, welcome. The goons wear robes. Bad robes. Terrible stitching. Their robe vans are round the Red Light District.", "No more bad robes. Fashion is saved.",
    K(12, 'dist:red'), X(2, 'van', 'dist:red', 'the robe vans'));
  J("Leather Shield", "Welcome, welcome. Leather stops goo. I tested it. Leather jackets for every shelter in Cum Hills.", "Every shelter in leather. They look marvellous.",
    G('van'), D(6, 'dist:hills', 'Drop a leather jacket at each shelter'));
  J("The Ceremony Dress", "Welcome, welcome. Blumhead wants a dress for his ceremony. My leather. My designs. His goons are taking it away in a lorry.", "Nobody wears my designs to end the world.",
    CS('truck', 'road:shop:bonjo', 'the lorry with the ceremony dress', 180), K(10, 'shop:bonjo'));
  J("Dressed to Kill", "Welcome, welcome. The final battle needs style. Leather for every fighter, at his castle.", "The best dressed army in history. Lovely job.",
    G('van'), D(5, 'dist:club', 'Drop a leather jacket at each post'), V('dist:blumc', 'the leather'), S(60, 'dist:blumc'), K(14, 'dist:blumc'));

  W('blum', 't');
  J("Purple Clients", "Darling, some of my clients went purple. They still pay, but they say Hail Blumhead at the worst moment. Get my girls out of Cum Hills.", "Out safe, darling. They say the purple ones tip badly.",
    D(5, 'dist:hills', 'Pick up each girl', 'limo'), V('shop:t', 'the girls'));
  J("Motel of the Goo", "Darling, the Sticky Sheets Motel is full of goo. Not the good kind. My girls work there.", "Sticky again, the good kind.",
    K(12, 'poi:motel'), S(55, 'poi:motel'), K(10, 'poi:motel'));
  J("Girls with Guns", "Darling, my girls are armed and angry. They want to hit the goons at the Bone Pit. Drive them, and back them up.", "My girls, darling. Dangerous. Like you.",
    G('limo'), V('poi:quarry', 'the girls'), K(14, 'poi:quarry'), S(55, 'poi:quarry'));
  J("Red Moon, Red Lights", "Darling, under the red moon the goons are marching on my street. My girls are not running. Neither are you.", "The red lights burn brighter than his moon, darling.",
    N(), K(14, 'dist:red'), S(60, 'shop:t'), K(16, 'dist:red'), S(60, 'shop:t'));

  W('blum', 'jessiah');
  J("Pure Soup", "The goo is in the water. Soup made with goo is not soup. Clean water from the Cream Sewers pumps.", "Pure water. Pure soup.",
    K(12, 'poi:outfall'), C(4, 'poi:outfall', 'the water barrels'));
  J("The Lost Flock", "The goo took some of my flock. They are at the Cemetery Chapel, praying to him. Bring them back.", "They are home. They remember. Go with God, droplet.",
    N(), K(12, 'poi:chapel'), D(3, 'poi:chapel', 'Pick up each of the flock', 'van'), V('shop:jessiah', 'the flock'));
  J("Sanctuary of Soup", "They come for my kitchen. A kitchen is a church. Hold it.", "The kitchen holds. The soup is warm.",
    S(60, 'shop:jessiah'), K(14, 'shop:jessiah'), S(60, 'shop:jessiah'));
  J("Last Rites", "At St Spunk's tonight I give the last rites to the goo. Everyone who is still themselves will be there. So will his goons.", "The rites are given. The goo will not rise again. Go with God.",
    N(), G('van'), V('poi:church', 'the van'), S(70, 'poi:church'), K(16, 'poi:church'));

  W('blum', 'natty');
  J("Holy Steel", "Goo dulls a blade. A blade must be cleaned in holy cream. Bottles from the Sanctum.", "Clean steel. Holy steel.",
    K(12, 'shop:sanct'), C(4, 'shop:sanct', 'the bottles of holy cream'));
  J("Egg Hunt", "Eggs in the Forest. Small ones. A blade cracks an egg.", "Cracked. All of them.",
    K(12, 'dist:forest'), K(12, 'poi:logging'));
  J("Tentacle Cutter", "A tentacle has wrapped itself round the windmill, and his goons are guarding it. A blade was made for this.", "Cut. Your blade is proud.",
    K(12, 'poi:windmill'), S(55, 'poi:windmill'), K(12, 'poi:windmill'));
  J("The Egg Breaker", "The great egg will be guarded by his best. A blade must reach it. Clear the way to his castle.", "The way is open. Your blade is ready.",
    K(12, 'dist:grotto'), K(14, 'poi:grotto'), K(14, 'dist:blumc'), S(60, 'dist:blumc'));

  W('blum', 'fate');
  J("The Moon", "The Moon card. Upright. Madness. His goons are dancing at the Crimson Moon Altar.", "The Moon. Reversed. The madness ebbs.",
    N(), K(12, 'poi:altar'), S(45, 'poi:altar'));
  J("The Devil", "The Devil card. Chains. His goons have chained people up at the Bone Pit.", "The chains are broken. So is the card. I will need a new deck.",
    K(12, 'poi:quarry'), S(50, 'poi:quarry'), K(10, 'poi:quarry'));
  J("Death, Again", "Death again. Not an ending. A change. The goons at the cemetery are changing into something else.", "They will not change now. Death is satisfied.",
    N(), K(14, 'dist:cemetery'), K(12, 'poi:chapel'), S(50, 'poi:chapel'));
  J("The Fool", "The last card I will ever draw for this city. The Fool. A new beginning. You, walking into his castle.", "The Fool walks on. The deck is closed. Thank you.",
    K(12, 'dist:blumc'), S(60, 'dist:blumc'), K(14, BLC), S(60, BLC));

  W('blum', 'judge');
  J("Shadow Purge", "Shadow, tonight. Goons in the Forest, at the hunting cabin.", "Purged.",
    N(), K(12, 'poi:cabin'), S(45, 'poi:cabin'));
  J("Light Purge", "Light, today. Goo tankers on the move. Burn them.", "Burned.",
    X(3, 'truck', 'dist:factory', 'the goo tankers'), K(12, 'dist:factory'));
  J("The Trial", "His high priest stands trial at the asylum. His goons want to free him. They will not.", "Guilty.",
    K(12, 'poi:asylum'), S(60, 'poi:asylum'), K(1, 'poi:asylum', { hp: 800, what: 'the high priest' }));
  J("Final Judgement", "Light and shadow, both. Every goon at his castle. Judge them all.", "The city is judged. It is found worthy. Barely.",
    N(), K(14, 'dist:blumc'), S(60, 'dist:blumc'), K(16, BLC), S(60, BLC));

  W('blum', 'bates');
  J("Do Not Listen", "The goo whispers on the Ranger Lookout. One must sit there and not listen.", "One did not listen. One is proud.",
    S(50, 'poi:lookout'), K(12, 'poi:lookout'));
  J("Cleanse", "One must cleanse the picnic spot. The goons are having a picnic. A goo picnic.", "The picnic is over. One may sit.",
    K(12, 'poi:picnic'), S(50, 'poi:picnic'));
  J("Clarity", "One must reach Crimson Peak. Above the goo. Above the whispers. One must proceed.", "Clarity. One sees the whole city. One sees the egg.",
    K(12, 'dist:peak'), S(60, 'dist:peak'), K(12, 'dist:peak'));
  J("Inner Peace, Outer War", "One has found inner peace. Now one must find outer war. His castle. One proceeds.", "War is over. Peace returns. One proceeds to bed.",
    K(14, 'dist:blumc'), S(60, 'dist:blumc'), K(14, 'dist:blumc'), S(60, 'poi:view'));

  W('blum', 'steve');
  J("Goo Circus", [ST, TB("The goons have taken over the big top. They are holding a goo circus. Steve wants his circus back.")], [ST, TB("The circus is his. He is the ringmaster now. He is grinning in a top hat.")],
    K(12, 'poi:bigtop'), S(50, 'poi:bigtop'));
  J("Purple Coaster", [ST, TB("Goo is dripping off the coaster. Goons are riding it and chanting. Steve finds the chanting off-key.")], [ST, TB("Coaster clean. Steve rode it six times. Still grinning.")],
    K(12, 'poi:coaster'), S(50, 'poi:coaster'), K(10, 'poi:coaster'));
  J("Ghost Train of Goo", [ST, TB("Something with too many arms is living in the ghost train. Steve went in. Steve came out faster.")], [ST, TB("Whatever it was, it is gone. Steve has put up a sign. STILL SCARY.")],
    N(), K(12, 'poi:ghost'), K(1, 'poi:ghost', { hp: 720, what: 'the thing in the ghost train' }), S(50, 'poi:ghost'));
  J("Throne Room", [ST, TB("Blumhead wants Ejaculand for his throne room. Every ride. Steve says no. Steve has never said anything. That is how serious this is.")], [ST, TB("Ejaculand is Steve's. Forever. He grinned so hard his face clicked.")],
    K(12, 'poi:carousel'), K(12, 'poi:ferris'), K(14, 'poi:gate'), S(70, 'poi:gate'));

  /* pay: each job pays more than the last, and each chapter more than the one before (the first job of each set too) */
  MISSIONS.forEach(function (m) { if (!m.chapJob) return; var k = m.jobK || 1; m.jobK = k; m.pay = Math.round(BASE[m.chap] * (1 + 0.35 * (k - 1)) / 50) * 50; });
})();
