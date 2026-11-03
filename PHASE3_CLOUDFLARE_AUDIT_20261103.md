# PLUVIAM Overdrive · Fase 3 Cloudflare

## Estado

**Preparado para despliegue manual aislado; no declarado desplegado.** En esta ejecución no se obtuvo una URL `pages.dev`, no se observaron bindings remotos y no se ejecutaron pruebas contra Cloudflare D1. Producción no fue modificada.

## Paquete Preview auditado

- Archivo: `PLUVIAM_OVERDRIVE_PREVIEW_SITE_20261103.zip`.
- SHA-256 esperado y observado: `CC6F02EDFED1F59EAFDEEDEC02E52F384544F8012A0494C565C084BAC868AB83`.
- Tamaño: 764,405 bytes; 57 entradas.
- Estructura: contenido de `site/` en la raíz del ZIP; no existe una carpeta `site/` adicional.
- `_worker.js`: presente en la raíz y contiene el enrutamiento `/api/beta/*` hacia `beta-overdrive.js`.
- Dependencias de publicación ausentes: ninguna de las requeridas para el paquete estática/Worker.
- No se incluyeron `tests/`, `migraciones/`, `docs/`, `.git/`, `baseline/` ni `outputs/`.

Listado completo:

```text
admin/index.html
assets/captacion.svg
assets/cisterna.svg
assets/filtracion.svg
colaborar/index.html
colaborar/mi-beehive/index.html
store/index.html
_headers
_worker.js
404.html
academia.html
admin-v50.css
admin.html
admin.js
app.js
beta-overdrive.js
beta.css
beta.js
coherencia-site.css
contacto.html
cotizacion.html
diagnostic-snapshot.js
engine.js
favicon.png
favicon.svg
identity-v46-r2.css
index.html
journey-profesional.css
mi-proyecto.html
mi-proyecto.js
modelo-3d.css
modelo-3d.html
modelo-3d.js
pagar.css
pagar.html
pagar.js
pluviam-gotas.png
pluviam-logo-oscuro.png
pluviam-logo-transparente.png
pluviam-mark.svg
portal-hidrico.svg
privacidad.html
project-docs.js
project-premium.css
project-timeline.js
project-v50.css
quote-r7.js
release-polish.css
roi-r7.js
styles.css
system.js
ux-conversion-preview.css
visual-captacion.svg
visual-r7.css
visual-reserva.svg
visual-tratamiento.svg
water.js
```

Cloudflare documenta que el método drag-and-drop de Direct Upload acepta ZIP y que `_worker.js` es compatible con ese método. Este paquete usa el modo avanzado `_worker.js`; no depende de una carpeta `functions/`.

## D1 beta

Nombre: `pluviam-overdrive-beta-db`  
Binding: `DB_BETA`  
Base: físicamente separada de producción.

La migración `migraciones_beta/006_overdrive_beta.sql` es autocontenida: crea sus tablas, índices y semillas sintéticas, y fue probada sobre SQLite vacío. Su SHA-256 es `798C67AB621A4A29D70BCD8CA31177124C7B48214677DAAC411969F198EDB658`.

Orden correcto en `DB_BETA` vacía:

1. Ejecutar únicamente `migraciones_beta/006_overdrive_beta.sql`.
2. Verificar las tablas `beta_*`, las cinco sesiones sintéticas y los dos aliados sintéticos.
3. No ejecutar `migraciones/001` a `migraciones/005` en `DB_BETA`: dependen de tablas productivas como `lead_cases`, `approved_quotes` y `payment_attempts`.

La configuración `wrangler.beta.toml.example` apunta deliberadamente a `./migraciones_beta`, no a la carpeta productiva.

## Procedimiento de panel Cloudflare

