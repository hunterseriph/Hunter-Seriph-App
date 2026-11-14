/* ---------- missions: each character's own run of jobs, a glimpse into their life, unlocked in order, and the three
   chapters (the zombie apocalypse, the robot uprising, Blumhead's plan). Steps are data: talk, go, getin, drive, kill,
   chase, collect, survive, follow, deliver, stunt, wait, fn. ---------- */
function placeOf(sp) {
  if (!sp) return null; if (typeof sp === 'object') return sp; var a = sp.split(':');
  if (a[0] === 'shop') { var s = SHOPS[a[1]]; if (!s) return null; var d = doorOf(s.b); return { x: d.x + Math.sin(d.a) * 2.8 + Math.cos(d.a) * 3.6, z: d.z + Math.cos(d.a) * 2.8 - Math.sin(d.a) * 3.6, a: d.a }; }
  if (a[0] === 'poi') { var p = POIS.filter(function (q) { return q.k === a[1] && (!a[2] || q.name === a[2]); })[0]; if (!p) return null; return { x: p.x + (+a[3] || 0), z: p.z + (+a[4] || 0) }; }
  if (a[0] === 'dist') { var d2 = DIST[DISTID[a[1]]]; return { x: d2.cx, z: d2.cz }; }
  if (a[0] === 'xz') return { x: +a[1], z: +a[2] };
  if (a[0] === 'road') { var b = placeOf(a.slice(1).join(':')), r = nearestRoad(b.x, b.z, 80); return r ? { x: r.x, z: r.z, a: Math.atan2(r.dx, r.dz), E: r.E, s: r.s } : b; }
  if (a[0] === 'house') { var h = HOUSES.filter(function (q) { return q.id === a[1]; })[0]; var dd = doorOf(h.b); return { x: dd.x + Math.sin(dd.a) * 2, z: dd.z + Math.cos(dd.a) * 2 }; }
  return null;
}
function roadNear(sp, off) { var b = placeOf(sp), a = Math.random() * 6.28, x = b.x + Math.sin(a) * (off || 0), z = b.z + Math.cos(a) * (off || 0), r = nearestRoad(x, z, 120); return r ? { x: r.x, z: r.z, a: Math.atan2(r.dx, r.dz), E: r.E, s: r.s } : b; }
var MISSIONS = [];
function MI(o) { MISSIONS.push(o); return o; }
var T2 = function () { return pick(TBQUOTES2); };
/* ---------- Chapter One: Welcome to Cum City ---------- */
MI({ id: 'lab1', who: 'lab', title: 'Fresh Off the Bus', at: 'shop:club', chap: 'one', pay: 200, steps: [
  { t: 'talk', lines: [['lab', 'Cumhead! You made it. Welcome to Cum City, the greatest load of a city there ever was.'], ['lab', 'First job, nice and easy. Greebo has a tray of cream pies for the Clubhouse. My old Cumbo is round the side.'], ['lab', 'Get them back here hot. Cold cream pie is a crime even the police care about.']] },
  { t: 'getin', type: 'hatch', at: 'road:shop:club', msg: 'Get in Shithead Laboozie\'s Cumbo.' },
  { t: 'go', to: 'shop:greebo', car: 1, msg: 'Drive to Greebo\'s Gourmet Goonery.' },
  { t: 'talk', lines: [['greebo', 'Fresh cream pies. Don\'t ask what\'s in them.'], ['greebo', 'Ninety seconds before they sag. Go, go!']] },
  { t: 'go', to: 'shop:club', car: 1, time: 90, msg: 'Get the pies to the Clubhouse before they go cold.' },
  { t: 'talk', lines: [['lab', 'Still steaming. You\'re a natural, droplet. Here, have some drops for your trouble.'], ['lab', 'Have a look round. Everyone in this city wants something done.']] }] });
MI({ id: 'greebo1', who: 'greebo', title: 'Pie in the Sky', at: 'shop:greebo', chap: 'one', req: ['lab1'], pay: 450, steps: [
  { t: 'talk', lines: [['greebo', 'Disaster! My secret ingredient van has been nicked. A Cream Van full of... the secret ingredient.'], ['greebo', 'TB\'s boys took it towards the docks. Bring it back. Do not open the back.']] },
  { t: 'chase', type: 'van', at: 'road:dist:docks', crew: 'gimp', hp: 60, msg: 'Stop the stolen Cream Van: ram it until it stalls.', stall: 1 },
  { t: 'getin', type: 'van', target: 'chase', msg: 'Get in the Cream Van.' },
  { t: 'go', to: 'shop:greebo', car: 1, msg: 'Take the van back to Greebo.' },
  { t: 'talk', lines: [['greebo', 'Not a single dent in the ingredient. You did not open the back, did you?'], ['greebo', 'Good. Some things are better left a mystery.']] }] });
MI({ id: 'amy1', who: 'amy', title: 'Dynamite', at: 'shop:amy', chap: 'one', req: ['lab1'], pay: 500, steps: [
  { t: 'talk', lines: [['amy', 'Mild, hot or dynamite? Today it\'s dynamite. The Ejaculand Chilli Cook-Off starts in four minutes.'], ['amy', 'The pot is in the back of my car. Drive gently. If it spills, it eats through the floor.']] },
  { t: 'getin', type: 'saloon', at: 'road:shop:amy', msg: 'Get in Amy\'s car.' },
  { t: 'deliver', to: 'poi:gate', car: 1, time: 240, minHp: 70, msg: 'Get the chilli to Ejaculand. Do not crash.' },
  { t: 'talk', lines: [['amy', 'The judges cried. Two of them saw God. We won!'], ['amy', 'Here, your cut. And a jar of the dynamite for emergencies.']] }] });
MI({ id: 'saba1', who: 'saba', title: 'Hitless Run', at: 'shop:saba', chap: 'one', req: ['lab1'], pay: 700, give: ['pistol', 48], steps: [
  { t: 'talk', lines: [['saba', 'Hitless runs only. Take a look, my friend.'], ['saba', 'TB\'s gimps are squatting in the Cumstruction Site, scaring my customers off. Here is a Cream Pistol.'], ['saba', 'Clear them out. And if you take a hit, do it quietly. I have a reputation.']] },
  { t: 'go', to: 'dist:site', r: 30, msg: 'Go to the Cumstruction Site.' },
  { t: 'kill', spawn: [{ who: 'gimp', n: 6, at: 'dist:site', wpn: null, spread: 20 }], msg: 'Clear out the gimps.' },
  { t: 'talk', lines: [['saba', 'Clean work. Come back when you want a bigger gun. I am always open.']] }] });
