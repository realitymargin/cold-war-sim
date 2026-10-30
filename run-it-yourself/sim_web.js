// sim.js with its export keywords removed (built by tools/build_page.mjs), so the model loads as a plain script. Nothing else is changed.
// RealityMargin · "I Simulated the Cold War 1,000,000 Times" — the Cold War model. Version 4 (30 Oct 2026). v1–v3 kept as sim_v1.mjs … sim_v3.mjs.
// One Cold War = every documented crisis, war scare, false alarm and nuclear accident of 1945–1991, in real order.
// At each one the dice decide: does it stay a near-miss (what really happened), or does it go the other way?
// Every probability is a judgement, written down with its reason and sources in INPUTS.md. Three columns:
//   safe (the sceptics: Tertrais 2017, "the brink" was rarely close) · middle (headline) · dangerous (Chatham House 2014, Lundgren 2013).
// Outcomes: NUCLEAR WW3 (the superpowers at nuclear war: the run ends) · CONVENTIONAL WW3 (superpower war that stayed non-nuclear: the run ends)
//           · LIMITED NUCLEAR USE (bombs used in a smaller war, no superpower exchange: the run goes on, and the taboo is broken)
//           · SURVIVED (reached 26 Dec 1991, the end of the USSR).
// Every fork goes through roll(name, p): it always draws one random number (overrides never shift the stream), and an override map H
// can pin any fork (forced experiments, tests). Usage: node sim.mjs → results_v4.json + RESULTS_v4.md   Tests: node sim_test.mjs
// (the command-line run that writes results_v4.json is left out of the web copy: lines 11 and 173–end of sim/sim.mjs)