1. En Workers & Pages, crear un proyecto Direct Upload nuevo llamado `pluviam-overdrive-beta-1103`. No seleccionar el proyecto `pluviam` ni Git integration.
2. En el primer despliegue, subir `PLUVIAM_OVERDRIVE_PREVIEW_SITE_20261103.zip` mediante drag-and-drop. El primer deployment será el deployment principal de este proyecto separado; no es producción de PLUVIAM.
3. Crear la D1 `pluviam-overdrive-beta-db` desde el panel.
4. Ejecutar el SQL beta-only anterior en esa D1.
5. En Pages → Settings → Bindings → Add → D1 database bindings, usar variable `DB_BETA` y seleccionar `pluviam-overdrive-beta-db`. No agregar `DB`.
6. En Variables and Secrets, para el entorno que se pruebe, configurar `BETA_MODE=true` y `BETA_ISOLATED=true`. No configurar pagos, correo, WhatsApp, Retell, IA ni secretos productivos.
7. Guardar y volver a desplegar: Cloudflare requiere un nuevo deployment para que el binding tenga efecto.
8. En Settings → Access, activar una política de Cloudflare Access para el hostname `pages.dev` del proyecto beta y permitir sólo las identidades de prueba. No agregar dominios de clientes.

## QA remoto pendiente

Registrar la URL real y hora de cada resultado. Estas pruebas son distintas de las 15 pruebas locales ya aprobadas.

- HTML y assets: `/`, `/colaborar/`, `/colaborar/mi-beehive/`, `/store/`, `/admin/`, `/404.html`; comprobar que CSS, JS, SVG y PNG respondan sin 404.
- Estado: `GET /api/beta/status` devuelve `binding=DB_BETA`, `productionBindingUsed=false`, `dataMode=synthetic-only`, `paymentsEnabled=false`, `emailsEnabled=false`, `aiMode=MOCK`.
- Fail-closed: quitar temporalmente `DB_BETA` en una copia de prueba debe producir HTTP 503 con `Beta aislada no configurada`; nunca debe intentar `env.DB`.
- Sesiones: `beta-admin-synthetic`, `beta-fernando-synthetic`, `beta-345-synthetic`, `beta-architect-synthetic`, `beta-customer-synthetic`.
- Aliados: operaciones ve exactamente dos aliados; Fernando y 345 permanecen `PENDING_VALIDATION`, `NOT_SIGNED`, `NOT_AUTHORIZED`; no aparecen logos públicos.
- Aislamiento: Fernando y 345 no pueden ver expedientes ajenos; operaciones sí puede ver el conjunto beta.
- Flujo: consentimiento → diagnóstico → asignación → cotización; costos no verificados producen `NO_GO`.
- Finanzas: modo `REFERIDOR` e `INTEGRADOR`, IVA, ingreso neto, costos, contribución, piso 20% y objetivo 25%.
- Orden y QA: una orden de trabajo no nace antes de aprobación humana; después de aprobar, el flujo llega a QA sin pago.
- Store y HI Care: pedido `SIMULATED_NO_CHARGE` y solicitud de mantenimiento sin cargo.
- Auditoría: eventos privados visibles sólo para operaciones.
- Cobros y comunicaciones: confirmar que no existen checkout, cobros, email, WhatsApp, Retell ni llamadas de IA real.

## Rollback

Para detener la beta, bloquear el hostname con Access y retirar el deployment del proyecto beta. Para eliminar la D1 beta, exportar o conservar evidencia primero y ejecutar la eliminación sólo con autorización explícita. No tocar el proyecto `pluviam`, sus dominios, su D1 ni `main`.

## Riesgos pendientes

- Falta una URL real y, por tanto, no hay evidencia HTTP, D1 remota, Access ni verificación móvil/escritorio.
- El primer deployment de Direct Upload es principal dentro del proyecto beta; la separación depende de crear correctamente el proyecto nuevo.
- El sitio heredado conserva el correo público `pluviammx@gmail.com`; no se detectaron claves live, tokens activos ni llaves privadas.
- Los perfiles Fernando y 345 son datos sintéticos; no deben convertirse en invitaciones, contratos, logos públicos ni datos operativos.
- La beta sigue siendo `NO-GO` para cobros, clientes reales y producción.