MI({ id: 'kaya1', who: 'kaya', title: 'Bean There', at: 'shop:cafe', chap: 'one', req: ['lab1'], pay: 400, steps: [
  { t: 'talk', lines: [['kaya', 'Welcome in! Kaya\'s on the coffee, Elden\'s on the grill... and nobody is on the beans, because the bean truck tipped over on the coast road.'], ['elden', 'Six sacks of Cum City Roast all over the tarmac. Grab them before the gulls do.']] },
  { t: 'collect', n: 6, around: 'poi:pierend', spread: 160, time: 300, tile: 'crate', msg: 'Pick up the sacks of coffee beans.' },
  { t: 'go', to: 'shop:cafe', msg: 'Take the beans back to the Cum Café.' },
  { t: 'talk', lines: [['kaya', 'Cumpuccinos are back on! Elden, put the grill on.'], ['elden', 'It\'s been on since 2019.']] }] });
MI({ id: 'joff1', who: 'joff', title: 'Fight Me', at: 'shop:joff', chap: 'one', req: ['lab1'], pay: 450, steps: [
  { t: 'talk', lines: [['joff', 'Pineapple belongs on pizza. Fight me.'], ['joff', 'No, really. There are five fellas outside with placards saying it doesn\'t. Fists only, mind. We are not animals.']] },
  { t: 'kill', spawn: [{ kind: 'cit', n: 5, at: 'shop:joff', spread: 8, angry: 1, hp: 30, placard: 1 }], fists: 1, msg: 'Persuade the protestors. Fists only.' },
  { t: 'talk', lines: [['joff', 'Debate won. Free slice, any topping you like, as long as it\'s pineapple.']] }] });
MI({ id: 'beeb1', who: 'beeb', title: 'Last Orders', at: 'shop:beebs', chap: 'one', req: ['greebo1'], pay: 900, steps: [
  { t: 'talk', lines: [['beeb', 'Sit down, lad. First one\'s always warm.'], ['beeb', 'My kegs came in on a boat last night. Imported. Very imported. The police would love to know how imported.'], ['beeb', 'The Load Hauler is at the docks. Bring it to the tavern.']] },
  { t: 'getin', type: 'truck', at: 'road:dist:docks', msg: 'Get in the Load Hauler at the docks.', wanted: 2 },
  { t: 'go', to: 'shop:beebs', car: 1, msg: 'Get the kegs to Uncle Beeb\'s Tavern. Lose the police if you can.' },
  { t: 'talk', lines: [['beeb', 'Ha! First one\'s on the house. Second one too. Third one, you\'re washing up.']] }] });
MI({ id: 'tb1', who: 'tb', title: 'Silly Pills', at: 'shop:tb', chap: 'one', req: ['joff1'], pay: 800, steps: [
  { t: 'talk', lines: [['tb', T2], ['lab', 'TB wants you to drop his pills round the red light district. Four customers. Do NOT take any.'], ['tb', T2]] },
  { t: 'fn', fn: function () { G.pilled = 0.7; } },
  { t: 'drops', n: 4, around: 'dist:red', spread: 120, msg: 'Drop TB\'s pills at the doors. Something is wrong with the colours.' },
  { t: 'talk', lines: [['tb', T2], ['tb', T2]] }] });
MI({ id: 'pot1', who: 'potbelly', title: 'High Score', at: 'shop:arcade', chap: 'one', req: ['saba1'], pay: 900, steps: [
  { t: 'talk', lines: [['potbelly', 'Cabinets are free, kid. Play all you like. Except somebody took my best one.'], ['potbelly', 'The Load Stopper cabinet. It is in the Bone Pit with a bunch of clowns round it. Clowns, kid. Bring a truck.']] },
  { t: 'getin', type: 'truck', at: 'road:shop:arcade', msg: 'Take Potbelly\'s truck.' },
  { t: 'go', to: 'poi:quarry', r: 25, car: 1, msg: 'Drive to the Bone Pit.' },
  { t: 'kill', spawn: [{ who: 'clown', n: 4, at: 'poi:quarry', spread: 14 }, { who: 'pieclown', n: 2, at: 'poi:quarry', spread: 14 }], msg: 'Deal with the clowns.' },
  { t: 'go', to: 'poi:quarry', r: 6, msg: 'Load the cabinet onto the truck.', car: 1 },
  { t: 'go', to: 'shop:arcade', car: 1, msg: 'Bring the cabinet back to Potbelly Arcade.' },
  { t: 'talk', lines: [['potbelly', 'My baby! Have a free go. Every go is free, I said that already. Here, take some drops.']] }] });
MI({ id: 'pulsar1', who: 'pulsar', title: 'Drop the Bass', at: 'shop:pulsar', chap: 'one', req: ['kaya1'], pay: 1000, steps: [
  { t: 'talk', lines: [['pulsar', 'Just vibes, friend. Free of charge.'], ['pulsar', 'I have a gig at the docks tonight. The speakers are in a van in the Blood Factory. Rival DJs want to stop the show.']] },
  { t: 'getin', type: 'van', at: 'road:dist:factory', msg: 'Get the speaker van at the Blood Factory.' },
  { t: 'go', to: 'poi:crane', r: 22, car: 1, msg: 'Drive the speakers to the docks.' },
  { t: 'survive', time: 60, kind: 'goon', at: 'poi:crane', msg: 'Keep the rival DJs off the stage while Pulsar sets up.' },
  { t: 'talk', lines: [['pulsar', 'Feel that? That is the bass, friend. Have a mixtape. It is free. Everything is free.']] }] });
MI({ id: 'sperm1', who: 'spermaid', title: 'Message in a Bottle', at: 'shop:sanct', chap: 'one', req: ['pulsar1'], pay: 1200, steps: [
  { t: 'talk', lines: [['spermaid', 'Sweetie! Even down here I keep a little stall.'], ['spermaid', 'My sisters on the Sperm Isles have sent me letters in bottles, but the tide has scattered them. Take a boat from the pier and fish them out?']] },
  { t: 'getin', type: 'speedboat', at: 'poi:boats', msg: 'Take a boat.' },
  { t: 'collect', n: 5, around: 'poi:sanctum', spread: 180, water: 1, time: 360, tile: 'i_note', msg: 'Pick up the bottles floating round the Sperm Isles.' },
  { t: 'go', to: 'poi:sanctum', r: 14, msg: 'Take the letters to Spermaid\'s Sanctum on the isles.' },
  { t: 'talk', lines: [['spermaid', 'They say the sea is warm and the cream is fresh. They also say you are cute. I told them you are taken. By me. As a friend!']] }] });
MI({ id: 'harold1', who: 'harold', title: 'The Cat That Got the Cream', at: 'shop:harold', chap: 'one', req: ['amy1'], pay: 800, steps: [
  { t: 'talk', lines: [['harold', 'Potions? Tea? Same thing, really. Sit, sit!'], ['harold', 'Sir Johnathan came for tea and has wandered off up the hills. Greebo will have kittens. Well, Sir Johnathan will.'], ['harold', 'Follow the paw prints. Bring him home.']] },
  { t: 'trail', from: 'poi:grotto', n: 6, msg: 'Follow Sir Johnathan\'s paw prints.' },
  { t: 'go', to: 'poi:grotto', r: 10, msg: 'Sir Johnathan is asleep at the Grotto. Pick him up.' },
  { t: 'go', to: 'shop:harold', msg: 'Bring Sir Johnathan back to Harold\'s Mad Tea Party.' },
  { t: 'talk', lines: [['harold', 'There he is! Had a lovely nap, did we? Tea is on me. Everything is on me, actually, I spilled it.']] }] });
