// Interactivos de la presentación. Todos los valores son de ejemplo y se editan en vivo.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const flash = (el, ms = 460) => { el.classList.add('upd'); clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove('upd'), ms); };
  const COP = n => '$' + Math.round(n).toLocaleString('es-CO');
  const mill = n => `${n < 0 ? '−' : ''}$${(Math.abs(n) / 1e6).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`;

  /* Pestañas genéricas */
  $$('[data-tabs]').forEach(box => {
    const bs = $$('.tabs button', box), ps = $$('.panel-t', box);
    bs.forEach((b, i) => { b.onclick = () => { bs.forEach((x, k) => x.classList.toggle('sel', k === i)); ps.forEach((x, k) => x.classList.toggle('sel', k === i)); }; });
  });

  /* Portada */
  const hero = Tienda.crear3D($('#hero3d'), { intro: true, drag: false, shift: .23, zoom: 1.8, spin: .07 });
  const portada = $('#portada');
  portada.addEventListener('deck:enter', () => hero.start());
  portada.addEventListener('deck:leave', () => hero.stop());

  /* Demo principal */
  Tienda.demo($('#demo'));

  /* Archivos que toca un cambio */
  const a = $('#archivos');
  a.addEventListener('deck:step', e => { $('.files', a).classList.toggle('fired', e.detail.step >= 1); });

  /* Línea contra objeto */
  (() => {
    const ELS = {
      muro: { n: 'Muro de fachada interior', cad: ['Tipo: Línea', 'Capa: A-MURO', 'Longitud: 9,00 m'], rvt: [['Familia', 'Muro básico'], ['Tipo', 'Drywall 12 cm + pintura'], ['Altura', '3,20 m'], ['Área', '28,80 m²'], ['Keynote', '1.1.1'], ['Fase', 'Nueva construcción']] },
      vitrina: { n: 'Vitrina', cad: ['Tipo: Línea', 'Capa: A-VIDRIO', 'Longitud: 4,50 m'], rvt: [['Familia', 'Vitrina comercial'], ['Tipo', 'Vidrio templado 10 mm'], ['Alto', '2,60 m'], ['Área', '11,70 m²'], ['Keynote', '5.2.1'], ['Proveedor', 'Por definir']] },
      gondola: { n: 'Góndola', cad: ['Tipo: Bloque', 'Nombre: GOND_120', 'Capa: A-MOB'], rvt: [['Familia', 'Góndola mural'], ['Tipo', '120 × 45 × 195 cm'], ['Material', 'Melamina roble'], ['Marca', 'Marca A'], ['Keynote', '8.1.1'], ['Costo unitario', 'Parámetro del tipo']] },
      puerta: { n: 'Puerta de bodega', cad: ['Tipo: Bloque', 'Nombre: PTA_90', 'Capa: A-PUERTA'], rvt: [['Familia', 'Puerta sencilla'], ['Tipo', '90 × 210 cm'], ['Marca de puerta', 'P-02'], ['Resistencia', 'Por especificar'], ['Keynote', '5.1.1'], ['Cuadro', 'Aparece solo en la tabla']] },
      piso: { n: 'Piso del salón', cad: ['Tipo: Sombreado', 'Capa: A-PISO', 'Área: hay que medirla'], rvt: [['Familia', 'Suelo'], ['Tipo', 'Porcelanato 60 × 60'], ['Área', '126,00 m²'], ['Perímetro', '46,00 m'], ['Keynote', '2.1.1'], ['Espacio', 'Salón de ventas']] },
      ducto: { n: 'Ducto de aire acondicionado', cad: ['Tipo: Líneas punteadas', 'Capa: M-DUCTO', 'Archivo: el DWG del ingeniero'], rvt: [['Familia', 'Ducto rectangular'], ['Tamaño', '60 × 45 cm'], ['Sistema', 'Suministro de aire'], ['Altura inferior', '2,75 m'], ['Origen', 'Modelo de instalaciones vinculado'], ['Coordinación', 'Cruza el muro de bodega: necesita pase']] },
    };
    const root = $('#objeto'), svg = $('svg', root), box = $('#props'), host = $('#obj3d'); let modo = 'cad', sel = 'muro', v3 = null;

    /* Vista 3D del mismo local: mismas medidas que la planta (60 px = 1 m) */
    function crearVista() {
      const T = window.THREE; if (!T) return null;
      const ren = new T.WebGLRenderer({ antialias: true }); ren.setPixelRatio(Math.min(devicePixelRatio, 1.5)); ren.shadowMap.enabled = true; host.append(ren.domElement);
      const sc = new T.Scene(); sc.background = new T.Color(0x12151a);
      const cam = new T.PerspectiveCamera(34, 1.4, .3, 200);
      sc.add(new T.HemisphereLight(0xffffff, 0x30343b, 1.6));
      const sun = new T.DirectionalLight(0xffffff, 1.8); sun.position.set(-8, 18, -6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15 }); sc.add(sun);
      const pick = [], borde = new T.LineBasicMaterial({ color: 0x0b0d10, transparent: true, opacity: .35 });
      const P = 60, X = x => (x - 80) / P, Z = y => (y - 70) / P;
      function caja(el, x0, y0, x1, y1, h, yb, color, op) {
        const w = Math.max((x1 - x0) / P, .04), d = Math.max((y1 - y0) / P, .04), g = new T.BoxGeometry(w, h, d);
        const m = new T.MeshStandardMaterial({ color, roughness: .75, transparent: !!op, opacity: op ?? 1, depthWrite: !op });
        const me = new T.Mesh(g, m); me.position.set(X(x0) + w / 2, yb + h / 2, Z(y0) + d / 2); me.castShadow = !op; me.receiveShadow = true;
        me.userData = { el, base: color }; sc.add(me);
        const l = new T.LineSegments(new T.EdgesGeometry(g), borde); l.position.copy(me.position); sc.add(l);
        if (el) pick.push(me);
      }
      const MURO = 0xe9e5de;
      caja('piso', 80, 70, 920, 650, .1, -.1, 0xc9c3b8);
      caja('muro', 60, 50, 940, 70, 3.2, 0, MURO);
      caja(null, 920, 70, 940, 650, 3.2, 0, MURO);
      caja(null, 60, 650, 940, 670, 3.2, 0, MURO, .2);
      caja(null, 60, 70, 80, 110, 3.2, 0, MURO, .2); caja(null, 60, 450, 80, 650, 3.2, 0, MURO, .2); caja(null, 60, 110, 80, 450, .6, 2.6, MURO, .2);
      caja('vitrina', 66, 110, 80, 450, 2.6, 0, 0x9fd8ef, .5);
      caja(null, 770, 70, 786, 200, 3.2, 0, 0xd9d4cc); caja(null, 770, 300, 786, 650, 3.2, 0, 0xd9d4cc); caja(null, 770, 200, 786, 300, 1.1, 2.1, 0xd9d4cc);
      caja('puerta', 772, 200, 784, 300, 2.1, 0, 0x8a6a4a);
      [[220, 70], [410, 70], [600, 70], [220, 580], [410, 580]].forEach(([x, y]) => caja('gondola', x, y, x + 170, y + 70, 1.9, 0, 0x8a6a4a));
      caja('ducto', 120, 330, 880, 370, .45, 2.75, 0x94a3b8);
      let az = -.55, el = .72, drg = null, on = false, raf = 0, movio = false;
      const c = ren.domElement;
      c.addEventListener('pointerdown', e => { drg = [e.clientX, e.clientY, az, el]; movio = false; c.setPointerCapture(e.pointerId); });
      c.addEventListener('pointermove', e => { if (!drg) return; const dx = e.clientX - drg[0], dy = e.clientY - drg[1]; if (Math.abs(dx) + Math.abs(dy) > 4) movio = true; az = drg[2] - dx * .007; el = Math.max(.2, Math.min(1.4, drg[3] + dy * .005)); });
      c.addEventListener('pointerup', e => {
        drg = null; if (movio) return;
        const r = c.getBoundingClientRect(), ray = new T.Raycaster();
        ray.setFromCamera(new T.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), cam);
        const hit = ray.intersectObjects(pick)[0]; if (hit) { sel = hit.object.userData.el; pintar(); }
      });
      function ajustar() { const W = host.clientWidth || 900, H = host.clientHeight || 600; ren.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); }
      function loop() {
        if (!on) return; raf = requestAnimationFrame(loop);
        if (!drg) az += .0012;
        const r = 24, cx = 7, cz = 4.8;
        cam.position.set(cx + Math.sin(az) * Math.cos(el) * r, Math.sin(el) * r, cz + Math.cos(az) * Math.cos(el) * r); cam.lookAt(cx, .8, cz);
        ren.render(sc, cam);
      }
      return {
        marcar() { pick.forEach(m => m.material.color.set(m.userData.el === sel ? 0x38bdf8 : m.userData.base)); },
        start() { if (on) return; on = true; ajustar(); addEventListener('deck:fit', ajustar); raf = requestAnimationFrame(loop); },
        stop() { on = false; cancelAnimationFrame(raf); removeEventListener('deck:fit', ajustar); },
      };
    }

    function pintar() {
      svg.classList.toggle('solid', modo !== 'cad');
      host.hidden = modo !== '3d';
      if (modo === '3d') { v3 ??= crearVista(); v3?.start(); v3?.marcar(); } else v3?.stop();
      $$('.seg button', root).forEach(b => b.classList.toggle('sel', b.dataset.modo === modo));
      $$('.el', svg).forEach(e => e.classList.toggle('sel', e.closest('[data-el]').dataset.el === sel));
      $('#objAyuda').textContent = modo === '3d' ? 'Arrastra para girar. Haz clic en un elemento; prueba con el ducto de aire.' : 'Haz clic en el muro, la vitrina, una góndola, la puerta, el piso o el ducto punteado.';
      const e = ELS[sel];
      if (modo === 'cad') box.innerHTML = `<h3>Lo que sabe AutoCAD</h3><dl>${e.cad.map(t => { const [k, v] = t.split(': '); return `<dt>${k}</dt><dd>${v}</dd>`; }).join('')}</dl><p class="say">El dibujo muestra una forma. El significado está en la cabeza de quien lo hizo.</p>`;
      else {
        const say = modo === '3d'
          ? (sel === 'ducto' ? 'En planta era una línea punteada de otro archivo. En 3D se ve que el ducto atraviesa el muro de la bodega: se resuelve antes de la obra.' : 'El mismo modelo, en 3D: arquitectura e instalaciones juntas para coordinar.')
          : 'Es un objeto: sabe qué es, cuánto mide y dónde aparece.';
        box.innerHTML = `<h3>${e.n}</h3><dl>${e.rvt.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><p class="say">${say}</p>`;
      }
    }
    $$('.seg button', root).forEach(b => { b.onclick = () => { modo = b.dataset.modo; pintar(); }; });
    $$('[data-el]', svg).forEach(g => { g.onclick = () => { sel = g.dataset.el; pintar(); }; });
    root.addEventListener('deck:enter', () => { if (modo === '3d') v3?.start(); });
    root.addEventListener('deck:leave', () => v3?.stop());
    pintar();
  })();

  /* Kits de marca */
  (() => {
    const root = $('#marcas'), M = Tienda.MARCAS;
    const kits = $$('.kit', root), det = $('#kitDet');
    function pintar(k) {
      kits.forEach(b => b.classList.toggle('sel', b.dataset.m === k));
      const m = M[k];
      det.innerHTML = `<dt>Piso</dt><dd>${m.pisoT}</dd><dt>Muros</dt><dd>${m.muroT}</dd><dt>Mobiliario</dt><dd>${m.muebleT}</dd><dt>Aviso</dt><dd>Acento propio de la marca</dd>`;
    }
    kits.forEach(b => {
      const m = M[b.dataset.m];
      b.style.setProperty('--c', m.acento);
      $('.swatches', b).innerHTML = [m.piso, m.muro, m.mueble, m.acento].map(c => `<i style="background:${c}"></i>`).join('');
      b.onclick = () => pintar(b.dataset.m);
    });
    pintar('A');
  })();

  /* Comparadores */
  $$('.cmp').forEach(c => {
    let on = false;
    const mover = e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--p', `${Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100))}%`);
    };
    c.addEventListener('pointerdown', e => { on = true; c.setPointerCapture(e.pointerId); mover(e); });
    c.addEventListener('pointermove', e => { if (on) mover(e); });
    c.addEventListener('pointerup', () => { on = false; });
  });
  $$('[data-pares]').forEach(root => {
    const c = $('.cmp', root), [a, b] = [$('.top', c), $('.base', c)];
    $$('.tabs button', root).forEach(btn => {
      btn.onclick = () => {
        $$('.tabs button', root).forEach(x => x.classList.toggle('sel', x === btn));
        a.src = btn.dataset.a; b.src = btn.dataset.b;
        if (btn.dataset.ta) { $('.tl', c).textContent = btn.dataset.ta; $('.tr', c).textContent = btn.dataset.tb; }
        c.style.setProperty('--p', '50%');
      };
    });
  });

  /* Selector de licencia */
  const lic = { rev: 2, lt: 4 };
  (() => {
    const root = $('#selector');
    const v = id => +$('#' + id).value, chk = id => $('#' + id).checked;
    function calc() {
      const n = v('sN'), s = Math.min(n, v('sS'));
      $('#oN').textContent = n; $('#oS').textContent = s; $('#sS').max = n;
      const razones = []; let full = 1;
      razones.push('Quien mantiene la plantilla necesita filtros de vista y automatización: una licencia completa como mínimo.');
      if (s >= 2) { full = Math.max(full, s); razones.push(`${s} personas en el mismo modelo a la vez exigen trabajo compartido, que Revit LT no tiene.`); }
      if (chk('sMep')) { full = Math.max(full, Math.min(n, 2)); razones.push('Coordinar instalaciones pide comprobar interferencias y copiar/supervisar.'); }
      if (chk('sAuto')) razones.push('Dynamo, macros y complementos solo corren en Revit completo: concentren esa tarea en esas licencias.');
      if (chk('sMue')) { full = Math.max(full, Math.min(n, 2)); razones.push('Despiezar mobiliario usa ensamblajes y partes, que no están en Revit LT.'); }
      if (chk('sRen')) razones.push('El render dentro del programa no existe en LT: usarían la nube u otro programa de visualización.');
      full = Math.min(full, n); const lt = n - full;
      if (lt > 0) razones.push(`Las ${lt === 1 ? 'otra persona puede' : `otras ${lt} personas pueden`} modelar y documentar en LT si trabajan en proyectos separados.`);
      lic.rev = full; lic.lt = lt;
      const pR = v('pRev'), pL = v('pLT'), tot = full * pR + lt * pL, todo = n * pR;
      $('#mFull').textContent = full; $('#mLt').textContent = lt;
      $('#mTot').textContent = `US$${tot.toLocaleString('es-CO')}`;
      $('#mAll').textContent = `US$${todo.toLocaleString('es-CO')}`;
      $('#mWhy').innerHTML = razones.slice(0, 5).map(r => `<li>${r}</li>`).join('');
      window.dispatchEvent(new CustomEvent('lic:cambio'));
    }
    $$('input', root).forEach(i => { i.oninput = calc; });
    calc();
  })();

  /* Keynote en vivo */
  (() => {
    const root = $('#keynote');
    const K = [
      { k: '1.1.1', d: 'Pintura vinilo tipo 1, color de marca, tres manos', p: '1.1', u: 'm²', q: '186,4', fam: 'Muro · Drywall 12' },
      { k: '2.1.1', d: 'Porcelanato gris 60 × 60 rectificado, junta 2 mm', p: '2.1', u: 'm²', q: '126,0', fam: 'Suelo · Porcelanato' },
      { k: '3.1.1', d: 'Cielo en drywall pintado, altura libre 3,20 m', p: '3.1', u: 'm²', q: '126,0', fam: 'Techo · Drywall' },
      { k: '5.2.1', d: 'Vitrina en vidrio templado 10 mm con perfil negro', p: '5.2', u: 'm²', q: '11,7', fam: 'Vitrina comercial' },
      { k: '8.1.1', d: 'Góndola mural 120 × 45 × 195 en melamina roble', p: '8.1', u: 'und', q: '6', fam: 'Góndola mural' },
      { k: '9.1.1', d: 'Aviso de fachada retroiluminado en acrílico y acero', p: '9.1', u: 'ml', q: '5,4', fam: 'Aviso de fachada' },
    ];
    const HOJAS = [['A-101 · Planta de acabados', ['2.1.1', '1.1.1', '3.1.1']], ['A-201 · Fachada', ['5.2.1', '9.1.1', '1.1.1']], ['A-501 · Mobiliario', ['8.1.1', '2.1.1', '5.2.1']]];
    let sel = '2.1.1';
    const txt = $('#kTxt'), ed = $('#kInput'), cl = $('#kClave'), out = $('#kOut'), fic = $('#kFicha');
    const hallar = k => K.find(x => x.k === k);
    function txtFile() {
      const caps = { 1: 'ACABADOS DE MURO', 2: 'PISOS', 3: 'CIELOS', 5: 'PUERTAS Y VITRINAS', 8: 'MOBILIARIO', 9: 'IMAGEN DE MARCA' };
      txt.innerHTML = K.map(x => `<span class="r${x.k === sel ? ' sel' : ''}" data-k="${x.k}"><span class="k">${x.k}</span>\t${x.d}\t${x.p}</span>`).join('');
      $$('.r', txt).forEach(r => { r.onclick = () => elegir(r.dataset.k); });
      return caps;
    }
    function hojas(pulso) {
      out.innerHTML = HOJAS.map(([t, ks]) => `<div class="ksheet${pulso && ks.includes(sel) ? ' upd' : ''}"><small>${t}</small>${ks.map(k => `<div><b>${k}</b> ${hallar(k).d}</div>`).join('')}</div>`).join('');
      if (pulso) setTimeout(() => $$('.ksheet', out).forEach(e => e.classList.remove('upd')), 500);
    }
    function ficha() { const x = hallar(sel); fic.innerHTML = `<dt>Clave</dt><dd class="mono">${x.k}</dd><dt>Elemento</dt><dd>${x.fam}</dd><dt>Cantidad</dt><dd>${x.q} ${x.u}</dd><dt>Texto</dt><dd>${x.d}</dd>`; }
    function elegir(k) {
      sel = k; const x = hallar(k);
      cl.textContent = k; ed.value = x.d; txtFile(); hojas(false); ficha();
      $$('.tagk', root).forEach(t => t.classList.toggle('sel', t.dataset.k === k));
    }
    ed.oninput = () => { hallar(sel).d = ed.value; txtFile(); hojas(true); ficha(); };
    $$('.tagk', root).forEach(t => { t.onclick = () => elegir(t.dataset.k); });
    elegir(sel);
  })();

  /* LOD: la misma góndola en cada nivel de desarrollo. Cada nivel suma lo del anterior. */
  (() => {
    const L = [
      { n: 100, t: 'Conceptual', geo: 'Un volumen o símbolo que reserva el espacio.', info: 'Área aproximada y uso.', tienda: 'Primera distribución para la marca.', quien: 'Dirección y marca' },
      { n: 200, t: 'Genérico', geo: 'Tamaño, forma y posición aproximados.', info: 'Tipo genérico de mueble.', tienda: 'Anteproyecto y prueba de recorridos.', quien: 'Diseño y marca' },
      { n: 300, t: 'Específico', geo: 'Medidas y posición exactas.', info: 'Tipo, material, keynote y cantidad.', tienda: 'Planos para aprobación del centro comercial y presupuesto.', quien: 'Administración y presupuesto' },
      { n: 350, t: 'Coordinado', geo: 'Conexiones con otros sistemas: anclajes, tomas e iluminación.', info: 'Puntos eléctricos, cargas y holguras.', tienda: 'Coordinación con eléctrico, aire acondicionado y cielo.', quien: 'Ingenieros y coordinación' },
      { n: 400, t: 'Fabricación', geo: 'Piezas, uniones y herrajes para fabricar e instalar.', info: 'Despiece, cantidades por pieza y proveedor.', tienda: 'Planos de taller del mobiliario. Muchas veces lo hace el taller.', quien: 'Taller y contratista' },
      { n: 500, t: 'Verificado en obra', geo: 'Lo construido, medido en sitio.', info: 'Medidas reales, fecha y garantías.', tienda: 'Cierre de obra y base para la próxima remodelación.', quien: 'Operación y mantenimiento' },
    ];
    const root = $('#lod'), tabs = $('#lodTabs'), svg = $('#lodSvg'), txt = $('#lodTxt');
    // Alzado frontal de una góndola de 120 × 195 cm: 2,1 px por cm, base en y = 470.
    const k = 2.1, x0 = 150, yb = 470, W = 120 * k, H = 195 * k, M = '#8a6a4a';
    const X = c => x0 + c * k, Y = c => yb - c * k;
    const tag = (x, y, t, f = '#fff') => `<g transform="translate(${x},${y})"><rect x="-44" y="-17" width="88" height="34" rx="17" fill="${f}" stroke="#14171b" stroke-width="2"/><text y="8" text-anchor="middle" font-size="21" font-weight="600" fill="#14171b">${t}</text></g>`;
    const num = (x, y, t) => `<g transform="translate(${x},${y})"><circle r="15" fill="#fff" stroke="#14171b" stroke-width="2"/><text y="7" text-anchor="middle" font-size="18" font-weight="600" fill="#14171b">${t}</text></g>`;
    function dibujo(n) {
      let g = `<line x1="40" y1="${yb}" x2="660" y2="${yb}" stroke="#14171b" stroke-width="3"/>`;
      g += `<rect x="${X(-8)}" y="${Y(240)}" width="10" height="${240 * k}" fill="#d9d4cc" stroke="#14171b" stroke-width="1.5"/><text x="${X(-14)}" y="${Y(232)}" font-size="19" fill="#555" text-anchor="end">Muro</text>`;
      if (n === 100) {
        g += `<rect x="${X(0)}" y="${Y(200)}" width="${W}" height="${200 * k}" fill="none" stroke="#14171b" stroke-width="2.5" stroke-dasharray="14 10"/>`;
        g += `<text x="${X(60)}" y="${Y(100)}" text-anchor="middle" font-size="26" fill="#14171b">Góndola</text><text x="${X(60)}" y="${Y(100) + 32}" text-anchor="middle" font-size="22" fill="#555">≈ 1,2 × 2 m</text>`;
      } else {
        const det = n >= 300;
        g += `<rect x="${X(0)}" y="${Y(195)}" width="${W}" height="${H}" fill="${det ? '#efe6da' : '#e6e3dd'}" stroke="#14171b" stroke-width="2.5"/>`;
        [40, 85, 130, 175].forEach(h => { g += det ? `<rect x="${X(2)}" y="${Y(h)}" width="${116 * k}" height="${3 * k}" fill="${M}" stroke="#14171b" stroke-width="1"/>` : `<line x1="${X(0)}" x2="${X(120)}" y1="${Y(h)}" y2="${Y(h)}" stroke="#14171b" stroke-width="2"/>`; });
        if (det) g += `<rect x="${X(0)}" y="${Y(10)}" width="${W}" height="${10 * k}" fill="#2b2f35"/>` + `<rect x="${X(0)}" y="${Y(195)}" width="${2 * k}" height="${H}" fill="${M}"/><rect x="${X(118)}" y="${Y(195)}" width="${2 * k}" height="${H}" fill="${M}"/>`;
        const cota = det ? ['120', '195'] : ['≈ 120', '≈ 200'];
        g += `<line x1="${X(0)}" x2="${X(120)}" y1="${yb + 30}" y2="${yb + 30}" stroke="#14171b" stroke-width="1.5"/><text x="${X(60)}" y="${yb + 24}" text-anchor="middle" font-size="22" font-weight="600" fill="#14171b">${cota[0]}</text>`;
        g += `<line x1="${X(132)}" x2="${X(132)}" y1="${Y(0)}" y2="${Y(195)}" stroke="#14171b" stroke-width="1.5"/><text x="${X(138)}" y="${Y(97)}" font-size="22" font-weight="600" fill="#14171b">${cota[1]}</text>`;
        if (det) g += tag(X(60), Y(152), '8.1.1');
      }
      if (n >= 350) {
        [60, 160].forEach(h => { g += `<rect x="${X(-4)}" y="${Y(h) - 6}" width="${14 * k}" height="12" fill="#64748b"/>`; });
        g += `<rect x="${X(92)}" y="${Y(28)}" width="34" height="24" rx="3" fill="#fff" stroke="#ef4444" stroke-width="2.5"/><text x="${X(92) + 17}" y="${Y(28) + 18}" text-anchor="middle" font-size="16" font-weight="700" fill="#ef4444">T</text>`;
        g += `<rect x="${X(4)}" y="${Y(176)}" width="${112 * k}" height="6" fill="#f59e0b"/>`;
        g += `<text x="${X(150)}" y="${Y(176) + 6}" font-size="20" fill="#b45309">LED</text><text x="${X(150)}" y="${Y(60)}" font-size="20" fill="#475569">Anclajes</text><text x="${X(150)}" y="${Y(24)}" font-size="20" fill="#ef4444">Toma</text>`;
      }
      if (n >= 400) {
        g += num(X(60), Y(40) - 16, 1) + num(X(30), Y(85) - 16, 2) + num(X(90), Y(130) - 16, 3) + num(X(30), Y(175) - 16, 4) + num(X(110), Y(5), 5) + num(X(1), Y(110), 6);
        [40, 85, 130, 175].forEach(h => { g += `<circle cx="${X(6)}" cy="${Y(h) + 3}" r="3" fill="#14171b"/><circle cx="${X(114)}" cy="${Y(h) + 3}" r="3" fill="#14171b"/>`; });
      }
      if (n >= 500) {
        g += `<text x="${X(60)}" y="${yb + 58}" text-anchor="middle" font-size="22" font-weight="700" fill="#16a34a">Medido en obra: 119,5</text>`;
        g += `<g transform="translate(${X(148)},${Y(140)})"><rect width="190" height="56" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/><text x="95" y="36" text-anchor="middle" font-size="21" font-weight="700" fill="#166534">✓ Verificado</text></g>`;
      }
      svg.innerHTML = `<g font-family="Geist,system-ui,sans-serif">${g}</g>`;
    }
    /* Vista 3D de la misma góndola (metros: 1,2 de ancho, 1,95 de alto, 0,45 de fondo) */
    function crear3D() {
      const T = window.THREE, host = $('#lod3d'); if (!T) return null;
      const ren = new T.WebGLRenderer({ antialias: true }); ren.setPixelRatio(Math.min(devicePixelRatio, 1.5)); ren.shadowMap.enabled = true; host.append(ren.domElement);
      const sc = new T.Scene(); sc.background = new T.Color(0xf7f6f2);
      const cam = new T.PerspectiveCamera(32, 1, .1, 50);
      sc.add(new T.HemisphereLight(0xffffff, 0x9a958c, 1.7));
      const sun = new T.DirectionalLight(0xffffff, 1.6); sun.position.set(2.5, 4, 3); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sc.add(sun);
      let grupo = null, az = .55, el = .3, drg = null, on = false, raf = 0;
      function caja(g, w, h, d, x, y, z, color, o = {}) {
        const geo = new T.BoxGeometry(w, h, d);
        const m = new T.MeshStandardMaterial({ color, roughness: .7, transparent: o.op != null, opacity: o.op ?? 1, emissive: o.em ?? 0, emissiveIntensity: o.em ? 1 : 0, depthWrite: o.op == null });
        const me = new T.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = o.op == null; me.receiveShadow = true; g.add(me);
        if (o.borde !== false) {
          const lm = o.raya ? new T.LineDashedMaterial({ color: 0x14171b, dashSize: .06, gapSize: .04 }) : new T.LineBasicMaterial({ color: o.bc ?? 0x14171b, transparent: true, opacity: o.bc ? 1 : .45 });
          const l = new T.LineSegments(new T.EdgesGeometry(geo), lm); l.position.copy(me.position); if (o.raya) l.computeLineDistances(); g.add(l);
        }
      }
      function construir(n) {
        if (grupo) { sc.remove(grupo); grupo.traverse(c => { c.geometry?.dispose(); c.material?.dispose(); }); }
        grupo = new T.Group(); sc.add(grupo);
        caja(grupo, 2.6, .02, 1.4, 0, -.01, .35, 0xe6e3dd, { borde: false });
        caja(grupo, 2.2, 2.4, .1, 0, 1.2, -.06, 0xd9d4cc, { op: .55 });
        const bc = n === 500 ? 0x16a34a : undefined, e = n === 400 ? .14 : 0, MU = 0x8a6a4a;
        if (n === 100) { caja(grupo, 1.2, 2, .45, 0, 1, .225, 0x94a3b8, { op: .22, raya: true }); }
        else if (n === 200) {
          caja(grupo, 1.2, 1.95, .45, 0, .975, .225, 0xd6d3cd);
          [.4, .85, 1.3, 1.75].forEach(h => caja(grupo, 1.2, .02, .45, 0, h, .225, 0xbdb9b1, { borde: false }));
        } else {
          caja(grupo, 1.2, 1.95, .03, 0, .975, .015 - e * .6, 0xefe6da, { bc });
          caja(grupo, .03, 1.95, .45, -.585 - e, .975, .225, MU, { bc }); caja(grupo, .03, 1.95, .45, .585 + e, .975, .225, MU, { bc });
          caja(grupo, 1.14, .1, .42, 0, .05 - e * .3, .225, 0x2b2f35, { bc });
          [.4, .85, 1.3, 1.75].forEach((h, i) => caja(grupo, 1.14, .03, .42, 0, h + e * (i - 1.5) * .5, .24 + e * 1.4, MU, { bc }));
        }
        if (n >= 350) {
          [[-.4, .6], [.4, .6], [-.4, 1.6], [.4, 1.6]].forEach(([x, y]) => caja(grupo, .1, .04, .1, x, y, -.03, 0x64748b, { borde: false }));
          caja(grupo, 1.1, .02, .03, 0, 1.72 + e * .38, .42 + e * 1.4, 0xf59e0b, { em: 0xf59e0b, borde: false });
          caja(grupo, .11, .11, .03, .42, .3, -.005, 0xef4444, { borde: false });
        }
        if (n === 400) [.4, .85, 1.3, 1.75].forEach((h, i) => [-.53, .53].forEach(x => {
          const s = new T.Mesh(new T.SphereGeometry(.018, 10, 8), new T.MeshStandardMaterial({ color: 0x14171b })); s.position.set(x * 1.25, h + e * (i - 1.5) * .5, .24 + e * .7); grupo.add(s);
        }));
      }
      const c = ren.domElement;
      c.addEventListener('pointerdown', ev => { drg = [ev.clientX, ev.clientY, az, el]; c.setPointerCapture(ev.pointerId); });
      c.addEventListener('pointermove', ev => { if (!drg) return; az = drg[2] - (ev.clientX - drg[0]) * .008; el = Math.max(.05, Math.min(1.2, drg[3] + (ev.clientY - drg[1]) * .005)); });
      c.addEventListener('pointerup', () => { drg = null; });
      function ajustar() { const W = host.clientWidth || 600, H = host.clientHeight || 600; ren.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); }
      function loop() {
        if (!on) return; raf = requestAnimationFrame(loop);
        const r = 4.4 / Math.min(1, cam.aspect); cam.position.set(Math.sin(az) * Math.cos(el) * r, .95 + Math.sin(el) * r, .25 + Math.cos(az) * Math.cos(el) * r); cam.lookAt(0, .95, .2);
        ren.render(sc, cam);
      }
      return {
        construir,
        start() { if (on) return; on = true; ajustar(); addEventListener('deck:fit', ajustar); raf = requestAnimationFrame(loop); },
        stop() { on = false; cancelAnimationFrame(raf); removeEventListener('deck:fit', ajustar); },
      };
    }
    let v3 = null, actual = 300;
    root.addEventListener('deck:enter', () => { v3 ??= crear3D(); v3?.construir(actual); v3?.start(); });
    root.addEventListener('deck:leave', () => v3?.stop());

    function elegir(i) {
      [...tabs.children].forEach((b, k) => b.classList.toggle('sel', k === i));
      const l = L[i]; dibujo(l.n); actual = l.n; v3?.construir(l.n);
      txt.innerHTML = `<h3>LOD ${l.n} · ${l.t}</h3><dl><dt>Geometría</dt><dd>${l.geo}</dd><dt>Información</dt><dd>${l.info}</dd><dt>En una tienda</dt><dd>${l.tienda}</dd><dt>Lo usa</dt><dd>${l.quien}</dd></dl>`;
    }
    L.forEach((l, i) => { const b = document.createElement('button'); b.textContent = `LOD ${l.n}`; b.onclick = () => elegir(i); tabs.append(b); });
    elegir(2);
  })();

  /* Decisiones */
  (() => {
    const root = $('#decisiones'), ins = $$('input', root), key = 'decisionesRevit';
    try { const s = JSON.parse(localStorage.getItem(key) || '{}'); ins.forEach(i => { if (s[i.id]) i.value = s[i.id]; }); } catch {}
    ins.forEach(i => { i.oninput = () => { try { localStorage.setItem(key, JSON.stringify(Object.fromEntries(ins.map(x => [x.id, x.value])))); } catch {} }; });
    $('#btnCopiar').onclick = async () => {
      const t = ins.map(i => `${i.closest('label').querySelector('span').textContent}: ${i.value || 'pendiente'}`).join('\n');
      try { await navigator.clipboard.writeText(t); deckToast('Resumen copiado al portapapeles.'); } catch { deckToast('No se pudo copiar. Tomen una foto de la pantalla.'); }
    };
  })();
})();
