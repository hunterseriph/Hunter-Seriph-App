/* ---------- update 160: everyone has at least five jobs (his ask), the main faces up to ten. Side jobs run in a
   chain per character after their first story job; they never change the chapter. TB only ever says his own quotes,
   Shithead Laboozie translates. ---------- */
function SIDE(who, at, req, list) { var prev = req; list.forEach(function (o, i) { var id = who + '_s' + (i + 1); MI({ id: id, who: who, title: o.title, at: o.at || at, chap: 'one', req: [prev].concat(o.req || []), pay: o.pay, give: o.give, steps: o.steps, after: o.after }); prev = id; }); }
var GO = function (to, msg, o) { var s = { t: 'go', to: to, msg: msg }; for (var k in o || {}) s[k] = o[k]; return s; };
var TALK = function () { return { t: 'talk', lines: Array.prototype.slice.call(arguments) }; };

/* ---- Shithead Laboozie, Sheriff of Cum City ---- */
SIDE('lab', 'shop:club', 'lab2', [
  { title: 'Speed Trap', pay: 900, steps: [TALK(['lab', 'Sheriff business, Mister Mayor. Some lunatic in a Spunkster GT is doing a hundred and ten down the boulevard.'], ['lab', 'I have the hat, you have the driving. Run him off the road.']),
    { t: 'chase', type: 'sports', at: 'road:dist:club', hp: 70, stall: 1, msg: 'Ram the speeding Spunkster GT until it stalls.' },
    TALK(['lab', 'Licence, registration and an apology to the boulevard. Lovely work.'])] },
  { title: 'Bank Job', pay: 1600, give: ['pistol', 36], steps: [TALK(['lab', 'Somebody is robbing the Bank of Cum City. In daylight. With balaclavas made of socks.'], ['lab', 'Here is some ammo. Do not shoot the cashiers, they are unionised.']),
    GO('shop:bank', 'Get to the Bank of Cum City.', { r: 18 }),
    { t: 'kill', spawn: [{ kind: 'goon', n: 6, at: 'shop:bank', spread: 14, wpn: 'pistol' }], msg: 'Stop the robbers.' },
    TALK(['lab', 'The money is safe. Most of it. Some of it is in my hat now, as evidence.'])] },
  { title: 'Prisoner Transport', pay: 1300, steps: [TALK(['lab', 'One of TB\'s gimps has been caught at the Blood Factory. Take him to the station in a squad car.'], ['lab', 'He bites. Drive fast.']),
    { t: 'getin', type: 'police', at: 'road:dist:factory', msg: 'Get in the squad car at the Blood Factory.' },
    { t: 'deliver', to: 'shop:cops', car: 1, time: 200, minHp: 40, msg: 'Get the prisoner to Cum City Police.', horde: 'goon' },
    TALK(['lab', 'Booked. Charged. Released on bail an hour later, but still. Paperwork done.'])] },
  { title: 'Evidence', pay: 1400, steps: [TALK(['lab', 'A crate of TB\'s pills fell off a boat at the docks and split open. Six bags of evidence, everywhere.'], ['lab', 'Pick them up before the gulls get high.']),
    { t: 'collect', n: 6, around: 'dist:docks', spread: 130, time: 300, tile: 'crate', msg: 'Pick up the bags of evidence.' },
    GO('shop:cops', 'Hand the evidence in at the police station.'),
    TALK(['lab', 'Logged. Six bags. Well, five. One went in the evidence locker that is my mouth. Joking. Mostly.'])] },
  { title: 'Sheriff\'s Drag', pay: 1800, steps: [TALK(['lab', 'I have challenged myself to a race. Well, I challenged Saba, but Saba sent me back the challenge. So: me, versus you.'], ['lab', 'First to the airport. Loser buys the cream.']),
    { t: 'getin', type: 'muscle', at: 'road:shop:club', msg: 'Get in the Dickhead Charger.' },
    { t: 'race', to: 'poi:terminal', rival: 'lab', rtype: 'muscle', msg: 'Beat Shithead Laboozie to the airport.' },
    TALK(['lab', 'You cheated. I saw you use the road. The cream is on me.'])] },
  { title: 'Riot at the Gates', pay: 1700, steps: [TALK(['lab', 'There is a riot at Ejaculand. Someone said the coaster is closed. The coaster is never closed.'], ['lab', 'Hold the gate till the riot police turn up. Which is me. I am the riot police.']),
    GO('poi:gate', 'Get to the Ejaculand gate.', { r: 22 }),
    { t: 'survive', time: 70, kind: 'goon', at: 'poi:gate', msg: 'Hold the gate against the rioters.' },
    TALK(['lab', 'Coaster\'s open. Everyone calm. Steve is giving out free grins.'])] },
  { title: 'Hot Pursuit', pay: 2000, steps: [TALK(['lab', 'Bonjo\'s rival boutique is back. They nicked a whole van of leather. Stop that van.']),
    { t: 'chase', type: 'van', at: 'road:dist:red', crew: 'butcher', hp: 120, msg: 'Wreck the van full of stolen leather.' },
    TALK(['lab', 'Leather everywhere. Bonjo is going to have the best week of his life.'])] },
  { title: 'Graveyard Shift', pay: 2200, give: ['smg', 60], steps: [TALK(['lab', 'Grave robbers at the cemetery. Big lads. They are digging up Uncle Beeb\'s old drinking mates.'], ['lab', 'Here, a Cream Chopper. Night shift.']),
    { t: 'night' }, GO('poi:chapel', 'Go to the cemetery.', { r: 24 }),
    { t: 'kill', spawn: [{ kind: 'goon', n: 8, at: 'poi:chapel', spread: 26, wpn: 'pistol' }], msg: 'Stop the grave robbers.' },
    TALK(['lab', 'Rest in peace, lads. Rest in pieces, robbers.'])] },
  { title: 'Sheriff for a Day', pay: 3000, steps: [TALK(['lab', 'Mister Mayor, I need a day off. You wear the hat. Do the rounds of the city: the docks, the factory, the red lights, the cafes.']),
    GO('dist:docks', 'Do the rounds: the docks.', { r: 60, car: 1 }), GO('dist:factory', 'Do the rounds: the Blood Factory.', { r: 60, car: 1 }), GO('dist:red', 'Do the rounds: the red light district.', { r: 60, car: 1 }), GO('dist:cafe', 'Do the rounds: the Cafe Streets.', { r: 60, car: 1 }),
    GO('shop:club', 'Bring the hat back to the Clubhouse.'),
    TALK(['lab', 'Not one complaint. Well, forty complaints, but not one about you. Here, your sheriff\'s wages.'])] }
]);
/* Sheriff for a Day: lend him the squad car for the rounds */
MISSIONS.filter(function (m) { return m.id === 'lab_s9'; }).forEach(function (m) { m.steps.splice(1, 0, { t: 'getin', type: 'police', at: 'road:shop:club', msg: 'Get in the sheriff\'s squad car.' }); });