MI({ id: 't1', who: 't', title: 'Doors', at: 'shop:t', chap: 'one', req: ['tb1'], pay: 1500, steps: [
  { t: 'talk', lines: [['t', 'Come in, darling. I\'ll get the doors.'], ['t', 'A very important client needs the airport by midnight. The limo is outside. Smooth driving, darling, he has had a long night.']] },
  { t: 'getin', type: 'limo', at: 'road:shop:t', msg: 'Get in the Loadsamoney Limo.' },
  { t: 'deliver', to: 'poi:terminal', car: 1, time: 260, minHp: 60, msg: 'Get the client to the airport. Gently.' },
  { t: 'talk', lines: [['t', 'He tipped well. He always tips well. Here, darling, your share.']] }] });
MI({ id: 'bonjo1', who: 'bonjo', title: 'Fashion Emergency', at: 'shop:bonjo', chap: 'one', req: ['tb1'], pay: 1100, steps: [
  { t: 'talk', lines: [['bonjo', 'Welcome, welcome. Let me get the door.'], ['bonjo', 'A rival boutique stole my new collection on a motorbike. Get it back, and the bike too. Matching is everything.']] },
  { t: 'chase', type: 'moto', at: 'road:dist:club', hp: 30, msg: 'Knock the thief off the Spunk Rocket.', stall: 1 },
  { t: 'getin', type: 'moto', target: 'chase', msg: 'Get on the Spunk Rocket.' },
  { t: 'go', to: 'shop:bonjo', car: 1, msg: 'Bring the bike back to Bonjo.' },
  { t: 'talk', lines: [['bonjo', 'You smell of exhaust and victory. It suits you.']] }] });
MI({ id: 'ali1', who: 'ali', title: 'Garlic Breath', at: 'shop:ali', chap: 'one', req: ['harold1'], pay: 1300, steps: [
  { t: 'talk', lines: [['ali', 'Nuggets? Garlic bread? Everything is better with garlic.'], ['ali', 'Something is draining the blood bags at the cemetery chapel at night. Bloodsuckers. Take this garlic bread and a bat.']] },
  { t: 'fn', fn: function () { giveWeapon('bat', 0); G.garlic = 400; } },
  { t: 'night' },
  { t: 'go', to: 'poi:chapel', r: 20, msg: 'Go to the cemetery chapel.' },
  { t: 'kill', spawn: [{ kind: 'goon', n: 7, at: 'poi:chapel', spread: 22 }], msg: 'See off the bloodsuckers.' },
  { t: 'talk', lines: [['ali', 'Garlic. Never fails. Except on dates.']] }] });
MI({ id: 'natty1', who: 'natty', title: 'A Blade Without a Bite', at: 'shop:natty', chap: 'one', req: ['ali1'], pay: 1400, steps: [
  { t: 'talk', lines: [['natty', 'A blade without a bite is merely a stick.'], ['natty', 'Jessiah borrowed my enchanted blade and rode off to Cumhead\'s Castle to show it to the stones. Beat him there on a bike and bring it back.']] },
  { t: 'getin', type: 'moto', at: 'road:shop:natty', msg: 'Get on the bike.' },
  { t: 'race', to: 'poi:castle', rival: 'jessiah', rtype: 'moto', msg: 'Beat Jessiah to Cumhead\'s Castle.' },
  { t: 'talk', lines: [['jessiah', 'An empty stomach makes a hollow man. Eat. And take the blade, you won it.'], ['natty', 'The bite returns. Your fists will remember this.']] }], after: function () { SV.str = (SV.str || 0) + 1; } });
MI({ id: 'fate1', who: 'fate', title: 'The Deck', at: 'shop:fate', chap: 'one', req: ['bonjo1'], pay: 1500, steps: [
  { t: 'talk', lines: [['fate', 'The deck was never yours. Neither was your fate.'], ['fate', 'Five of my cards blew out of the window. They landed where they are needed most. Find them before the dawn.']] },
  { t: 'collect', n: 5, around: 'dist:club', spread: 520, time: 600, tile: 'star5', msg: 'Find Stacked Fate\'s five cards across the city.' },
  { t: 'go', to: 'shop:fate', msg: 'Bring the cards back.' },
  { t: 'talk', lines: [['fate', 'The Tower, the Moon, the Load, the Fool and... you. Interesting. Very interesting.']] }] });
MI({ id: 'judge1', who: 'judge', title: 'Light or Shadow', at: 'shop:judge', chap: 'one', req: ['natty1'], pay: 1200, steps: [
  { t: 'talk', lines: [['judge', 'Light or shadow. Both have a price.'], ['judge', 'A soul is fading at the Bone Pit. Take the ambulance and get them to the hospital while there is light in them.']] },
  { t: 'getin', type: 'ambulance', at: 'road:shop:judge', msg: 'Get in the ambulance.' },
  { t: 'go', to: 'poi:quarry', r: 25, car: 1, msg: 'Drive to the Bone Pit.' },
  { t: 'deliver', to: 'shop:hosp', car: 1, time: 200, minHp: 30, msg: 'Get the patient to Cum City Hospital.' },
  { t: 'talk', lines: [['judge', 'Light, this time. Remember the feeling.']] }] });
MI({ id: 'steve1', who: 'steve', title: 'Must Be This Loaded', at: 'poi:gate', chap: 'one', req: ['amy1'], pay: 1000, steps: [
  { t: 'talk', lines: [['steve', '...'], ['lab', 'Steve wants you to do three stunt jumps. He can\'t talk, he just grins. I\'m translating the grin.']] },
  { t: 'stunts', n: 3, msg: 'Do three stunt jumps anywhere in Cum City (look for the ramps).' },
  { t: 'talk', lines: [['steve', '...'], ['lab', 'That grin means you\'re loaded enough. Free rides for life.']] }] });
MI({ id: 'jess1', who: 'jessiah', title: 'Hollow Men', at: 'shop:jessiah', chap: 'one', req: ['fate1'], pay: 1300, steps: [
  { t: 'talk', lines: [['jessiah', 'An empty stomach makes a hollow man. Eat.'], ['jessiah', 'Take the Cream Dream round the city. Six crowds are waiting. Stop by each and they will eat.']] },
  { t: 'getin', type: 'icecream', at: 'road:shop:jessiah', msg: 'Get in the Cream Dream ice cream van.' },
  { t: 'drops', n: 6, around: 'dist:cafe', spread: 300, car: 1, crowd: 1, msg: 'Stop at each crowd so they can eat.' },
  { t: 'talk', lines: [['jessiah', 'Full bellies, full hearts. You have done a knight\'s work.']] }] });
