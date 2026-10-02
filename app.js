// Sleep Guide — renders everything from window.SLEEP_DATA (data.js).
(() => {
  'use strict';

  const D = window.SLEEP_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const pct = (n) => `${Math.round(n)}%`;
  const fmtDuration = (min) => {
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
  };

  // ---------- Quick facts ----------
  function renderFacts() {
    $('#quick-facts').innerHTML = D.quickFacts.map((f) => `
      <div class="fact">
        <div class="fact__value">${esc(f.value)}</div>
        <div class="fact__label">${esc(f.label)}</div>
        <div class="fact__note">${esc(f.note)}</div>
      </div>`).join('');
  }

  // ---------- Night explorer (hypnogram) ----------
  const BEDTIME_MIN = 22 * 60 + 30; // 10:30 PM lights out
  const clock = (offsetMin) => {
    const t = (BEDTIME_MIN + offsetMin) % (24 * 60);
    let h = Math.floor(t / 60); const m = Math.floor(t % 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  function buildNight(night) {
    let t = 0;
    const segs = night.segments.map(([stage, dur]) => {
      const s = { stage, start: t, end: t + dur, dur };
      t += dur;
      return s;
    });
    const total = t;
    const firstSleep = segs.find((s) => s.stage !== 'wake');
    const lastSleep = [...segs].reverse().find((s) => s.stage !== 'wake');
    const mins = { wake: 0, rem: 0, n1: 0, n2: 0, n3: 0 };
    segs.forEach((s) => { mins[s.stage] += s.dur; });
    const asleep = total - mins.wake;
    const waso = segs
      .filter((s) => s.stage === 'wake' && s.start >= firstSleep.start && s.end <= lastSleep.end)
      .reduce((a, s) => a + s.dur, 0);
    const wakeups = segs.filter((s) => s.stage === 'wake' && s.start > firstSleep.start && s.end <= lastSleep.end).length;

    // Cycle index: a new cycle starts after each REM period ends.
    let cycle = 1;
    segs.forEach((s, i) => {
      s.cycle = cycle;
      if (s.stage === 'rem' && segs[i + 1] && segs[i + 1].stage !== 'rem') cycle++;
    });

    return {
      segs, total, mins, asleep, waso, wakeups,
      latency: firstSleep.start,
      efficiency: (asleep / total) * 100,
      events: night.events
    };
  }

  const stageBlurb = {
    wake: 'Awake or a brief arousal. Light, noise, heat, pressure or a partner can cause these.',
    n1: 'Drifting off. Very easy to disturb.',
    n2: 'Light, stable sleep. Spindles help block noise.',
    n3: 'Deep sleep — physical repair, growth hormone, immune support.',
    rem: 'Dreaming. Emotional processing and memory.'
  };

  const nightState = { key: 'healthy', model: null, cursor: 95 };

  function renderScenarioButtons() {
    const wrap = $('#night-scenarios');
    wrap.innerHTML = Object.entries(D.nights).map(([key, n]) => `
      <button type="button" role="tab" data-key="${key}" aria-selected="${key === nightState.key}">${esc(n.label)}</button>`).join('');
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-key]');
      if (!btn) return;
      nightState.key = btn.dataset.key;
      $$('button', wrap).forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      drawNight();
    });
  }

  function renderNightLegend() {
    $('#night-legend').innerHTML = D.stageOrder.map((k) => `
      <span class="legend__item"><i class="swatch swatch--${k}"></i>${esc(D.stages[k].name)}</span>`).join('');
  }

  function drawNight() {
    const night = D.nights[nightState.key];
    const m = buildNight(night);
    nightState.model = m;
    $('#night-summary').textContent = night.summary;

    const host = $('#hypnogram');
    const W = Math.max(320, host.clientWidth);
    const narrow = W < 560;
    const H = narrow ? 240 : 290;
    const pad = { l: narrow ? 40 : 48, r: 12, t: 34, b: 30 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const rows = D.stageOrder.length;
    const rowH = ih / rows;
    const x = (min) => pad.l + (min / m.total) * iw;
    const yMid = (stage) => pad.t + D.stageOrder.indexOf(stage) * rowH + rowH / 2;
    const barH = Math.min(18, rowH * 0.55);

    let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Hypnogram, ${esc(night.label)} scenario: ${fmtDuration(m.asleep)} asleep, ${m.wakeups} wake-ups, deep sleep ${pct(m.mins.n3 / m.asleep * 100)}">`;

    // Row guides + labels
    D.stageOrder.forEach((k, i) => {
      const y = pad.t + i * rowH + rowH / 2;
      svg += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}"/>`;
      svg += `<text class="axis-label" x="${pad.l - 8}" y="${y}" text-anchor="end" dominant-baseline="middle">${D.stages[k].short}</text>`;
    });

    // Hour ticks
    const hourStep = narrow ? 120 : 60;
    for (let t = 0; t <= m.total; t += hourStep) {
      const xx = x(t);
      svg += `<line class="tick" x1="${xx}" x2="${xx}" y1="${pad.t}" y2="${H - pad.b + 4}"/>`;
      const anchor = t === 0 ? 'start' : t >= m.total ? 'end' : 'middle';
      const lbl = narrow ? clock(t).replace(' AM', 'a').replace(' PM', 'p') : clock(t).replace(':00', '');
      svg += `<text class="axis-label" x="${xx}" y="${H - 10}" text-anchor="${anchor}">${lbl}</text>`;
    }

    // Step connector line (neutral) then colored stage bars on top.
    let d = '';
    m.segs.forEach((s, i) => {
      const y = yMid(s.stage);
      d += i === 0 ? `M${x(s.start)},${y}` : `V${y}`;
      d += `H${x(s.end)}`;
    });
    svg += `<path class="step" d="${d}"/>`;
    m.segs.forEach((s) => {
      const w = Math.max(1.5, x(s.end) - x(s.start) - 1);
      svg += `<rect class="seg seg--${s.stage}" x="${x(s.start) + 0.5}" y="${yMid(s.stage) - barH / 2}" width="${w}" height="${barH}" rx="${Math.min(4, w / 2)}"/>`;
    });

    // Disruption markers
    m.events.forEach((ev, i) => {
      const xx = x(ev.at);
      svg += `<g class="event"><line x1="${xx}" x2="${xx}" y1="${pad.t - 14}" y2="${H - pad.b}"/>` +
        `<circle cx="${xx}" cy="${pad.t - 18}" r="8"/><text x="${xx}" y="${pad.t - 18}" text-anchor="middle" dominant-baseline="central">${i + 1}</text></g>`;
    });

    // Cursor
    svg += `<g class="cursor" id="night-cursor"><line y1="${pad.t - 6}" y2="${H - pad.b}"/><circle r="6"/></g>`;
    svg += `<rect class="hit" x="${pad.l}" y="0" width="${iw}" height="${H}" tabindex="0" aria-label="Scrub through the night. Use arrow keys."/>`;
    svg += '</svg>';
    host.innerHTML = svg;

    const geo = { x, yMid, pad, iw, total: m.total };
    nightState.geo = geo;
    nightState.cursor = Math.min(nightState.cursor, m.total - 1);
    bindScrub(host);
    moveCursor(nightState.cursor);
    renderNightStats(m);
    renderNightTable(m);
  }

  function bindScrub(host) {
    const hit = $('.hit', host);
    const toMin = (clientX) => {
      const r = hit.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      return f * (nightState.model.total - 0.01);
    };
    let dragging = false;
    hit.addEventListener('pointerdown', (e) => { dragging = true; hit.setPointerCapture(e.pointerId); moveCursor(toMin(e.clientX)); });
    hit.addEventListener('pointermove', (e) => { if (dragging || e.pointerType === 'mouse') moveCursor(toMin(e.clientX)); });
    hit.addEventListener('pointerup', () => { dragging = false; });
    hit.addEventListener('pointercancel', () => { dragging = false; });
    hit.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 30 : 5;
      if (e.key === 'ArrowRight') { moveCursor(Math.min(nightState.model.total - 0.01, nightState.cursor + step)); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { moveCursor(Math.max(0, nightState.cursor - step)); e.preventDefault(); }
    });
  }

  function moveCursor(min) {
    nightState.cursor = min;
    const { model: m, geo } = nightState;
    const seg = m.segs.find((s) => min >= s.start && min < s.end) || m.segs[m.segs.length - 1];
    const cur = $('#night-cursor');
    if (cur) {
      const xx = geo.x(min);
      $('line', cur).setAttribute('x1', xx);
      $('line', cur).setAttribute('x2', xx);
      const c = $('circle', cur);
      c.setAttribute('cx', xx);
      c.setAttribute('cy', geo.yMid(seg.stage));
      c.setAttribute('class', `dot--${seg.stage}`);
    }
    const near = m.events.map((ev, i) => ({ ...ev, n: i + 1 })).find((ev) => Math.abs(ev.at - min) <= 12);
    const elapsed = min;
    const partOfNight = elapsed < m.total / 3 ? 'early' : elapsed < (2 * m.total) / 3 ? 'middle' : 'late';
    const hint = {
      early: 'Early night: deep sleep (N3) is at its peak.',
      middle: 'Middle of the night: cycles balance N2, N3 and REM.',
      late: 'Late night: REM periods get longer; deep sleep is mostly done.'
    }[partOfNight];

    $('#night-readout').innerHTML = `
      <div class="readout__time">${clock(min)}</div>
      <div class="readout__stage"><i class="swatch swatch--${seg.stage}"></i>${esc(D.stages[seg.stage].name)}</div>
      <p class="readout__text">${esc(stageBlurb[seg.stage])}</p>
      <p class="readout__meta">${seg.stage === 'wake' ? '' : `Cycle ${seg.cycle} · `}${fmtDuration(seg.dur)} in this stretch</p>
      ${near ? `<p class="readout__event"><span class="badge">${near.n}</span>${esc(near.text)}</p>` : `<p class="readout__hint">${esc(hint)}</p>`}`;
  }

  function renderNightStats(m) {
    const healthy = buildNight(D.nights.healthy);
    const deep = (m.mins.n3 / m.asleep) * 100;
    const rem = (m.mins.rem / m.asleep) * 100;
    const stats = [
      { label: 'Asleep', value: fmtDuration(m.asleep), ok: m.asleep >= 7 * 60, base: fmtDuration(healthy.asleep) },
      { label: 'Fell asleep in', value: `${m.latency} min`, ok: m.latency <= 30, base: `${healthy.latency} min` },
      { label: 'Efficiency', value: pct(m.efficiency), ok: m.efficiency >= 85, base: pct(healthy.efficiency) },
      { label: 'Wake-ups', value: m.wakeups, ok: m.wakeups <= 2, base: healthy.wakeups },
      { label: 'Deep sleep', value: `${pct(deep)} · ${fmtDuration(m.mins.n3)}`, ok: deep >= 15, base: fmtDuration(healthy.mins.n3) },
      { label: 'REM', value: `${pct(rem)} · ${fmtDuration(m.mins.rem)}`, ok: rem >= 20, base: fmtDuration(healthy.mins.rem) }
    ];
    const isHealthy = nightState.key === 'healthy';
    $('#night-stats').innerHTML = stats.map((s) => `
      <div class="stat ${s.ok ? 'stat--ok' : 'stat--warn'}">
        <div class="stat__label">${esc(s.label)}</div>
        <div class="stat__value">${esc(s.value)}</div>
        <div class="stat__flag">${s.ok
          ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5 6.5 12 13 4.5"/></svg>In range'
          : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v6M8 12.5v.5"/></svg>Below healthy'}${isHealthy ? '' : ` <span class="stat__base">vs ${esc(s.base)}</span>`}</div>
      </div>`).join('');
  }

  function renderNightTable(m) {
    const rows = D.stageOrder.map((k) => `<tr><th scope="row"><i class="swatch swatch--${k}"></i>${esc(D.stages[k].name)}</th><td>${fmtDuration(m.mins[k])}</td><td>${k === 'wake' ? '—' : pct((m.mins[k] / m.asleep) * 100)}</td></tr>`).join('');
    $('#night-table').innerHTML = `<table class="table"><thead><tr><th>Stage</th><th>Time</th><th>% of sleep</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  // ---------- EEG-style waveforms ----------
  // Deterministic pseudo-noise so waves look organic but stable.
  const noise = (t, seed = 1) => Math.sin(t * 12.9898 * seed) * 0.5 + Math.sin(t * 7.233 + seed) * 0.3 + Math.sin(t * 23.1 + seed * 3) * 0.2;

  const eegFns = {
    wake: (t) => 0.18 * Math.sin(t * 38) + 0.12 * noise(t * 3, 2),
    n1: (t) => 0.35 * Math.sin(t * 11) + 0.12 * noise(t * 2, 3),
    n2: (t) => {
      const cyc = ((t % 6) + 6) % 6;
      let v = 0.32 * Math.sin(t * 10) + 0.1 * noise(t * 2, 4);
      if (cyc > 1.2 && cyc < 2.0) v += 0.35 * Math.sin(t * 52) * Math.sin(((cyc - 1.2) / 0.8) * Math.PI); // spindle
      if (cyc > 3.8 && cyc < 4.6) { const k = (cyc - 3.8) / 0.8; v += -1.1 * Math.sin(k * Math.PI) * (k < 0.5 ? 1 : -0.6); } // K-complex
      return v;
    },
    n3: (t) => 0.85 * Math.sin(t * 2.6) + 0.2 * Math.sin(t * 4.1 + 1) + 0.08 * noise(t, 5),
    rem: (t) => 0.22 * Math.sin(t * 24) + 0.16 * Math.sin(t * 9) + 0.1 * noise(t * 4, 6) + (((t % 3) + 3) % 3 < 0.25 ? 0.35 * Math.sin(t * 25) : 0) // sawtooth-ish bursts
  };

  const animators = new Set();
  function wavePath(fn, w, h, phase, span = 6) {
    const n = Math.max(120, Math.floor(w / 2));
    let d = '';
    for (let i = 0; i <= n; i++) {
      const t = phase + (i / n) * span;
      const y = h / 2 - fn(t) * (h / 2) * 0.9;
      d += `${i ? 'L' : 'M'}${((i / n) * w).toFixed(1)},${y.toFixed(1)}`;
    }
    return d;
  }

  function mountWave(el, fn, { span = 6, speed = 0.6 } = {}) {
    const w = 600, h = el.dataset.h ? +el.dataset.h : 120;
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><line class="wave-base" x1="0" x2="${w}" y1="${h / 2}" y2="${h / 2}"/><path class="wave-line"/></svg>`;
    const path = $('path', el);
    const anim = { el, path, fn, w, h, span, speed, phase: 0, visible: false };
    path.setAttribute('d', wavePath(fn, w, h, 0, span));
    if (!reduceMotion) { animators.add(anim); waveObserver.observe(el); }
    return anim;
  }

  const waveObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => animators.forEach((a) => { if (a.el === e.target) a.visible = e.isIntersecting; }));
  }) : { observe() {} };

  let lastTs = 0;
  function tick(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;
    animators.forEach((a) => {
      if (!a.visible || !a.el.isConnected) return;
      a.phase += dt * a.speed;
      a.path.setAttribute('d', wavePath(a.fn, a.w, a.h, a.phase, a.span));
    });
    requestAnimationFrame(tick);
  }

  // ---------- Stages ----------
  let stageWave = null;
  function renderStageTabs() {
    const tabs = $('#stage-tabs');
    tabs.innerHTML = D.stageDetails.map((s, i) => `
      <button type="button" role="tab" id="tab-${s.id}" data-id="${s.id}" aria-selected="${i === 0}" class="stage-tab stage-tab--${s.id}">
        <span class="stage-tab__name">${esc(s.name.split(' · ')[0])}</span>
        <span class="stage-tab__desc">${esc(s.name.split(' · ')[1])}</span>
        <span class="stage-tab__bar"><i style="width:${s.shareNum * 1.6}%"></i></span>
        <span class="stage-tab__share">${esc(s.share)} of the night</span>
      </button>`).join('');
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-id]');
      if (b) selectStage(b.dataset.id);
    });
    tabs.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      const ids = D.stageDetails.map((s) => s.id);
      const cur = ids.indexOf($('[aria-selected="true"]', tabs).dataset.id);
      const next = ids[(cur + (e.key === 'ArrowRight' ? 1 : ids.length - 1)) % ids.length];
      selectStage(next);
      $(`#tab-${next}`).focus();
    });
    selectStage(D.stageDetails[0].id);
  }

  function selectStage(id) {
    const s = D.stageDetails.find((x) => x.id === id);
    $$('#stage-tabs button').forEach((b) => {
      const on = b.dataset.id === id;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    const list = (arr) => `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    const view = $('#stage-view');
    view.setAttribute('aria-labelledby', `tab-${id}`);
    view.className = `stage-view stage-view--${id}`;
    view.innerHTML = `
      <div class="stage-view__top">
        <div>
          <h3>${esc(s.name)}</h3>
          <p class="stage-view__tag">${esc(s.tagline)}</p>
        </div>
        <dl class="stage-view__meta">
          <div><dt>Share of night</dt><dd>${esc(s.share)}</dd></div>
          <div><dt>Length</dt><dd>${esc(s.length)}</dd></div>
        </dl>
      </div>
      <div class="eeg">
        <div class="eeg__label">Brain activity · ${esc(s.wave)}</div>
        <div class="eeg__wave" data-h="110"></div>
        ${id === 'n2' ? '<div class="eeg__notes"><span>Spindle = quick burst</span><span>K-complex = one big dip</span></div>' : ''}
      </div>
      <div class="stage-view__grid">
        <div><h4>In the body</h4>${list(s.body)}</div>
        <div><h4>What it does</h4>${list(s.purpose)}</div>
        <div><h4>What disrupts it</h4>${list(s.disruptors)}</div>
      </div>
      <blockquote class="say"><span class="say__label">Say it like this</span>${esc(s.talkingPoint)}</blockquote>`;
    if (stageWave) animators.delete(stageWave);
    stageWave = mountWave($('.eeg__wave', view), eegFns[id], { span: id === 'n2' ? 12 : 6, speed: 0.7 });
    stageWave.visible = true;
  }

  function renderWaves() {
    $('#waves').innerHTML = D.brainWaves.map((w) => `
      <div class="wave-row" id="wave-${w.id}">
        <div class="wave-row__name"><strong>${esc(w.name)}</strong><span>${esc(w.hz)}</span></div>
        <div class="wave-row__viz" data-h="44"></div>
        <div class="wave-row__info"><span>${esc(w.when)}</span><span class="muted">${esc(w.sleep)}</span></div>
      </div>`).join('');
    D.brainWaves.forEach((w) => {
      const fn = (t) => w.amp * Math.sin(t * w.freq * 2) + 0.05 * noise(t * 2, w.freq);
      mountWave($(`#wave-${w.id} .wave-row__viz`), fn, { span: 6, speed: 0.4 });
    });
  }

  // ---------- Customer fit helper ----------
  const fitState = { position: null, concerns: new Set() };

  function renderFit() {
    $('#positions').innerHTML = D.positions.map((p) => `
      <button type="button" role="radio" aria-checked="false" data-id="${p.id}" class="pos">
        ${positionIcon(p.id)}<span>${esc(p.label)}</span>
      </button>`).join('');
    $('#concerns').innerHTML = D.concerns.map((c) => `
      <button type="button" class="chip-toggle" aria-pressed="false" data-id="${c.id}">${esc(c.label)}</button>`).join('');

    $('#positions').addEventListener('click', (e) => {
      const b = e.target.closest('[data-id]');
      if (!b) return;
      fitState.position = fitState.position === b.dataset.id ? null : b.dataset.id;
      $$('#positions [data-id]').forEach((x) => x.setAttribute('aria-checked', String(x.dataset.id === fitState.position)));
      renderFitOutput();
    });
    $('#concerns').addEventListener('click', (e) => {
      const b = e.target.closest('[data-id]');
      if (!b) return;
      const id = b.dataset.id;
      fitState.concerns.has(id) ? fitState.concerns.delete(id) : fitState.concerns.add(id);
      b.setAttribute('aria-pressed', String(fitState.concerns.has(id)));
      renderFitOutput();
    });
    $('#fit-reset').addEventListener('click', () => {
      fitState.position = null;
      fitState.concerns.clear();
      $$('#positions [data-id]').forEach((x) => x.setAttribute('aria-checked', 'false'));
      $$('#concerns [data-id]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      renderFitOutput();
    });
    renderFitOutput();
  }

  function positionIcon(id) {
    // Simple figure silhouettes lying on a mattress line.
    const figs = {
      side: '<circle cx="10" cy="14" r="4"/><path d="M15 15c6-3 14-3 20 0l5 3"/><path d="M22 14l-2 5"/>',
      back: '<circle cx="9" cy="16" r="4"/><path d="M14 18h26"/><path d="M20 18v-3"/>',
      stomach: '<circle cx="9" cy="17" r="4"/><path d="M14 18c8 2 16 2 26 0"/><path d="M18 19l2 1"/>',
      combo: '<circle cx="10" cy="14" r="4"/><path d="M15 15c6-3 14-3 20 0"/><path d="M36 9a4 4 0 1 1-1 5" /><path d="M35 7l1 2.5-2.5.5"/>'
    };
    return `<svg class="pos__icon" viewBox="0 0 46 26" aria-hidden="true"><path class="pos__bed" d="M3 22h40"/>${figs[id]}</svg>`;
  }

  function renderFitOutput() {
    const out = $('#fit-output');
    const pos = D.positions.find((p) => p.id === fitState.position);
    const picked = D.concerns.filter((c) => fitState.concerns.has(c.id));
    if (!pos && !picked.length) {
      out.innerHTML = `<div class="empty">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>
        <p><strong>Start with a question:</strong> "How do you usually fall asleep — side, back or stomach? And how do you feel when you wake up?"</p>
      </div>`;
      return;
    }
    let html = '';
    if (pos) {
      html += `<article class="result result--pos">
        <header><span class="result__kicker">${esc(pos.label)} sleeper</span><h4>${esc(pos.need)}</h4></header>
        <div class="result__row"><span class="label">Typical feel</span><strong>${esc(pos.feel)}</strong></div>
        <div class="result__row"><span class="label">Pressure points</span><span class="tags">${pos.pressure.map((p) => `<span class="tag">${esc(p)}</span>`).join('')}</span></div>
        <p class="result__watch">${esc(pos.watch)}</p>
      </article>`;
    }
    const referral = picked.some((c) => c.refer);
    picked.forEach((c) => {
      html += `<article class="result">
        <header><span class="result__kicker">${esc(c.priority)}</span><h4>${esc(c.label)}</h4></header>
        <p class="result__why"><strong>The sleep science:</strong> ${esc(c.why)}</p>
        <div class="result__look"><span class="label">Look for</span><ul>${c.look.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>
        <blockquote class="say say--small"><span class="say__label">Say it like this</span>${esc(c.say)}</blockquote>
      </article>`;
    });
    if (referral) {
      html += `<p class="refer"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/></svg>Some of these can have a medical cause. Suggest they mention it to their doctor.</p>`;
    }
    out.innerHTML = html;
  }

  // ---------- Drivers + caffeine ----------
  function renderDrivers() {
    const icons = {
      'Sleep pressure': '<path d="M5 19h14M7 19V9M12 19V5M17 19v-7"/>',
      'Body clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      'Temperature': '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/><path d="M12 10v6"/>'
    };
    $('#drivers-cards').innerHTML = D.drivers.points.map((p) => `
      <div class="driver">
        <svg viewBox="0 0 24 24" aria-hidden="true">${icons[p.title] || ''}</svg>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.body)}</p>
      </div>`).join('');

    const c = $('#caffeine');
    c.innerHTML = `
      <div class="caffeine__head">
        <h3>Caffeine calculator</h3>
        <p class="muted">One cup of coffee (~${D.drivers.caffeineMg} mg). Caffeine's half-life averages about ${D.drivers.caffeineHalfLife} hours, but varies a lot by person.</p>
      </div>
      <div class="caffeine__controls">
        <label>Last coffee <output id="cup-out"></output><input id="cup-time" type="range" min="6" max="21" step="0.5" value="15"></label>
        <label>Bedtime <output id="bed-out"></output><input id="bed-time" type="range" min="20" max="25" step="0.5" value="22.5"></label>
      </div>
      <div class="caffeine__result" id="caf-result" aria-live="polite"></div>
      <div class="caffeine__chart" id="caf-chart"></div>`;
    const update = () => drawCaffeine(+$('#cup-time').value, +$('#bed-time').value);
    $('#cup-time').addEventListener('input', update);
    $('#bed-time').addEventListener('input', update);
    update();
  }

  const hourLabel = (h) => {
    const hh = ((h % 24) + 24) % 24;
    const H = Math.floor(hh), M = Math.round((hh - H) * 60);
    return `${H % 12 || 12}${M ? ':' + String(M).padStart(2, '0') : ''} ${H >= 12 ? 'PM' : 'AM'}`;
  };

  function drawCaffeine(cup, bed) {
    const mg = D.drivers.caffeineMg, hl = D.drivers.caffeineHalfLife;
    const left = (h) => (h < cup ? 0 : mg * Math.pow(0.5, (h - cup) / hl));
    const atBed = left(bed);
    $('#cup-out').textContent = hourLabel(cup);
    $('#bed-out').textContent = hourLabel(bed);
    const frac = atBed / mg;
    const level = frac > 0.4 ? 'high' : frac > 0.2 ? 'mid' : 'low';
    const msg = { high: 'Enough to noticeably delay sleep and reduce deep sleep.', mid: 'Can still make sleep lighter, even if they fall asleep fine.', low: 'Most of it has worn off by bedtime.' }[level];
    $('#caf-result').innerHTML = `<span class="caf-num caf-num--${level}">${Math.round(atBed)} mg</span><span>still in the body at bedtime (${pct(frac * 100)} of the cup). ${esc(msg)}</span>`;

    const host = $('#caf-chart');
    const W = Math.max(300, host.clientWidth), H = 150;
    const pad = { l: 36, r: 12, t: 12, b: 24 };
    const start = 6, end = 26;
    const x = (h) => pad.l + ((h - start) / (end - start)) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - v / mg) * (H - pad.t - pad.b);
    let d = '';
    for (let h = start; h <= end; h += 0.1) d += `${d ? 'L' : 'M'}${x(h).toFixed(1)},${y(left(h)).toFixed(1)}`;
    let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Caffeine remaining over the day">`;
    [0, mg / 2, mg].forEach((v) => {
      svg += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text class="axis-label" x="${pad.l - 6}" y="${y(v)}" text-anchor="end" dominant-baseline="middle">${Math.round(v)}</text>`;
    });
    for (let h = 6; h <= 26; h += 4) svg += `<text class="axis-label" x="${x(h)}" y="${H - 6}" text-anchor="middle">${hourLabel(h).replace(' ', '')}</text>`;
    svg += `<path class="caf-area" d="${d}L${x(end)},${y(0)}L${x(start)},${y(0)}Z"/><path class="caf-line" d="${d}"/>`;
    svg += `<line class="bed-line" x1="${x(bed)}" x2="${x(bed)}" y1="${pad.t}" y2="${H - pad.b}"/><circle class="bed-dot" cx="${x(bed)}" cy="${y(atBed)}" r="5"/>`;
    svg += `<text class="axis-label axis-label--strong" x="${x(bed) - 6}" y="${pad.t + 8}" text-anchor="end">Bedtime</text></svg>`;
    host.innerHTML = svg;
  }

  // ---------- Age ----------
  function renderAge() {
    const max = 18;
    const host = $('#age-chart');
    host.innerHTML = `
      <div class="age__rows" role="list">
        ${D.ageGroups.map((g, i) => `
          <button type="button" class="age__row" role="listitem" data-i="${i}" aria-pressed="${g.label === 'Adult'}">
            <span class="age__label"><strong>${esc(g.label)}</strong><span>${esc(g.range)}</span></span>
            <span class="age__track">
              <span class="age__bar" style="left:${(g.hours[0] / max) * 100}%;width:${((g.hours[1] - g.hours[0]) / max) * 100}%"></span>
            </span>
            <span class="age__val">${g.hours[0]}–${g.hours[1]} h</span>
          </button>`).join('')}
        <div class="age__axis" aria-hidden="true"><span></span><span class="age__ticks">${[0, 6, 12, 18].map((h) => `<i style="left:${(h / max) * 100}%">${h}h</i>`).join('')}</span><span></span></div>
      </div>
      <div class="age__note" id="age-note" aria-live="polite"></div>`;
    const show = (i) => {
      const g = D.ageGroups[i];
      $$('.age__row', host).forEach((r) => r.setAttribute('aria-pressed', String(+r.dataset.i === i)));
      $('#age-note').innerHTML = `<strong>${esc(g.label)} (${esc(g.range)}):</strong> ${g.hours[0]}–${g.hours[1]} hours. ${esc(g.note)}`;
    };
    host.addEventListener('click', (e) => { const r = e.target.closest('.age__row'); if (r) show(+r.dataset.i); });
    show(D.ageGroups.findIndex((g) => g.label === 'Adult'));
  }

  // ---------- Good vs poor + costs ----------
  function renderQuality() {
    $('#compare').innerHTML = `<table class="table table--compare">
      <thead><tr><th>Measure</th><th class="good-h">Healthy</th><th class="poor-h">Poor</th></tr></thead>
      <tbody>${D.healthyVsPoor.map((r) => `<tr><th scope="row">${esc(r.metric)}</th><td class="good">${esc(r.good)}</td><td class="poor">${esc(r.poor)}</td></tr>`).join('')}</tbody>
    </table>`;

    const toggle = $('#cost-toggle');
    toggle.innerHTML = `<button type="button" role="tab" data-k="shortTerm" aria-selected="true">Next day</button><button type="button" role="tab" data-k="longTerm" aria-selected="false">Over years</button>`;
    const show = (k) => {
      $$('button', toggle).forEach((b) => b.setAttribute('aria-selected', String(b.dataset.k === k)));
      $('#costs').innerHTML = D.consequences[k].map((c) => `
        <div class="cost"><h4>${esc(c.area)}</h4><ul>${c.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');
    };
    toggle.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) show(b.dataset.k); });
    show('shortTerm');
  }

  // ---------- Myths ----------
  function renderMyths() {
    $('#myth-cards').innerHTML = D.myths.map((m, i) => `
      <button type="button" class="myth" id="myth-${i}" aria-pressed="false">
        <span class="myth__face myth__front"><span class="myth__tag">Myth</span><span class="myth__text">"${esc(m.myth)}"</span><span class="myth__hint">Tap for the facts</span></span>
        <span class="myth__face myth__back"><span class="myth__tag myth__tag--fact">Fact</span><span class="myth__text">${esc(m.fact)}</span></span>
      </button>`).join('');
    $('#myth-cards').addEventListener('click', (e) => {
      const c = e.target.closest('.myth');
      if (c) c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
    });
  }

  // ---------- Disorders, tracking, glossary, sources ----------
  function renderLists() {
    $('#disorders').innerHTML = D.disorders.map((d) => `
      <article class="card" id="disorder-${slug(d.name)}">
        <h3>${esc(d.name)}</h3>
        <p class="card__stat">${esc(d.stat)}</p>
        <p><strong>Signs:</strong> ${esc(d.signs)}</p>
        <p class="muted">${esc(d.note)}</p>
      </article>`).join('');

    $('#tracking-list').innerHTML = D.tracking.map((t) => `
      <article class="card card--row">
        <div><h3>${esc(t.name)}</h3><p>${esc(t.detail)}</p></div>
        <span class="tag">${esc(t.tag)}</span>
      </article>`).join('');

    const gl = $('#glossary-list');
    gl.innerHTML = D.glossary.map((g) => `<div class="gloss" id="term-${slug(g.term)}"><dt>${esc(g.term)}</dt><dd>${esc(g.def)}</dd></div>`).join('');
    $('#glossary-filter').addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      $$('.gloss', gl).forEach((el) => { el.hidden = q && !el.textContent.toLowerCase().includes(q); });
    });

    $('#sources').innerHTML = 'Sources: ' + D.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(' · ');
  }

  // ---------- Search ----------
  function buildIndex() {
    const idx = [];
    $$('main section[id]').forEach((s) => {
      const h = $('h2', s);
      if (h) idx.push({ title: h.textContent, type: 'Section', target: s.id, text: h.textContent + ' ' + ($('.panel__sub', s)?.textContent || '') });
    });
    D.stageDetails.forEach((s) => idx.push({ title: s.name, type: 'Stage', target: 'stages', stage: s.id, text: [s.name, s.tagline, s.wave, ...s.body, ...s.purpose, ...s.disruptors].join(' ') }));
    D.glossary.forEach((g) => idx.push({ title: g.term, type: 'Term', target: `term-${slug(g.term)}`, text: g.term + ' ' + g.def, sub: g.def }));
    D.myths.forEach((m, i) => idx.push({ title: m.myth, type: 'Myth', target: `myth-${i}`, text: m.myth + ' ' + m.fact }));
    D.concerns.forEach((c) => idx.push({ title: c.label, type: 'Customer', target: 'fit', concern: c.id, text: [c.label, c.priority, c.why, ...c.look].join(' ') }));
    D.disorders.forEach((d) => idx.push({ title: d.name, type: 'Disorder', target: `disorder-${slug(d.name)}`, text: d.name + ' ' + d.signs }));
    D.brainWaves.forEach((w) => idx.push({ title: `${w.name} waves`, type: 'Brain wave', target: `wave-${w.id}`, text: `${w.name} ${w.hz} ${w.when} ${w.sleep}` }));
    return idx;
  }

  function setupSearch() {
    const input = $('#search'), list = $('#search-results');
    const idx = buildIndex();
    let results = [], active = 0;

    const score = (item, terms) => {
      const title = item.title.toLowerCase(), text = item.text.toLowerCase();
      let s = 0;
      for (const t of terms) {
        if (title.startsWith(t)) s += 6;
        else if (title.includes(t)) s += 4;
        else if (text.includes(t)) s += 1;
        else return 0;
      }
      return s;
    };

    const render = () => {
      if (!results.length) {
        list.innerHTML = input.value.trim() ? '<li class="search__empty">No matches</li>' : '';
      } else {
        list.innerHTML = results.map((r, i) => `<li role="option" id="sr-${i}" aria-selected="${i === active}" data-i="${i}"><span class="search__type">${esc(r.type)}</span><span class="search__title">${esc(r.title)}</span></li>`).join('');
      }
      const open = !!input.value.trim();
      list.hidden = !open;
      input.setAttribute('aria-expanded', String(open));
      input.setAttribute('aria-activedescendant', results.length ? `sr-${active}` : '');
    };

    input.addEventListener('input', () => {
      const terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      results = terms.length ? idx.map((it) => ({ it, s: score(it, terms) })).filter((r) => r.s).sort((a, b) => b.s - a.s).slice(0, 8).map((r) => r.it) : [];
      active = 0;
      render();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { active = Math.min(results.length - 1, active + 1); render(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { active = Math.max(0, active - 1); render(); e.preventDefault(); }
      if (e.key === 'Enter' && results[active]) { go(results[active]); e.preventDefault(); }
      if (e.key === 'Escape') { input.value = ''; results = []; render(); input.blur(); }
    });
    list.addEventListener('pointerdown', (e) => {
      const li = e.target.closest('[data-i]');
      if (li) { e.preventDefault(); go(results[+li.dataset.i]); }
    });
    input.addEventListener('blur', () => setTimeout(() => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); }, 120));
    input.addEventListener('focus', () => { if (input.value.trim()) render(); });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); input.select(); }
    });

    function go(item) {
      if (item.stage) selectStage(item.stage);
      if (item.concern && !fitState.concerns.has(item.concern)) {
        $(`#concerns [data-id="${item.concern}"]`).click();
      }
      const el = document.getElementById(item.target);
      if (!el) return;
      const gf = $('#glossary-filter');
      if (gf.value) { gf.value = ''; gf.dispatchEvent(new Event('input')); }
      if (el.classList.contains('myth')) el.setAttribute('aria-pressed', 'true');
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: el.tagName === 'SECTION' ? 'start' : 'center' });
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
      input.value = '';
      results = [];
      render();
      input.blur();
    }
  }

  // ---------- Scroll spy for section chips ----------
  function setupScrollSpy() {
    const chips = $$('.chips a');
    const byId = new Map(chips.map((a) => [a.getAttribute('href').slice(1), a]));
    if (!('IntersectionObserver' in window)) return;
    const visible = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, bestR = 0;
      visible.forEach((r, id) => { if (r > bestR) { bestR = r; best = id; } });
      chips.forEach((a) => a.removeAttribute('aria-current'));
      const a = best && byId.get(best);
      if (a) {
        a.setAttribute('aria-current', 'true');
        const nav = a.parentElement;
        const target = a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2;
        nav.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }, { rootMargin: '-120px 0px -40% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  // ---------- Theme ----------
  function setupTheme() {
    $('#theme-toggle').addEventListener('click', () => {
      const root = document.documentElement;
      const cur = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('sleep-theme', next); } catch (e) { /* storage unavailable */ }
    });
  }

  // ---------- Init ----------
  function init() {
    renderFacts();
    renderScenarioButtons();
    renderNightLegend();
    drawNight();
    renderStageTabs();
    renderWaves();
    renderFit();
    renderDrivers();
    renderAge();
    renderQuality();
    renderMyths();
    renderLists();
    setupSearch();
    setupScrollSpy();
    setupTheme();
    if (!reduceMotion) requestAnimationFrame(tick);

    let resizeTimer;
    let lastW = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastW) return; // ignore mobile URL-bar height changes
      lastW = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        drawNight();
        drawCaffeine(+$('#cup-time').value, +$('#bed-time').value);
      }, 120);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
