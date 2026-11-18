/* ---------- update 157 (his ask: the radio repeats itself a lot, needs loads more lines, sound effects like on the news,
   and more kinds of report). Talk is now built from segments: a sting or sound effect, then one or more voiced lines.
   Kinds: news, traffic (helicopter), weather (chimes), sports (crowd and whistle), crime watch (siren), celebrity
   gossip, horoscopes, call-ins (phone ring, a caller, the host answers), adverts (a jingle) and DJ chat. Every pool is
   a shuffled deck, so nothing comes round again until the whole pool has played (RAD.decks). The music ducks under
   any voice (music.duck). Voices: news anchor 'news', traffic 'traffic', weather 'weather', sports 'sports', callers
   'pedM' / 'pedF', the DJs by station id. ---------- */
(function () { var t = sfx.tone, n = sfx.noise;
  sfx.add('r_news', function () { [880, 660, 880, 1320].forEach(function (f, i) { t('square', f, f, 0.16, 0.05, i * 0.14); t('sine', f / 2, f / 2, 0.3, 0.05, i * 0.14); }); t('sawtooth', 110, 110, 0.9, 0.04, 0.56); });
  sfx.add('r_break', function () { for (var i = 0; i < 6; i++) t('square', i % 2 ? 1040 : 780, i % 2 ? 1040 : 780, 0.12, 0.05, i * 0.13); t('sawtooth', 55, 55, 1.0, 0.06, 0.8); });
  sfx.add('r_traffic', function () { for (var i = 0; i < 14; i++) n(0.06, 0.16, 180, i * 0.085); t('square', 660, 990, 0.2, 0.04, 1.2); });
  sfx.add('r_weather', function () { [1047, 1319, 1568, 2093, 1568].forEach(function (f, i) { t('sine', f, f, 0.5, 0.05, i * 0.12); }); });
  sfx.add('r_sports', function () { n(1.4, 0.12, 900); n(1.2, 0.08, 2600, 0.2); t('square', 2600, 2600, 0.12, 0.05, 0.1); t('square', 2600, 2600, 0.5, 0.05, 0.3); });
  sfx.add('r_crime', function () { for (var i = 0; i < 3; i++) { t('sawtooth', 700, 1100, 0.35, 0.04, i * 0.7); t('sawtooth', 1100, 700, 0.35, 0.04, i * 0.7 + 0.35); } });
  sfx.add('r_gossip', function () { for (var i = 0; i < 8; i++) t('sine', 1600 + i * 180, 1800 + i * 180, 0.08, 0.04, i * 0.05); t('triangle', 523, 659, 0.3, 0.05, 0.45); });
  sfx.add('r_stars', function () { for (var i = 0; i < 12; i++) t('sine', 440 * Math.pow(1.12, i), 440 * Math.pow(1.12, i), 0.4, 0.035, i * 0.06); });
  sfx.add('r_ring', function () { for (var i = 0; i < 2; i++) { t('sine', 440, 440, 0.4, 0.05, i * 0.9); t('sine', 480, 480, 0.4, 0.05, i * 0.9); } });
  sfx.add('r_jingle', function () { [523, 659, 784, 659, 1047].forEach(function (f, i) { t('triangle', f, f, 0.14, 0.06, i * 0.11); }); t('square', 1047, 1047, 0.3, 0.04, 0.55); });
  sfx.add('r_sweep', function () { n(0.6, 0.1, 400); t('sine', 200, 1800, 0.6, 0.03); });
})();
var RADIO2 = {
  news: [
    'News. A reminder from the Council: sports are still outlawed in Cum City. Anyone caught kicking a ball will have the ball taken off them. And the leg.',
    'News. The old stadium has been turned into a car park. The goal posts have been left up as a warning.',
    'News. Cream levels on the Jizz River are high again tonight. Boats are told to keep to the middle and keep their mouths shut.',
    'Good evening, this is Cum City News. Mayor Cumhead has promised to fix every road in the city. He was then seen driving on the pavement.',
    'Cum City News. Sheriff Shithead Laboozie says crime is down this week. Crime says it is just resting.',
    'Breaking news. A giant cream pie has been spotted rolling down Clubhouse Row. Greebo denies everything. His apron says otherwise.',
    'In tonight\'s news, scientists at Spunk Brain Labs have created a homunculus that can do your taxes. It ate the receipts.',
    'Cum City News. The Blood Factory has been fined for leaking. Again. Residents are advised not to drink anything red.',
    'Breaking news. Blumhead has been seen near the docks. Police say do not approach him, do not feed him, and do not let him talk about his plans.',
    'Ejaculand has reopened the Load Flume after last week\'s incident. Riders are reminded to keep their mouths closed.',
    'Cum City News. Uncle Beeb has been banned from his own tavern. He has appealed. To himself. The appeal was successful.',
    'A new study finds ninety percent of Cum City residents have stepped in cream this year. The other ten percent are lying.',
    'Cum City News. The Cumstruction Site is three years behind schedule. The foreman says the building is ahead of schedule, it is just upside down.',
    'Breaking news. TB\'s Suck n\' Fuck has passed its health inspection. The inspector has not been seen since.',
    'In local news, the Crimson Peak cable car is out of order. Hikers are advised to bring snacks. And a will.',
    'Cum City News. A homunculus has been elected to the council by mistake. Early reports say it is doing better than the others.',
    'Potbelly\'s Arcade has opened a fourth arcade. Potbelly says it is to serve the community. His accountant says it is for the coins.',
    'Cum City News. Spermaid has opened a little stall at the beach. She says sweetie a lot. Business is booming.',
    'Breaking news. Somebody has stolen every bench in Cum Hills. Police are looking for a man with a very big van and nowhere to sit.',
    'The airport has added a new flight. Cum City to Cum City. It goes round in a circle for an hour. Tickets have sold out.',
    'Cum City News. Saba completed a hitless run of the tax office. He paid nothing. He was not hit. Nobody knows how.',
    'Harold\'s Mad Tea Party has introduced a new tea. It is just potion. They have always been just potion.',
    'Cum City News. A fight broke out at Joff\'s over pineapple on pizza. Joff won. Joff always wins.',
    'Breaking news. Steve has stopped waving at the Ejaculand gate for the first time in twenty years. He was just scratching his head. He is waving again.',
    'The Cum City Council has voted to rename the river. The new name is the Jizz River. The old name was also the Jizz River.',
    'Cum City News. Master Bates has been asked to leave the library. He says he was only clearing his head before proceeding.',
    'A homunculus has hatched in the post office. It has been given a job. It is already the best worker there.',
    'Cum City News. Nattyboro says a blade without a bite is merely a stick. He then enchanted a stick. It bit him.',
    'Breaking news. The Cream Wash has washed a police car. The police car is now wanted.',
    'In science news, Spunk Brain Labs say the brain in the big jar is thinking about you. They would not say what.',
    'Cum City News. Kaya and Elden have invented the Double Cumpuccino. Doctors advise drinking one, then lying down for a week.',
    'A tourist asked for directions to Night City and was told politely that he is in Cum City, and to get in the cream wash.',
    'Cum City News. Stacked Fate has predicted tomorrow\'s news. It is this. You are listening to it now.'
  ],
  traffic: [
    'Traffic now. The Cum Ring is solid from the docks to the Bone Pit. A lorry has spilled forty tonnes of cream. Drivers are advised to lick it or leave it.',
    'Traffic. A herd of homunculi is crossing at Clubhouse Row. They have right of way. They always have right of way.',
    'Traffic from the chopper. Somebody in a gothic outfit is driving on the pavement in the cafe streets. Just let him through. Trust me.',
    'Traffic. Roadworks on every road in Cum City. The council says it is all part of the plan. Nobody has seen the plan.',
    'Traffic. The bridge over the Jizz River is open again after a tanker of Silly Pills overturned. The fish are very happy.',
    'Traffic from the chopper. Clear skies over Ejaculand, queues at the Load Flume back to the car park, and a police chase heading your way. Have a nice day.',
    'Traffic. A taxi has been parked across the airport road for three hours. The driver says he is on his break. He is asleep.',
    'Traffic. Avoid the red light district tonight, there is a parade. Or a riot. From up here they look the same.',
    'Traffic. A runaway mine cart is heading down from the Blood Factory. If you see it, do not try to ride it. We know you want to.',
    'Traffic. Somebody has painted the zebra crossings on Clubhouse Row red. Pedestrians are asked to cross anyway and hope.',
    'Traffic from the chopper. I can see the whole city from up here. It is mostly cream. Back to you in the studio.',
    'Traffic. A cow is loose on the country roads. It belongs to Brothers Load. Do not upset it. It knows people.',
    'Traffic. The tunnel under the docks is closed due to a large cat. It is Sir Johnathan. He is asleep. Nobody is moving him.',
    'Traffic. Heavy delays near the cemetery due to a funeral procession that keeps getting up again.',
    'Traffic. All clear on the ring road. That has never happened before. Something is wrong. Stay indoors.'
  ],
  weather: [
    'Weather. Tonight, a red moon over Cum City, light cream showers, and a chance of Blumhead in the north. Wrap up warm.',
    'Weather. Sunny spells this morning, a fog of cream rolling in from the docks this afternoon. Keep your windows shut.',
    'Weather. It is going to rain. Properly rain. The kind of rain that gets in your shoes and stays there till Thursday.',
    'Weather. Hot today. Very hot. Amy says it is dynamite weather. Drink water. Not the river.',
    'Weather. Snow on the Crimson Peak, ice on the bridges, and Greebo\'s pies cooling on every window ledge. Do not take them.',
    'Weather. A storm is coming in from the Sperm Isles. Boats back in the harbour, kites back in the cupboard, homunculi back indoors.',
    'Weather. Windy. Hold on to your hats. Hold on to your hair. Shithead Laboozie, hold on to your head.',
    'Weather. Clear skies and a full moon. A beautiful night for a drive. A terrible night to be wanted by the police.',
    'Weather. Grey. Just grey. All day. Like a Monday that got lost.',
    'Weather. The pollen count is high in Cum Hills. The cream count is high everywhere. Antihistamines will not help with the cream.',
    'Weather. Thunder and lightning over the Blood Factory. If the lights flicker, it is the storm. If the lights laugh, it is Blumhead.',
    'Weather. A lovely sunrise tomorrow at six. If you are still awake for it, you have been on TB\'s pills. Go to bed.'
  ],
  sports: [], /* update 162: sports are outlawed in Cum City (his rule), so there is no sports desk */
  crime: [
    'Crime Watch. Police are looking for a cream droplet in a Hunter Seriph shirt and trip pants. If you see him, he is probably the mayor. Carry on.',
    'Crime Watch. A string of car thefts across Cum City. Victims say the thief apologised every time, then drove off on the pavement.',
    'Crime Watch. Someone has been robbing shops with a banana. Shopkeepers are advised that a banana is not a gun. It is still scary.',
    'Crime Watch. Sheriff Shithead Laboozie has arrested himself by mistake. He has released himself on good behaviour.',
    'Crime Watch. Goons in purple have been seen near the docks. They work for Blumhead. They have terrible dental plans.',
    'Crime Watch. A cat has been kidnapped. A big black cat. If you see Sir Johnathan, call Greebo. If you see the kidnappers, run.',
    'Crime Watch. The Cream Wash has been reported to the police for helping criminals. The police got their car washed and dropped the case.',
    'Crime Watch. Somebody stole the bank vault door. Not what was inside it. Just the door. Police are baffled.',
    'Crime Watch. TB has been reported for handing out Silly Pills at the bus stop. TB says they are mints. They are not mints.',
    'Crime Watch. Graffiti on Clubhouse Row reads TB WAS HERE. TB says he was not there. TB was there.',
    'Crime Watch. A man dressed as Steve has been scaring people at Ejaculand. Steve has asked us to say it was not him. It was him.',
    'Crime Watch. Police chases are up three hundred percent this year. The police say that is mostly one guy.'
  ],
  gossip: [
    'Celebrity gossip. Is Spermaid dating PulsarOctopus? She says they are just friends. He says just vibes. We say we saw them at the beach.',
    'Gossip. Potbelly has been seen buying a gold toilet. Where does the arcade money go? Now we know.',
    'Gossip. T from T\'s Hussy House has been spotted at Harold\'s tea party. Two hours. Four pots. The waiter is still recovering.',
    'Gossip. Greebo has a new hat. It is taller than the old hat. Sources say it is to look down on Joff.',
    'Gossip. Mayor Cumhead was seen in his pants at three in the morning outside the Clubhouse. His office says he was walking the cat. He does not have a cat.',
    'Gossip. Bonjo has opened her doors to everyone. She says let me get the door. She will always get the door.',
    'Gossip. Amy and Ali are feuding over who makes the hottest food in Cum City. Amy says dynamite. Ali says garlic. The fire brigade says both.',
    'Gossip. Shithead Laboozie has had a haircut. We are not sure how. He does not have hair. He has a swirl.',
    'Gossip. Kaya and Elden renewed their vows at the Cum Café. The cake was a Cumpuccino. Everyone was awake for three days.',
    'Gossip. Master Bates was seen at the library again. He says he is clearing his head. Staff say please clear it somewhere else.'
  ],
  stars: [
    'Your stars with Stacked Fate. Aries. Today you will drive into something. It will be a lamppost. It is always a lamppost.',
    'Your stars. Taurus. Money is coming your way. It is falling out of a wrecked van. Pick it up before the police do.',
    'Your stars. Gemini. Two of you will argue today. Both of you are wrong. Have a Cumpuccino.',
    'Your stars. Cancer. Avoid water today. Avoid cream. Avoid Steve. Especially Steve.',
    'Your stars. Leo. Today you are the main character. Everybody else is getting jacked from their cars.',
    'Your stars. Virgo. A stranger will offer you a pill. The deck was never yours. Neither was your fate. Do not take the pill.',
    'Your stars. Libra. Balance in all things. One pie for you, one pie for Greebo, one pie in the face of the man who said pineapple is wrong.',
    'Your stars. Scorpio. Something follows you tonight. It is the police. Five stars. Good luck.'
  ],
  ads: [
    'Insurance! Wrecked your car? Wrecked somebody else\'s? Cum City Insurance. We pay out. Eventually. Call us on your phone today.',
    'Hungry? Order Combat Stims straight to your door! Delivered by scooter in under five minutes or your next one is free. Side effects include winning.',
    'Need a ride? Cum Cabs! Wherever you are, whatever you have done, we will take you there. No questions. Some screaming.',
    'Cum Motors summer sale! Every car must go. Most of them already went. Somebody keeps stealing them.',
    'The SprayStation! Every game in Cum City, on your telly, on your sofa. Cartridges at Potbelly\'s Arcade. Four locations. Play responsibly. Or don\'t.',
    'Joff\'s Pineapple Pizzaria. Pineapple belongs on pizza. Fight me. Two for one on Tuesdays.',
    'Amy\'s Willy Chilli. Mild, hot or dynamite? If you have to ask, it is dynamite.',
    'Kaya and Elden\'s Cum Café. Welcome in! Kaya\'s on the coffee, Elden\'s on the grill. Try the Cumpuccino. Everyone does. Eventually.',
    'Uncle Beeb\'s Tavern. Sit down, lad. First one\'s always warm.',
    'Ali\'s Garlic Grub. Nuggets? Garlic bread? Everything is better with garlic. Even you.',
    'Harold\'s Mad Tea Party. Potions? Tea? Same thing, really. Sit, sit!',
    'T\'s Hussy House. Come in, darling. I\'ll get the doors.',
    'Bonjo\'s BJ Boutique. Welcome, welcome. Let me get the door.',
    'TB\'s Suck n\' Fuck. Sit. Stay a while. Don\'t mind the stains.',
    'PulsarOctopus Beats. Just vibes, friend. Free of charge.',
    'Iron Loads Gym. Train hard, lift heavy, grunt loudly. The mirrors are free.',
    'The Bank of Cum City. Your money is safe with us. The vault door is back. We checked.',
    'Cum City Hospital. Patch me up, they say. And we do. Fifty dollars a time. Loyalty card available.',
    'Gooning Cave Keeper! Dig the caves, hatch the homunculi, slap them when they slack. In the Hunter Seriph app.',
    'Spermhog Adventure! Cumhead, Greebo, Spermaid and Shithead Laboozie. Four stories, one Super TB. In the app.',
    'Super Spunky Ball. Tilt the world. Do not fall off. You will fall off. In the app.',
    'Pulsar\'s Octobeats. Four lanes, every song in Cum City, and Pulsar watching you miss. In the app.',
    'The Fap Rooms. You noclipped out of reality. Find the exit. Do not look at the Grinner. In the app.',
    'Cumstein 3D. Eight floors, five guns, one Blumhead. In the app.',
    'Spuzzworld. Save the homunculi from the mincer. Cum\'s Oddysee. In the Hunter Seriph app.'
  ],
  jokes: [
    'What do you call Cumhead in a car chase? The mayor. What do you call him when he is caught? Also the mayor. He has immunity.',
    'Why did Steve stand at the gate for twenty years? Nobody told him he could leave.',
    'How many homunculi does it take to change a light bulb? None. They ate it.',
    'Why does Greebo never tell you what is in the pies? Because you would stop buying them.',
    'What is the difference between TB and a Silly Pill? One of them is good for you. And it is not TB.',
    'Why did the police stop chasing Cumhead? He drove into the Cream Wash and came out somebody else.',
    'Why did Shithead Laboozie become sheriff? Nobody else would wear the badge after he touched it.',
    'What is Saba\'s favourite song? Anything without a hit.',
    'Why did Sir Johnathan cross the road? To sit in the middle of it and stop all the traffic. He is a cat.',
    'What do you get if you cross a meatnado with a cream pie? A Tuesday in Cum City.',
    'Knock knock. Who is there? Bonjo. Bonjo who? Let me get the door.',
    'Why is Potbelly so round? Five dollars a go, kid. Five dollars a go.',
    'How do you know if someone has been to Amy\'s? They tell you. And then they cry.',
    'What did the Blood Factory say to the Jizz River? Nothing. They are not speaking since the leak.',
    'Why did Harold\'s tea party end early? Somebody asked what was in the tea.',
    'What do you call a homunculus with a degree? Still a homunculus. But smug.',
    'Why did the taxi driver quit? Cumhead tipped him with a car.',
    'What do you call a cream pie that has been to space? A meteor-ite. Greebo wants it back.',
    'Why does the Crimson Peak glow at midnight? Nobody knows. Nobody goes up there to check. Nobody comes back to tell us.',
    'Why did Pulsar get a job at the radio? Just vibes. And free of charge. We do not pay him.'
  ],
  calls: [
    [['pedM', 'Hello? Yeah, I just want to say somebody stole my car this morning, and then gave it back, washed, with a parking ticket on it.'], [null, 'That was Cumhead. That is just how he says hello.']],
    [['pedF', 'Hi. I have a question. Is it normal to see a giant pie roll past my window at night?'], [null, 'In Cum City? Madam, that is a quiet night.']],
    [['pedM', 'Am I on? Right. I want to complain about the potholes. My car went in one and came out in Ejaculand.'], [null, 'Free ride. You are welcome.']],
    [['pedF', 'I would like to request a song. Something hitless.'], [null, 'Every song on this station is hitless, love. Except the ones that are hits.']],
    [['pedM', 'Yeah, hi. I think my homunculus is smarter than me. He did the crossword.'], [null, 'Mate, the homunculus is smarter than all of us. Let him drive.']],
    [['pedF', 'Hello? Is this where I win the prize?'], [null, 'You have won a lovely free Silly Pill from TB. Please do not take it.']],
    [['pedM', 'Hi. I saw Blumhead buying milk at the corner shop. Is that normal?'], [null, 'Evil needs calcium too, sir. Keep an eye on him.']],
    [['pedF', 'I would just like to say, Steve waved at me today, and it made my whole week.'], [null, 'Steve waves at everyone, love. But he meant it with you.']],
    [['pedM', 'Yeah, my mate says the Crimson Peak is haunted. Is it?'], [null, 'Go up there at midnight and let us know. Actually, do not. Nobody comes back.']],
    [['pedF', 'Hi, I just want to say, the mayor nearly ran me over on the pavement.'], [null, 'Did he say sorry? He always says sorry. Lovely man.']],
    [['pedM', 'Can you tell Greebo his pies are amazing? I have had nine today.'], [null, 'Sir, please put the pies down and go to Cum City Hospital.']],
    [['pedF', 'What time does Ejaculand close?'], [null, 'It never closes, love. People just stop coming out.']]
  ],
  dj: {
    hs: ['Hunter Seriph FM. Riffs to die to. You will die. A lot.', 'This one goes out to everybody stuck on the same boss. Forty tries is nothing. Keep going.', 'Bonfire lit. Song on. Do not look at your phone while you drive. Look at the boss.', 'You are listening to Hunter Seriph FM, the only station with no hits allowed.', 'Live on Twitch most nights. Come say hi. Bring your estus.', 'If you are stuck in traffic, roll. Roll through it. I-frames work on cars, probably.', 'Next up, something heavy. Like my sword. Like my heart after that last boss.', 'Red moon over Cum City tonight. Perfect weather for a hitless run.', 'Somebody asked if I would ever play an easy game. No.', 'That was a banger. This is also a banger. Every song here is a banger.', 'Shout out to the chat. You lot are the reason I keep dying on stream.', 'Remember, git gud. And wear your seatbelt.', 'This one goes out to everyone parked down by the Jizz River tonight. You know what you are doing. So does the river.', 'Hunter Seriph wrote a song about that river, you know. Rivers of Cum. Go and find it. Play it loud on the bridge.', 'If you are crossing the Jizz River tonight, roll your windows up. Trust me.'],
    bl: ['Brothers Load Radio. Yeehaw, Cum City.', 'Piggy wants to say hi to his mum. Hi, Piggy\'s mum.', 'That was a country song about a pickup truck and a pig. They are all about a pickup truck and a pig.', 'The Cowboy says this next one is his favourite. He says that about every song. He is a liar.', 'Pull over, crack a cold one, and listen to the Brothers Load. Not while driving. Pull over first.', 'Shot Rope is still number one, five years running. Nobody else is allowed to be number one.', 'If you see a big pink pig in a cowboy hat at the bar, buy him a drink. That is Piggy. He is broke.', 'Two brothers, one load, and a radio licence we definitely paid for.', 'Brothers Load Radio. Mugs up. Mind the mugs, the Cowboy throws them.', 'Next song is about a man who lost his boots. Piggy wrote it. It is about Piggy.', 'Saddle up, Cum City. The night is young and the beer is warm.', 'This one is for the truckers on the Cum Ring. Keep on hauling. Mind the cream.'],
    po: ['PulsarOctopus Beats FM. Just vibes, friend.', 'Eight arms on the decks tonight. Do not ask how I do the decks with eight arms. I just vibe.', 'If you are driving, slow down and feel it. If you are being chased, speed up and feel it.', 'This one is free of charge. They all are. I really should charge.', 'Shout out to everyone at Ejaculand tonight. I can hear you screaming from here. Vibes.', 'Deep breath. In through the nose. Out through the beat.', 'This track was made underwater. That is why it sounds wet.', 'Spermaid says hi. She says sweetie. I say vibes. We are a good team.', 'Turn it up. Turn it all the way up. Your neighbours love it.', 'Pulsar here with the late night beats for the late night loads.', 'Ink in the water, bass in the speakers, cream on the roads.', 'Vibes are free. Petrol is not. Fill up, friend.'],
    talk: ['Cum Talk FM. Shithead Laboozie here, sheriff by day, radio by night.', 'If you are a criminal listening to this, please stop. If you are the mayor, carry on.', 'Lines are open, people. Call in. Tell me your problems. I will not fix them.', 'This is Cum Talk FM. Talk, adverts, and nothing you need to hear. You are welcome.', 'Sheriff\'s tip of the day. Do not jump out of a moving car. Unless it is on fire. Then definitely do.', 'I have been told I need to read the adverts. Fine. Here come the adverts.', 'Back after this. Do not go anywhere. Seriously, where would you go, it is Cum City.', 'The mayor called. He says do not believe anything on Crime Watch. That is exactly what a criminal would say.', 'Coming up, the news, the traffic, and a man who says his homunculus does his taxes.', 'Shithead Laboozie on Cum Talk. My head is a swirl but my heart is in the right place.', 'You are listening to Cum Talk FM. If you are not listening, how do you know?', 'Stay safe out there, Cum City. Or at least stay interesting.']
  }
};
/* the decks: shuffled pools, never the same line again until the pool is used up */
function radioDeal(key, pool) { RAD.decks = RAD.decks || {}; var d = RAD.decks[key]; if (!d || !d.length) { d = RAD.decks[key] = pool.map(function (x, i) { return i; }); for (var i = d.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), q = d[i]; d[i] = d[j]; d[j] = q; } if (RAD.lastOf && RAD.lastOf[key] === d[d.length - 1] && d.length > 1) { var tq = d[0]; d[0] = d[d.length - 1]; d[d.length - 1] = tq; } }
  var k = d.pop(); RAD.lastOf = RAD.lastOf || {}; RAD.lastOf[key] = k; return pool[k]; }