MI({ id: 'lab2', who: 'lab', title: 'Flaming Bags', at: 'shop:club', chap: 'one', req: ['tb1', 'saba1'], pay: 1200, give: ['bag', 6], steps: [
  { t: 'talk', lines: [['lab', 'Time you learned the family trade. The Flaming Bag of Shit.'], ['lab', 'TB has four cars parked in the red light district. He said, and I quote, "' + TBQUOTES2[17] + '". So we torch them.']] },
  { t: 'destroy', n: 4, type: 'muscle', around: 'dist:red', spread: 70, msg: 'Torch TB\'s four cars.' },
  { t: 'talk', lines: [['lab', 'Beautiful. Smell that? Victory. Also shit.']] }] });
MI({ id: 'tb2', who: 'tb', title: 'Shot Rope', at: 'shop:tb', chap: 'one', req: ['lab2', 'pulsar1'], pay: 2500, steps: [
  { t: 'talk', lines: [['tb', T2], ['lab', 'Brothers Load are playing the docks and TB is on the bill. He has to be there in four minutes and he cannot drive. Look at him.'], ['tb', T2]] },
  { t: 'getin', type: 'muscle', at: 'road:shop:tb', msg: 'Get in the Dickhead Charger.' },
  { t: 'go', to: 'poi:crane', r: 22, car: 1, time: 240, msg: 'Get TB to the Brothers Load gig at the docks.' },
  { t: 'fn', fn: function () { radioSpecial('shotrope'); } },
  { t: 'talk', lines: [['tb', T2], ['lab', 'That was Shot Rope. TB cried. I cried. The pills cried.']] }] });
MI({ id: 'bates1', who: 'bates', title: 'Clear Your Head', at: 'shop:bates', chap: 'one', req: ['judge1', 'steve1'], pay: 2000, steps: [
  { t: 'talk', lines: [['bates', 'One must clear one\'s head before one proceeds.'], ['bates', 'Drive to the Crimson Moon Altar on the peak. No police. No hurry. Breathe.']] },
  { t: 'go', to: 'poi:altar', r: 14, nowanted: 1, msg: 'Get to the Crimson Moon Altar without being wanted.' },
  { t: 'talk', lines: [['bates', 'Look down. All of Cum City. Something is wrong down there, and it has been for a long time.'], ['bates', 'Someone took the Crimson Moon Trophy from this altar years ago. The answer is scattered round the city. Find the clues. Ask me when you are stuck.']] }], after: function () { SV.mysteryOn = 1; toast('THE MYSTERY has begun: look for clues (purple on the map).'); } });
/* ---------- Chapter Two: Dead Loads (the zombie apocalypse) ---------- */
MI({ id: 'z1', who: 'harold', title: 'Tea Time of the Dead', at: 'shop:harold', chap: 'zombie', req: ['tb2', 'bates1'], pay: 2500, startChap: 'zombie', steps: [
  { t: 'talk', lines: [['harold', 'Ah. About the tea. I may have mixed a little something from Spunk Brain Labs into the batch.'], ['harold', 'Everyone who drank it is... peckish. For people. Mostly at night. Hold the cafe streets while I think!']] },
  { t: 'night' }, { t: 'survive', time: 90, kind: 'zombie', at: 'shop:harold', msg: 'Hold the Cafe Streets against the dead.' },
  { t: 'talk', lines: [['harold', 'Splendid! I have a cure. I think. It needs holy cream.']] }] });
MI({ id: 'z2', who: 'spermaid', title: 'Holy Cream', at: 'shop:sanct', chap: 'zombie', req: ['z1'], pay: 3000, steps: [
  { t: 'talk', lines: [['spermaid', 'Holy cream? Sweetie, I have the only font of it on the Sperm Isles, and two more drops are kept at the chapel and the castle.']] },
  { t: 'go', to: 'poi:chapel', r: 12, msg: 'Fetch holy cream from the cemetery chapel.' }, { t: 'kill', spawn: [{ kind: 'zombie', n: 6, at: 'poi:chapel', spread: 18 }], msg: 'The dead are guarding it.' },
  { t: 'go', to: 'poi:castle:Cumhead\'s Castle', r: 20, msg: 'Fetch holy cream from Cumhead\'s Castle.' }, { t: 'go', to: 'poi:sanctum', r: 12, msg: 'Fetch the last drop from the Sanctum on the isles.' },
  { t: 'go', to: 'shop:harold', msg: 'Take the holy cream to Harold.' }, { t: 'talk', lines: [['harold', 'Holy cream, Spunk Brain residue, a dash of milk. The cure!']] }] });
MI({ id: 'z3', who: 'saba', title: 'Hitless Apocalypse', at: 'shop:saba', chap: 'zombie', req: ['z2'], pay: 4000, give: ['shotgun', 24], endChap: 'zombie', steps: [
  { t: 'talk', lines: [['saba', 'Hitless runs only, even at the end of the world. Here is a shotgun.'], ['saba', 'Drive the cure to the Spunk Brain dome. They will spray it over the whole city.']] },
  { t: 'getin', type: 'ambulance', at: 'road:shop:saba', msg: 'Get in the ambulance with the cure.' },
  { t: 'deliver', to: 'poi:dome', car: 1, time: 240, minHp: 25, msg: 'Get the cure to Spunk Brain Labs.', horde: 'zombie' },
  { t: 'talk', lines: [['saba', 'The sky is raining cure. The dead are just... tired now. Good run, my friend.']] }] });
/* ---------- Chapter Three: Rise of the Machines ---------- */
MI({ id: 'r1', who: 'potbelly', title: 'Game Over', at: 'shop:arcade', chap: 'robot', req: ['z3'], pay: 3500, startChap: 'robot', steps: [
  { t: 'talk', lines: [['potbelly', 'Kid. The cleaning robots from Spunk Brain have taken over my arcade. And the city. They want everything spotless.'], ['potbelly', 'Three robot vans are carrying the brain chips. Wreck them.']] },
  { t: 'destroy', n: 3, type: 'van', around: 'dist:brain', spread: 200, moving: 1, robots: 1, msg: 'Wreck the three robot vans.' },
  { t: 'talk', lines: [['potbelly', 'Game over for them. Insert coin to continue... no, keep your coin.']] }] });
MI({ id: 'r2', who: 'pulsar', title: 'Feedback Loop', at: 'shop:pulsar', chap: 'robot', req: ['r1'], pay: 4000, steps: [
  { t: 'talk', lines: [['pulsar', 'The robots hate noise, friend. I will play feedback through the dome\'s speakers. You keep them off me.']] },
  { t: 'go', to: 'poi:dome', r: 20, msg: 'Go to the Spunk Brain dome.' }, { t: 'survive', time: 75, kind: 'robot', at: 'poi:dome', msg: 'Hold off the robots while Pulsar drops the feedback.' },
  { t: 'talk', lines: [['pulsar', 'Their circuits are vibing. Vibing very hard. One more job.']] }] });