/* ---- TB ---- */
SIDE('tb', 'shop:tb', 'tb2', [
  { title: 'Home Delivery', pay: 1200, steps: [TALK(['tb', T2], ['lab', 'TB says he has five more customers in Cum Hills. One at a time, follow the GPS. Do not take any yourself.'], ['tb', T2]),
    { t: 'getin', type: 'hatch', at: 'road:shop:tb', msg: 'Get in TB\'s delivery Cumbo.' },
    { t: 'drops', n: 5, around: 'dist:hills', spread: 160, car: 1, msg: 'Drop the pills at each house.' }, TALK(['tb', T2])] },
  { title: 'Pill Party', pay: 1500, steps: [TALK(['tb', T2], ['lab', 'TB is throwing a pill party at the Clubhouse... no, outside his bar. Rival dealers want to crash it. Keep them out.']),
    { t: 'survive', time: 70, kind: 'goon', at: 'shop:tb', msg: 'Keep the rival dealers away from TB\'s pill party.' }, TALK(['tb', T2], ['tb', T2])] },
  { title: 'Supply Run', pay: 1600, steps: [TALK(['tb', T2], ['lab', 'His supplier lands at the airport. The pills come in a hearse. Do not ask why, I asked, he said the line about the lotion.']),
    { t: 'getin', type: 'hearse', at: 'road:dist:airport', msg: 'Get in the Stiff Ride at the airport.' },
    { t: 'deliver', to: 'shop:tb', car: 1, time: 260, minHp: 50, msg: 'Get the hearse back to TB\'s Suck n\' Fuck.' }, TALK(['tb', T2])] },
  { title: 'Rival Pushers', pay: 1800, give: ['pistol', 24], steps: [TALK(['tb', T2], ['lab', 'Pushers are selling fake Silly Pills at the docks. Chalk and sadness. TB is upset. Look at him, he is upset.']),
    GO('dist:docks', 'Go to the docks.', { r: 50 }),
    { t: 'kill', spawn: [{ who: 'pusher', n: 7, at: 'dist:docks', spread: 30 }], msg: 'Deal with the fake pill pushers.' }, TALK(['tb', T2])] },
  { title: 'Stolen Stash', pay: 2000, steps: [TALK(['tb', T2], ['lab', 'Someone nicked TB\'s stash in an ice cream van. It plays Greensleeves. You will hear it coming.']),
    { t: 'chase', type: 'icecream', at: 'road:dist:cafe', crew: 'gimp', hp: 90, stall: 1, msg: 'Stop the ice cream van with TB\'s stash.' },
    { t: 'getin', type: 'icecream', target: 'chase', msg: 'Get in the van.' }, GO('shop:tb', 'Bring the stash back to TB.', { car: 1 }), TALK(['tb', T2])] },
  { title: 'Cop Cars', pay: 2200, steps: [TALK(['tb', T2], ['lab', 'TB has a grudge against four squad cars outside the station. As sheriff I cannot condone this. As a friend, here is a lighter.']),
    { t: 'destroy', n: 4, type: 'police', around: 'shop:cops', spread: 60, msg: 'Torch the four squad cars.' }, TALK(['tb', T2], ['lab', 'I saw nothing. I was looking at a pigeon.'])] },
  { title: 'Tucker Fucker', pay: 3000, steps: [TALK(['tb', T2], ['lab', 'Last one. TB wants to see the Crimson Moon Altar on the peak. He says it is spiritual. Drive him. Do not let him drive.']),
    { t: 'getin', type: 'limo', at: 'road:shop:tb', msg: 'Get in the limo with TB.' },
    GO('poi:altar', 'Take TB to the Crimson Moon Altar.', { r: 16, car: 1 }), TALK(['tb', T2], ['tb', T2], ['lab', 'That was beautiful. He cried. Or sweated. Hard to tell with TB.'])] }
]);

/* ---- Greebo ---- */
SIDE('greebo', 'shop:greebo', 'greebo2', [
  { title: 'Flour Power', pay: 1100, steps: [TALK(['greebo', 'Fresh cream pies. Don\'t ask what\'s in them.'], ['greebo', 'Flour. I am out of flour. The windmill in the outskirts has sacks of it. Bring a van.']),
    { t: 'getin', type: 'van', at: 'road:shop:greebo', msg: 'Take Greebo\'s van.' }, GO('poi:windmill', 'Drive to the windmill.', { r: 20, car: 1 }), GO('shop:greebo', 'Bring the flour back.', { car: 1 }),
    TALK(['greebo', 'Flour! Now the pies have a bottom again.'])] },
  { title: 'Pie Fight', pay: 1300, steps: [TALK(['greebo', 'Clowns have been throwing MY pies at people in Ejaculand. Pies are for eating. Mostly.']),
    GO('dist:ejac', 'Go to Ejaculand.', { r: 60 }), { t: 'kill', spawn: [{ who: 'pieclown', n: 6, at: 'dist:ejac', spread: 30 }], msg: 'Stop the pie clowns.' },
    TALK(['greebo', 'Every pie returned. Some of them were in faces, but still.'])] },
  { title: 'Sir Johnathan\'s Dinner', pay: 1400, steps: [TALK(['greebo', 'Sir Johnathan only eats fresh fish. From the jetties. Today.']),
    { t: 'collect', n: 4, around: 'poi:jetty', spread: 300, time: 420, tile: 'crate', msg: 'Pick up the fish boxes from the jetties.' }, GO('poi:grotto', 'Take the fish to Sir Johnathan at the Grotto.', { r: 12 }),
    TALK(['greebo', 'He ate it in one go and went to sleep on my hat. That is love.'])] },
  { title: 'Bake Off', pay: 2000, steps: [TALK(['greebo', 'The Great Cum City Bake Off. At the drive-in. My pie is in the back of the car and the judges close the doors in three minutes.']),
    { t: 'getin', type: 'saloon', at: 'road:shop:greebo', msg: 'Get in Greebo\'s car.' }, { t: 'deliver', to: 'poi:drivein', car: 1, time: 220, minHp: 70, msg: 'Get the pie to the Load Drive-In. Gently.' },
    TALK(['greebo', 'First place. The judges asked what was in it. I said: don\'t ask.'])] }
]);

