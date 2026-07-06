/* ═══════════════════════════════════════════════════════════════
   ASPEN OPS KIT · ops.js v1.0 — aquatic interactions
   Auto-initializes on DOMContentLoaded. Zero dependencies.

   What it does automatically:
   1. RIPPLE   — every .ops-btn (and any .ops-ripple element) emits a
                 water ripple from the exact click point.
   2. WATERLINE— every <div class="ops-waterline"> gets the animated
                 Aspen water-surface SVG injected (brand hex colors).
   3. RISE     — every .ops-rise element animates in when it enters
                 the viewport (emerging-from-water reveal).
   4. BUBBLES  — if a <div class="ops-bubbles"> exists, gentle ambient
                 bubbles rise behind the UI.

   Manual helpers:
     OPS.toast('Saved ✓')          — buoyant toast
     OPS.waterline(element)        — inject waterline into any container
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. RIPPLE on click ───────────────────────────────────── */
  function attachRipples(){
    document.addEventListener('click', function(e){
      const host = e.target.closest('.ops-btn, .ops-ripple');
      if(!host || reduced) return;
      const rect = host.getBoundingClientRect();
      const wave = document.createElement('span');
      wave.className = 'ops-ripple-wave';
      const size = Math.max(rect.width, rect.height) * 2.2;
      wave.style.width = wave.style.height = size + 'px';
      wave.style.left = (e.clientX - rect.left) + 'px';
      wave.style.top  = (e.clientY - rect.top) + 'px';
      host.appendChild(wave);
      setTimeout(()=>wave.remove(), 750);
    }, {passive:true});
  }

  /* ── 2. WATERLINE injection (brand-true colors) ───────────── */
  const WL_SVG = `
  <svg viewBox="0 0 1100 38" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="ops-wl-grad" x1="0" x2="1">
        <stop offset="0" stop-color="#1C8FA8" stop-opacity=".2"/>
        <stop offset=".5" stop-color="#4FC3D9" stop-opacity=".95"/>
        <stop offset="1" stop-color="#B5733A" stop-opacity=".5"/>
      </linearGradient>
      <linearGradient id="ops-wl-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1C8FA8" stop-opacity=".14"/>
        <stop offset="1" stop-color="#1C8FA8" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path class="ops-wl-under" fill="url(#ops-wl-fill)"
      d="M0,15 C140,11 260,19 400,15 S680,11 820,15 S1020,19 1100,14 L1100,38 L0,38 Z">
      <animate attributeName="d" dur="9s" repeatCount="indefinite"
        values="M0,15 C140,11 260,19 400,15 S680,11 820,15 S1020,19 1100,14 L1100,38 L0,38 Z;
                M0,14 C140,18 260,12 400,16 S680,19 820,13 S1020,12 1100,16 L1100,38 L0,38 Z;
                M0,15 C140,11 260,19 400,15 S680,11 820,15 S1020,19 1100,14 L1100,38 L0,38 Z"/>
    </path>
    <path class="ops-wl-surface" stroke="url(#ops-wl-grad)"
      d="M0,15 C140,11 260,19 400,15 S680,11 820,15 S1020,19 1100,14">
      <animate attributeName="d" dur="9s" repeatCount="indefinite"
        values="M0,15 C140,11 260,19 400,15 S680,11 820,15 S1020,19 1100,14;
                M0,14 C140,18 260,12 400,16 S680,19 820,13 S1020,12 1100,16;
                M0,15 C140,11 260,19 400,15 S680,11 820,15 S1020,19 1100,14"/>
    </path>
    <path class="ops-wl-glint"
      d="M0,15 C140,11 260,19 400,15 S680,11 820,15 S1020,19 1100,14"/>
  </svg>`;

  function waterline(el){
    if(!el || el.dataset.opsWl) return;
    el.dataset.opsWl = '1';
    el.innerHTML = WL_SVG;
  }

  /* ── 3. RISE reveal (IntersectionObserver) ────────────────── */
  function attachRise(){
    const items = document.querySelectorAll('.ops-rise');
    if(!items.length) return;
    if(reduced || !('IntersectionObserver' in window)){
      items.forEach(el=>el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    },{threshold:.12});
    items.forEach(el=>io.observe(el));
  }

  /* ── 4. Ambient bubbles ───────────────────────────────────── */
  function spawnBubbles(){
    const host = document.querySelector('.ops-bubbles');
    if(!host || reduced) return;
    const COUNT = 14;
    for(let i=0;i<COUNT;i++){
      const b = document.createElement('span');
      b.className = 'ops-bubble';
      const size = 4 + Math.random()*10;
      b.style.width = b.style.height = size.toFixed(1)+'px';
      b.style.left  = (Math.random()*100).toFixed(1)+'%';
      b.style.setProperty('--sway',((Math.random()*44)-22).toFixed(0)+'px');
      b.style.animationDuration = (14 + Math.random()*16).toFixed(1)+'s';
      b.style.animationDelay = (Math.random()*18).toFixed(1)+'s';
      host.appendChild(b);
    }
  }

  /* ── Toast helper ─────────────────────────────────────────── */
  let toastEl = null, toastTimer = null;
  function toast(msg, ms){
    if(!toastEl){
      toastEl = document.createElement('div');
      toastEl.className = 'ops-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(()=>toastEl.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>toastEl.classList.remove('show'), ms || 2600);
  }

  /* ── Init ─────────────────────────────────────────────────── */
  function init(){
    attachRipples();
    document.querySelectorAll('.ops-waterline').forEach(waterline);
    attachRise();
    spawnBubbles();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  /* ── Public API ───────────────────────────────────────────── */
  window.OPS = { toast, waterline };
})();