MI({ id: 'r3', who: 'lab', title: 'Unplugged', at: 'shop:club', chap: 'robot', req: ['r2'], pay: 5000, give: ['rocket', 6], endChap: 'robot', steps: [
  { t: 'talk', lines: [['lab', 'The robots run on the Blood Factory chimneys. Three power nodes. Here, a Meatnado Launcher. Do not point it at me.']] },
  { t: 'nodes', at: 'chimney', msg: 'Destroy the power nodes at the three chimneys.' },
  { t: 'talk', lines: [['lab', 'Lights out for the robots. Lights out for half the city too. Worth it.']] }] });
/* ---------- Chapter Four: Blumhead's Plan ---------- */
MI({ id: 'b1', who: 'greebo', title: 'Goo Tube', at: 'shop:greebo', chap: 'blum', req: ['r3'], pay: 4000, startChap: 'blum', steps: [
  { t: 'talk', lines: [['greebo', 'Blumhead! His goo is in the water. In the cream. In my PIES.'], ['greebo', 'A goo tanker is heading for the Cream River. Stop it.']] },
  { t: 'chase', type: 'truck', at: 'road:dist:factory', crew: 'goon', hp: 140, msg: 'Destroy Blumhead\'s goo tanker.' },
  { t: 'talk', lines: [['greebo', 'That is one tanker. He has a castle full of them.']] }] });
MI({ id: 'b2', who: 'spermaid', title: 'The Black Keep', at: 'shop:sanct', chap: 'blum', req: ['b1'], pay: 5000, steps: [
  { t: 'talk', lines: [['spermaid', 'Sweetie, I can feel him. Blumhead is hatching something in his castle. An egg the size of a bus.'], ['spermaid', 'Get into the courtyard of the Black Keep. Be careful. Be brave. Be back.']] },
  { t: 'go', to: 'poi:castle:Blumhead\'s Castle', r: 40, msg: 'Get to Blumhead\'s Castle.' }, { t: 'kill', spawn: [{ kind: 'goon', n: 10, at: 'poi:castle:Blumhead\'s Castle', spread: 24, wpn: 'pistol' }], msg: 'Clear the gate.' },
  { t: 'talk', lines: [['spermaid', 'The egg is cracking. Everyone is coming, Cumhead. Everyone.']] }] });
MI({ id: 'b3', who: 'tb', title: 'The Hatching', at: 'shop:club', chap: 'blum', req: ['b2'], pay: 25000, endChap: 'blum', final: 1, steps: [
  { t: 'talk', lines: [['lab', 'This is it. Saba is bringing guns. Amy is bringing chilli. TB is bringing... himself.'], ['tb', T2], ['lab', 'Let\'s go hatch an omelette.']] },
  { t: 'go', to: 'poi:castle:Blumhead\'s Castle', r: 20, msg: 'Go to the courtyard of Blumhead\'s Castle.' },
  { t: 'boss', at: 'poi:castle:Blumhead\'s Castle', msg: 'Stop Blumhead.' },
  { t: 'talk', lines: [['spermaid', 'He\'s gone back into his egg. And the egg is gone back into the ground. Cum City is ours again.'], ['lab', 'Party at the Clubhouse. Bring cream.'], ['tb', T2]] }], after: function () { bigText('CUM CITY IS YOURS', 'Thanks for playing. The city keeps going.', '#ffe36a', 6); SV.won = 1; } });
