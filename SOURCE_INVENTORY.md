# Fuente y preservación

- Repositorio observado: `https://github.com/madbenji/pluviamnew`
- Rama observada: `feature/pluviam-beta-distribucion-avianny-20261103`
- Estado observado: README + `PLUVIAM_JOURNEY_FOLIO_PRIMERO_CODIGO_Y_QA (1).zip`; no árbol de código fuera del ZIP.
- ZIP descargado sin modificación: `outputs/PLUVIAM_JOURNEY_FOLIO_PRIMERO_CODIGO_Y_QA_beta.zip`.
- SHA-256 del ZIP observado: `FC453189775DD915C71262D582AD219FD7446C57F1B22451FF4EDDD34EA083B2`.
- Copia base expandida: `outputs/pluviam-beta-inspected/`.
- Copia de trabajo: `outputs/pluviam-beta-overdrive/`.

## Comparación base → beta

El contenido heredado permanece idéntico salvo `site/_worker.js`, que sólo añade el import/routing de la beta y los redirects de rutas nuevas. Los demás cambios son aditivos: migración, módulo beta, páginas beta, estilos, pruebas y documentación.

No se verificaron autenticadamente Cloudflare Pages, bindings D1 productivos, origen de producción ni rollback remoto; por eso no se afirma que exista una URL Preview real ni que la producción haya sido observada. En esta sesión no se ejecutaron escrituras contra GitHub, Cloudflare, D1 productiva, correo, WhatsApp, Stripe, Mercado Pago o Retell.

