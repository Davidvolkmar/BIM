// La tienda paramétrica: un solo estado alimenta la vista 3D, la planta, la fachada y la tabla.
// Es una ilustración del principio de Revit, no un modelo de Revit. Marcas, medidas y materiales son de ejemplo.
window.Tienda = (() => {
  const T = window.THREE;
  const H = 3.2, BOD = 2.6;
  const MARCAS = {
    A: { n: 'Marca A', piso: '#b9b4aa', muro: '#ece7df', acento: '#e4572e', mueble: '#8a6a4a', pisoT: 'Porcelanato gris 60 × 60', muroT: 'Pintura vinilo marfil', muebleT: 'Melamina roble' },
    B: { n: 'Marca B', piso: '#50555d', muro: '#2b2f35', acento: '#38bdf8', mueble: '#d8dde3', pisoT: 'Vinilo carbón en tablón', muroT: 'Pintura mate grafito', muebleT: 'Lámina blanca' },
    C: { n: 'Marca C', piso: '#d9c9a8', muro: '#f7f4ee', acento: '#2f9e6e', mueble: '#b7c9b0', pisoT: 'Microcemento arena', muroT: 'Pintura hueso', muebleT: 'Madera clara lacada' },
  };
  const S = { w: 9, d: 14, vit: 4.5, gon: 6, ix: 6.2, iy: 4.5, m: 'A' };
  const listeners = new Set();
  const es = (n, d = 1) => n.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });

  function clamp() {
    S.vit = Math.min(S.vit, S.w - 2.4);
    S.gon = Math.min(S.gon, maxGon());
    S.ix = Math.max(2, Math.min(S.ix, S.d - BOD - 2.4));
    S.iy = Math.max(1.5, Math.min(S.iy, S.w - 1.5));
  }
  const maxGon = () => 2 * Math.floor((S.d - BOD - 2) / 1.35);
  function set(p) { Object.assign(S, p); clamp(); listeners.forEach(f => f()); }

  function cantidades() {
    const m = MARCAS[S.m];
    return [
      ['2.1.1', `Piso. ${m.pisoT}`, S.w * S.d, 'm²', 1],
      ['1.1.1', `Muro. ${m.muroT}`, (2 * S.d + 2 * S.w) * H - S.vit * 2.6 - 1.6 * 2.6, 'm²', 1],
      ['3.1.1', 'Cielo en drywall pintado', S.w * S.d, 'm²', 1],
      ['5.2.1', 'Vitrina en vidrio templado', S.vit * 2.6, 'm²', 1],
      ['8.1.1', `Góndola mural. ${m.muebleT}`, S.gon, 'und', 0],
      ['8.1.2', 'Isla de exhibición', 1, 'und', 0],
      ['9.1.1', 'Aviso de fachada', S.w * .6, 'ml', 1],
    ];
  }

  function posGondolas() {
    const out = [];
    for (let i = 0; i < S.gon; i++) out.push({ lado: i % 2, z: 1.9 + Math.floor(i / 2) * 1.35 });
    return out;
  }

  /* ---------- Vista 3D ---------- */
  function crear3D(host, { intro = false, drag = true, shift = 0, zoom = 2.25, spin = .05 } = {}) {
    if (!T) return { start() {}, stop() {} };
    let renderer, scene, cam, modelo, raf = 0, on = false, t0 = 0, az = .62, el = .62, muros = {}, dirty = true, drg = null;
    function init() {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
      host.append(renderer.domElement);
      scene = new T.Scene();
      cam = new T.PerspectiveCamera(30, 1.6, .5, 200);
      scene.add(new T.HemisphereLight(0xffffff, 0x20242b, 1.5));
      const sun = new T.DirectionalLight(0xfff2dd, 2.2);
      sun.position.set(-6, 16, -9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, far: 60 });
      scene.add(sun);
      if (drag) {
        const c = renderer.domElement; c.style.cursor = 'grab';
        c.addEventListener('pointerdown', e => { drg = [e.clientX, e.clientY, az, el]; c.setPointerCapture(e.pointerId); });
        c.addEventListener('pointermove', e => { if (!drg) return; az = drg[2] - (e.clientX - drg[0]) * .007; el = Math.max(.18, Math.min(1.35, drg[3] + (e.clientY - drg[1]) * .005)); });
        c.addEventListener('pointerup', () => { drg = null; });
      }
    }
    function liberar(o) { o.traverse(c => { c.geometry?.dispose(); if (c.material) (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => m.dispose()); }); }
    function construir() {
      if (modelo) { scene.remove(modelo); liberar(modelo); }
      modelo = new T.Group(); scene.add(modelo); muros = {};
      const m = MARCAS[S.m], w = S.w, d = S.d, items = [];
      const borde = new T.LineBasicMaterial({ color: 0x0b0d10, transparent: true, opacity: .32 });
      function box(g, a, b, c, x, y, z, color, o = {}) {
        const geo = new T.BoxGeometry(a, b, c);
        const mt = new T.MeshStandardMaterial({ color, roughness: o.r ?? .78, metalness: o.me ?? 0, transparent: !!o.op, opacity: o.op ?? 1, emissive: o.em ?? 0, emissiveIntensity: o.em ? 1.2 : 0 });
        const me = new T.Mesh(geo, mt); me.position.set(x, y, z); me.castShadow = !o.op; me.receiveShadow = true; g.add(me);
        if (!o.nb) { const l = new T.LineSegments(new T.EdgesGeometry(geo), borde); l.position.copy(me.position); g.add(l); }
        return me;
      }
      const item = delay => { const g = new T.Group(); g.userData.d = delay; modelo.add(g); items.push(g); return g; };

      box(item(0), w + .4, .15, d + .4, w / 2, -.075, d / 2, m.piso, { r: .5 });
      const L = item(.15), R = item(.25), B = item(.35);
      box(L, .15, H, d, -.075, H / 2, d / 2, m.muro); box(R, .15, H, d, w + .075, H / 2, d / 2, m.muro); box(B, w + .3, H, .15, w / 2, H / 2, d + .075, m.muro);
      muros = { L, R, B };
      const bod = item(.45), z0 = d - BOD;
      box(bod, w - 1.2, H, .1, (w - 1.2) / 2, H / 2, z0, m.muro);
      const fr = item(.6);
      box(fr, S.vit, 2.6, .04, .2 + S.vit / 2, 1.3, 0, 0xbfe6f5, { op: .22, nb: false, r: .1 });
      for (let i = 0; i <= Math.ceil(S.vit / 1.5); i++) box(fr, .05, 2.6, .07, Math.min(.2 + i * 1.5, .2 + S.vit), 1.3, 0, 0x22262c, { nb: true });
      const pX = .2 + S.vit + 1.6;
      if (w - pX > .05) box(fr, w - pX, 2.6, .15, pX + (w - pX) / 2, 1.3, 0, m.muro);
      box(fr, .2, 2.6, .15, .1, 1.3, 0, m.muro);
      box(fr, w + .15, H - 2.6, .18, w / 2, 2.6 + (H - 2.6) / 2, 0, 0x2b2f35);
      const av = item(.75);
      box(av, w * .6, .36, .1, w / 2, 2.9, -.14, m.acento, { em: m.acento, nb: true });
      const vt = item(.85);
      box(vt, S.vit, .3, .8, .2 + S.vit / 2, .15, .55, m.mueble);
      const nm = Math.floor(S.vit / 1.1);
      for (let i = 0; i < nm; i++) {
        const x = .2 + (i + .5) * S.vit / nm;
        const c = new T.Mesh(new T.CylinderGeometry(.13, .17, 1.15, 16), new T.MeshStandardMaterial({ color: m.acento, roughness: .55 }));
        c.position.set(x, .88, .55); c.castShadow = true; vt.add(c);
        const s = new T.Mesh(new T.SphereGeometry(.12, 16, 12), new T.MeshStandardMaterial({ color: 0xe9e4da, roughness: .5 }));
        s.position.set(x, 1.58, .55); s.castShadow = true; vt.add(s);
      }
      posGondolas().forEach((g, i) => {
        const it = item(1 + i * .05), x = g.lado ? w - .24 : .24, sg = g.lado ? 1 : -1;
        box(it, .06, 1.95, 1.2, x + sg * .2, .975, g.z, m.mueble);
        for (let k = 0; k < 4; k++) box(it, .42, .03, 1.2, x, .3 + k * .48, g.z, m.mueble, { nb: true });
        for (let k = 0; k < 3; k++) box(it, .24, .16 + (i * 7 + k * 3) % 4 * .03, .86, x, .42 + k * .48, g.z, m.acento, { nb: true, r: .6 });
      });
      const ic = item(1.35);
      box(ic, 1, .82, 2, S.iy, .41, S.ix, m.mueble);
      box(ic, 1.08, .05, 2.08, S.iy, .845, S.ix, m.acento, { nb: true });
      const cj = item(1.45);
      box(cj, 2.2, 1.05, .62, w - 1.5, .525, z0 - 1.1, m.mueble);
      box(cj, 2.28, .05, .7, w - 1.5, 1.075, z0 - 1.1, 0x22262c, { nb: true });
      const lz = item(1.55);
      [w * .34, w * .66].forEach(x => box(lz, .07, .05, z0 - 1, x, H - .1, z0 / 2, 0xffffff, { em: 0xfff0cf, nb: true }));
      items.forEach(g => { g.userData.y = 0; });
      modelo.userData.items = items;
    }
    function ajustar() {
      const W = host.clientWidth || 640, Hh = host.clientHeight || 400;
      renderer.setSize(W, Hh, false); cam.aspect = W / Hh;
      if (shift) cam.setViewOffset(W, Hh, -W * shift, 0, W, Hh); else cam.clearViewOffset();
      cam.updateProjectionMatrix();
    }
    function loop(now) {
      if (!on) return;
      raf = requestAnimationFrame(loop);
      if (dirty) { construir(); dirty = false; }
      if (!drg) az += spin * .016;
      const cx = S.w / 2, cz = S.d / 2, r = Math.hypot(S.w, S.d) * zoom;
      cam.position.set(cx + Math.sin(az) * Math.cos(el) * r, 1 + Math.sin(el) * r, cz - Math.cos(az) * Math.cos(el) * r);
      cam.lookAt(cx, 1, cz);
      if (muros.L) { muros.L.visible = cam.position.x > cx - 1; muros.R.visible = cam.position.x < cx + 1; muros.B.visible = cam.position.z < cz + 1; }
      const t = (now - t0) / 1000;
      modelo.userData.items.forEach(g => {
        if (!intro) return;
        const p = Math.min(1, Math.max(0, (t - g.userData.d - .3) / .75)), e = 1 - (1 - p) ** 3;
        g.position.y = (1 - e) * 4.5;
        if (g !== muros.L && g !== muros.R && g !== muros.B) g.visible = p > 0;
        else if (p <= 0) g.visible = false;
      });
      renderer.render(scene, cam);
    }
    const f = () => { dirty = true; };
    return {
      start() { if (!renderer) init(); listeners.add(f); dirty = true; on = true; t0 = performance.now(); ajustar(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); addEventListener('deck:fit', ajustar); },
      stop() { on = false; listeners.delete(f); cancelAnimationFrame(raf); removeEventListener('deck:fit', ajustar); },
    };
  }

  /* ---------- Planta ---------- */
  function planta(svg) {
    const VW = 800, VH = 420, k = Math.min(610 / S.d, 268 / S.w), ox = 106, oy = 78 + (268 - S.w * k) / 2;
    const X = z => ox + z * k, Y = x => oy + x * k, m = MARCAS[S.m];
    const r = (z, x, dz, dx, c = '') => `<rect x="${X(z)}" y="${Y(x)}" width="${dz * k}" height="${dx * k}" ${c}/>`;
    const tag = (px, py, t) => `<g transform="translate(${px},${py})"><rect x="-37" y="-15" width="74" height="30" rx="15" fill="#fff" stroke="#14171b" stroke-width="1.6"/><text text-anchor="middle" y="7" font-size="20" font-weight="600" fill="#14171b">${t}</text></g>`;
    let g = `<rect x="${X(0)}" y="${Y(0)}" width="${S.d * k}" height="${S.w * k}" fill="${m.piso}" opacity=".28"/>`;
    const z0 = S.d - BOD;
    g += `<g fill="#14171b">${r(-.0, -.15, S.d, .15)}${r(0, S.w, S.d, .15)}${r(S.d, -.15, .15, S.w + .3)}${r(z0, 0, .1, S.w - 1.2)}${r(0, S.vit + 1.8, .15, S.w - S.vit - 1.8)}</g>`;
    g += `<line x1="${X(.07)}" y1="${Y(.2)}" x2="${X(.07)}" y2="${Y(.2 + S.vit)}" stroke="#0284c7" stroke-width="6"/>`;
    g += `<path d="M${X(0)} ${Y(.2 + S.vit)} A${1.6 * k} ${1.6 * k} 0 0 1 ${X(1.6)} ${Y(1.8 + S.vit)} L${X(0)} ${Y(1.8 + S.vit)}" fill="none" stroke="#14171b" stroke-width="1.5"/>`;
    g += `<g fill="${m.mueble}" stroke="#14171b" stroke-width="1.5">${r(.15, .2, .8, S.vit)}`;
    posGondolas().forEach(p => { g += r(p.z - .6, p.lado ? S.w - .45 : 0, 1.2, .45); });
    g += r(z0 - 1.41, S.w - 2.6, .62, 2.2);
    g += `</g><g class="isla" data-isla="1">${r(S.ix - 1, S.iy - .5, 2, 1, `fill="${m.acento}" stroke="#14171b" stroke-width="2"`)}</g>`;
    g += `<text x="${X(z0 + BOD / 2)}" y="${Y(S.w / 2) + 7}" font-size="21" text-anchor="middle" fill="#14171b">Bodega</text>`;
    const dim = (x1, y1, x2, y2, t, tx, ty, rot = 0) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#14171b" stroke-width="1.4"/><circle cx="${x1}" cy="${y1}" r="3"/><circle cx="${x2}" cy="${y2}" r="3"/><text x="${tx}" y="${ty}" font-size="22" font-weight="600" text-anchor="middle" fill="#14171b" ${rot ? `transform="rotate(${rot} ${tx} ${ty})"` : ''}>${t}</text>`;
    g += dim(X(0), oy - 22, X(S.d), oy - 22, `${es(S.d, 2)} m`, X(S.d / 2), oy - 30);
    g += dim(ox - 30, Y(0), ox - 30, Y(S.w), `${es(S.w, 2)} m`, ox - 40, Y(S.w / 2), -90);
    g += tag(X(S.ix), Y(S.iy), '8.1.2') + tag(X(.55), Y(.2 + S.vit / 2), '5.2.1') + tag(X(Math.min(S.ix + 2.6, S.d - BOD - 1.4)), Y(S.w * .5 > S.iy ? S.w * .7 : S.w * .3), '2.1.1');
    svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
    svg.innerHTML = `<g font-family="Geist,system-ui,sans-serif">${g}</g>`;
  }
  function arrastre(svg) {
    let on = false;
    const leer = e => {
      const k = Math.min(610 / S.d, 268 / S.w), ox = 106, oy = 78 + (268 - S.w * k) / 2;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
      return { ix: (p.x - ox) / k, iy: (p.y - oy) / k };
    };
    svg.addEventListener('pointerdown', e => { if (e.target.closest('[data-isla]')) { on = true; svg.setPointerCapture(e.pointerId); } });
    svg.addEventListener('pointermove', e => { if (on) set(leer(e)); });
    svg.addEventListener('pointerup', () => { if (on) { on = false; svg.dispatchEvent(new CustomEvent('cambio')); } });
  }

  /* ---------- Fachada ---------- */
  function fachada(svg) {
    const VW = 800, VH = 420, k = Math.min(620 / S.w, 230 / H), ox = (VW - S.w * k) / 2, by = 330, m = MARCAS[S.m];
    const X = x => ox + x * k, Y = y => by - y * k;
    const tag = (px, py, t) => `<g transform="translate(${px},${py})"><rect x="-37" y="-15" width="74" height="30" rx="15" fill="#fff" stroke="#14171b" stroke-width="1.6"/><text text-anchor="middle" y="7" font-size="20" font-weight="600" fill="#14171b">${t}</text></g>`;
    let g = `<line x1="30" y1="${by}" x2="770" y2="${by}" stroke="#14171b" stroke-width="3"/>`;
    g += `<rect x="${X(0)}" y="${Y(H)}" width="${S.w * k}" height="${H * k}" fill="${m.muro}" stroke="#14171b" stroke-width="2.5"/>`;
    g += `<rect x="${X(0)}" y="${Y(H)}" width="${S.w * k}" height="${(H - 2.6) * k}" fill="#2b2f35"/>`;
    g += `<rect x="${X(S.w * .2)}" y="${Y(3.08)}" width="${S.w * .6 * k}" height="${.36 * k}" fill="${m.acento}"/>`;
    g += `<text x="${X(S.w / 2)}" y="${Y(2.82)}" text-anchor="middle" font-size="24" font-weight="600" fill="#fff">${m.n.toUpperCase()}</text>`;
    g += `<rect x="${X(.2)}" y="${Y(2.6)}" width="${S.vit * k}" height="${2.6 * k}" fill="#bfe6f5" stroke="#14171b" stroke-width="2"/>`;
    for (let i = 1; i < Math.ceil(S.vit / 1.5); i++) g += `<line x1="${X(.2 + i * 1.5)}" y1="${Y(2.6)}" x2="${X(.2 + i * 1.5)}" y2="${by}" stroke="#14171b" stroke-width="2"/>`;
    g += `<rect x="${X(.2 + S.vit)}" y="${Y(2.6)}" width="${1.6 * k}" height="${2.6 * k}" fill="#e7f6fc" stroke="#14171b" stroke-width="2"/>`;
    g += `<line x1="${X(.2)}" y1="${by + 34}" x2="${X(.2 + S.vit)}" y2="${by + 34}" stroke="#14171b" stroke-width="1.4"/><text x="${X(.2 + S.vit / 2)}" y="${by + 66}" text-anchor="middle" font-size="22" font-weight="600" fill="#14171b">Vitrina ${es(S.vit, 2)} m</text>`;
    g += tag(X(.2 + S.vit / 2), Y(1.3), '5.2.1') + tag(X(S.w * .8) + 44, Y(2.9), '9.1.1');
    svg.setAttribute('viewBox', `0 0 ${VW} ${VH}`);
    svg.innerHTML = `<g font-family="Geist,system-ui,sans-serif">${g}</g>`;
  }

  /* ---------- Tabla ---------- */
  function tabla(tb) {
    tb.innerHTML = cantidades().map(([c, t, v, u, dec]) => `<tr><td>${c}</td><td>${t}</td><td class="n">${es(v, dec)}</td><td>${u}</td></tr>`).join('');
  }

  /* ---------- Demo ---------- */
  function demo(root) {
    const $ = s => root.querySelector(s);
    const pPl = $('#pPlanta'), pFa = $('#pFachada'), tb = $('#tTabla'), panes = [...root.querySelectorAll('.pane')];
    let cambios = 0, h;
    const vista = crear3D($('#p3d'), { zoom: 1.75, spin: .03 });
    const dibujar = () => {
      planta(pPl); fachada(pFa); tabla(tb);
      panes.forEach(p => p.classList.add('upd')); clearTimeout(h); h = setTimeout(() => panes.forEach(p => p.classList.remove('upd')), 420);
      $('#oW').textContent = `${es(S.w)} m`; $('#oD').textContent = `${es(S.d)} m`; $('#oV').textContent = `${es(S.vit)} m`; $('#oG').textContent = S.gon;
      $('#rV').max = S.w - 2.4; $('#rG').max = maxGon();
      root.querySelectorAll('.seg button').forEach(b => b.classList.toggle('sel', b.dataset.m === S.m));
      $('#tCambios').textContent = cambios; $('#tVistas').textContent = cambios * 6;
    };
    const uno = p => { cambios++; set(p); };
    $('#rW').oninput = e => uno({ w: +e.target.value });
    $('#rD').oninput = e => uno({ d: +e.target.value });
    $('#rV').oninput = e => uno({ vit: +e.target.value });
    $('#rG').oninput = e => uno({ gon: +e.target.value });
    root.querySelectorAll('.seg button').forEach(b => { b.onclick = () => uno({ m: b.dataset.m }); });
    arrastre(pPl); pPl.addEventListener('cambio', () => { cambios++; dibujar(); });
    $('#btnReset').onclick = () => { cambios = 0; set({ w: 9, d: 14, vit: 4.5, gon: 6, ix: 6.2, iy: 4.5, m: 'A' }); ['rW', 'rD', 'rV', 'rG'].forEach(i => { $('#' + i).value = { rW: 9, rD: 14, rV: 4.5, rG: 6 }[i]; }); };
    listeners.add(dibujar);
    root.addEventListener('deck:enter', () => { dibujar(); vista.start(); });
    root.addEventListener('deck:leave', () => vista.stop());
    dibujar();
  }

  return { S, MARCAS, set, cantidades, crear3D, demo };
})();