/* ---------- running a mission ---------- */
var MS = null; // { m, i, st (step state) }
function missionAvailable(m) { if (SV.done[m.id]) return false; if (m.req && !m.req.every(function (r) { return SV.done[r]; })) return false; if (m.chap !== 'one' && !m.startChap && G.chapter !== m.chap) return false; if (G.mission) return false; return true; }
function startMission(m) {
  G.mission = m; MS = { m: m, i: -1, spawned: [], veh: null }; if (m.startChap) { G.chapter = SV.chapter = m.startChap; bigText({ zombie: 'DEAD LOADS', robot: 'RISE OF THE MACHINES', blum: "BLUMHEAD'S PLAN" }[m.startChap], 'A new chapter in Cum City', '#c4121c', 4); }
  if (m.give) giveWeapon(m.give[0], m.give[1]);
  bigText(m.title, CAST[m.who] ? CAST[m.who].name : '', '#ffe36a', 2.5); nextStep();
}
function nextStep() { MS.i++; MS.st = { t: 0 }; G.objective = null; G.timer = null; G.counter = null; G.mission.mark = null; var s = MS.m.steps[MS.i]; if (!s) return missionPass(); stepInit(s); }
function missionPass() { var m = MS.m; SV.done[m.id] = 1; money(m.pay || 0); if (m.after) m.after(); if (m.endChap) { G.chapter = SV.chapter = 'free'; } cleanupMission(); bigText('MISSION PASSED', '+$' + (m.pay || 0).toLocaleString('en-GB'), '#ffe36a', 3.5); sfx.play('win'); persist(); worldSetup(); }
function missionFail(why) { if (!G.mission) return; cleanupMission(); bigText('MISSION FAILED', why || '', '#c4121c', 3.5); sfx.play('lose'); worldSetup(); }
function cleanupMission() { if (MS) { MS.spawned.forEach(function (p) { p.mission = 0; p.keep = 0; p.ctl = null; }); VEH.forEach(function (v) { if (v.mission && v !== (P && P.veh)) { v.mission = 0; } }); } G.mission = null; MS = null; G.objective = null; G.timer = null; G.counter = null; G.cut = null; G.talk = null; PICKUPS = PICKUPS.filter(function (q) { return !q.mission; }); G.blips = []; }
function stepInit(s) {
  var st = MS.st; G.objective = s.msg || null;
  if (s.t === 'talk') { castFor(s.lines); G.cut = { lines: s.lines.map(function (l) { return [l[0], typeof l[1] === 'function' ? l[1]() : l[1]]; }), i: -1 }; cutNext(); }
  else if (s.t === 'getin') { var at = s.target === 'chase' ? null : roadNear(s.at, 0); if (s.target === 'chase') { st.v = MS.chase; } else { st.v = makeVeh(s.type, at.x, at.z, at.a || 0, { mission: 1, col: 0 }); } MS.veh = st.v; if (s.wanted) { SV.wanted = Math.max(SV.wanted, s.wanted); SV.heat = Math.max(SV.heat, [0, 0.5, 1.6, 3.6][s.wanted]); } }
  else if (s.t === 'go' || s.t === 'deliver') { st.to = placeOf(s.to); if (s.time) G.timer = s.time; if (s.horde) st.horde = s.horde; }
  else if (s.t === 'kill') { st.list = []; s.spawn.forEach(function (g0) { var c = placeOf(g0.at); for (var k = 0; k < g0.n; k++) { var a = k / g0.n * 6.28 + Math.random(), r = rnd(3, g0.spread || 10), x = c.x + Math.sin(a) * r, z = c.z + Math.cos(a) * r; if (collide(x, z, 0.4, groundY(x, z), 1.7).hit) { x = c.x; z = c.z; }
    var kind = g0.kind || 'cit', p = makePed({ x: x, z: z, kind: kind, who: g0.who || null, rig: rigFor(kind, g0.who), hostile: 1, hp: g0.hp || (kind === 'goon' ? 70 : kind === 'zombie' ? 60 : 50), wpn: g0.wpn || null, mission: 1, keep: 1 }); p.angry = 1; if (g0.placard) p.holding = 'batM'; st.list.push(p); MS.spawned.push(p); } }); G.counter = st.list.length + ' LEFT'; }
  else if (s.t === 'chase') { var at2 = roadNear(s.at, 40), v = makeVeh(s.type, at2.x, at2.z, at2.a || 0, { mission: 1, col: 1 }); v.hp = s.hp || 80; v.ai = { E: at2.E, s: at2.s, back: false, lane: at2.E.w / 4, want: 22, flee: 1, wait: 0 }; var dr = makePed({ x: v.x, z: v.z, kind: 'cit', who: s.crew || null, rig: rigFor('cit', s.crew), mission: 1, keep: 1 }); dr.inVeh = v; v.driver = dr; MS.spawned.push(dr); st.v = v; MS.chase = v; v.keep = 1; }
  else if (s.t === 'collect' || s.t === 'drops') { st.left = s.n; var c2 = placeOf(s.around); for (var k2 = 0; k2 < s.n; k2++) { var p2 = null; for (var tries = 0; tries < 40 && !p2; tries++) { var a2 = Math.random() * 6.28, r2 = rnd(s.spread * 0.2, s.spread), x2 = c2.x + Math.sin(a2) * r2, z2 = c2.z + Math.cos(a2) * r2, k3 = kAt(x2, z2); if (s.water ? isWaterK(k3) && k3 !== K_CREAM : !isWaterK(k3) && !collide(x2, z2, 1, groundY(x2, z2), 2).hit) p2 = { x: x2, z: z2 }; }
      if (!p2) p2 = { x: c2.x + k2 * 6, z: c2.z }; if (s.t === 'drops') { var rr = nearestRoad(p2.x, p2.z, 60); if (rr) p2 = { x: rr.x + rr.dz * (rr.E.w / 2 + 3), z: rr.z - rr.dx * (rr.E.w / 2 + 3) }; }
      var q = { k: 'mission', tile: s.tile || 'marker', size: s.tile ? 1.2 : 2.4, o: s.tile ? null : { add: 1 }, x: p2.x, z: p2.z, y: s.water ? 0.3 : groundY(p2.x, p2.z), mission: 1, fn: function () { st.left--; sfx.play('coin'); G.counter = st.left + ' LEFT'; if (s.crowd) money(20); } };
      if (s.t === 'drops') { q.r = s.car ? 6 : 2.5; } PICKUPS.push(q); if (s.crowd) for (var c3 = 0; c3 < 4; c3++) { var cp = makePed({ x: p2.x + rnd(-2, 2), z: p2.z + rnd(-2, 2), kind: 'cit', rig: rigFor('cit'), state: 'idle', mission: 1, keep: 1 }); MS.spawned.push(cp); } }
    if (s.time) G.timer = s.time; G.counter = st.left + ' LEFT'; }
  else if (s.t === 'survive') { st.c = placeOf(s.at); st.left = s.time; G.timer = s.time; st.spawnT = 0; }
  else if (s.t === 'race') { st.to = placeOf(s.to); var at3 = roadNear('xz:' + P.x + ':' + P.z, 6), rv = makeVeh(s.rtype || 'moto', at3.x + 3, at3.z, at3.a || 0, { mission: 1, col: 1 }); var rd = makePed({ x: rv.x, z: rv.z, who: s.rival, rig: rigOf(s.rival), mission: 1, keep: 1 }); rd.inVeh = rv; rv.driver = rd; rv.ai = { race: st.to, want: rv.t.top * 0.82 }; st.rv = rv; MS.spawned.push(rd); }
  else if (s.t === 'trail') { st.c = placeOf(s.from); st.pts = []; var bx = SHOPS.harold ? placeOf('shop:harold') : P; for (var k4 = 1; k4 <= s.n; k4++) { var t4 = k4 / (s.n + 1); st.pts.push({ x: lerp(bx.x, st.c.x, t4) + Math.sin(k4 * 2.1) * 60, z: lerp(bx.z, st.c.z, t4) + Math.cos(k4 * 1.7) * 60 }); } st.i = 0; }
  else if (s.t === 'destroy') { st.list = []; var c4 = placeOf(s.around); for (var k5 = 0; k5 < s.n; k5++) { var r5 = roadNear('xz:' + (c4.x + rnd(-s.spread, s.spread)) + ':' + (c4.z + rnd(-s.spread, s.spread)), 0), v5 = makeVeh(s.type, r5.x, r5.z, r5.a || 0, { mission: 1, col: k5 }); v5.keep = 1; if (s.moving) { v5.ai = { E: r5.E, s: r5.s, back: false, lane: r5.E.w / 4, want: 14, wait: 0 }; var d5 = makePed({ x: v5.x, z: v5.z, kind: s.robots ? 'robot' : 'cit', rig: rigFor(s.robots ? 'robot' : 'cit'), mission: 1, keep: 1 }); d5.inVeh = v5; v5.driver = d5; MS.spawned.push(d5); } st.list.push(v5); } G.counter = s.n + ' LEFT'; }
  else if (s.t === 'stunts') { st.start = Object.keys(SV.stuntsDone).length; st.got = 0; G.counter = '0 / ' + s.n; MS.stuntCount = 0; }
  else if (s.t === 'night') { if (dayLight(G.time) > 0.3) { G.fade = 2; G.time = 22; toast('You wait for nightfall.'); } nextStepSoon(); }
  else if (s.t === 'nodes') { st.list = poisOf(s.at).map(function (p) { var q = { x: p.x, z: p.z, y: p.h + 46, hp: 200 }; return q; }); G.counter = st.list.length + ' LEFT'; }
  else if (s.t === 'boss') { var c5 = placeOf(s.at), b = makePed({ x: c5.x, z: c5.z - 6, kind: 'goon', who: null, rig: RIGS.goon, hostile: 1, hp: 1500, wpn: 'smg', mission: 1, keep: 1 }); b.sc = 1.8; b.boss = 1; b.name = 'BLUMHEAD'; st.b = b; MS.spawned.push(b); st.wave = 0; }
  else if (s.t === 'fn') { s.fn(); nextStepSoon(); }
}
function castFor(lines) { // the people talking come and stand in front of you
  var seen = {}; lines.forEach(function (l, i) { var w = l[0]; if (w === 'cumhead' || seen[w]) return; seen[w] = 1; var ex = PEDS.filter(function (p) { return p.cutWho === w && !p.dead; })[0]; if (ex && dist2(ex.x, ex.z, P.x, P.z) < 15 * 15) return; if (ex) PEDS.splice(PEDS.indexOf(ex), 1);
    var n = Object.keys(seen).length, a = (P.state === 'car' && P.veh ? P.veh.a : P.a) + (n % 2 ? 0.5 : -0.5) * n, x = P.x + Math.sin(a) * 2.6, z = P.z + Math.cos(a) * 2.6; if (collide(x, z, 0.4, P.y, 1.7).hit) { x = P.x + 1.5; z = P.z; }
    var p = makePed({ x: x, z: z, who: w, rig: w === 'steve' ? 'steve' : rigOf(w), state: 'idle', keep: 1 }); p.cutWho = w; p.a = Math.atan2(P.x - x, P.z - z); p.god = 1; p.leaveT = 1; if (MS) MS.spawned.push(p); p.ctl = function (q, dt) { if (!G.cut) { q.leaveT -= dt; if (q.leaveT < -6) { q.keep = 0; q.ctl = null; q.state = 'walk'; var r = nearestRoad(q.x, q.z, 40); if (r) { q.E = r.E; q.s = r.s; } } } else q.a = Math.atan2(P.x - q.x, P.z - q.z); }; });
}
function nextStepSoon() { MS.st.done = 1; }
function cutNext() { var C = G.cut; C.i++; if (C.i >= C.lines.length) { G.cut = null; G.sub = null; if (C.done) C.done(); else if (MS) nextStepSoon(); return; } var L = C.lines[C.i], nm = CAST[L[0]] ? CAST[L[0]].name : L[0]; subtitle(nm, L[1], 99); C.who = L[0]; if (typeof voiceLine === 'function') voiceLine(L[0], L[1]); }
function stepMission(dt) {
  if (G.cut) { stepCut(dt); return; } if (!G.mission || !MS) return;
  var s = MS.m.steps[MS.i], st = MS.st; if (!s) return; st.t += dt;
  if (st.done) { nextStep(); return; }
  if (G.timer !== null && G.timer !== undefined) { G.timer -= dt; if (G.timer <= 0 && s.t !== 'survive') { missionFail('Too slow.'); return; } }
  if (s.fists && P.wpn !== 'fists' && WPN[P.wpn] && !WPN[P.wpn].melee) { missionFail('Fists only, they said.'); return; }
  if (MS.veh && MS.veh.dead && (s.t === 'getin' || s.t === 'go' || s.t === 'deliver') && MS.m.steps.slice(MS.i).some(function (q) { return q.car; })) { missionFail('The vehicle is wrecked.'); return; }
  switch (s.t) {
    case 'getin': G.mission.mark = st.v; if (P.veh === st.v) nextStep(); break;
    case 'go': case 'deliver': G.mission.mark = st.to; if (s.car && (!P.veh || (MS.veh && P.veh !== MS.veh))) { G.objective = 'Get back in the ' + (MS.veh ? MS.veh.t.n : 'vehicle') + '.'; G.mission.mark = MS.veh || st.to; break; } G.objective = s.msg;
      if (s.nowanted && SV.wanted > 0) { G.objective = 'Lose the police first.'; break; }
      if (s.minHp && MS.veh && MS.veh.hp < s.minHp) { missionFail('You wrecked it.'); return; }
      if (st.horde && Math.random() < dt * 1.5) { var hp = spawnPoint(30, 60); if (hp) { var z0 = makePed({ x: hp.x, z: hp.z, kind: st.horde, rig: rigFor(st.horde), hostile: 1, hp: 50, mission: 1 }); MS.spawned.push(z0); } }
      var tx = P.state === 'car' ? P.veh.x : P.x, tz = P.state === 'car' ? P.veh.z : P.z; if (Math.hypot(tx - st.to.x, tz - st.to.z) < (s.r || 6) && (!s.car || Math.abs(P.veh.sp) < 4)) nextStep(); break;
    case 'kill': var left = st.list.filter(function (p) { return !p.dead; }).length; G.counter = left + ' LEFT'; G.blips = st.list.filter(function (p) { return !p.dead; }).map(function (p) { return { x: p.x, z: p.z, c: '#ff2630' }; }); if (!left) { G.blips = []; nextStep(); } break;
    case 'chase': G.mission.mark = st.v; G.blips = [{ x: st.v.x, z: st.v.z, c: '#ff2630', big: 1 }]; if (s.stall && st.v.hp < (s.hp || 80) * 0.25 || (!s.stall && st.v.dead)) { if (s.stall && st.v.driver) { var d6 = st.v.driver; d6.inVeh = null; d6.x = st.v.x + 2; d6.z = st.v.z; d6.y = st.v.y; d6.fear = 30; d6.ctl = null; st.v.driver = null; st.v.ai = null; st.v.hp = Math.max(st.v.hp, 20); } G.blips = []; nextStep(); }
      if (dist2(st.v.x, st.v.z, P.x, P.z) > 400 * 400) missionFail('It got away.'); break;
    case 'collect': case 'drops': PICKUPS.forEach(function (q) { if (q.mission && q.r && dist2(P.x, P.z, q.x, q.z) < q.r * q.r && (!s.car || P.state === 'car')) { q.taken = 1; takePickup(q); } }); PICKUPS = PICKUPS.filter(function (q) { return !q.taken; }); G.blips = PICKUPS.filter(function (q) { return q.mission; }).map(function (q) { return { x: q.x, z: q.z, c: '#ffe36a' }; }); if (st.left <= 0) { G.blips = []; G.timer = null; nextStep(); } break;
    case 'survive': st.left -= dt; st.spawnT -= dt; G.mission.mark = st.c; if (st.spawnT <= 0) { st.spawnT = 3.2; for (var n = 0; n < 2; n++) { var a = Math.random() * 6.28, x = st.c.x + Math.sin(a) * 30, z = st.c.z + Math.cos(a) * 30; var e = makePed({ x: x, z: z, kind: s.kind, rig: rigFor(s.kind), hostile: 1, hp: s.kind === 'robot' ? 70 : 55, wpn: s.kind === 'goon' && Math.random() < 0.4 ? 'pistol' : null, mission: 1 }); MS.spawned.push(e); } } if (st.left <= 0) { G.timer = null; MS.spawned.forEach(function (p) { if (!p.dead && p.hostile) { p.fear = 20; p.hostile = 0; p.angry = 0; } }); nextStep(); } break;
    case 'race': G.mission.mark = st.to; var rv = st.rv; raceAI(rv, st.to, dt); if (Math.hypot(rv.x - st.to.x, rv.z - st.to.z) < 14) { missionFail('Jessiah got there first.'); return; } if (P.veh && Math.hypot(P.veh.x - st.to.x, P.veh.z - st.to.z) < 14) nextStep(); break;
    case 'trail': var pt = st.pts[st.i]; if (!pt) { nextStep(); break; } G.mission.mark = pt; G.objective = s.msg + ' (' + st.i + ' / ' + st.pts.length + ')'; if (dist2(P.x, P.z, pt.x, pt.z) < 64) { st.i++; sfx.play('coin'); } break;
    case 'destroy': var l2 = st.list.filter(function (v) { return !v.dead; }).length; G.counter = l2 + ' LEFT'; G.blips = st.list.filter(function (v) { return !v.dead; }).map(function (v) { return { x: v.x, z: v.z, c: '#ff2630' }; }); if (!l2) { G.blips = []; nextStep(); } break;
    case 'stunts': G.counter = MS.stuntCount + ' / ' + s.n; if (MS.stuntCount >= s.n) nextStep(); break;
    case 'nodes': st.list.forEach(function (q) { if (q.hp <= 0) return; FX.forEach(function (f) { if (f.k === 'rocket' && Math.hypot(f.x - q.x, f.z - q.z) < 6 && f.y > q.y - 8) { q.hp = 0; f.life = 0; boom(q.x, q.y, q.z, 8, P); } }); if (P.state === 'foot' && dist2(P.x, P.z, q.x, q.z) < 36 && KIT.pressed('x') && (P.wpn === 'bag' || WPN[P.wpn].melee)) { q.hp -= 40; } });
      var l3 = st.list.filter(function (q) { return q.hp > 0; }); G.counter = l3.length + ' LEFT'; G.blips = l3.map(function (q) { return { x: q.x, z: q.z, c: '#ff2630' }; }); if (!l3.length) { G.blips = []; nextStep(); } break;
    case 'boss': var b = st.b; G.counter = 'BLUMHEAD ' + Math.max(0, Math.round(b.hp / 15)) + '%'; if (b.dead) { nextStep(); break; } if (b.hp < 1500 - (st.wave + 1) * 400 && st.wave < 3) { st.wave++; bigText('BLUMHEAD CALLS HIS GOONS', null, '#c040ff', 2); for (var g1 = 0; g1 < 5; g1++) { var a1 = g1 * 1.25, e1 = makePed({ x: b.x + Math.sin(a1) * 12, z: b.z + Math.cos(a1) * 12, kind: 'goon', rig: RIGS.goon, hostile: 1, hp: 60, wpn: 'pistol', mission: 1 }); MS.spawned.push(e1); } }
      if (Math.random() < dt * 0.5) addFx({ k: 'rocket', x: b.x, y: b.y + 3, z: b.z, vx: (P.x - b.x) * 0.6, vy: 2, vz: (P.z - b.z) * 0.6, life: 3, by: b }); break;
  }
}
function stepCut(dt) { var C = G.cut; C.t = (C.t || 0) + dt; if ((KIT.pressed('a') || KIT.pressed('x') || KIT.pressed('y') || (KIT.ptr && KIT.ptr.tap)) && C.t > 0.25) { C.t = 0; cutNext(); }
  // the camera: at the one speaking, or at Cumhead
  var who = C.who, spk = null; PEDS.forEach(function (p) { if (p.cutWho === who) spk = p; }); var tgt = spk || P, ex, ey, ez; if (spk && dist2(spk.x, spk.z, P.x, P.z) < 30 * 30) { var dx = P.x - spk.x, dz = P.z - spk.z, d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d; ex = P.x + dx * 2.2 + dz * 1.3; ez = P.z + dz * 2.2 - dx * 1.3; ey = P.y + 2.0; }
  else { var fa = P.state === 'car' && P.veh ? P.veh.a : P.a, fd = P.state === 'car' ? 7 : 3.2; ex = P.x + Math.sin(fa) * fd + Math.cos(fa) * 1.2; ez = P.z + Math.cos(fa) * fd - Math.sin(fa) * 1.2; ey = P.y + 1.9; tgt = P; }
  if (rayBlock(tgt.x, (tgt.y || 0) + 1.5, tgt.z, ex, ey, ez) < 1) { ex = (ex + tgt.x) / 2; ez = (ez + tgt.z) / 2; ey += 1.5; }
  var k = C.t < 0.05 ? 1 : Math.min(1, dt * 6); CAM.x += (ex - CAM.x) * k; CAM.y += (ey - CAM.y) * k; CAM.z += (ez - CAM.z) * k; CAM.at = [tgt.x, (tgt.y || 0) + 1.45, tgt.z]; }
