/* ---------- update 156: a controller works like GTA's (his ask: R2 is accelerate, Y gets in cars, the d-pad changes the radio).
   padkit turns the face buttons into keys (padKeys in 9-main.js: A sprint, X jump, B hit, Y car / door / talk, LB weapon, RB handbrake);
   the triggers, d-pad and stick clicks are read straight from the pad here: RT gas / fire, LT brake and reverse / aim,
   d-pad left and right the radio, d-pad down the map, R3 looks behind in a car. ---------- */
var GPB = {}, GPP = {};
function gpStep() { var g = KIT.gamepad; GPP = {}; if (!g || !g.buttons) { GPB = {}; return; } for (var i = 0; i < 17; i++) { var b = g.buttons[i], on = !!(b && (b.pressed || b.value > 0.4)); if (on && !GPB[i]) GPP[i] = 1; GPB[i] = on; } }
function gpHeld(i) { return !!GPB[i]; }
function gpPressed(i) { return !!GPP[i]; }