var STING = { news: 'r_news', traffic: 'r_traffic', weather: 'r_weather', sports: 'r_sports', crime: 'r_crime', gossip: 'r_gossip', stars: 'r_stars', ads: 'r_jingle', calls: 'r_ring', jokes: 'r_sweep', dj: null };
var ANCHOR = { news: 'news', traffic: 'traffic', weather: 'weather', sports: 'sports', crime: 'news', gossip: 'weather', stars: 'fate' };
// which kinds each station plays, by weight
var KINDS = { hs: { dj: 5, ads: 2, news: 1, jokes: 1, crime: 1 }, bl: { dj: 5, ads: 2, traffic: 1, weather: 1, jokes: 1 }, po: { dj: 5, ads: 2, gossip: 1, stars: 1, jokes: 1 }, talk: { news: 3, traffic: 2, weather: 2, sports: 2, crime: 2, gossip: 2, stars: 1, calls: 3, ads: 3, jokes: 2, dj: 2 } };
function radioTalkSeg(st) { var W = KINDS[st.id] || KINDS.talk, tot = 0, k; for (k in W) tot += W[k]; var r = Math.random() * tot; for (k in W) { r -= W[k]; if (r <= 0) break; }
  var parts = []; if (STING[k]) parts.push({ sfx: STING[k], t: k === 'calls' ? 1.9 : 1.4 });
  if (k === 'calls') { var c = radioDeal('calls', RADIO2.calls); parts.push({ who: c[0][0] + '2', s: c[0][1] }); parts.push({ who: st.id === 'off' ? 'talk' : st.id, s: c[1][1] }); }
  else if (k === 'dj') parts.push({ who: st.id, s: radioDeal('dj' + st.id, RADIO2.dj[st.id] || RADIO2.dj.talk) });
  else { var line = radioDeal(k, RADIO2[k]); parts.push({ who: k === 'ads' || k === 'jokes' ? st.id : ANCHOR[k] || st.id, s: line }); }
  return parts; }