function raceAI(v, to, dt) { var r = nearestRoad(v.x, v.z, 60), aim = to; if (r) { var ahead = edgeAt(r.E, r.s + 25, Math.cos(Math.atan2(to.x - v.x, to.z - v.z) - Math.atan2(r.dx, r.dz)) < 0, r.E.w / 4); aim = Math.hypot(to.x - v.x, to.z - v.z) < 60 ? to : ahead; }
  var steer = clamp(angDiff(v.a, Math.atan2(aim.x - v.x, aim.z - v.z)) * 2, -1, 1); stepVehicle(v, { thr: Math.abs(steer) > 0.7 ? 0.6 : 1, brk: 0, steer: steer }, dt); }
/* the people who give missions stand outside their place */
function missionGivers() {
  var L = []; MISSIONS.forEach(function (m) { if (!missionAvailable(m)) return; var p = placeOf(m.at); if (!p) return; if (L.some(function (u) { return Math.hypot(u.x - p.x, u.z - p.z) < 3; })) return;
    L.push({ x: p.x, z: p.z, r: 1.8, blip: 'mission', icon: (CAST[m.who] ? CAST[m.who].name : '?')[0], label: 'START: ' + m.title.toUpperCase(), m: m, fn: function () { startMission(m); } }); });
  return L;
}
function missionsMenu() { var av = MISSIONS.filter(missionAvailable), dn = MISSIONS.filter(function (m) { return SV.done[m.id]; });
  KIT.menu({ title: 'Missions', sub: dn.length + ' of ' + MISSIONS.length + ' done · ' + (G.chapter === 'one' ? 'Chapter One: Welcome to Cum City' : G.chapter === 'zombie' ? 'Chapter Two: Dead Loads' : G.chapter === 'robot' ? 'Chapter Three: Rise of the Machines' : G.chapter === 'blum' ? "Chapter Four: Blumhead's Plan" : 'Free roam'),
    items: av.map(function (m) { return { label: m.title, sub: (CAST[m.who] ? CAST[m.who].name : '') + ' · ' + (SHOPS[m.at.split(':')[1]] ? SHOPS[m.at.split(':')[1]].name : 'Ejaculand'), fn: function () { var p = placeOf(m.at); SV.way = [p.x, p.z]; toast('Waypoint set: ' + m.title); KIT.closeMenu(); } }; }).concat([{ label: 'BACK', back: true, fn: pauseMenu }]) }); }