// [safe, middle, dangerous]
// kind 'sp'    : a superpower crisis.  war = it becomes a US–Soviet (or Allied–Soviet) war; nuke = nuclear weapons used in that war; hold = the exchange stops after a few weapons.
// kind 'proxy' : a smaller war.        use = nuclear weapons used in it; spread = that use drags the superpowers into nuclear war.
// kind 'alarm' : a false alarm.        launch = a real launch on a false warning (the other side answers: nuclear WW3).
// kind 'alarm2': a false alarm in two steps. pass = the warning is believed and passed up as real; launch = the leaders launch on it.
// kind 'acc'   : an accident.          launch = an accidental detonation is taken for an attack and answered.
const EVENTS = [
  { k: 'unthinkable', y: 1945.5,  kind: 'sp',    name: 'Operation Unthinkable (Churchill’s plan to attack the USSR)', war: [0.001, 0.003, 0.010], nuke: [0.60, 0.80, 0.90] },
  { k: 'iran46',      y: 1946.2,  kind: 'sp',    name: 'Iran crisis', war: [0.001, 0.003, 0.010], nuke: [0.50, 0.70, 0.85] }, // v4: war 0.5%→0.3% (Truman's "ultimatum" never existed; settled by diplomacy by May 1946)
  { k: 'turkey46',    y: 1946.6,  kind: 'sp',    name: 'Turkish Straits crisis: Stalin presses Turkey, a US carrier group sent', war: [0.0005, 0.002, 0.008], nuke: [0.50, 0.70, 0.85] }, // v3 new (Tertrais 2017 crisis list)
  { k: 'berlin48',    y: 1948.5,  kind: 'sp',    name: 'Berlin Blockade', war: [0.005, 0.020, 0.050], nuke: [0.60, 0.80, 0.90] }, // v2: was 1/3/6% (no shot was ever fired at the airlift)
  { k: 'preventive',  y: 1950.0,  kind: 'sp',    name: 'US preventive war before the Soviets build up', war: [0.001, 0.005, 0.020], nuke: [1, 1, 1] }, // v2: was 0.2/1/3%
  { k: 'korea50',     y: 1950.9,  kind: 'proxy', name: 'Korea: China enters, “every weapon that we have”', use: [0.020, 0.050, 0.120], spread: [0.05, 0.15, 0.30] }, // v2: use was 3/7/15% (no bombs sent to Korea in 1950). v3: spread was 10/20/35% (Stalin kept his airmen covert)
  { k: 'korea51',     y: 1951.3,  kind: 'proxy', name: 'Korea: MacArthur fired, atomic cores sent to Guam', use: [0.020, 0.050, 0.100], spread: [0.05, 0.15, 0.30] }, // v3: spread as above
  { k: 'korea53',     y: 1953.4,  kind: 'proxy', name: 'Korea: Eisenhower’s threat to end the war', use: [0.010, 0.030, 0.060], spread: [0.05, 0.12, 0.25] },
  { k: 'dienbienphu', y: 1954.3,  kind: 'proxy', name: 'Dien Bien Phu: Operation Vulture', use: [0.005, 0.020, 0.050], spread: [0.03, 0.08, 0.15] }, // v4: use 3%→2% (Eisenhower required Britain and Congress; Britain refused)
  { k: 'taiwan54',    y: 1954.9,  kind: 'proxy', name: 'First Taiwan Strait crisis', use: [0.010, 0.040, 0.080], spread: [0.05, 0.12, 0.25] },
  { k: 'suez56',      y: 1956.8,  kind: 'sp',    name: 'Suez and Hungary: Bulganin’s rocket threat', war: [0.001, 0.004, 0.015], nuke: [0.60, 0.75, 0.90] },
  { k: 'suezAlarm56', y: 1956.85, kind: 'alarm', name: 'Suez: unknown jets over Turkey, a Soviet fleet reported in the Dardanelles', launch: [0.0002, 0.001, 0.005] }, // v3 new (NORAD's simultaneous false reports, 5 Nov 1956)
  { k: 'lebanon58',   y: 1958.5,  kind: 'sp',    name: 'Lebanon landing', war: [0.0005, 0.002, 0.008], nuke: [0.60, 0.75, 0.90] },
  { k: 'taiwan58',    y: 1958.7,  kind: 'proxy', name: 'Second Taiwan Strait crisis', use: [0.010, 0.030, 0.070], spread: [0.05, 0.12, 0.25] },
  { k: 'berlinUlt58', y: 1958.9,  kind: 'sp',    name: 'Khrushchev’s Berlin ultimatum: six months to leave', war: [0.002, 0.006, 0.020], nuke: [0.60, 0.75, 0.90] }, // v3 new
  { k: 'powers60',    y: 1960.35, kind: 'sp',    name: 'Gary Powers’ U-2 shot down; the Paris summit collapses', war: [0.0002, 0.001, 0.005], nuke: [0.60, 0.75, 0.90] }, // v3 new
  { k: 'moonrise',    y: 1960.75, kind: 'alarm', name: 'BMEWS mistakes the rising Moon for a Soviet attack', launch: [0.0005, 0.002, 0.010] },
  { k: 'goldsboro',   y: 1961.05, kind: 'acc',   name: 'Goldsboro: two bombs fall on North Carolina', launch: [0.0001, 0.001, 0.010] },
  { k: 'berlin61',    y: 1961.8,  kind: 'sp',    name: 'Berlin: tanks face to face at Checkpoint Charlie', war: [0.005, 0.020, 0.050], nuke: [0.60, 0.75, 0.90] },
  { k: 'bmews61',     y: 1961.9,  kind: 'alarm', name: 'One failed switch cuts SAC off from the radars', launch: [0.0005, 0.002, 0.010] },
  // Cuba, October 1962: the order of the forks follows the 13 days
  { k: 'cubaStrike',  y: 1962.79, kind: 'cuba',  name: 'Cuba: Kennedy chooses air strikes and invasion, not the blockade', go: [0.10, 0.25, 0.40], nuke: [0.20, 0.40, 0.65], hold: [0.40, 0.25, 0.15], berlin: [0.05, 0.15, 0.30] }, // v3: nuke was 15/35/60% (NSA: "most definitely" used if US troops landed; Moscow's 27 Oct no-use order pulls it down). berlin = after a non-nuclear invasion, Moscow answers in Berlin // nuke and hold are shared by every road into an invasion
  { k: 'volkBear',    y: 1962.81, kind: 'alarm', name: 'Cuba: a bear sets off the scramble alarm at Volk Field', launch: [0.0002, 0.001, 0.005] },
  { k: 'b59',         y: 1962.82, kind: 'cubaSub', name: 'Cuba: submarine B-59 and its nuclear torpedo', fire: [0.010, 0.050, 0.200], hold: [0.50, 0.35, 0.20] },
  { k: 'u2',          y: 1962.82, kind: 'cubaU2', name: 'Cuba: a U-2 shot down, the retaliation question', strike: [0.08, 0.20, 0.40], widen: [0.20, 0.35, 0.50] }, // v2: same invasion dice as cubaStrike. v3: strike was 5/15/30% — the ExComm had agreed IN ADVANCE to hit the SAM site
  { k: 'maultsby',    y: 1962.82, kind: 'alarm', name: 'Cuba: a lost U-2 over Soviet Chukotka, F-102s with nuclear missiles scrambled', launch: [0.0005, 0.003, 0.015] }, // v3 new (27 Oct 1962; Khrushchev's letter of 28 Oct)
  { k: 'malmstrom',   y: 1962.82, kind: 'acc',   name: 'Cuba: Minuteman crews at Malmstrom rig a way to launch on their own', launch: [0.0001, 0.0005, 0.003] }, // v3 new (Sagan 1993)
  { k: 'okinawa',     y: 1962.83, kind: 'alarm', name: 'Cuba: the launch order at Okinawa (disputed)', launch: [0, 0.002, 0.020] },
  { k: 'floridaSat',  y: 1962.83, kind: 'alarm', name: 'Cuba: a satellite read as a missile on Florida', launch: [0.0002, 0.001, 0.005] },
  { k: 'otherSubs',   y: 1962.835, kind: 'cubaSub', name: 'Cuba: B-36, B-130 and B-4, also carrying nuclear torpedoes, forced up by US ships', fire: [0.002, 0.010, 0.050], hold: [0.50, 0.35, 0.20] }, // v4 new: hunted after the 28 Oct deal, so lower than B-59 (NSA EBB 75)
  { k: 'blackout65',  y: 1965.86, kind: 'alarm', name: 'Northeast blackout lights up the bomb-alarm board', launch: [0.0001, 0.001, 0.005] },
  { k: 'solar67',     y: 1967.39, kind: 'alarm', name: 'Solar storm blinds the early-warning radars', launch: [0.001, 0.005, 0.020] },
  { k: 'sixDayIL',    y: 1967.42, kind: 'proxy', name: 'Six-Day War: Israel assembles makeshift bombs', use: [0.001, 0.003, 0.010], spread: [0.02, 0.05, 0.10] }, // v3 new (Cohen 2007)
  { k: 'sixDaySp',    y: 1967.44, kind: 'sp',    name: 'Six-Day War: Kosygin on the hotline, the Sixth Fleet moves east', war: [0.0005, 0.002, 0.008], nuke: [0.60, 0.75, 0.90] }, // v3 new
  { k: 'thule68',     y: 1968.05, kind: 'acc',   name: 'Thule: a burning B-52 crashes by the warning radar', launch: [0.0002, 0.002, 0.010] },
  { k: 'khesanh',     y: 1968.1,  kind: 'proxy', name: 'Khe Sanh: the nuclear option studied', use: [0.002, 0.008, 0.020], spread: [0.02, 0.05, 0.10] },
  { k: 'ec121',       y: 1969.3,  kind: 'proxy', name: 'North Korea shoots down an EC-121: jets loaded with nuclear bombs (disputed)', use: [0.001, 0.005, 0.015], spread: [0.02, 0.05, 0.10] }, // v3 new (account disputed)
  { k: 'sinoSoviet',  y: 1969.6,  kind: 'proxy', name: 'Soviet–Chinese border war: Moscow sounds out a strike on China', use: [0.005, 0.030, 0.080], spread: [0.02, 0.05, 0.12] }, // v4: use 4%→3% (most scholars read Moscow's soundings as coercion; Mao still fled Beijing)
  { k: 'madman',      y: 1969.8,  kind: 'proxy', name: 'Nixon’s “madman” alert and Duck Hook', use: [0.002, 0.008, 0.020], spread: [0.03, 0.08, 0.15] },
  { k: 'indoPak71',   y: 1971.95, kind: 'sp',    name: 'India–Pakistan war: USS Enterprise sent to the Bay of Bengal', war: [0.0002, 0.001, 0.004], nuke: [0.60, 0.75, 0.90] }, // v3 new
  { k: 'yomKippurIL', y: 1973.78, kind: 'proxy', name: 'Yom Kippur: Israel readies its bombs', use: [0.005, 0.020, 0.050], spread: [0.03, 0.08, 0.15] },
  { k: 'defcon3',     y: 1973.81, kind: 'sp',    name: 'Yom Kippur: DEFCON 3, Soviet troops for Egypt', war: [0.001, 0.005, 0.020], nuke: [0.60, 0.75, 0.90] },
  { k: 'kincheloe73', y: 1973.82, kind: 'alarm', name: 'Yom Kippur: a false klaxon nearly scrambles B-52s at Kincheloe', launch: [0.0001, 0.0005, 0.003] }, // v3 new
  { k: 'tape79',      y: 1979.86, kind: 'alarm', name: 'NORAD: a training tape shows up to 2,200 Soviet missiles; Brzezinski about to wake Carter', launch: [0.001, 0.005, 0.020] }, // v3: label corrected (the 2,200 story is 9 Nov 1979)
  { k: 'iran80',      y: 1980.05, kind: 'sp',    name: 'Afghanistan and the Carter Doctrine: plans to stop a Soviet move into Iran', war: [0.0005, 0.002, 0.008], nuke: [0.60, 0.75, 0.90] }, // v3 new (GCRI: plans included nuclear force)
  { k: 'kuril80',     y: 1980.2,  kind: 'alarm', name: 'A Soviet test launch looks aimed at America', launch: [0.0005, 0.002, 0.010] },
  { k: 'chip80',      y: 1980.42, kind: 'alarm', name: 'A 46-cent chip fills the warning screens with 2s', launch: [0.0005, 0.003, 0.015] }, // v4: 0.5%→0.3% (caught within minutes by comparing sensors; never reached the President)
  { k: 'damascus80',  y: 1980.72, kind: 'acc',   name: 'Damascus, Arkansas: a Titan II missile explodes in its silo', launch: [0.0001, 0.0005, 0.002] },
  { k: 'petrov',      y: 1983.73, kind: 'alarm2', name: 'Petrov: five US missiles on the Soviet screen', pass: [0.30, 0.50, 0.70], launch: [0.010, 0.040, 0.140] },
  { k: 'ableArcher',  y: 1983.86, kind: 'alarm2', name: 'Able Archer: NATO’s exercise read as the real thing', pass: [0.010, 0.050, 0.200], launch: [0.050, 0.100, 0.200] }, // v4: pass 8%→5% (Miles 2020: Pact archives show calm, no pre-emption considered; PFIAB 1990 keeps it above zero) // v4: launch 12%→10%
  { k: 'gulf90',      y: 1990.9,  kind: 'proxy', name: 'Gulf War: US nuclear threats, Iraq’s plan against Tel Aviv, Israel’s answer', use: [0.002, 0.006, 0.020], spread: [0.002, 0.005, 0.020] }, // v3: was 0.1/0.3/1%; adds the Israel–Iraq road // v4: spread 2%→0.5% (the USSR of 1991 would not go to nuclear war over Iraq)
  { k: 'coup91',      y: 1991.63, kind: 'acc',   name: 'August coup: Gorbachev’s nuclear briefcase cut off', launch: [0.0005, 0.002, 0.010] },
];
const SET = { safe: 0, mid: 1, dangerous: 2 };
// A US–Soviet nuclear exchange that stops after a few weapons. v3: was 25/15/5%. Proud Prophet (1983), the top-level US war game: every road tried,
// from a demonstration shot to limited strikes, ended in all-out war (Bracken, The Second Nuclear Age).
const SP_HOLD = [0.15, 0.10, 0.05];
// Once nuclear weapons have been used in war again (a "limited" use), the taboo is broken: every later first step is more likely.
// Tannenwald, The Nuclear Taboo (2007). Judgement: ×1.25 / ×1.5 / ×2.
const TABOO = [1.25, 1.5, 2.0];
// US and Soviet warheads at the time (Norris & Kristensen, Bulletin of the Atomic Scientists 2010), straight lines between the listed years
const STOCK = { 1945: [2, 0], 1950: [299, 5], 1955: [2422, 200], 1960: [18638, 1605], 1965: [31149, 6129], 1970: [26008, 11643], 1975: [27519, 19055], 1980: [23368, 30062], 1985: [21392, 39197], 1990: [10904, 37000], 1995: [10904, 37000] };
function warheads(y) { const a = Math.floor(y / 5) * 5, b = a + 5, t = (y - a) / 5; return [0, 1].map(i => Math.round(STOCK[a][i] + (STOCK[b][i] - STOCK[a][i]) * t)); }

