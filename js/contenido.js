// Contenido de las dos láminas navegables: capas de la plantilla y documentos base.
(() => {
  const CAPAS = [
    // [nombre, qué es, en una tienda, imágenes de apoyo [archivo, pie]]
    ['Hojas y rótulos', 'El juego de planos completo, vacío y ordenado, con el rótulo de la empresa.', 'Abren un proyecto y ya están A-101, A-102 y A-501 con su formato.', [['plt_rotulo', 'Rótulo de la plantilla']]],
    ['Vistas y plantillas de vista', 'Cada tipo de plano guarda su escala, visibilidad y grosores.', 'Una planta de acabados siempre se ve igual, la haga quien la haga.'],
    ['Tablas', 'Cuadros de acabados, puertas, mobiliario y cantidades ya formateados.', 'Se colocan elementos y la tabla se llena sola.'],
    ['Familias', 'Mobiliario, puertas, vitrinas y anotación propia, con sus tipos, revisadas en un tablero.', 'Góndolas, cajas e islas de cada marca, listas para colocar.', [['plt_tablero_familias', 'Tablero de familias por capítulo'], ['plt_personas', 'Familias de personas']]],
    ['Materiales', 'Biblioteca con apariencia, patrón, nota clave y datos de compra.', 'El porcelanato de la marca sale igual en plano, tabla y render.', [['plt_materiales', 'Materiales con nota clave y datos del producto']]],
    ['Keynotes', 'Archivo de claves conectado a tipos y materiales, mantenido en Excel.', 'El texto de la especificación se escribe una vez.', [['plt_keynotes_excel', 'Claves, descripción, capítulo y familia']]],
    ['Parámetros compartidos', 'Datos propios: marca, proveedor, código, etapa.', 'Se puede filtrar y contar por marca o por proveedor.'],
    ['Filtros', 'Reglas que colorean u ocultan según un dato. Requieren Revit completo.', 'Ver en rojo lo pendiente de aprobar por la marca.'],
    ['Símbolos y etiquetas', 'Norte, escalas gráficas, cortes y etiquetas de puertas y ventanas.', 'Cada puerta muestra su código y su dintel sin escribirlo a mano.', [['plt_simbolos', 'Símbolos y etiquetas por categoría']]],
    ['Textos, líneas y rellenos', 'Pocos tipos de texto, estilos de línea y patrones con nombre según su uso.', 'Los planos se imprimen con el mismo carácter gráfico.', [['plt_textos', 'Tres tamaños de texto'], ['plt_rellenos', 'Patrones de relleno']]],
  ];
  const DOCS = [
    { g: 'Una vez, para toda la empresa', items: [
      ['Manual BIM', 'Reglas de la oficina: nomenclatura, plantilla, familias, carpetas y revisión.', 'Líder BIM', 'Al inicio; se revisa cada cierto tiempo', 'Cómo se nombra una hoja, una familia o un proyecto de cualquier marca.'],
      ['Matriz de responsabilidades', 'Quién hace, quién revisa y quién aprueba cada entrega.', 'Dirección y líder BIM', 'Al inicio', 'Quién aprueba el paquete que va al centro comercial.'],
      ['Matriz de nivel de información', 'Qué tanto detalle lleva cada elemento en cada etapa.', 'Líder BIM', 'Al inicio; se ajusta por tipo de proyecto', 'Una góndola en anteproyecto es un volumen; en construcción lleva tipo y material.'],
      ['Lista de control de calidad', 'Revisión antes de emitir: vistas, hojas, keynotes y advertencias.', 'Líder BIM', 'Una vez; se usa en cada emisión', 'Ninguna hoja sale con claves vacías o rótulos sin llenar.'],
    ]},
    { g: 'En cada proyecto', items: [
      ['Requisitos de información (EIR)', 'Qué necesita recibir quien solicita el proyecto, y para qué.', 'La marca o la dirección', 'Antes de arrancar', 'Planos para aprobación, cantidades para compras y fecha de apertura.'],
      ['Plan de ejecución BIM (BEP)', 'Cómo se va a cumplir: equipo, modelos, intercambios y reuniones.', 'Coordinación', 'Al arrancar', 'Puede ser de dos páginas para una tienda repetitiva.'],
      ['Plan de entregas', 'Qué información se entrega, cuándo y quién la produce.', 'Coordinación', 'Al arrancar; se actualiza', 'Fechas de anteproyecto, aprobación del centro comercial y obra.'],
      ['Registro de coordinación', 'Interferencias, decisiones y cambios acordados.', 'Coordinación', 'Durante el proyecto', 'El ducto baja, el cielo sube a 2,90 m: acordado y con fecha.'],
    ]},
  ];

  const list = document.getElementById('capas'), det = document.getElementById('capaDet');
  CAPAS.forEach(([n, q, ej, imgs], i) => {
    const b = document.createElement('button'); b.textContent = n;
    b.onclick = () => {
      [...list.children].forEach(x => x.classList.toggle('sel', x === b));
      const fig = imgs ? `<div class="pimgs">${imgs.map(([f, c]) => `<figure class="frame fit"><img src="assets/img/${f}.png" alt="${c}"><figcaption>${c}</figcaption></figure>`).join('')}</div>` : '';
      det.classList.toggle('conimg', !!imgs);
      det.innerHTML = `<h3>${n}</h3><p>${q}</p><div class="ex"><span>En una tienda</span>${ej}</div>${fig}`;
    };
    list.append(b); if (i === 0) b.click();
  });

  const dl = document.getElementById('docList'), dd = document.getElementById('docDet');
  let primero = null;
  DOCS.forEach(g => {
    const h = document.createElement('div'); h.className = 'grp'; h.textContent = g.g; dl.append(h);
    g.items.forEach(([n, q, quien, cuando, ej]) => {
      const b = document.createElement('button'); b.textContent = n;
      b.onclick = () => {
        dl.querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
        dd.innerHTML = `<h3>${n}</h3><dl><dt>Qué es</dt><dd>${q}</dd><dt>Quién</dt><dd>${quien}</dd><dt>Cuándo</dt><dd>${cuando}</dd><dt>En una tienda</dt><dd>${ej}</dd></dl>`;
      };
      dl.append(b); primero ??= b;
    });
  });
  primero.click();
})();