function radioAllLines() { var L = []; ['news', 'traffic', 'weather', 'sports', 'crime', 'gossip', 'stars'].forEach(function (k) { RADIO2[k].forEach(function (s) { L.push([ANCHOR[k], s]); }); });
  STATIONS.forEach(function (st) { if (st.id === 'off') return; RADIO2.ads.concat(RADIO2.jokes).forEach(function (s) { L.push([st.id, s]); }); (RADIO2.dj[st.id] || []).forEach(function (s) { L.push([st.id, s]); }); RADIO2.calls.forEach(function (c) { L.push([st.id, c[1][1]]); }); });
  RADIO2.calls.forEach(function (c) { L.push([c[0][0] + '2', c[0][1]]); }); return L; }
/* the radio's talk is a little queue of parts: a sting, then voices one after another */
radioNextSeg = function () {
  var st = STATIONS[RAD.st]; if (!RAD.on || st.id === 'off') { G.radioSong = null; try { music.stop(); } catch (e) {} return; }
  var real = window.CCNRADIO && window.CCNRADIO[st.id] && window.CCNRADIO[st.id].length ? window.CCNRADIO[st.id] : null;
  if (RAD.forced) { var f = RAD.forced; RAD.forced = null; RAD.seg = { k: 'song', id: f, t: 150 }; music.play(f); G.radioSong = (music.songs[f] && music.songs[f].name ? music.songs[f].name : f) + ' · Brothers Load'; G.radioName = STATIONS[1].name; G.radioT = 5; return; }
  RAD.count = (RAD.count || 0) + 1;
  if (st.id === 'talk' || RAD.count % 2 === 0) { try { music.stop(); } catch (e) {} RAD.seg = { k: 'talk', parts: radioTalkSeg(st), t: 0.3 }; return; }
  if (real) { var src = real[Math.floor(Math.random() * real.length)]; RAD.audio = new Audio(src); RAD.audio.volume = 0.8; RAD.audio.play().catch(function () {}); RAD.seg = { k: 'real', t: 600 }; RAD.audio.onended = function () { RAD.seg = null; radioNextSeg(); }; G.radioSong = src.split('/').pop().replace(/\.mp3$/i, '').replace(/[-_]/g, ' '); return; }
  if (st.id === 'po' && SV.mixtape && Math.random() < 0.3) st = STATIONS[2];
  var id = radioDeal('song' + st.id, st.songs); music.play(id); RAD.seg = { k: 'song', id: id, t: rnd(70, 110) }; G.radioSong = (music.songs[id] && music.songs[id].name ? music.songs[id].name : ({ castle: 'Castle Gates', boss: 'Boss Door', roof: 'Over the Rooftops', town: 'Town Square Two-Step', park: 'Ejaculand Waltz' }[id] || id)) + ' · ' + ({ hs: 'Hunter Seriph', bl: 'Brothers Load', po: 'PulsarOctopus' }[st.id] || '');
};
stepRadio = function (dt) {
  if (!RAD.on) return; if (P && P.state !== 'car') { radioOff(); return; }
  var S = RAD.seg; if (S) { S.t -= dt;
    if (S.k === 'talk' && S.t <= 0) { var p = S.parts.shift(); if (!p) { RAD.seg = null; radioNextSeg(); }
      else if (p.sfx) { sfx.play(p.sfx); S.t = p.t; }
      else { var st = STATIONS[RAD.st], ok = radioSay(p.who, p.s); S.t = ok ? 30 : Math.max(3, p.s.length * 0.06); S.wait = ok; if (!ok) G.radioLine = { who: st.dj || 'Radio', s: p.s, t: S.t }; } }
    else if (S.k !== 'talk' && S.t <= 0) { RAD.seg = null; radioNextSeg(); } }
  if (G.radioLine) { G.radioLine.t -= dt; if (G.radioLine.t <= 0) G.radioLine = null; }
};
function radioSay(who, text) { var f = voiceFile(who, text); if (!f) return false; var a = playFile(f, 0.95, 'radio'); if (!a) return false;
  a.onloadedmetadata = function () { if (RAD.seg && RAD.seg.k === 'talk' && isFinite(a.duration)) RAD.seg.t = a.duration + 0.5; };
  a.onended = function () { if (RAD.seg && RAD.seg.k === 'talk') RAD.seg.t = Math.min(RAD.seg.t, 0.4); }; a.onerror = function () { if (RAD.seg) RAD.seg.t = 0.2; }; return true; }