/* ---- Spermaid ---- */
SIDE('spermaid', 'shop:sanct', 'sperm1', [
  { title: 'Lighthouse Keeper', pay: 1400, steps: [TALK(['spermaid', 'Sweetie, the lighthouse on the isles has gone out. Boats keep bumping into my sisters.'], ['spermaid', 'Take a boat and switch it back on?']),
    { t: 'getin', type: 'speedboat', at: 'poi:boats', msg: 'Take a boat.' }, GO('poi:lighthouse', 'Get to the lighthouse.', { r: 18 }),
    TALK(['spermaid', 'It is shining! Everyone can see where they are going. Mostly into me. As a friend!'])] },
  { title: 'Shell Collector', pay: 1500, steps: [TALK(['spermaid', 'I am making a new shell bra. A very important shell bra. The best shells wash up on Seamen Beach.']),
    { t: 'collect', n: 7, around: 'dist:beach', spread: 120, time: 300, tile: 'star5', msg: 'Pick up the best shells on Seamen Beach.' }, GO('shop:sanct', 'Bring the shells to Spermaid.'),
    TALK(['spermaid', 'Perfect. Do not look. You are looking. Sweetie!'])] },
  { title: 'Cream Tide', pay: 2200, steps: [TALK(['spermaid', 'Something is pumping goo into the Jizz River at the outfall. Blumhead\'s boys, I think. Make them stop.']),
    GO('poi:outfall', 'Go to the outfall.', { r: 30 }), { t: 'kill', spawn: [{ kind: 'goon', n: 8, at: 'poi:outfall', spread: 22, wpn: 'pistol' }], msg: 'Stop Blumhead\'s boys at the outfall.' },
    TALK(['spermaid', 'The cream is clean again. Taste it. No, do not taste it.'])] }
]);

/* ---- Saba ---- */
SIDE('saba', 'shop:saba', 'saba1', [
  { title: 'No Hit Delivery', pay: 1200, steps: [TALK(['saba', 'Hitless runs only. Take a look, my friend.'], ['saba', 'A customer wants his hemp across the city. Do not scratch the car. Not one hit.']),
    { t: 'getin', type: 'saloon', at: 'road:shop:saba', msg: 'Get in Saba\'s car.' }, { t: 'deliver', to: 'poi:motel', car: 1, time: 300, minHp: 90, msg: 'Get the hemp to the Sticky Sheets Motel without a scratch.' },
    TALK(['saba', 'Not a mark on it. You could do a hitless run, my friend.'])] },
  { title: 'Range Day', pay: 1500, give: ['shotgun', 18], steps: [TALK(['saba', 'New stock. I need it tested. The Bone Pit is full of targets that shoot back. Here, a shotgun.']),
    GO('poi:quarry', 'Go to the Bone Pit.', { r: 28 }), { t: 'kill', spawn: [{ kind: 'goon', n: 9, at: 'poi:quarry', spread: 24, wpn: 'pistol' }], msg: 'Test the stock on the targets.' },
    TALK(['saba', 'Works. I will put a sticker on it. Tested by the mayor.'])] },
  { title: 'Hemp Harvest', pay: 1700, steps: [TALK(['saba', 'My hemp grows on a farm in the outskirts. The farmer is... tired. Pick it for me?']),
    { t: 'collect', n: 6, around: 'poi:farm', spread: 60, time: 360, tile: 'crate', msg: 'Pick up the bales of hemp.' }, GO('shop:saba', 'Bring the hemp to Saba.'),
    TALK(['saba', 'Fresh. Have a few joints, my friend. On the house.'])], after: function () { SV.joints = (SV.joints || 0) + 5; } },
  { title: 'Hitless Gauntlet', pay: 2600, steps: [TALK(['saba', 'The real test. Get from here to the Blood Factory with a wanted level and no hits. No car damage. Ready?']),
    { t: 'getin', type: 'sports', at: 'road:shop:saba', msg: 'Get in the Spunkster GT.', wanted: 2 },
    { t: 'deliver', to: 'dist:factory', r: 40, car: 1, time: 260, minHp: 85, msg: 'Get to the Blood Factory with the police on you and no damage.' },
    TALK(['saba', 'Hitless. Legendary. I will tell the chat.'])] }
]);

/* ---- Potbelly ---- */
SIDE('potbelly', 'shop:arcade', 'pot1', [
  { title: 'Token Thieves', pay: 1200, steps: [TALK(['potbelly', 'Cabinets are free, kid. Play all you like. So why is somebody stealing my tokens?'], ['potbelly', 'Rats. In a scooter gang. Get them.']),
    { t: 'chase', type: 'moto', at: 'road:dist:club', crew: 'gimp', hp: 40, msg: 'Knock the token thief off his bike.' }, TALK(['potbelly', 'Tokens back. The rats can play for free like everyone else.'])] },
  { title: 'Arcade Night', pay: 1500, steps: [TALK(['potbelly', 'Tournament night. The prize cabinet is at the docks arcade and the players are getting rowdy. Keep the peace.']),
    { t: 'night' }, GO('dist:docks', 'Go to the docks.', { r: 60 }), { t: 'survive', time: 60, kind: 'goon', at: 'dist:docks', msg: 'Keep the rowdy players off the prize cabinet.' },
    TALK(['potbelly', 'Nobody broke a joystick. A miracle, kid.'])] },
  { title: 'High Score Run', pay: 1800, steps: [TALK(['potbelly', 'Do me a lap of the city. Stunt jumps. Five of them. The crowd loves a stunt.']),
    { t: 'stunts', n: 5, msg: 'Do five stunt jumps.' }, TALK(['potbelly', 'New high score. Have your name put on the board. In tokens.'])] }
]);

