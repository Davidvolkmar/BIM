// Motor de la presentación: escala, navegación, pasos, índice y notas del orador.
(() => {
  const stage = document.getElementById('stage');
  const list = [...document.querySelectorAll('.slide')];
  const COLOR = { hoy: '#ef4444', bim: '#38bdf8', casos: '#34d399', lic: '#a78bfa', sis: '#f59e0b', org: '#fb923c', dec: '#f3f1ec' };
  const $ = id => document.getElementById(id);
  let idx = -1, step = 0, notesWin = null;
  const secondsOf = s => +(s.querySelector('.notes')?.dataset.t ?? 0);

  /* Escala */
  function fit() {
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `scale(${k}) translate(-50%,-50%)`;
    window.dispatchEvent(new CustomEvent('deck:fit'));
  }
  addEventListener('resize', fit);

  /* Navegación */
  const stepsOf = s => Math.max(0, ...[...s.querySelectorAll('[data-step]')].map(e => +e.dataset.step));
  function paint() {
    const s = list[idx];
    s.querySelectorAll('[data-step]').forEach(e => e.classList.toggle('shown', +e.dataset.step <= step));
    s.dispatchEvent(new CustomEvent('deck:step', { detail: { step } }));
    sendNotes();
  }
  function go(i, st = 0, force = false) {
    i = Math.max(0, Math.min(list.length - 1, i));
    if (i === idx && !force) { step = st; paint(); return; }
    const prevS = list[idx];
    if (prevS) prevS.dispatchEvent(new CustomEvent('deck:leave'));
    idx = i; step = st;
    list.forEach(s => s.classList.remove('on'));
    const s = list[idx];
    s.classList.add('on');
    s.dispatchEvent(new CustomEvent('deck:enter'));
    try { history.replaceState(null, '', `#${s.id}`); } catch {}
    $('bar').style.width = `${(idx + 1) / list.length * 100}%`;
    $('bar').style.background = COLOR[s.dataset.tool] ?? '#f3f1ec';
    $('hud').textContent = `${idx + 1} / ${list.length}`;
    paint();
    if ($('notesInline').classList.contains('on')) fillInline();
  }
  function next() { const s = list[idx]; if (step < stepsOf(s)) { step++; paint(); } else if (idx < list.length - 1) go(idx + 1); }
  function prev() { if (step > 0) { step--; paint(); } else if (idx > 0) { const p = idx - 1; go(p, stepsOf(list[p])); } }

  /* Notas del orador: ventana aparte, o panel lateral si el navegador no deja abrirla */
  const notesOf = s => s.querySelector('.notes')?.innerHTML ?? '';
  function sendNotes() {
    if (!notesWin || notesWin.closed) return;
    const s = list[idx], nx = list[idx + 1];
    const remaining = list.slice(idx).filter(x => !x.dataset.anexo).reduce((a, x) => a + secondsOf(x), 0);
    notesWin.postMessage({
      type: 'deck', i: idx + 1, n: list.length, title: s.dataset.title, html: notesOf(s), secs: secondsOf(s),
      next: nx?.dataset.title ?? '(fin)', step, steps: stepsOf(s), remaining,
    }, '*');
  }
  function fillInline() { const n = $('notesInline'); n.innerHTML = `<h3>${list[idx].dataset.title}</h3><div class="mt1">${notesOf(list[idx])}</div>`; }
  function openNotes() {
    let w = null;
    try { w = open('notas.html', 'notasRevit', 'width=1000,height=760'); } catch {}
    if (w) { notesWin = w; setTimeout(sendNotes, 700); return; }
    $('notesInline').classList.toggle('on'); fillInline();
  }
  addEventListener('message', e => {
    if (e.data?.type === 'nav') { if (e.data.dir > 0) next(); else prev(); }
    if (e.data?.type === 'ready') sendNotes();
  });

  /* Índice */
  function toggleGrid() {
    const g = $('grid');
    if (g.classList.toggle('on')) {
      const box = g.querySelector('.list'); box.innerHTML = '';
      list.forEach((s, i) => {
        const b = document.createElement('button');
        b.innerHTML = `<i>${s.dataset.chapter ?? ''}</i>${i + 1}. ${s.dataset.title}`;
        b.style.setProperty('--c', COLOR[s.dataset.tool] ?? '#7f8591');
        if (i === idx) b.className = 'cur';
        b.onclick = () => { go(i); g.classList.remove('on'); };
        box.append(b);
      });
    }
  }
  function toast(t, ms = 3600) { const e = $('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove('on'), ms); }
  window.deckToast = toast;

  /* Teclado y control remoto */
  addEventListener('keydown', e => {
    const tag = e.target.tagName;
    if (tag === 'SELECT' || tag === 'TEXTAREA' || (tag === 'INPUT' && e.target.type !== 'range' && e.target.type !== 'checkbox')) { if (e.key === 'Escape') e.target.blur(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown': case 'Enter': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace': e.preventDefault(); prev(); break;
      case 'Home': go(0); break;
      case 'End': go(list.length - 1); break;
      case 'f': case 'F': case 'F5': e.preventDefault(); document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {}); break;
      case 'n': case 'N': openNotes(); break;
      case 'g': case 'G': toggleGrid(); break;
      case 'b': case 'B': case '.': $('black').classList.toggle('on'); break;
      case 'Escape': $('grid').classList.remove('on'); $('black').classList.remove('on'); $('notesInline').classList.remove('on'); break;
    }
  });
  // Tras usar un control, las flechas vuelven a avanzar diapositivas.
  document.addEventListener('pointerup', e => { if (e.target.matches?.('input[type=range],button')) setTimeout(() => e.target.blur(), 0); });

  let idleT;
  addEventListener('mousemove', () => { stage.classList.add('moving'); document.body.style.cursor = ''; clearTimeout(idleT); idleT = setTimeout(() => { stage.classList.remove('moving'); document.body.style.cursor = 'none'; }, 3500); });

  addEventListener('hashchange', () => {
    const i = list.findIndex(s => s.id === location.hash.replace(/^#\/?/, ''));
    if (i >= 0 && i !== idx) go(i);
  });

  /* Inicio */
  fit();
  addEventListener('load', () => {
    const h = location.hash.replace(/^#\/?/, '');
    const i = list.findIndex(s => s.id === h);
    go(i >= 0 ? i : 0, 0, true);
  });
})();