/* the music ducks under any voice: people talking, the DJ, the news */
var _playFileD = playFile;
playFile = function (src, vol, slot) { var a = _playFileD(src, vol, slot); if (a) { duckFor(slot); a.addEventListener('ended', function () { undock(slot); }); a.addEventListener('pause', function () { undock(slot); }); a.addEventListener('error', function () { undock(slot); }); } return a; };
var DUCK = {};
function duckFor(slot) { DUCK[slot] = 1; duckApply(); }
function undock(slot) { DUCK[slot] = 0; duckApply(); }
function duckApply() { var talk = DUCK.line || DUCK.bark, radioTalk = DUCK.radio; try { if (music.duck) music.duck(talk ? 0.22 : radioTalk ? 0.3 : 1); } catch (e) {} if (VOX.radio && VOX.radio !== null) VOX.radio.volume = talk ? 0.25 : 0.95; }
/* ---------- update 158 (his ask: more jingles and sound effects, and the talking was way louder than the music):
   - voices on the radio play quieter (0.6) and the music only dips to 40% under them, so talk and songs sit level;
   - talk has a music bed now: news, weather, adverts and the DJ talk over a low song instead of silence;
   - station idents (each station has its own jingle) between songs, and more sound effects inside the segments:
     a teletype under the news, thunder in storm weather, a cash register on adverts, a record scratch and an air horn
     for the DJs, a banjo twang on Brothers Load, a camera shutter on the gossip, a harp on the horoscopes, the click of
     a caller going on air. ---------- */