/* ---- PulsarOctopus ---- */
SIDE('pulsar', 'shop:pulsar', 'pulsar1', [
  { title: 'Vinyl Hunt', pay: 1200, steps: [TALK(['pulsar', 'Just vibes, friend. Free of charge.'], ['pulsar', 'My crate of vinyl fell off a van. Five records, all over the Cafe Streets.']),
    { t: 'collect', n: 5, around: 'dist:cafe', spread: 140, time: 300, tile: 'i_note', msg: 'Pick up Pulsar\'s records.' }, GO('shop:pulsar', 'Bring the records back.'),
    TALK(['pulsar', 'Not a scratch. Well, they are scratched, that is the point. Vibes.'])] },
  { title: 'Beach Rave', pay: 1600, steps: [TALK(['pulsar', 'Rave on Seamen Beach tonight. Speakers are at the docks. Bring them down.']),
    { t: 'getin', type: 'van', at: 'road:dist:docks', msg: 'Get the speaker van.' }, GO('dist:beach', 'Drive to Seamen Beach.', { r: 40, car: 1 }),
    { t: 'night' }, { t: 'survive', time: 50, kind: 'goon', at: 'dist:beach', msg: 'Keep the noise complaints off the decks.' }, TALK(['pulsar', 'The sea was dancing, friend. I saw it.'])] },
  { title: 'Signal Boost', pay: 2000, steps: [TALK(['pulsar', 'PulsarOctopus Beats FM needs the radio mast in the outskirts pointed the right way. Climb it? Drive to it, I mean.']),
    GO('poi:mast', 'Get to the radio mast.', { r: 16 }), TALK(['pulsar', 'Hear that? We are on the radio. Everywhere. Even in TB\'s bathroom.'])] }
]);

/* ---- Harold ---- */
SIDE('harold', 'shop:harold', 'harold1', [
  { title: 'Tea Leaves', pay: 1100, steps: [TALK(['harold', 'Potions? Tea? Same thing, really. Sit, sit!'], ['harold', 'I have run out of my special leaves. They grow by the Spunkhenge Stones. Probably. Fetch some?']),
    GO('poi:stones', 'Go to the Spunkhenge Stones.', { r: 20 }), GO('shop:harold', 'Bring the leaves back to Harold.'), TALK(['harold', 'Smells like Tuesday. Perfect.'])] },
  { title: 'Mad Hatter', pay: 1300, steps: [TALK(['harold', 'My top hat blew off in the wind. It is touring the city without me. It has been seen at the clock tower.']),
    { t: 'trail', from: 'poi:clock', n: 5, base: 'shop:harold', msg: 'Follow the hat\'s trail.' }, GO('poi:clock', 'The hat is on the clock tower. Grab it.', { r: 12 }), GO('shop:harold', 'Bring the hat home.'),
    TALK(['harold', 'There it is! Had a lovely day out, did we? We did.'])] },
  { title: 'Tea for Two Hundred', pay: 1800, steps: [TALK(['harold', 'A party at the observatory. Two hundred guests. One teapot. Drive carefully, the teapot is the size of a van because it is a van.']),
    { t: 'getin', type: 'van', at: 'road:shop:harold', msg: 'Get in the tea van.' }, { t: 'deliver', to: 'poi:observatory', car: 1, time: 320, minHp: 65, msg: 'Get the tea to the Starload Observatory.' },
    TALK(['harold', 'Two hundred cups. Most of them drank it. Some of them are still drinking it.'])] }
]);

