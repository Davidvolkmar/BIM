# Una tienda, un solo modelo

Charla web de 38 minutos sobre Revit y BIM para una empresa de espacios comerciales. Son 29 láminas más un anexo de fuentes. Todo lo que usa está en esta carpeta y funciona sin internet.

## Cómo abrirla

1. Doble clic en `INICIAR.bat` o en `index.html`.
2. Pulsa **F** para pantalla completa.
3. Pulsa **N** para abrir las notas del orador en otra ventana. Mueve esa ventana a tu pantalla, no a la del proyector.

## Controles

| Tecla | Acción |
|---|---|
| → · Espacio · PgDn | Avanzar |
| ← · PgUp | Volver |
| F | Pantalla completa |
| N | Notas del orador, reloj y tiempo restante |
| G | Índice para saltar a cualquier lámina |
| B | Pantalla negra |

## Interactivos

| Lámina | Qué hace |
|---|---|
| Línea contra objeto | Muestra lo que sabe AutoCAD y lo que sabe Revit sobre el mismo local |
| Un cambio, todo se actualiza | Cambia medidas, góndolas y marca; 3D, planta, fachada y tabla responden juntos |
| Selector de licencias | Recomienda la mezcla de Revit y Revit LT |
| Keynote en vivo | Edita un texto y actualiza las hojas que usan esa clave |
| Nivel de desarrollo (LOD) | Muestra la misma góndola en LOD 100, 200, 300, 350, 400 y 500 |
| Cinco decisiones | Registra las decisiones de la dirección y permite copiar el resumen |

## Antes de presentar

- Pedir a un distribuidor el precio de Revit y de AutoCAD Revit LT Suite para Colombia. En las láminas figuran US$2.800 y US$3.425 para Revit y AEC Collection, de la tienda de Autodesk para Latinoamérica el 6 de noviembre de 2026. Revit LT no muestra precio regional; los US$680 del selector son una referencia y deben cotizarse.
- Probar en la versión de prueba de Revit LT si importa SketchUp y PDF. La tabla comercial de Autodesk y su ayuda no coinciden en ese punto.
- Contar en las notas de experiencia cuál fue tu papel en cada proyecto.

## Confidencialidad

- Los proyectos y la plantilla de referencia aparecen sin nombre. Las imágenes se recortaron para quitar rótulos y se les eliminaron los marcadores del recorrido.
- Algunos espacios siguen siendo reconocibles para quien conozca el proyecto. El caso más claro es el centro comercial del comparador de render y obra.

## Qué hay aquí

| Ruta | Contenido |
|---|---|
| `index.html` | Láminas y notas del orador |
| `notas.html` | Ventana del orador |
| `css/deck.css` | Estilos, derivados del sistema de la Suite BIO |
| `js/deck.js` | Motor de la presentación |
| `js/tienda.js` | Tienda paramétrica: 3D, planta, fachada y tabla |
| `js/demos.js` | Interactivos: línea contra objeto, 3D, selector, keynotes y LOD |
| `servidor.py`, `SERVIDOR.bat` | Servidor local sin caché en el puerto 5731 |
| `js/contenido.js` | Capas de la plantilla y documentos base |
| `assets/` | Imágenes, fuente Geist y Three.js |

Las demostraciones ilustran el principio de funcionamiento. No ejecutan Revit, y los valores de marcas, medidas y licencias son de ejemplo. En las imágenes de la plantilla se taparon la marca y los datos de contacto de su autor.