(function () { var t = sfx.tone, n = sfx.noise;
  sfx.add('r_typing', function () { for (var i = 0; i < 18; i++) { n(0.025, 0.07, 3200, i * 0.07 + (i % 3) * 0.01); if (i % 6 === 5) t('square', 1800, 1800, 0.05, 0.04, i * 0.07 + 0.03); } });
  sfx.add('r_thunder', function () { n(2.2, 0.16, 90); n(1.2, 0.1, 160, 0.3); });
  sfx.add('r_cash', function () { t('square', 2093, 2093, 0.08, 0.05); t('square', 2637, 2637, 0.3, 0.05, 0.08); n(0.2, 0.06, 5000, 0.08); });
  sfx.add('r_scratch', function () { t('sawtooth', 300, 900, 0.12, 0.06); t('sawtooth', 900, 250, 0.16, 0.06, 0.12); n(0.25, 0.05, 1400); });
  sfx.add('r_horn', function () { [0, 0.22, 0.44].forEach(function (d) { t('sawtooth', 466, 466, 0.18, 0.06, d); t('sawtooth', 587, 587, 0.18, 0.05, d); }); t('sawtooth', 466, 440, 0.6, 0.06, 0.66); });
  sfx.add('r_twang', function () { [392, 494, 587, 784].forEach(function (f, i) { t('triangle', f, f * 0.995, 0.5, 0.06, i * 0.09); t('square', f * 2, f * 2, 0.06, 0.02, i * 0.09); }); });
  sfx.add('r_camera', function () { for (var i = 0; i < 4; i++) { n(0.05, 0.1, 6000, i * 0.18); t('sine', 3000, 4000, 0.04, 0.04, i * 0.18 + 0.02); } });
  sfx.add('r_harp', function () { [262, 330, 392, 523, 659, 784, 1047, 1319].forEach(function (f, i) { t('triangle', f, f, 0.9, 0.04, i * 0.07); }); });
  sfx.add('r_click', function () { n(0.04, 0.12, 2000); t('sine', 1200, 1200, 0.05, 0.04, 0.05); });
  // station idents: a short tune each
  sfx.add('r_id_hs', function () { [196, 233, 294, 392].forEach(function (f, i) { t('sawtooth', f, f, 0.22, 0.05, i * 0.16); t('sawtooth', f * 1.5, f * 1.5, 0.22, 0.03, i * 0.16); }); t('sawtooth', 392, 370, 0.9, 0.06, 0.64); n(0.7, 0.05, 300, 0.64); });
  sfx.add('r_id_bl', function () { [392, 392, 523, 659, 587, 523].forEach(function (f, i) { t('triangle', f, f, 0.16, 0.06, i * 0.12); }); t('square', 196, 196, 0.3, 0.04, 0.72); t('triangle', 784, 784, 0.4, 0.05, 0.72); });
  sfx.add('r_id_po', function () { [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) { t('sine', f, f, 0.2, 0.05, i * 0.1); t('sine', f / 2, f / 2, 0.2, 0.03, i * 0.1); }); n(0.6, 0.04, 120, 0.7); t('sine', 55, 40, 0.6, 0.12, 0.7); });
  sfx.add('r_id_talk', function () { [440, 554, 659].forEach(function (f, i) { t('square', f, f, 0.12, 0.04, i * 0.1); }); t('sine', 880, 880, 0.5, 0.05, 0.3); n(0.15, 0.05, 2500, 0.3); });
})();
var EXTRA = { news: ['r_typing'], crime: ['r_typing'], ads: ['r_cash'], gossip: ['r_camera'], stars: ['r_harp'], calls: ['r_click'] };
var BEDK = { news: 1, weather: 1, ads: 1, dj: 1, gossip: 1, stars: 1, sports: 1, traffic: 1 };
var _radioTalkSeg157 = radioTalkSeg; radioTalkSeg = function (st) { var parts = _radioTalkSeg157(st), first = parts[0], k = null; for (var kk in STING) if (first && STING[kk] === first.sfx) k = kk;
  if (!k) k = 'dj'; var out = []; if (first && first.sfx) out.push(first);
  (EXTRA[k] || []).forEach(function (e) { out.push({ sfx: e, t: 0.1 }); }); if (k === 'weather' && (G.weather === 'storm' || G.weather === 'rain')) out.push({ sfx: 'r_thunder', t: 0.6 });
  if (k === 'dj') out.unshift({ sfx: st.id === 'po' ? 'r_horn' : st.id === 'bl' ? 'r_twang' : st.id === 'hs' ? 'r_scratch' : 'r_click', t: 0.7 });
  parts.forEach(function (p) { if (p !== first || !first.sfx) out.push(p); }); out.bed = BEDK[k] ? 1 : 0; out.kind = k; return out; };