const warSeed = (seed, i) => (Math.imul(seed ^ 0x9E3779B9, 0x85EBCA6B) + Math.imul(i + 1, 0xC2B2AE35)) >>> 0;
function rng(seed) { let s = seed >>> 0; return () => { s += 0x6D2B79F5; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// one Cold War. s = column (0 safe, 1 middle, 2 dangerous). H = overrides { 'key.step': true/false }
// X = { alarms: multiplier on every false-alarm and accident first step } (the "secret incidents" sensitivity: the known list is mostly US-declassified)
function coldWar(s, R, H = {}, X = { alarms: 1 }) {
  const roll = (k, p) => { const r = R(); return k in H ? !!H[k] : r < p; };
  const path = []; let taboo = 1, limited = 0, cubaInvaded = false;
  // v2: before the Soviet arsenal existed (under 200 Soviet warheads, i.e. before 1955) a superpower nuclear war is a one-sided ATOMIC WAR, not the end of the world
  const end = (outcome, e, how) => ({ outcome: outcome === 'NUCLEAR WW3' && warheads(e.y)[1] < 200 ? 'ATOMIC WAR (before 1955)' : outcome, at: e.k, year: e.y, how, path, limited, warheads: warheads(e.y) });
  const CUBA = EVENTS.find(x => x.k === 'cubaStrike'), B61 = EVENTS.find(x => x.k === 'berlin61'); let invN = 0, invH = 0, invB = 0, invBN = 0;
  // the invasion of Cuba, however it starts, is ONE war with ONE set of dice (drawn once at the Cuba decision): ~98 tactical warheads on the island
  const invasion = (e, tag) => {
    if (!('cuba.nuke' in H ? H['cuba.nuke'] : invN < CUBA.nuke[s])) {                       // stays non-nuclear in Cuba: Cuba falls…
      if (!('cuba.berlin' in H ? H['cuba.berlin'] : invB < CUBA.berlin[s])) return null; // …and Moscow lets it go (Kennedy's fear: "they'll take Berlin")
      path.push(tag + ': Moscow answers in Berlin');
      return end(invBN < B61.nuke[s] ? 'NUCLEAR WW3' : 'CONVENTIONAL WW3', e, 'the invasion of Cuba led to war over Berlin'); }
    if ('cuba.hold' in H ? H['cuba.hold'] : invH < CUBA.hold[s]) { limited++; taboo = TABOO[s]; path.push(tag + ': tactical nuclear weapons used, then a ceasefire'); return null; }
    return end('NUCLEAR WW3', e, 'the invasion of Cuba went nuclear'); };
  for (const e of EVENTS) {
    const f = p => Math.min(1, p[s] * taboo);          // first step, raised once the taboo is broken
    const g = p => p[s];
    if (e.kind === 'sp') {
      if (!roll(e.k + '.war', f(e.war))) { R(); R(); continue; }
      path.push(e.k + ': war');
      if (!roll(e.k + '.nuke', g(e.nuke))) { R(); return end('CONVENTIONAL WW3', e, 'war that stayed non-nuclear'); }
      if (roll(e.k + '.hold', SP_HOLD[s])) { limited++; taboo = TABOO[s]; path.push(e.k + ': a few weapons, then a ceasefire'); continue; }
      return end('NUCLEAR WW3', e, 'a crisis became a nuclear war');
    }
    if (e.kind === 'proxy') {
      if (!roll(e.k + '.use', f(e.use))) { R(); continue; }
      limited++; taboo = TABOO[s]; path.push(e.k + ': nuclear weapons used');
      if (roll(e.k + '.spread', g(e.spread))) return end('NUCLEAR WW3', e, 'a smaller war went nuclear and pulled in the superpowers');
      continue;
    }
    if (e.kind === 'alarm' || e.kind === 'acc') {
      if (roll(e.k + '.launch', Math.min(1, f(e.launch) * X.alarms))) return end('NUCLEAR WW3', e, e.kind === 'alarm' ? 'a launch on a false alarm' : 'an accident taken for an attack');
      continue;
    }
    if (e.kind === 'alarm2') {
      if (!roll(e.k + '.pass', Math.min(1, f(e.pass) * X.alarms))) { R(); continue; }
      path.push(e.k + ': the warning goes up as real');
      if (roll(e.k + '.launch', g(e.launch))) return end('NUCLEAR WW3', e, 'a launch on a false alarm');
      continue;
    }
    if (e.kind === 'cuba') { // the decision of 16–22 Oct 1962
      const go = roll(e.k + '.go', f(e.go)); invN = R(); invH = R(); invB = R(); invBN = R();
      if (!go) continue;
      cubaInvaded = true; path.push('Cuba: strikes and invasion');
      const r = invasion(e, 'Cuba'); if (r) return r; continue; // no nuclear use: Cuba falls, the crisis ends
    }
    if (e.kind === 'cubaU2') { // 27 Oct 1962: strike the SAM site? If the strikes widen, it is the same invasion as above
      const strike = roll(e.k + '.strike', f(e.strike)) && !cubaInvaded, widen = roll(e.k + '.widen', g(e.widen));
      if (!strike) continue;
      path.push('U-2: the SAM sites are bombed');
      if (!widen) continue;
      cubaInvaded = true; path.push('U-2: the strikes widen into an invasion');
      const r = invasion(e, 'U-2'); if (r) return r; continue;
    }
    if (e.kind === 'cubaSub') { // v2: in the blockade world AND during an invasion (the Foxtrots are hunted either way)
      const fire = roll(e.k + '.fire', f(e.fire));
      if (!fire) { R(); continue; }
      limited++; taboo = TABOO[s]; path.push('B-59 fires its nuclear torpedo');
      if (roll(e.k + '.hold', g(e.hold))) continue;
      return end('NUCLEAR WW3', e, 'a nuclear torpedo at sea started the war');
    }
  }
  return { outcome: 'SURVIVED', at: null, year: null, how: 'the Soviet Union ended on 26 Dec 1991', path, limited };
}

function batch(set, n, seed, H, X) {
  const s = SET[set]; const out = { n, outcomes: {}, at: {}, how: {}, decade: {}, limitedRuns: 0, limitedSurvived: 0, quiet: 0, alive: {} };
  for (const e of EVENTS) out.alive[e.k] = 0;
  for (let i = 0; i < n; i++) {
    const r = coldWar(s, rng(warSeed(seed, i)), H, X);
    if (r.outcome === 'SURVIVED' && !r.limited) out.quiet++; // a Cold War like ours: no nuclear weapon used in war at all
    out.outcomes[r.outcome] = (out.outcomes[r.outcome] || 0) + 1;
    if (r.limited) { out.limitedRuns++; if (r.outcome === 'SURVIVED') out.limitedSurvived++; }
    if (r.at) { out.at[r.at] = (out.at[r.at] || 0) + 1; out.how[r.how] = (out.how[r.how] || 0) + 1; const d = Math.floor(r.year / 10) * 10 + 's'; out.decade[d] = (out.decade[d] || 0) + 1; }
    // the board: how many worlds are still alive after each event
    for (const e of EVENTS) { if (r.year !== null && e.y >= r.year) break; out.alive[e.k]++; }
  }
  return out;
}

// forced experiments: one fork pinned the dangerous way
const FORCED = { berlin48: { 'berlin48.war': true }, korea50: { 'korea50.use': true }, berlin61: { 'berlin61.war': true }, cubaStrike: { 'cubaStrike.go': true }, u2: { 'u2.strike': true },
  b59: { 'b59.fire': true }, sinoSoviet: { 'sinoSoviet.use': true }, petrov: { 'petrov.pass': true }, ableArcher: { 'ableArcher.pass': true } };

