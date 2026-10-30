// Cold War Simulator — the page. Plain script (no modules, no workers) so it runs the same online and when index.html is opened straight from the disk.
// The model (EVENTS, coldWar, rng, warSeed) comes from sim_web.js: the video's locked model, unchanged except for its export keywords.
(function () {
  'use strict';
  const STEP = { sp: 'war', proxy: 'use', alarm: 'launch', acc: 'launch', alarm2: 'pass', cuba: 'go', cubaU2: 'strike', cubaSub: 'fire' };
  const STEPNAME = { war: 'becomes a war', use: 'nuclear weapon used', launch: 'launch on a false alarm', pass: 'warning passed up as real', go: 'Kennedy chooses the air strike', strike: 'the SAM site is bombed', fire: 'the torpedo is fired' };
  const BIG = [['cubaStrike.go', 'Kennedy chooses the air strike (Cuba, 1962)', 'the biggest killer in the video'], ['b59.fire', 'B-59 fires its nuclear torpedo (1962)', 'sources disagree: 1% to 20%'], ['berlin61.war', 'Checkpoint Charlie becomes a war (1961)', ''], ['petrov.pass', 'Petrov reports the alarm as real (1983)', 'above him: the leaders still roll'], ['ableArcher.pass', 'Able Archer read as the real thing (1983)', ''], ['korea50.use', 'Korea: the bomb is used (1950)', '']];
  /* the video's numbers (middle column, 1,000,000 worlds, seed 19450716) and every experiment the video runs, in the video's order (checked by tools/test_webpage.mjs) */
  const VIDEO = { SURVIVED: 699712, 'NUCLEAR WW3': 228235, 'ATOMIC WAR (before 1955)': 48918, 'CONVENTIONAL WW3': 23135 };
  const PRESETS = [
    ['The video', 'Middle odds, nothing changed.', 'video: 699,712 survive', { col: 1, alarms: 1, edits: {} }, 699712],
    ['Berlin becomes a war', 'Checkpoint Charlie, October 1961: the tanks fire in every world.', 'video: 48,977 survive', { col: 1, alarms: 1, edits: { 'berlin61.war': 1 } }, 48977],
    ['Kennedy strikes Cuba', 'October 1962: the air strike chosen in every world.', 'video: 486,499 survive', { col: 1, alarms: 1, edits: { 'cubaStrike.go': 1 } }, 486499],
    ['B-59 fires its torpedo', '27 October 1962: the nuclear torpedo fired in every world.', 'video: 243,701 survive', { col: 1, alarms: 1, edits: { 'b59.fire': 1 } }, 243701],
    ['Petrov reports it', 'Petrov passes the alarm up every time. Everyone above him still rolls.', 'video: 687,236 survive', { col: 1, alarms: 1, edits: { 'petrov.pass': 1 } }, 687236],
    ['Every alarm × 2', 'Twice the chance for every false alarm and accident: the secret incidents.', 'video: 657,448 survive', { col: 1, alarms: 2, edits: {} }, 657448],
    ['The video\'s slider test', 'Air strike 45%, torpedo 12%, Petrov 30%, Korea 8%.', 'video: 602,899 survive', { col: 1, alarms: 1, edits: { 'cubaStrike.go': 0.45, 'b59.fire': 0.12, 'petrov.pass': 0.3, 'korea50.use': 0.08 } }, 602899],
    ['Danger exaggerated', 'The sceptics\' odds for every fork.', 'video: 94% survive', { col: 0, alarms: 1, edits: {} }, '94%'],
    ['We got very lucky', 'The alarmists\' odds for every fork.', 'video: 19% survive', { col: 2, alarms: 1, edits: {} }, '19%']];
  const LAB = [['SURVIVED', 'Survived: no war between the superpowers', '#a6dcff'], ['NUCLEAR WW3', 'Nuclear World War III', '#ff6a52'], ['ATOMIC WAR (before 1955)', 'Atomic war before 1955 (one-sided)', '#f9a825'], ['CONVENTIONAL WW3', 'World War III without nuclear weapons', '#c19c00']];
  const ORIGINAL = JSON.parse(JSON.stringify(EVENTS));
  const $ = id => document.getElementById(id), fmt = n => Math.round(n).toLocaleString('en-US'), pct = v => (v * 100).toFixed(v < 0.01 ? 2 : 1);
  const edits = {}; let current = 0, running = null;
  const col = () => +$('col').value, base = kf => { const [k, f] = kf.split('.'); return ORIGINAL.find(e => e.k === k)[f][col()]; }, val = kf => kf in edits ? edits[kf] : base(kf);
  function toast(s) { const t = $('toast'); t.textContent = s; t.style.opacity = 1; clearTimeout(toast.h); toast.h = setTimeout(() => { t.style.opacity = 0; }, 1800); }
  function status(s) { $('status').textContent = s; }
  function describe() { const n = Object.keys(edits).length; return current >= 0 ? 'Settings: “' + PRESETS[current][0] + '”.' : `Settings: your own (${n} odd${n === 1 ? '' : 's'} changed${$('alarms').value === '2' ? ', alarms × 2' : ''}).`; }

  /* ---------- drawing the controls ---------- */
  function drawPresets() { $('presets').innerHTML = PRESETS.map(([t, d, v], i) => `<button class="preset${i === current ? ' on' : ''}" data-i="${i}"><span class="t">${t}</span><span class="d">${d}</span><span class="v">${v}</span></button>`).join('');
    for (const b of $('presets').children) b.onclick = () => { load(+b.dataset.i); toResult(); run(); }; }
  function toResult() { $(innerWidth < 700 ? 'status' : 'run-h').scrollIntoView({ behavior: 'smooth', block: 'start' }); }   /* on a phone, land on the counter and the answer */
  function drawSliders() { $('sliders').innerHTML = BIG.map(([kf, lab, note]) => { const v = val(kf); return `<div class="slider"><label for="s_${kf}"><span>${lab}</span><span class="val${kf in edits ? ' changed' : ''}" id="v_${kf}">${pct(v)}%</span></label><input type="range" id="s_${kf}" min="0" max="1" step="0.0025" value="${v}"><small>model: ${pct(base(kf))}%${note ? ' · ' + note : ''}</small></div>`; }).join('');
    for (const [kf] of BIG) $('s_' + kf).oninput = e => { edits[kf] = +e.target.value; const o = $('v_' + kf); o.textContent = pct(edits[kf]) + '%'; o.className = 'val changed'; userChanged(); }; }
  function drawForks() { const q = ($('filter').value || '').toLowerCase().trim();
    $('forkTable').querySelector('tbody').innerHTML = ORIGINAL.filter(e => !q || (e.name + ' ' + Math.floor(e.y)).toLowerCase().includes(q)).map(e => { const f = STEP[e.kind], kf = e.k + '.' + f; return `<tr><td class="y">${Math.floor(e.y)}</td><td>${e.name}</td><td class="muted">${STEPNAME[f]}</td><td><input type="number" min="0" max="100" step="0.01" data-kf="${kf}" value="${(val(kf) * 100).toFixed(2)}" class="${kf in edits ? 'changed' : ''}" aria-label="odd for ${e.name.replace(/"/g, '')}"></td></tr>`; }).join('') || '<tr><td colspan="4" class="muted">No fork matches.</td></tr>';
    for (const inp of $('forkTable').querySelectorAll('input')) inp.onchange = e => { const v = Math.max(0, Math.min(100, +e.target.value || 0)) / 100, kf = e.target.dataset.kf; edits[kf] = v; e.target.value = (v * 100).toFixed(2); e.target.classList.add('changed'); drawSliders(); userChanged(); }; }
  function userChanged() { current = -1; drawPresets(); status('Changed. Press ▶ RUN. ' + describe()); }
  function load(i) { const s = PRESETS[i][3]; for (const k in edits) delete edits[k]; Object.assign(edits, s.edits); $('col').value = String(s.col); $('alarms').value = String(s.alarms); $('nw').value = '1000000'; current = i; drawPresets(); drawSliders(); drawForks(); status('Loaded. ' + describe()); }

  /* ---------- running: chunks of worlds between screen updates, so the page stays responsive ---------- */
  function run() { if (running) stop(true);
    EVENTS.forEach((e, i) => Object.assign(e, JSON.parse(JSON.stringify(ORIGINAL[i]))));   /* start from the locked odds, then apply this run's changes to the chosen column */
    const c = col(), alarms = +$('alarms').value, n = +$('nw').value, seed = 19450716;
    for (const [kf, v] of Object.entries(edits)) { const [k, f] = kf.split('.'), e = EVENTS.find(x => x.k === k); if (e && Array.isArray(e[f])) e[f][c] = v; }
    const out = {}, endedAt = {}; let i = 0, quiet = 0; const t0 = performance.now(), job = { cancel: false }; running = job;
    $('run').disabled = true; $('stop').disabled = false; $('where').innerHTML = ''; $('countOf').textContent = '/ ' + fmt(n) + ' worlds simulated'; $('headline').innerHTML = '<span class="muted">Running…</span>'; status('Running… ' + describe());
    const step = () => { if (job.cancel) return; const end = Math.min(n, i + 25000);
      for (; i < end; i++) { const r = coldWar(c, rng(warSeed(seed, i)), {}, { alarms }); out[r.outcome] = (out[r.outcome] || 0) + 1; if (r.at) endedAt[r.at] = (endedAt[r.at] || 0) + 1; if (r.outcome === 'SURVIVED' && !r.limited) quiet++; }
      $('count').textContent = fmt(i); $('bar').style.width = (i / n * 100) + '%'; showRes(out, i, i === n && n === 1000000 && current <= 0);
      if (i < n) setTimeout(step, 0); else finish(out, endedAt, quiet, n, t0); };
    setTimeout(step, 30); }
  function stop(silent) { if (running) running.cancel = true; running = null; $('run').disabled = false; $('stop').disabled = true; if (!silent) status('Stopped. ' + describe()); }
  function finish(out, endedAt, quiet, n, t0) { running = null; $('run').disabled = false; $('stop').disabled = true;
    status(`Done in ${((performance.now() - t0) / 1000).toFixed(1)} s. ${describe()}${n !== 1000000 ? ' A quick run: only the full 1,000,000 compares with the video.' : ''}`);
    headline(out, n);
    const top = Object.entries(endedAt).sort((a, b) => b[1] - a[1]).slice(0, 8);
    $('where').innerHTML = `<p class="muted" style="margin-top:14px">Worlds with no nuclear weapon used in any war, like ours: <b>${fmt(quiet)}</b></p><h3>Where the worlds ended</h3><div class="where">` + top.map(([k, v]) => `<span>${ORIGINAL.find(e => e.k === k).name}</span><span class="n">${fmt(v)}</span><span class="d">${(v / n * 100).toFixed(1)}%</span>`).join('') + '</div>'; }
  /* the answer in one line: how many survived, and how that compares with the video */
  function headline(o, n) { const s = o.SURVIVED || 0, w = o['NUCLEAR WW3'] || 0; let cmp = '';
    if (n !== 1000000) cmp = '<span class="muted">A quick run. Run all 1,000,000 to compare with the video.</span>';
    else if (current >= 0) { const want = PRESETS[current][4], got = typeof want === 'string' ? Math.round(s / 1e4) + '%' : s;
      cmp = got === want ? '<span class="ok">✓ Same as in the video</span>' : '<span class="muted">The video: ' + (typeof want === 'string' ? want : fmt(want)) + '</span>'; }
    else { const d = s - VIDEO.SURVIVED; cmp = d === 0 ? '<span class="ok">Same as the video</span>' : `<span class="${d > 0 ? 'ok' : 'bad'}">${fmt(Math.abs(d))} ${d > 0 ? 'more worlds survive' : 'more worlds end'} than in the video</span>`; }
    $('headline').innerHTML = `<div><b class="big">${fmt(s)}</b> of ${fmt(n)} worlds survive <span class="muted">(${(s / n * 100).toFixed(1)}%)</span></div><div><b class="red">${fmt(w)}</b> end in nuclear World War III</div><div class="cmp">${cmp}</div>`; }
  function showRes(o, n, cmp) { $('res').innerHTML = '<span class="h">outcome</span><span class="h">worlds</span><span class="h">share</span><span class="h v">' + (cmp ? 'vs the video' : '') + '</span>' + LAB.map(([k, lab, c]) => { const v = o[k] || 0, d = v - VIDEO[k], good = k === 'SURVIVED' ? d > 0 : d < 0;
      return `<span><i class="sw" style="background:${c}"></i>${lab}</span><span class="n" style="color:${c}">${n ? fmt(v) : "—"}</span><span class="d">${n ? (v / n * 100).toFixed(1) + '%' : ''}</span><span class="v" style="color:${d === 0 ? 'var(--green)' : good ? 'var(--green)' : 'var(--red)'}">${!cmp ? '' : d === 0 ? 'same' : (d > 0 ? '+' : '−') + fmt(Math.abs(d))}</span>`; }).join('');
    $('stack').innerHTML = n ? LAB.map(([k, , c]) => `<i style="width:${(o[k] || 0) / n * 100}%;background:${c}" title="${k}"></i>`).join('') : ''; }

  /* ---------- sharing: the scenario lives in the link (#c=column&a=alarms&e=key.step:value,…); nothing is stored or sent ---------- */
  const encode = () => `#c=${col()}&a=${$('alarms').value}` + (Object.keys(edits).length ? '&e=' + Object.entries(edits).map(([k, v]) => k + ':' + (+(+v).toFixed(4))).join(',') : '');
  async function share() { const url = location.href.split('#')[0] + encode(); try { history.replaceState(null, '', encode()); } catch (e) { }
    try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch (e) { window.prompt('Copy this link:', url); } }
  function fromHash() { const h = new URLSearchParams(location.hash.slice(1)); if (!h.has('c')) return false; for (const k in edits) delete edits[k];
    for (const p of (h.get('e') || '').split(',').filter(Boolean)) { const [k, v] = p.split(':'); if (/^[a-zA-Z0-9]+\.[a-z]+$/.test(k) && isFinite(+v)) edits[k] = Math.max(0, Math.min(1, +v)); }
    $('col').value = String([0, 1, 2].includes(+h.get('c')) ? +h.get('c') : 1); $('alarms').value = h.get('a') === '2' ? '2' : '1'; current = -1; drawPresets(); drawSliders(); drawForks(); status('Scenario from a shared link. Press ▶ RUN. ' + describe()); return true; }

  /* ---------- wiring ---------- */
  $('run').onclick = run; $('stop').onclick = () => stop(false); $('share').onclick = share; $('reset').onclick = () => { load(0); toast('Back to the video\'s settings'); };
  $('heroRun').onclick = () => { load(0); toResult(); run(); };
  $('col').onchange = () => { drawSliders(); drawForks(); userChanged(); }; $('alarms').onchange = userChanged; $('nw').onchange = () => status('Worlds: ' + $('nw').selectedOptions[0].textContent + '. ' + describe());
  $('filter').oninput = () => { $('forkWrap').hidden = false; $('toggleForks').textContent = 'Hide the list'; drawForks(); };
  $('toggleForks').onclick = () => { const w = $('forkWrap'); w.hidden = !w.hidden; $('toggleForks').textContent = w.hidden ? 'Show all 51' : 'Hide the list'; };
  if (!fromHash()) load(0); showRes({}, 0, false);
})();