/* ---- the ones with one job each in the story: four more each ---- */
SIDE('amy', 'shop:amy', 'amy1', [
  { title: 'Chilli Run', pay: 900, steps: [TALK(['amy', 'Mild, hot or dynamite?'], ['amy', 'Five orders of dynamite to go. One at a time, they melt the bag.']), { t: 'getin', type: 'hatch', at: 'road:shop:amy', msg: 'Get in Amy\'s car.' },
    { t: 'drops', n: 5, around: 'dist:cafe', spread: 180, car: 1, msg: 'Deliver the chilli to each door.' }, TALK(['amy', 'Everybody sweating. Everybody happy.'])] },
  { title: 'Hot Peppers', pay: 1100, steps: [TALK(['amy', 'My peppers come from a farm in the outskirts. The farmer stopped answering. He probably ate one.']),
    GO('poi:farm', 'Go to the farm.', { r: 30 }), { t: 'collect', n: 5, around: 'poi:farm', spread: 50, time: 240, tile: 'crate', msg: 'Pick up the crates of peppers.' }, GO('shop:amy', 'Take the peppers to Amy.'),
    TALK(['amy', 'The farmer is fine. He is just very, very warm.'])] },
  { title: 'Sausage Fest', pay: 1400, steps: [TALK(['amy', 'Somebody stole my Sausage. THE Sausage. They went towards the Blood Factory.']),
    GO('dist:factory', 'Go to the Blood Factory.', { r: 50 }), { t: 'kill', spawn: [{ who: 'butcher', n: 6, at: 'dist:factory', spread: 26 }], msg: 'Get the Sausage back from the butchers.' },
    TALK(['amy', 'My Sausage! Do not touch it. Nobody touches the Sausage.'])] },
  { title: 'Dynamite Derby', pay: 2000, steps: [TALK(['amy', 'Chilli eating contest at the drive-in. I am the chilli. Get me there before it goes cold. It never goes cold.']),
    { t: 'getin', type: 'muscle', at: 'road:shop:amy', msg: 'Get in the Dickhead Charger.' }, { t: 'deliver', to: 'poi:drivein', car: 1, time: 240, minHp: 60, msg: 'Get Amy and the chilli to the drive-in.' },
    TALK(['amy', 'Nine people tried it. Nine people saw the Crimson Moon. We won.'])] }
]);
SIDE('kaya', 'shop:cafe', 'kaya1', [
  { title: 'Morning Rush', pay: 900, steps: [TALK(['kaya', 'Welcome in! Kaya\'s on the coffee, Elden\'s on the grill.'], ['kaya', 'Five Cumpuccinos to go, to the offices downtown. One at a time, they spill.']),
    { t: 'drops', n: 5, around: 'dist:club', spread: 160, msg: 'Take the coffees to each door.' }, TALK(['elden', 'That is the fastest anyone has ever had a coffee in this city.'])] },
  { title: 'Grill Gas', pay: 1100, steps: [TALK(['elden', 'The grill is out of gas. The Pump n Dump has some. Bring the van.']),
    { t: 'getin', type: 'van', at: 'road:shop:cafe', msg: 'Take the cafe van.' }, GO('poi:petrol', 'Get to the Pump n Dump.', { r: 18, car: 1 }), GO('shop:cafe', 'Bring the gas back to the cafe.', { car: 1 }),
    TALK(['elden', 'Grill is on. Since 2019. Again.'])] },
  { title: 'Bad Review', pay: 1300, steps: [TALK(['kaya', 'A critic gave us one star. Then he went to Ali\'s and gave them five. I want to know why. Follow him.']),
    { t: 'chase', type: 'saloon', at: 'road:dist:cafe', hp: 60, stall: 1, msg: 'Catch up with the critic and stop his car.' },
    TALK(['kaya', 'He says it was the garlic. Fine. We will add garlic.'], ['elden', 'To the coffee?'], ['kaya', 'To the coffee.'])] },
  { title: 'Beans to Go', pay: 1700, steps: [TALK(['kaya', 'A coffee stall at Ejaculand. Elden has to be there in four minutes with the grill. On the back of the truck.']),
    { t: 'getin', type: 'truck', at: 'road:shop:cafe', msg: 'Get in the truck with the grill.' }, { t: 'deliver', to: 'poi:gate', car: 1, time: 240, minHp: 55, msg: 'Get Elden and the grill to Ejaculand.' },
    TALK(['elden', 'Grill is on. In Ejaculand. Since just now.'])] }
]);
SIDE('joff', 'shop:joff', 'joff1', [
  { title: 'Pizza Run', pay: 900, steps: [TALK(['joff', 'Pineapple belongs on pizza. Fight me.'], ['joff', 'Six pizzas, six doors, all pineapple. One at a time.']), { t: 'getin', type: 'scooter', at: 'road:shop:joff', msg: 'Get on the pizza scooter.' },
    { t: 'drops', n: 6, around: 'dist:hills', spread: 160, car: 1, msg: 'Deliver each pizza.' }, TALK(['joff', 'Six happy customers. Pineapple wins again.'])] },
  { title: 'Pineapple Heist', pay: 1200, steps: [TALK(['joff', 'A crate of pineapples is sitting at the docks and the docks say it is not mine. It is mine. It has my face on it. I drew it.']),
    GO('dist:docks', 'Go to the docks.', { r: 50 }), { t: 'kill', spawn: [{ kind: 'goon', n: 6, at: 'dist:docks', spread: 24 }], msg: 'Argue with the dockers.' }, GO('shop:joff', 'Bring the pineapples back.'),
    TALK(['joff', 'My face! On the crate! Safe!'])] },
  { title: 'Anti-Pineapple League', pay: 1500, steps: [TALK(['joff', 'The protestors are back. With a van this time. Ram it. Fists are for amateurs.']),
    { t: 'chase', type: 'van', at: 'road:dist:cafe', crew: 'gimp', hp: 100, msg: 'Wreck the protest van.' }, TALK(['joff', 'Debate won. Again.'])] },
  { title: 'Pizza Oven', pay: 2000, steps: [TALK(['joff', 'My new oven is at Cum Scrap and Salvage. It is a car crusher. It makes very flat pizza. Bring the truck.']),
    { t: 'getin', type: 'truck', at: 'road:shop:joff', msg: 'Get in the truck.' }, GO('poi:scrapyard', 'Drive to the scrapyard.', { r: 24, car: 1 }), GO('shop:joff', 'Bring the oven back.', { car: 1 }),
    TALK(['joff', 'Flattest pizza in Cum City. Fight me.'])] }
]);
SIDE('beeb', 'shop:beebs', 'beeb1', [
  { title: 'Tab Collection', pay: 1000, steps: [TALK(['beeb', 'Sit down, lad. First one\'s always warm.'], ['beeb', 'Four regulars owe me for their tabs. They live round the red lights. Go and ask nicely. Then less nicely.']),
    { t: 'drops', n: 4, around: 'dist:red', spread: 120, msg: 'Knock on each door for the money.' }, TALK(['beeb', 'Every penny. Have one on me, lad.'])] },
  { title: 'Pub Quiz', pay: 1200, steps: [TALK(['beeb', 'Pub quiz tonight and the answers were nicked by the Dripping Tap lot. They are out in the village. Get them back.']),
    GO('poi:village', 'Go to Little Load.', { r: 30 }), { t: 'kill', spawn: [{ kind: 'cit', n: 5, at: 'poi:village', spread: 14, angry: 1, hp: 35 }], fists: 1, msg: 'Get the answers back. Fists only, it is a pub.' },
    TALK(['beeb', 'Question one: who is the best publican in Cum City? You know the answer, lad.'])] },
  { title: 'Brewery Run', pay: 1500, steps: [TALK(['beeb', 'The barrels from the brewery need to be here by opening time. The truck is at the factory.']),
    { t: 'getin', type: 'truck', at: 'road:dist:factory', msg: 'Get in the beer truck.' }, { t: 'deliver', to: 'shop:beebs', car: 1, time: 260, minHp: 60, msg: 'Get the barrels to the tavern.' },
    TALK(['beeb', 'Doors open, lad. Third one, you\'re washing up.'])] },
  { title: 'Last Orders, Lad', pay: 2200, steps: [TALK(['beeb', 'Somebody wants my tavern. A gang. They are coming tonight. Stand with me, lad.']),
    { t: 'night' }, { t: 'survive', time: 80, kind: 'goon', at: 'shop:beebs', msg: 'Hold Uncle Beeb\'s Tavern.' },
    TALK(['beeb', 'Nobody takes the tavern. Nobody. Drinks are free tonight. Not really.'])] }
]);
SIDE('t', 'shop:t', 't1', [
  { title: 'Late Night Pickup', pay: 1300, steps: [TALK(['t', 'Come in, darling. I\'ll get the doors.'], ['t', 'Four of my girls need picking up from their clients. One at a time. Be a gentleman.']),
    { t: 'getin', type: 'limo', at: 'road:shop:t', msg: 'Get in the limo.' }, { t: 'night' }, { t: 'drops', n: 4, around: 'dist:club', spread: 180, car: 1, msg: 'Pick up each of T\'s girls.' }, TALK(['t', 'All home safe. You\'re a darling.'])] },
  { title: 'Doorman', pay: 1500, steps: [TALK(['t', 'A stag party is trying to get in without paying. Twelve of them. Dressed as Steve. Darling, please.']),
    { t: 'kill', spawn: [{ kind: 'cit', n: 8, at: 'shop:t', spread: 10, angry: 1, hp: 40 }], fists: 1, msg: 'Throw the stag party out. Fists only.' }, TALK(['t', 'That is why I get the doors. And you get the stags.'])] },
  { title: 'Diamond Heist', pay: 1800, steps: [TALK(['t', 'A client left a diamond in my room and his driver drove off with it. Get it back, darling.']),
    { t: 'chase', type: 'limo', at: 'road:dist:red', hp: 120, stall: 1, msg: 'Stop the client\'s limo.' }, GO('shop:t', 'Bring the diamond back to T.'), TALK(['t', 'Sparkly. I\'ll keep it safe. For him. For now.'])] },
  { title: 'The Big Night', pay: 2500, steps: [TALK(['t', 'The mayor\'s ball. At your castle. I need the limo there by midnight with me in it.']),
    { t: 'getin', type: 'limo', at: 'road:shop:t', msg: 'Get in the limo with T.' }, { t: 'deliver', to: 'poi:castle:Cumhead\'s Castle', r: 40, car: 1, time: 360, minHp: 60, msg: 'Get T to Cumhead\'s Castle.' },
    TALK(['t', 'Every head turned. As they should. Thank you, darling.'])] }
]);
SIDE('bonjo', 'shop:bonjo', 'bonjo1', [
  { title: 'Photo Shoot', pay: 1100, steps: [TALK(['bonjo', 'Welcome, welcome. Let me get the door.'], ['bonjo', 'Photo shoot at the lighthouse. The leather is in the car. Drive like the leather is watching.']),
    { t: 'getin', type: 'sports', at: 'road:shop:bonjo', msg: 'Get in Bonjo\'s car.' }, GO('dist:beach', 'Drive to Seamen Beach for the shoot.', { r: 50, car: 1 }), TALK(['bonjo', 'The light! The sea! The leather! Iconic.'])] },
  { title: 'Fabric Run', pay: 1300, steps: [TALK(['bonjo', 'My fabric samples blew out of the van. All over the red lights. Five of them. Each one is a masterpiece.']),
    { t: 'collect', n: 5, around: 'dist:red', spread: 120, time: 260, tile: 'crate', msg: 'Pick up Bonjo\'s fabric samples.' }, GO('shop:bonjo', 'Bring them back.'), TALK(['bonjo', 'Every one. You have an eye, darling.'])] },
  { title: 'Runway', pay: 1600, steps: [TALK(['bonjo', 'Fashion show at the airport. On the actual runway. The models are late. Get them there.']),
    { t: 'getin', type: 'van', at: 'road:shop:bonjo', msg: 'Get in the van with the models.' }, { t: 'deliver', to: 'poi:runway', car: 1, time: 280, minHp: 70, msg: 'Get the models to the runway.' }, TALK(['bonjo', 'They walked, the planes waited. That is fashion.'])] },
  { title: 'Rival Boutique', pay: 2000, steps: [TALK(['bonjo', 'The rival boutique again. They have a shop at the docks now. Close it. Permanently. Fashionably.']),
    GO('dist:docks', 'Go to the docks.', { r: 50 }), { t: 'kill', spawn: [{ kind: 'goon', n: 8, at: 'dist:docks', spread: 24, wpn: 'pistol' }], msg: 'Close the rival boutique.' },
    TALK(['bonjo', 'Out of business. Out of season. Out.'])] }
]);
SIDE('ali', 'shop:ali', 'ali1', [
  { title: 'Garlic Delivery', pay: 1000, steps: [TALK(['ali', 'Nuggets? Garlic bread? Everything is better with garlic.'], ['ali', 'Five orders. One at a time. Open the windows.']),
    { t: 'getin', type: 'hatch', at: 'road:shop:ali', msg: 'Get in Ali\'s car.' }, { t: 'drops', n: 5, around: 'dist:cafe', spread: 170, car: 1, msg: 'Deliver the garlic to each door.' }, TALK(['ali', 'They will smell you coming for a week. Good.'])] },
  { title: 'Vampire Hunt', pay: 1400, steps: [TALK(['ali', 'More bloodsuckers. In the asylum this time. Garlic, bat, go.']),
    { t: 'fn', fn: function () { giveWeapon('bat', 0); G.garlic = 400; } }, { t: 'night' }, GO('poi:asylum', 'Go to Cumwood Asylum.', { r: 30 }),
    { t: 'kill', spawn: [{ kind: 'goon', n: 8, at: 'poi:asylum', spread: 24 }], msg: 'See off the bloodsuckers.' }, TALK(['ali', 'Garlic. Never fails.'])] },
  { title: 'Garlic Farm', pay: 1600, steps: [TALK(['ali', 'My garlic is ready at the farm in the outskirts. Bring the truck. Hold your breath.']),
    { t: 'getin', type: 'truck', at: 'road:shop:ali', msg: 'Get in the truck.' }, GO('poi:farm', 'Drive to the farm.', { r: 30, car: 1 }), GO('shop:ali', 'Bring the garlic back.', { car: 1 }), TALK(['ali', 'Enough garlic for a year. Or a weekend.'])] },
  { title: 'Food Fight', pay: 2000, steps: [TALK(['ali', 'Greebo says his pies are better than my nuggets. We settle it at the picnic spot. With food. Thrown.']),
    GO('poi:picnic', 'Go to the picnic spot.', { r: 24 }), { t: 'survive', time: 60, kind: 'cit', at: 'poi:picnic', msg: 'Survive the food fight.' }, TALK(['ali', 'Draw. Everybody is covered in garlic and cream. Everybody wins.'])] }
]);
SIDE('natty', 'shop:natty', 'natty1', [
  { title: 'Whetstone', pay: 1100, steps: [TALK(['natty', 'A blade without a bite is merely a stick.'], ['natty', 'I need a whetstone from the Spunkhenge Stones. Only the old stones will do.']),
    GO('poi:stones', 'Go to the Spunkhenge Stones.', { r: 20 }), GO('shop:natty', 'Bring the stone back.'), TALK(['natty', 'Your fists will thank you.'])], after: function () { SV.str = (SV.str || 0) + 1; } },
  { title: 'Trial by Fist', pay: 1300, steps: [TALK(['natty', 'Prove your bite. The gym has six challengers. Fists only.']),
    GO('shop:gym', 'Go to Iron Loads Gym.', { r: 16 }), { t: 'kill', spawn: [{ who: 'strongman', n: 4, at: 'shop:gym', spread: 10, hp: 60 }], fists: 1, msg: 'Beat the challengers with your fists.' },
    TALK(['natty', 'The bite returns. Stronger.'])], after: function () { SV.str = (SV.str || 0) + 1; } },
  { title: 'The Enchanted Bike', pay: 1600, steps: [TALK(['natty', 'Jessiah wants a rematch. To the observatory this time.']),
    { t: 'getin', type: 'moto', at: 'road:shop:natty', msg: 'Get on the bike.' }, { t: 'race', to: 'poi:observatory', rival: 'jessiah', rtype: 'moto', msg: 'Beat Jessiah to the observatory.' },
    TALK(['jessiah', 'An empty stomach makes a hollow man. Eat.'], ['natty', 'Twice. He will be insufferable about it.'])] },
  { title: 'Bite of the Moon', pay: 2200, steps: [TALK(['natty', 'The last enchantment needs the light of the Crimson Moon. At the altar, at night.']),
    { t: 'night' }, GO('poi:altar', 'Go to the Crimson Moon Altar at night.', { r: 16 }), TALK(['natty', 'Feel it? Your fists bite like a blade now.'])], after: function () { SV.str = (SV.str || 0) + 2; } }
]);
SIDE('fate', 'shop:fate', 'fate1', [
  { title: 'Reading', pay: 1100, steps: [TALK(['fate', 'The deck was never yours. Neither was your fate.'], ['fate', 'The cards say: go to the clock tower. Then come back. The cards are very particular.']),
    GO('poi:clock', 'Go to the clock tower.', { r: 16 }), GO('shop:fate', 'Go back to Stacked Fate.'), TALK(['fate', 'You did what the cards said. They are pleased. You are paid.'])] },
  { title: 'The Fool', pay: 1300, steps: [TALK(['fate', 'A man stole The Fool from my deck. He is driving it round the city in a taxi.']),
    { t: 'chase', type: 'taxi', at: 'road:dist:red', hp: 70, stall: 1, msg: 'Stop the taxi with The Fool in it.' }, TALK(['fate', 'The Fool returns to the deck. The man returns to being a fool.'])] },
  { title: 'Seven Candles', pay: 1600, steps: [TALK(['fate', 'Seven candles burn at seven places. Blow them out before the dawn.']),
    { t: 'night' }, { t: 'collect', n: 7, around: 'dist:club', spread: 420, time: 600, tile: 'star5', msg: 'Find the seven candles.' }, TALK(['fate', 'Dark now. As it should be.'])] },
  { title: 'The Tower', pay: 2200, steps: [TALK(['fate', 'The Tower card. Something falls. Be at Spunk Brain\'s dome when it does. Bring a gun.']),
    GO('poi:dome', 'Go to the Spunk Brain dome.', { r: 24 }), { t: 'kill', spawn: [{ kind: 'robot', n: 8, at: 'poi:dome', spread: 24 }], msg: 'Whatever falls, stop it.' },
    TALK(['fate', 'It fell. You stood. The cards are rarely surprised. They are surprised.'])] }
]);
SIDE('judge', 'shop:judge', 'judge1', [
  { title: 'Light', pay: 1100, steps: [TALK(['judge', 'Light or shadow. Both have a price.'], ['judge', 'Light, today. Five people need help. Find them.']),
    { t: 'getin', type: 'ambulance', at: 'road:shop:judge', msg: 'Get in the ambulance.' }, { t: 'drops', n: 5, around: 'dist:cafe', spread: 220, car: 1, msg: 'Get to each person who needs help.' },
    TALK(['judge', 'Five lights kept burning. Remember the feeling.'])] },
  { title: 'Shadow', pay: 1400, steps: [TALK(['judge', 'Shadow, today. A man who sells fake miracles at the chapel. End his business.']),
    GO('poi:chapel', 'Go to the chapel.', { r: 24 }), { t: 'kill', spawn: [{ kind: 'goon', n: 6, at: 'poi:chapel', spread: 18, wpn: 'pistol' }], msg: 'End the fake miracle business.' },
    TALK(['judge', 'Shadow has its uses. Do not get used to it.'])] },
  { title: 'Judgement Day', pay: 1800, steps: [TALK(['judge', 'Three cars race through the cafe streets every night. Somebody will die. Judge them.']),
    { t: 'night' }, { t: 'destroy', n: 3, type: 'sports', around: 'dist:cafe', spread: 150, moving: 1, msg: 'Wreck the three street racers.' }, TALK(['judge', 'Judged.'])] },
  { title: 'Balance', pay: 2400, steps: [TALK(['judge', 'Last lesson. Take the ambulance to the Bone Pit, save who you can, and take the shadows out on the way.']),
    { t: 'getin', type: 'ambulance', at: 'road:shop:judge', msg: 'Get in the ambulance.' }, GO('poi:quarry', 'Drive to the Bone Pit.', { r: 28, car: 1 }),
    { t: 'kill', spawn: [{ kind: 'goon', n: 6, at: 'poi:quarry', spread: 20, wpn: 'pistol' }], msg: 'Clear the shadows.' }, { t: 'deliver', to: 'shop:hosp', car: 1, time: 220, minHp: 30, msg: 'Get the wounded to the hospital.' },
    TALK(['judge', 'Light and shadow, both paid. You understand now.'])] }
]);
SIDE('steve', 'poi:gate', 'steve1', [
  { title: 'Grin and Bear It', pay: 1000, steps: [TALK(['steve', '...'], ['lab', 'Steve wants a ride on every ride. I mean you do. He watches. Grinning. Start with the Load Flume.']),
    GO('poi:flume', 'Go to the Load Flume.', { r: 20 }), GO('poi:coaster', 'Then the coaster.', { r: 24 }), GO('poi:ferris', 'Then the ferris wheel.', { r: 24 }), TALK(['steve', '...'], ['lab', 'Big grin. Biggest yet.'])] },
  { title: 'Balloon Hunt', pay: 1200, steps: [TALK(['steve', '...'], ['lab', 'Steve lost six balloons with his face on. They are floating round Ejaculand.']),
    { t: 'collect', n: 6, around: 'dist:ejac', spread: 120, time: 300, tile: 'star5', msg: 'Pick up Steve\'s balloons.' }, TALK(['steve', '...'], ['lab', 'He is grinning so hard his face might stay like that. It is already like that.'])] },
  { title: 'Clown Trouble', pay: 1500, steps: [TALK(['steve', '...'], ['lab', 'Clowns have taken over the funhouse. Steve hates clowns. Steve is basically a clown. Steve hates himself.']),
    GO('poi:mirrors', 'Go to the hall of mirrors.', { r: 26 }), { t: 'kill', spawn: [{ who: 'clown', n: 6, at: 'poi:mirrors', spread: 18 }, { who: 'pieclown', n: 2, at: 'poi:mirrors', spread: 18 }], msg: 'Get the clowns out.' },
    TALK(['steve', '...'], ['lab', 'He says thank you. With his face.'])] },
  { title: 'Steve\'s Parade', pay: 2000, steps: [TALK(['steve', '...'], ['lab', 'Steve\'s parade float is the ice cream van. Drive it round the park, slowly, past six crowds.']),
    { t: 'getin', type: 'icecream', at: 'road:poi:gate', msg: 'Get in the parade van.' }, { t: 'drops', n: 6, around: 'dist:ejac', spread: 120, car: 1, crowd: 1, msg: 'Stop by each crowd.' }, TALK(['steve', '...'], ['lab', 'Free rides for life. He means it this time.'])] }
]);
SIDE('jessiah', 'shop:jessiah', 'jess1', [
  { title: 'Soup Run', pay: 1000, steps: [TALK(['jessiah', 'An empty stomach makes a hollow man. Eat.'], ['jessiah', 'Soup for the night shift at the docks. Five stops, one at a time.']),
    { t: 'getin', type: 'van', at: 'road:shop:jessiah', msg: 'Get in the soup van.' }, { t: 'night' }, { t: 'drops', n: 5, around: 'dist:docks', spread: 140, car: 1, crowd: 1, msg: 'Stop at each crew.' }, TALK(['jessiah', 'Warm hands, warm hearts.'])] },
  { title: 'Knight\'s Errand', pay: 1300, steps: [TALK(['jessiah', 'My armour is at the castle smithy. Ride and fetch it, as a knight would.']),
    { t: 'getin', type: 'moto', at: 'road:shop:jessiah', msg: 'Get on the bike.' }, GO('poi:castle:Cumhead\'s Castle', 'Ride to Cumhead\'s Castle.', { r: 40, car: 1 }), GO('shop:jessiah', 'Bring the armour back.', { car: 1 }),
    TALK(['jessiah', 'It still fits. Barely. I have been eating.'])], after: function () { P.armour = Math.max(P.armour || 0, 50); } },
  { title: 'Hunger Strike', pay: 1600, steps: [TALK(['jessiah', 'Robbers stole the food bank\'s van. A hollow city is a dangerous city.']),
    { t: 'chase', type: 'van', at: 'road:dist:cafe', crew: 'goon', hp: 90, stall: 1, msg: 'Stop the stolen food van.' }, { t: 'getin', type: 'van', target: 'chase', msg: 'Get in the van.' }, GO('shop:jessiah', 'Bring the food back.', { car: 1 }),
    TALK(['jessiah', 'Every tin. Every loaf. A knight\'s work.'])] },
  { title: 'The Feast', pay: 2200, steps: [TALK(['jessiah', 'A feast at the castle. Everyone eats. Bring the cooks: Amy, Greebo, Ali. In one car. Fear nothing.']),
    { t: 'getin', type: 'limo', at: 'road:shop:jessiah', msg: 'Get in the limo.' }, GO('shop:amy', 'Pick up Amy.', { car: 1 }), GO('shop:greebo', 'Pick up Greebo.', { car: 1 }), GO('shop:ali', 'Pick up Ali.', { car: 1 }),
    { t: 'deliver', to: 'poi:castle:Cumhead\'s Castle', r: 40, car: 1, time: 400, minHp: 50, msg: 'Get the cooks to the castle.' }, TALK(['jessiah', 'Nobody in Cum City is hollow tonight.'])] }
]);
SIDE('bates', 'shop:bates', 'bates1', [
  { title: 'Breathe', pay: 1100, steps: [TALK(['bates', 'One must clear one\'s head before one proceeds.'], ['bates', 'Sit at the view point above the city. Breathe. Come back.']),
    GO('poi:view', 'Go to a view point.', { r: 14, nowanted: 1 }), { t: 'wait2', time: 10, msg: 'Breathe.' }, GO('shop:bates', 'Go back to Master Bates.'), TALK(['bates', 'Clearer. A little clearer.'])] },
  { title: 'Long Walk', pay: 1300, steps: [TALK(['bates', 'Walk to the windmill. No cars. One must feel the ground.']),
    GO('poi:windmill', 'Walk to the windmill. No cars.', { r: 18, foot: 1 }), TALK(['bates', 'Your legs remember what they are for.'])] },
  { title: 'Clear the Path', pay: 1600, steps: [TALK(['bates', 'Rowdy men disturb the stones at Spunkhenge. Clear them, quietly.']),
    GO('poi:stones', 'Go to the Spunkhenge Stones.', { r: 22 }), { t: 'kill', spawn: [{ kind: 'cit', n: 6, at: 'poi:stones', spread: 14, angry: 1, hp: 40 }], fists: 1, msg: 'Clear the rowdy men. Fists only.' },
    TALK(['bates', 'The stones are quiet. So are you. Good.'])] },
  { title: 'The Clearest Head', pay: 2500, steps: [TALK(['bates', 'The last lesson. Climb the ranger lookout at dawn and look at the whole of Cum City.']),
    GO('poi:lookout', 'Go to a ranger lookout.', { r: 14, nowanted: 1 }), TALK(['bates', 'All of it. Every load of it. Yours.'])] }
]);

/* two small step types the side jobs use: a quiet wait, and a walk with no vehicle */
(function () { var si = stepInit; stepInit = function (s) { if (s.t === 'wait2') { MS.st.left = s.time; G.timer = null; G.objective = s.msg; return; } return si(s); };
  var sm = stepMission; stepMission = function (dt) { if (!G.cut && G.mission && MS) { var s = MS.m.steps[MS.i]; if (s && s.t === 'wait2') { MS.st.left -= dt; G.counter = Math.ceil(MS.st.left) + 's'; if (MS.st.left <= 0) { G.counter = null; nextStep(); } return; } if (s && s.foot && P.state === 'car') { G.objective = 'Get out and walk.'; G.mission.mark = placeOf(s.to); return; } } return sm(dt); }; })();
