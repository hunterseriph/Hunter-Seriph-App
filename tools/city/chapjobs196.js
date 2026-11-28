/* ---------- update 196 (his ask: "new batches of missions for everyone in each chapter"): every character has a job of
   their own in each of the three chapters. They open once the chapter has begun (after its first story mission) and
   can be done until its last story mission ends the chapter; starting that last one asks first while jobs are left. ---------- */
(function () {
  var REQ = { zombie: 'z1', robot: 'r1', blum: 'b1' }, NAMES = { zombie: 'Dead Loads', robot: 'Rise of the Machines', blum: "Blumhead's Plan" };
  function CJ(chap, list) { list.forEach(function (o) { MI({ id: 'c' + chap[0] + '_' + o.who, who: o.who, title: o.title, at: o.at || (o.who === 'steve' ? 'poi:gate' : 'shop:' + (CAST[o.who] && CAST[o.who].shop || 'club')), chap: chap, req: [REQ[chap]], pay: o.pay, give: o.give, steps: o.steps, chapJob: 1 }); }); }
  var K = function (kind, n, at, spread, wpn, msg) { return { t: 'kill', spawn: [{ kind: kind, n: n, at: at, spread: spread || 16, wpn: wpn || null }], msg: msg }; };
  var SURV = function (kind, time, at, msg) { return { t: 'survive', time: time, kind: kind, at: at, msg: msg }; };

  /* ---------------- Chapter Two: Dead Loads ---------------- */
  CJ('zombie', [
    { who: 'lab', title: 'Martial Law', pay: 2600, give: ['shotgun', 20], steps: [TALK(['lab', 'Mister Mayor, the police station has fallen. The police have fallen. Some of them are still walking about, which is worse.'], ['lab', 'Take the shotgun. I have declared martial law. I am the martial.']),
      GO('shop:cops', 'Get to the police station.', { r: 22 }), K('zombie', 10, 'shop:cops', 18, null, 'Clear the zombies out of the police station.'),
      TALK(['lab', 'Station secure. Six officers, two dogs and a very confused traffic warden. I am giving them all a badge.'])] },
    { who: 'tb', title: 'Patient Zero', pay: 2400, steps: [TALK(['tb', T2], ['lab', 'TB says his gimps drank the tea. Now they are zombies. He says you cannot tell the difference. I can tell the difference. One of them ate a bin.']),
      K('zombie', 8, 'shop:tb', 14, null, 'Put down TB\'s zombie gimps.'), TALK(['tb', T2], ['lab', 'He is sad. He is also already hiring new gimps.'])] },
    { who: 'greebo', title: 'Pies of the Dead', pay: 2200, steps: [TALK(['greebo', 'People are hiding in their houses in Cum Hills and they have not eaten for days.'], ['greebo', 'Pies. Five houses. One at a time. Do not stop, do not open the boot, they can smell the cream.']),
      { t: 'getin', type: 'van', at: 'road:shop:greebo', msg: 'Get in Greebo\'s pie van.' }, { t: 'drops', n: 5, around: 'dist:hills', spread: 160, car: 1, msg: 'Drop a pie at each barricaded house.' },
      TALK(['greebo', 'They clapped. Through the planks. Nobody has ever clapped my pies before.'])] },
    { who: 'spermaid', title: 'Sanctuary', pay: 2800, steps: [TALK(['spermaid', 'Sweetie, half the city is hiding in my Sanctum and the dead are at the door.'], ['spermaid', 'Hold them off while my sisters seal the windows with holy cream?']),
      SURV('zombie', 70, 'shop:sanct', 'Keep the zombies out of the Spermaid Sanctum.'), TALK(['spermaid', 'Sealed. Everyone inside is safe and slightly sticky. Thank you, my hero.'])] },
    { who: 'amy', title: 'Too Hot to Eat', pay: 2100, steps: [TALK(['amy', 'Mild, hot or dynamite?'], ['amy', 'Zombies will not touch anything hotter than mild. My dynamite chilli crates fell off the lorry round the Cafe Streets. Get all six.']),
      { t: 'collect', n: 6, around: 'dist:cafe', spread: 120, time: 240, tile: 'crate', msg: 'Pick up the crates of dynamite chilli.' }, GO('shop:amy', 'Bring the chilli back to Amy.'),
      TALK(['amy', 'One spoon of this on your doorstep and they turn right round. Two spoons and so do you.'])] },
    { who: 'saba', title: 'Hitless Horde', pay: 3000, give: ['shotgun', 30], steps: [TALK(['saba', 'A horde is coming through the building site, my friend. Hitless run. Let none of them touch you.']),
      GO('dist:site', 'Get to the building site.', { r: 50 }), K('zombie', 14, 'dist:site', 30, null, 'Clear the horde at the building site.'),
      TALK(['saba', 'Not one hit? I saw one hit. I will allow it. The world is ending.'])] },
    { who: 'joff', title: 'The Last Pizza', pay: 2000, steps: [TALK(['joff', 'People still want pizza. Pineapple pizza. At the end of the world. I have never been prouder.'], ['joff', 'Five houses, one at a time. Do not stop at red lights. There are no red lights. There are only the dead.']),
      { t: 'getin', type: 'scooter', at: 'road:shop:joff', msg: 'Get on the pizza scooter.' }, { t: 'drops', n: 5, around: 'dist:club', spread: 150, car: 1, msg: 'Deliver the pizzas.' },
      TALK(['joff', 'Five stars from five houses. Well, four. One of them had already turned. He still ate it.'])] },
    { who: 'beeb', title: 'Last Orders', pay: 2300, steps: [TALK(['beeb', 'Sit down, lad. First one\'s always warm.'], ['beeb', 'The pub is the safest place in town. Always has been. The regulars are in. Keep the dead out till closing.']),
      SURV('zombie', 65, 'shop:beebs', 'Keep the zombies out of Uncle Beeb\'s pub.'), TALK(['beeb', 'Time, gentlemen. Not you lot outside. You are barred.'])] },
    { who: 'harold', title: 'Bitter Brew', pay: 2600, steps: [TALK(['harold', 'Oh dear, oh dear. My tea did this. I need to study it. A sample from the ones at Spunk Brain Labs, where it all began.'], ['harold', 'They will not give it willingly. Splendid!']),
      GO('dist:brain', 'Go to Spunk Brain Labs.', { r: 50 }), K('zombie', 8, 'dist:brain', 22, null, 'Take samples from the zombies at Spunk Brain.'), GO('shop:harold', 'Bring the samples to Harold.'),
      TALK(['harold', 'Fascinating. They are ninety percent cream. So am I, before breakfast.'])] },
    { who: 'kaya', title: 'Caffeine Supply', pay: 2200, steps: [TALK(['kaya', 'The survivors need coffee! Nobody can stay awake on watch without it.'], ['kaya', 'Our beans are in a van at the docks. Bring it back, and do not let anything bite the van.']),
      { t: 'getin', type: 'van', at: 'road:dist:docks', msg: 'Get in the coffee van at the docks.' }, { t: 'deliver', to: 'shop:cafe', car: 1, time: 240, minHp: 40, horde: 'zombie', msg: 'Get the beans back to the Cum Cafe.' },
      TALK(['kaya', 'Fresh brew for everyone! The zombies are welcome to the decaf.'])] },
    { who: 'elden', title: 'Closing Time', pay: 2400, give: ['knife', 1], steps: [TALK(['elden', 'They are in the kitchen.'], ['elden', 'Take a knife. I have the cleaver. Nobody eats in my kitchen without ordering.']),
      K('zombie', 9, 'shop:cafe', 14, null, 'Clear the zombies out of the cafe.'), TALK(['elden', 'Kitchen\'s open. Mind the floor.'])] },
    { who: 'ali', title: 'Garlic Wall', pay: 2100, steps: [TALK(['ali', 'Everything is better with garlic. Especially not being eaten.'], ['ali', 'The farms out in the countryside have the last of the garlic. Six crates. I will build a wall of it.']),
      { t: 'collect', n: 6, around: 'poi:farm', spread: 140, time: 300, tile: 'crate', msg: 'Pick up the crates of garlic.' }, GO('shop:ali', 'Bring the garlic back to Ali.'),
      TALK(['ali', 'They walk up, they smell it, they walk away. Like my last three dates.'])] },
    { who: 'potbelly', title: 'Arcade Bunker', pay: 2500, steps: [TALK(['potbelly', 'Cabinets are free, kid. Still. Even now.'], ['potbelly', 'I have thirty people in the arcade playing Meatnado to calm down. The dead want in. Hold the door.']),
      SURV('zombie', 70, 'shop:arcade', 'Keep the zombies out of Potbelly\'s Arcade.'), TALK(['potbelly', 'High score, kid. Everyone still has their brains. Mostly.'])] },
    { who: 'pulsar', title: 'Dead Beats', pay: 2600, steps: [TALK(['pulsar', 'Friend. The dead follow the bass. I have tested this. I will play a set at the docks and lead them away from the houses.'], ['pulsar', 'You keep them off the decks. Free of charge, obviously.']),
      GO('poi:crane', 'Get to the docks with Pulsar.', { r: 24, car: 1 }), SURV('zombie', 60, 'poi:crane', 'Keep the zombies off Pulsar\'s decks.'),
      TALK(['pulsar', 'Best crowd I have ever had. They did not dance. But they did not leave.'])] },
    { who: 'bonjo', title: 'Looters', pay: 2300, steps: [TALK(['bonjo', 'Welcome, welcome. Let me get the door. Oh. There is no door. Looters took the door. And all the leather.'], ['bonjo', 'Their van is heading for the red lights. Stop it.']),
      { t: 'chase', type: 'van', at: 'road:shop:bonjo', crew: 'butcher', hp: 110, msg: 'Wreck the looters\' van.' }, TALK(['bonjo', 'My leather! Zombies love leather. It is chewy. You saved it from a fate worse than death.'])] },
    { who: 't', title: 'Get My Girls Out', pay: 2700, steps: [TALK(['t', 'Darling, four of my girls are trapped round the red lights. Pick them up one at a time and bring them back to me.']),
      { t: 'getin', type: 'limo', at: 'road:shop:t', msg: 'Get in T\'s limo.' }, { t: 'drops', n: 4, around: 'dist:red', spread: 120, car: 1, msg: 'Pick up each of T\'s girls.' },
      { t: 'deliver', to: 'shop:t', car: 1, time: 180, minHp: 30, horde: 'zombie', msg: 'Get the girls back to T\'s.' }, TALK(['t', 'All safe. You are a gentleman. A dangerous one. I like that.'])] },
    { who: 'jessiah', title: 'Soup for the Living', pay: 2000, steps: [TALK(['jessiah', 'An empty stomach makes a hollow man. A hollow man is easy prey.'], ['jessiah', 'Five shelters by the docks. Soup, one at a time.']),
      { t: 'getin', type: 'van', at: 'road:shop:jessiah', msg: 'Get in the soup van.' }, { t: 'drops', n: 5, around: 'dist:docks', spread: 130, car: 1, msg: 'Take soup to each shelter.' },
      TALK(['jessiah', 'They are fed. Fed men fight. Go with God, droplet.'])] },
    { who: 'natty', title: 'Sharpened Stones', pay: 2400, steps: [TALK(['natty', 'A blade without a bite is merely a stick. I need the old stones again. The dead have found them first.']),
      GO('poi:stones', 'Go to the Spunkhenge Stones.', { r: 26 }), K('zombie', 9, 'poi:stones', 20, null, 'Clear the dead from the stones.'),
      TALK(['natty', 'Good. Now every blade in my shop can bite back.'])] },
    { who: 'fate', title: 'The Dead Card', pay: 2500, steps: [TALK(['fate', 'The deck was never yours. Tonight it gave me Death. Upright. At the cemetery.'], ['fate', 'Go and change the card.']),
      { t: 'night' }, GO('poi:chapel', 'Go to the cemetery.', { r: 26 }), K('zombie', 11, 'poi:chapel', 26, null, 'Put the dead back in the cemetery.'),
      TALK(['fate', 'Death. Reversed. You did that. The cards will remember.'])] },
    { who: 'judge', title: 'Shadow Work', pay: 2500, steps: [TALK(['judge', 'Light or shadow. Both have a price. The asylum chose shadow. Its patients are walking again.']),
      GO('poi:asylum', 'Go to the asylum.', { r: 30 }), K('zombie', 10, 'poi:asylum', 22, null, 'End what is walking at the asylum.'), TALK(['judge', 'It is done. The light paid for it.'])] },
    { who: 'bates', title: 'Inner Peace', pay: 2000, steps: [TALK(['bates', 'One must clear one\'s head before one proceeds. Even now. Especially now.'], ['bates', 'The view point. Sit. Breathe. If anything shambles towards you, do not let it disturb your breathing.']),
      GO('poi:view', 'Go to the view point.', { r: 18 }), SURV('zombie', 50, 'poi:view', 'Hold your calm at the view point.'),
      TALK(['bates', 'You breathed through an apocalypse. One is impressed.'])] },
    { who: 'steve', title: 'Ride Till You Die', pay: 2400, steps: [TALK(['steve', '...'], ['lab', 'The dead got into Ejaculand. Steve is still grinning, but it is a worried grin. Clear the coaster.']),
      GO('poi:coaster', 'Get to the coaster.', { r: 26 }), K('zombie', 12, 'poi:coaster', 26, null, 'Clear the zombies off the coaster.'), TALK(['steve', '...'], ['lab', 'He says thank you. With his eyes. They are the same eyes.'])] }
  ]);

  /* ---------------- Chapter Three: Rise of the Machines ---------------- */
  CJ('robot', [
    { who: 'lab', title: 'Resistance HQ', pay: 3200, give: ['smg', 60], steps: [TALK(['lab', 'The Clubhouse is the last messy building in Cum City, Mister Mayor. That makes it the resistance headquarters.'], ['lab', 'And the robots know. Here come the cleaners.']),
      K('robot', 9, 'shop:club', 18, null, 'Defend the Clubhouse from the robots.'), TALK(['lab', 'Resistance HQ is still standing. Still filthy. I have never been prouder of the carpet.'])] },
    { who: 'tb', title: 'Too Dirty to Clean', pay: 3000, steps: [TALK(['tb', T2], ['lab', 'TB is the messiest thing in the city. Every robot is coming for him. He says let them try. He is drinking lotion to make it harder.']),
      SURV('robot', 70, 'shop:tb', 'Keep the robots from cleaning TB.'), TALK(['tb', T2], ['lab', 'He is still filthy. The robots are scrap. Everyone wins except hygiene.'])] },
    { who: 'greebo', title: 'Health Inspection', pay: 2800, steps: [TALK(['greebo', 'The robots shut my shop. They say my pies are a biohazard. They are not wrong. That is not the point.'], ['greebo', 'Their inspection vans are driving round the Cafe Streets. Four of them. Wreck them.']),
      { t: 'destroy', n: 4, type: 'van', around: 'dist:cafe', spread: 90, moving: 1, robots: 1, msg: 'Wreck the robot inspection vans.' }, TALK(['greebo', 'Shop is open. Five stars from me to me.'])] },
    { who: 'spermaid', title: 'Rust', pay: 3200, steps: [TALK(['spermaid', 'Sweetie, the machines have taken my lighthouse. They want to clean the sea.'], ['spermaid', 'Salt water rusts them. Drive them into the sea, or just break them. Either is lovely.']),
      GO('poi:lighthouse', 'Get to the lighthouse.', { r: 30 }), K('robot', 9, 'poi:lighthouse', 20, null, 'Take back the lighthouse.'), TALK(['spermaid', 'The light is on again. The sea stays dirty. As it should be.'])] },
    { who: 'amy', title: 'Overheating', pay: 2700, steps: [TALK(['amy', 'Mild, hot or dynamite?'], ['amy', 'The robots charge up at stations round Spunk Brain. Slip a dynamite chilli in each one. They will melt from the inside.']),
      { t: 'getin', type: 'hatch', at: 'road:shop:amy', msg: 'Get in Amy\'s car.' }, { t: 'drops', n: 5, around: 'dist:brain', spread: 140, car: 1, msg: 'Drop a dynamite chilli at each charging station.' },
      TALK(['amy', 'Hear that? That is the sound of a robot that ordered dynamite.'])] },
    { who: 'saba', title: 'Hitless Against the Machine', pay: 3600, give: ['rifle', 20], steps: [TALK(['saba', 'Machines do not miss, my friend. So you must not be there when they shoot. Hitless.'], ['saba', 'They have the building site. Take the rifle.']),
      GO('dist:site', 'Get to the building site.', { r: 50 }), K('robot', 12, 'dist:site', 30, null, 'Destroy the robots at the building site.'), TALK(['saba', 'Clean run. Ironic.'])] },
    { who: 'joff', title: 'Pineapple Virus', pay: 2600, steps: [TALK(['joff', 'Robots hate pineapple on pizza. They have a rule about it. So I have made a pizza that is all pineapple.'], ['joff', 'Get it to the Spunk Brain dome. Their brain will melt trying to decide what it is.']),
      { t: 'getin', type: 'scooter', at: 'road:shop:joff', msg: 'Get on the pizza scooter.' }, { t: 'deliver', to: 'poi:dome', car: 1, time: 220, minHp: 20, horde: 'robot', msg: 'Deliver the pineapple pizza to the dome.' },
      TALK(['joff', 'It worked. Half of them are arguing with the other half. Fight me, robots.'])] },
    { who: 'beeb', title: 'Unplugged', pay: 2800, steps: [TALK(['beeb', 'They say a pub is unhygienic, lad. Of course it is. That is what it is for.'], ['beeb', 'They are coming to scrub it. Keep them out.']),
      SURV('robot', 65, 'shop:beebs', 'Keep the robots out of Uncle Beeb\'s pub.'), TALK(['beeb', 'Sticky floor saved. On the house. Just the one.'])] },
    { who: 'harold', title: 'Rust Tea', pay: 2900, steps: [TALK(['harold', 'A tea that rusts machines! Splendid! I need rusty bolts from the Blood Factory. Five should do.']),
      { t: 'collect', n: 5, around: 'dist:factory', spread: 120, time: 260, tile: 'crate', msg: 'Pick up the rusty bolts.' }, GO('shop:harold', 'Bring the bolts to Harold.'),
      TALK(['harold', 'One cup and they seize up. Two cups and they write a complaint. Lovely.'])] },
    { who: 'kaya', title: 'Espresso Shot', pay: 2700, steps: [TALK(['kaya', 'The robots are patrolling Clubhouse Row in vans and scanning everyone. Nobody can get to the cafe!'], ['kaya', 'Four patrol vans. Elden says do not be gentle.']),
      { t: 'destroy', n: 4, type: 'van', around: 'dist:club', spread: 90, moving: 1, robots: 1, msg: 'Wreck the robot patrol vans.' }, TALK(['kaya', 'Coffee\'s on! Extra shot for the hero.'])] },
    { who: 'elden', title: 'Scrap', pay: 2800, steps: [TALK(['elden', 'They took my grill to the scrapyard.'], ['elden', 'Get it back.']),
      GO('poi:scrapyard', 'Go to the scrapyard.', { r: 30 }), K('robot', 8, 'poi:scrapyard', 22, null, 'Smash the robots guarding the scrapyard.'), TALK(['elden', 'Grill\'s back. Order up.'])] },
    { who: 'ali', title: 'Garlic Grease', pay: 2600, steps: [TALK(['ali', 'Garlic oil gums up their joints. Everything is better with garlic. Even sabotage.'], ['ali', 'Pour some on the runways at the airport, where they land the new ones. Five spots.']),
      { t: 'getin', type: 'hatch', at: 'road:shop:ali', msg: 'Get in Ali\'s car.' }, { t: 'drops', n: 5, around: 'dist:airport', spread: 150, car: 1, msg: 'Pour garlic oil at each landing spot.' },
      TALK(['ali', 'They slip, they slide, they smell amazing. Job done.'])] },
    { who: 'potbelly', title: 'Game Over, Again', pay: 3000, steps: [TALK(['potbelly', 'Kid, they took my cabinets. Loaded them on a lorry. Said games make a mess of people\'s minds.'], ['potbelly', 'They are right. Get them back.']),
      { t: 'chase', type: 'truck', at: 'road:shop:arcade', hp: 160, stall: 1, msg: 'Stop the lorry full of arcade cabinets.' }, TALK(['potbelly', 'All there. Free to play, as always. Insert no coin.'])] },
    { who: 'pulsar', title: 'Noise Complaint', pay: 3000, steps: [TALK(['pulsar', 'Friend. If I play feedback from the radio mast the whole city hears it. Every robot will come running. Into you. Sorry.']),
      GO('poi:mast', 'Get to the radio mast.', { r: 26, car: 1 }), SURV('robot', 60, 'poi:mast', 'Keep the robots off the mast while Pulsar plays.'),
      TALK(['pulsar', 'Their ears are fried. They do not have ears. Something is fried.'])] },
    { who: 'bonjo', title: 'Chrome and Leather', pay: 2700, steps: [TALK(['bonjo', 'Welcome, welcome. The robots want to polish my leather. Polish it! Leather is meant to be lived in!']),
      K('robot', 8, 'shop:bonjo', 16, null, 'Get the robots out of Bonjo\'s boutique.'), TALK(['bonjo', 'They wanted chrome, they got leather. Lovely job.'])] },
    { who: 't', title: 'Off the Grid', pay: 3000, steps: [TALK(['t', 'Darling, the robots are scanning faces. Four of my girls need to get to safe houses in Cum Hills, out of sight. One at a time.']),
      { t: 'getin', type: 'limo', at: 'road:shop:t', msg: 'Get in T\'s limo.' }, { t: 'drops', n: 4, around: 'dist:hills', spread: 150, car: 1, msg: 'Get each girl to her safe house.' },
      TALK(['t', 'Off the grid. Like the best nights.'])] },
    { who: 'jessiah', title: 'Ration Run', pay: 2600, steps: [TALK(['jessiah', 'The machines ration food now. One beige cube a day. Man shall not live on beige cubes.'], ['jessiah', 'A boat brought real food to the jetty. Bring the van to me.']),
      { t: 'getin', type: 'van', at: 'road:poi:jetty', msg: 'Get in the food van at the jetty.' }, { t: 'deliver', to: 'shop:jessiah', car: 1, time: 260, minHp: 40, horde: 'robot', msg: 'Get the food to Jessiah.' },
      TALK(['jessiah', 'Real bread. Real soup. Tell nobody it was easy.'])] },
    { who: 'natty', title: 'Blade Runner', pay: 2900, steps: [TALK(['natty', 'Steel against steel. The quarry is full of them, mining for their new bodies.']),
      GO('poi:quarry', 'Go to the quarry.', { r: 30 }), K('robot', 9, 'poi:quarry', 24, null, 'Stop the robots at the quarry.'), TALK(['natty', 'Your blade has learned something today. So have you.'])] },
    { who: 'fate', title: 'Ghost in the Machine', pay: 2800, steps: [TALK(['fate', 'The cards cannot read machines. That frightens me. Go to the observatory at night. They are reading the stars.']),
      { t: 'night' }, GO('poi:observatory', 'Go to the observatory.', { r: 28 }), SURV('robot', 50, 'poi:observatory', 'Hold the observatory against the robots.'),
      TALK(['fate', 'The stars are ours again. And the cards are talking.'])] },
    { who: 'judge', title: 'Judgement on the Machines', pay: 3000, steps: [TALK(['judge', 'The machines took the police cars. Now they arrest people for being alive. Light, today. Burn the cars.']),
      { t: 'destroy', n: 4, type: 'police', around: 'shop:cops', spread: 80, moving: 1, robots: 1, msg: 'Wreck the robot police cars.' }, TALK(['judge', 'Judged.'])] },
    { who: 'bates', title: 'Signal and Noise', pay: 2700, steps: [TALK(['bates', 'One cannot clear one\'s head with that humming. They have a relay at the lookout.'], ['bates', 'Remove it. Breathe afterwards.']),
      GO('poi:lookout', 'Go to the lookout.', { r: 26 }), K('robot', 8, 'poi:lookout', 20, null, 'Destroy the robots at the lookout relay.'), TALK(['bates', 'Silence. One proceeds.'])] },
    { who: 'steve', title: 'Robot Rides', pay: 2800, steps: [TALK(['steve', '...'], ['lab', 'The robots are cleaning Ejaculand. They want to turn the big wheel into a bin. Steve has stopped grinning. Do something.']),
      GO('poi:ferris', 'Get to the big wheel.', { r: 26 }), K('robot', 10, 'poi:ferris', 24, null, 'Get the robots off the big wheel.'), TALK(['steve', '...'], ['lab', 'He is grinning again. Never make him stop again.'])] }
  ]);

  /* ---------------- Chapter Four: Blumhead's Plan ---------------- */
  CJ('blum', [
    { who: 'lab', title: 'Goo Patrol', pay: 3800, steps: [TALK(['lab', 'Mister Mayor, Blumhead\'s goons are saying Hail Blumhead outside the Clubhouse. On my steps. Using my steps.']),
      K('goon', 10, 'shop:club', 18, 'pistol', 'Clear the goons off the Clubhouse steps.'), TALK(['lab', 'Steps cleared. I am going to hose them down. Then I am going to hose myself down.'])] },
    { who: 'tb', title: 'Goo in the Supply', pay: 3600, steps: [TALK(['tb', T2], ['lab', 'TB says Blumhead put goo in his pills. Three goo tankers are driving round the Blood Factory. TB wants them gone. He used a word for them.'], ['tb', T2]),
      { t: 'destroy', n: 3, type: 'truck', around: 'dist:factory', spread: 90, moving: 1, msg: 'Wreck the goo tankers.' }, TALK(['tb', T2], ['lab', 'He means thank you.'])] },
    { who: 'greebo', title: 'Clean Flour', pay: 3000, steps: [TALK(['greebo', 'The goo is in everything. My flour is purple. My pies are whispering.'], ['greebo', 'The farms might still have clean sacks. Six of them.']),
      { t: 'collect', n: 6, around: 'poi:farm', spread: 140, time: 300, tile: 'crate', msg: 'Find the clean sacks of flour.' }, GO('shop:greebo', 'Bring the flour back to Greebo.'),
      TALK(['greebo', 'Clean pies. They are quiet. I miss the whispering a bit.'])] },
    { who: 'spermaid', title: 'The Last Font', pay: 3800, steps: [TALK(['spermaid', 'Sweetie, the goo cannot touch holy cream. My Sanctum is the last clean place in Cum City, and he knows it.'], ['spermaid', 'They are coming for my font. Protect it.']),
      SURV('goon', 70, 'shop:sanct', 'Protect the holy font in the Sanctum.'), TALK(['spermaid', 'The font is still pure. Unlike you, my love. Never change.'])] },
    { who: 'amy', title: 'Dynamite Against Goo', pay: 3200, steps: [TALK(['amy', 'Mild, hot or dynamite?'], ['amy', 'Goo boils at dynamite. Drop a pot by each goo pool round Blumhead\'s side of town.']),
      { t: 'getin', type: 'hatch', at: 'road:shop:amy', msg: 'Get in Amy\'s car.' }, { t: 'drops', n: 5, around: 'dist:blumc', spread: 140, car: 1, msg: 'Drop a pot of dynamite chilli in each goo pool.' },
      TALK(['amy', 'Steam everywhere. Smells like victory. And chilli.'])] },
    { who: 'saba', title: 'Hitless Purge', pay: 4200, give: ['smg', 80], steps: [TALK(['saba', 'The goons are gathering at Blumhead\'s gate, my friend. Last hitless run before the end. Make it count.']),
      GO('dist:blumc', 'Go to Blumhead\'s side of town.', { r: 60 }), K('goon', 14, 'dist:blumc', 32, 'pistol', 'Clear out the goons.'), TALK(['saba', 'Beautiful run. I will tell the chat.'])] },
    { who: 'joff', title: 'Goo-Free Delivery', pay: 2800, steps: [TALK(['joff', 'People are hiding from the goo in Cum Hills. They want pizza. Goo-free, pineapple-full.'], ['joff', 'Six doors, one at a time.']),
      { t: 'getin', type: 'scooter', at: 'road:shop:joff', msg: 'Get on the pizza scooter.' }, { t: 'drops', n: 6, around: 'dist:hills', spread: 160, car: 1, msg: 'Deliver the goo-free pizzas.' },
      TALK(['joff', 'They said it was the best pizza of the apocalypse. Which apocalypse? All of them.'])] },
    { who: 'beeb', title: 'Mind the Goo', pay: 3000, steps: [TALK(['beeb', 'Lad, the goons want to turn my regulars. They have been trying to turn my regulars for thirty years. They will not manage it now.']),
      SURV('goon', 65, 'shop:beebs', 'Keep the goons out of Uncle Beeb\'s pub.'), TALK(['beeb', 'Every regular still a regular. Pull up a stool.'])] },
    { who: 'harold', title: 'Anti-Goo Tea', pay: 3300, steps: [TALK(['harold', 'A tea that unturns the turned! I need moss from the grotto. Glowing moss. Five clumps. It may glow at you. Splendid!']),
      { t: 'collect', n: 5, around: 'dist:grotto', spread: 110, time: 260, tile: 'crate', msg: 'Pick the glowing moss.' }, GO('shop:harold', 'Bring the moss to Harold.'),
      TALK(['harold', 'One sip and they remember their own names. Two sips and they remember their passwords. Lovely.'])] },
    { who: 'kaya', title: 'Wake Up Call', pay: 2900, steps: [TALK(['kaya', 'The goo makes people sleepy and then it makes them his. Coffee keeps them awake!'], ['kaya', 'Five cups to the people hiding round Clubhouse Row. One at a time.']),
      { t: 'getin', type: 'hatch', at: 'road:shop:cafe', msg: 'Get in the cafe car.' }, { t: 'drops', n: 5, around: 'dist:club', spread: 140, car: 1, msg: 'Take a coffee to each hiding place.' },
      TALK(['kaya', 'Wide awake, all of them! Nobody is turning on my watch.'])] },
    { who: 'elden', title: 'Calamari', pay: 3200, steps: [TALK(['elden', 'Tentacles coming out of the sea at the jetty.'], ['elden', 'And goons with them. I want the tentacles. You get the goons.']),
      GO('poi:jetty', 'Go to the jetty.', { r: 26 }), K('goon', 10, 'poi:jetty', 20, 'pistol', 'Clear the goons at the jetty.'), TALK(['elden', 'Calamari special tonight.'])] },
    { who: 'ali', title: 'Garlic Ward', pay: 2900, steps: [TALK(['ali', 'Goo hates garlic. Everything hates garlic except people with taste.'], ['ali', 'Six crates from the farms. I will ward the whole street.']),
      { t: 'collect', n: 6, around: 'poi:farm', spread: 140, time: 300, tile: 'crate', msg: 'Pick up the crates of garlic.' }, GO('shop:ali', 'Bring the garlic back to Ali.'),
      TALK(['ali', 'The street is warded. And everyone can smell it from the airport.'])] },
    { who: 'potbelly', title: 'Insert Coin', pay: 3400, steps: [TALK(['potbelly', 'Kid, the goons want my arcade for a goo church. Over my dead belly.']),
      SURV('goon', 70, 'shop:arcade', 'Keep the goons out of the arcade.'), TALK(['potbelly', 'Still an arcade. Still free. Go play something, you earned it.'])] },
    { who: 'pulsar', title: 'Frequency', pay: 3400, steps: [TALK(['pulsar', 'Friend. The goo hums. I found the note that breaks it. I need the radio mast to play it to the whole city.']),
      GO('poi:mast', 'Get to the radio mast.', { r: 26, car: 1 }), SURV('goon', 55, 'poi:mast', 'Keep the goons off the mast while Pulsar plays.'),
      TALK(['pulsar', 'Did you feel the goo let go? That was the drop.'])] },
    { who: 'bonjo', title: 'Dressed for the End', pay: 3000, steps: [TALK(['bonjo', 'Welcome, welcome. Blumhead\'s goons stole my best leather for his ceremony. A limo, heading for his castle.']),
      { t: 'chase', type: 'limo', at: 'road:shop:bonjo', hp: 140, stall: 1, msg: 'Stop the limo with the stolen leather.' }, TALK(['bonjo', 'Nobody wears my leather to an evil ceremony. Except me.'])] },
    { who: 't', title: 'One Last Dance', pay: 3200, steps: [TALK(['t', 'Darling, if this is the end, my girls are going out dancing. Four of them, round the red lights. Pick them up and keep the goo off them.']),
      { t: 'getin', type: 'limo', at: 'road:shop:t', msg: 'Get in T\'s limo.' }, { t: 'drops', n: 4, around: 'dist:red', spread: 120, car: 1, msg: 'Pick up each of T\'s girls.' },
      { t: 'deliver', to: 'shop:t', car: 1, time: 180, minHp: 30, horde: 'goon', msg: 'Get the girls back to T\'s.' }, TALK(['t', 'If the world ends tonight, at least it ends dancing.'])] },
    { who: 'jessiah', title: 'Feed the Resistance', pay: 2900, steps: [TALK(['jessiah', 'The fighters at the Clubhouse have not eaten. I have a van of bread at the docks. Bring it to them.']),
      { t: 'getin', type: 'van', at: 'road:dist:docks', msg: 'Get in the bread van at the docks.' }, { t: 'deliver', to: 'shop:club', car: 1, time: 260, minHp: 40, horde: 'goon', msg: 'Get the bread to the Clubhouse.' },
      TALK(['jessiah', 'Bread for the fight. The goo cannot make bread. Remember that.'])] },
    { who: 'natty', title: 'Egg Breaker', pay: 3400, steps: [TALK(['natty', 'He is growing eggs in the grotto. Little ones. Practice eggs. A blade can crack an egg.']),
      GO('poi:grotto', 'Go to the grotto.', { r: 26 }), K('goon', 10, 'poi:grotto', 20, 'pistol', 'Clear the goons guarding the eggs.'), TALK(['natty', 'Cracked. Your blade will dream of this.'])] },
    { who: 'fate', title: 'The Final Card', pay: 3300, steps: [TALK(['fate', 'One card left in the deck. It shows the clock tower at midnight. The goons are praying there.']),
      { t: 'night' }, GO('poi:clock', 'Go to the clock tower.', { r: 28 }), K('goon', 10, 'poi:clock', 22, 'pistol', 'Break up the goons\' prayer at the clock tower.'),
      TALK(['fate', 'The card has changed. It shows you now. Standing over a broken egg.'])] },
    { who: 'judge', title: 'Judgement Day', pay: 3600, steps: [TALK(['judge', 'Light or shadow. He has chosen. His goons are at the Crimson Moon Altar, calling something down. Stop them.']),
      GO('poi:altar', 'Go to the Crimson Moon Altar.', { r: 26 }), K('goon', 12, 'poi:altar', 22, 'pistol', 'Stop the goons at the altar.'), TALK(['judge', 'The moon is ours. Judgement is yours.'])] },
    { who: 'bates', title: 'Sanity', pay: 2800, steps: [TALK(['bates', 'The goo whispers. One must not listen. The view point is high above the whispering.'], ['bates', 'Go. Breathe. Do not answer it.']),
      GO('poi:view', 'Go to the view point.', { r: 18 }), SURV('goon', 50, 'poi:view', 'Keep your head at the view point.'),
      TALK(['bates', 'You did not answer. One is proud.'])] },
    { who: 'steve', title: 'Last Ride', pay: 3200, steps: [TALK(['steve', '...'], ['lab', 'Blumhead wants Ejaculand for his throne room. Steve has locked himself in the Load Flume. The goons are at the gate.']),
      GO('poi:gate', 'Get to the Ejaculand gate.', { r: 24 }), K('goon', 12, 'poi:gate', 24, 'pistol', 'Hold Ejaculand against the goons.'), TALK(['steve', '...'], ['lab', 'He has come out. He is grinning. It is the best grin.'])] }
  ]);

  /* a chapter job at the same door as a story mission stands a few steps along from it, so both can be picked */
  var _mg = missionGivers;
  missionGivers = function () { var L = _mg.apply(this, arguments); if (G.guest) return L;
    MISSIONS.forEach(function (m) { if (!m.chapJob || !missionAvailable(m) || L.some(function (u) { return u.m === m; })) return; var p = placeOf(m.at); if (!p) return;
      var a = p.a || 0, x = p.x, z = p.z; for (var k = 1; k < 6 && L.some(function (u) { return Math.hypot(u.x - x, u.z - z) < 3; }); k++) { x = p.x + Math.cos(a) * 3.4 * k; z = p.z - Math.sin(a) * 3.4 * k; }
      L.push({ x: x, z: z, r: 1.8, blip: 'mission', who: m.who, icon: (CAST[m.who] ? CAST[m.who].name : '?')[0], label: 'START: ' + m.title.toUpperCase(), m: m, fn: function () { startMission(m); } }); });
    return L; };

  /* the chapter's last story mission asks first while chapter jobs are left (it ends the chapter and its jobs) */
  var _sm = startMission;
  startMission = function (m) { var self = this, args = arguments;
    if (m && m.endChap && !m.__ok) { var left = MISSIONS.filter(function (q) { return q.chapJob && q.chap === m.chap && !SV.done[q.id]; }).length;
      if (left) { KIT.menu({ title: m.title, sub: 'This ends ' + NAMES[m.chap] + '. ' + left + ' chapter ' + (left === 1 ? 'job is' : 'jobs are') + ' still open and will be gone.', items: [
        { label: 'START IT', fn: function () { KIT.closeMenu(); m.__ok = 1; try { _sm.apply(self, args); } finally { m.__ok = 0; } } }, { label: 'NOT YET', back: true, fn: function () { KIT.closeMenu(); } }] }); return; } }
    return _sm.apply(this, arguments); };
})();