radioNextSeg = function () {
  var st = STATIONS[RAD.st]; if (!RAD.on || st.id === 'off') { G.radioSong = null; try { music.stop(); } catch (e) {} return; }
  var real = window.CCNRADIO && window.CCNRADIO[st.id] && window.CCNRADIO[st.id].length ? window.CCNRADIO[st.id] : null;
  if (RAD.forced) { var f = RAD.forced; RAD.forced = null; RAD.seg = { k: 'song', id: f, t: 150 }; music.play(f); G.radioSong = (music.songs[f] && music.songs[f].name ? music.songs[f].name : f) + ' · Brothers Load'; G.radioName = STATIONS[1].name; G.radioT = 5; return; }
  RAD.count = (RAD.count || 0) + 1;
  if (st.id === 'talk' || RAD.count % 2 === 0) { var parts = radioTalkSeg(st); // talk: over a low bed of music when it suits
    if (parts.bed && st.songs.length) { var bed = radioDeal('bed' + st.id, st.songs); try { music.play(bed); } catch (e) {} RAD.bedOn = 1; duckApply(); } else if (parts.bed && st.id === 'talk') { try { music.play(pick(['town', 'park', 'roof'])); } catch (e) {} RAD.bedOn = 1; duckApply(); } else { RAD.bedOn = 0; try { music.stop(); } catch (e) {} }
    RAD.seg = { k: 'talk', parts: parts, t: 0.3 }; return; }
  RAD.bedOn = 0; duckApply();
  if (real) { var src = real[Math.floor(Math.random() * real.length)]; RAD.audio = new Audio(src); RAD.audio.volume = 0.8; RAD.audio.play().catch(function () {}); RAD.seg = { k: 'real', t: 600 }; RAD.audio.onended = function () { RAD.seg = null; radioNextSeg(); }; G.radioSong = src.split('/').pop().replace(/\.mp3$/i, '').replace(/[-_]/g, ' '); return; }
  if (st.id === 'po' && SV.mixtape && Math.random() < 0.3) st = STATIONS[2];
  if (Math.random() < 0.6) sfx.play('r_id_' + st.id); // the station's jingle, then the song
  var id = radioDeal('song' + st.id, st.songs); music.play(id); RAD.seg = { k: 'song', id: id, t: rnd(70, 110) }; G.radioSong = (music.songs[id] && music.songs[id].name ? music.songs[id].name : ({ castle: 'Castle Gates', boss: 'Boss Door', roof: 'Over the Rooftops', town: 'Town Square Two-Step', park: 'Ejaculand Waltz' }[id] || id)) + ' · ' + ({ hs: 'Hunter Seriph', bl: 'Brothers Load', po: 'PulsarOctopus' }[st.id] || '');
};
radioSay = function (who, text) { var f = voiceFile(who, text); if (!f) return false; var a = playFile(f, 0.6, 'radio'); if (!a) return false;
  a.onloadedmetadata = function () { if (RAD.seg && RAD.seg.k === 'talk' && isFinite(a.duration)) RAD.seg.t = a.duration + 0.5; };
  a.onended = function () { if (RAD.seg && RAD.seg.k === 'talk') RAD.seg.t = Math.min(RAD.seg.t, 0.4); }; a.onerror = function () { if (RAD.seg) RAD.seg.t = 0.2; }; return true; };
duckApply = function () { var talk = DUCK.line || DUCK.bark, radioTalk = DUCK.radio, bed = RAD.bedOn && RAD.seg && RAD.seg.k === 'talk'; try { if (music.duck) music.duck(talk ? 0.35 : radioTalk ? (bed ? 0.3 : 0.45) : bed ? 0.5 : 1); } catch (e) {} if (VOX.radio && VOX.radio !== null) VOX.radio.volume = talk ? 0.2 : 0.6; };
