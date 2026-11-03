# PLUVIAM Global · Overdrive Beta aislada

Paquete de construcción sobre la candidata V52.1 de Cloudflare Pages. No es producción y no sustituye la fuente canónica hasta que se compare contra Cloudflare autenticado.

## Qué se añadió

- `/colaborar/`: entrada de red de aliados, referidores y operaciones.
- `/colaborar/mi-beehive/`: panel sintético por rol con aislamiento de expedientes.
- `/admin/`: tablero beta privado para oportunidades y auditoría.
- `/store/`: catálogo compartido con pedidos `SIMULATED_NO_CHARGE`.
- `site/beta-overdrive.js`: API tipada para oportunidades, diagnóstico, aliados, cotizaciones, órdenes, QA, catálogo y HI Care.
- `migraciones_beta/006_overdrive_beta.sql`: esquema idempotente y autocontenido para `DB_BETA`, con dos perfiles y catálogo sintéticos. Las migraciones 001–005 son productivas y no forman parte del orden beta.

## Seguridad de beta

La API sólo opera cuando `BETA_MODE=true`, `BETA_ISOLATED=true` y existe el binding `DB_BETA`. No consulta `DB`, no habilita pagos, no envía correo/WhatsApp, no publica logos y no usa IA real: el modo está marcado `MOCK`. Los tokens de sesión son marcadores sintéticos de Preview, no credenciales de producción.

Los perfiles `AL-BETA-FERNANDO` y `AL-BETA-345` quedan `PENDING_VALIDATION`, `NOT_SIGNED` y `NO PUBLICABLE`. Las cifras de Fernando y 345 son referencias preliminares/históricas, no cotizaciones.

## Economía

La cotización separa `REFERIDOR` e `INTEGRADOR`, convierte el PVP con IVA a ingreso neto, calcula contribución, piso de 20%, objetivo de 25% y precio mínimo indicativo. Costos no verificados, capacidad no confirmada, margen negativo o margen bajo el piso generan `NO_GO`. Un resultado `PRE_GO_REVIEW_CONTRACT` todavía requiere aprobación humana; nunca activa cobros ni trabajo automáticamente.

## Cómo probar en una D1 beta

1. Crear una D1 nueva de Preview y respaldar el entorno antes de cualquier migración.
2. Configurar sólo `DB_BETA` con `wrangler.beta.toml.example`; no copiar `DB` ni secretos productivos.
3. Ejecutar sólo `migraciones_beta/006_overdrive_beta.sql` en esa D1. No ejecutar 001–005 en `DB_BETA`.
4. Publicar el contenido de `site/` en un Pages Preview aislado.
5. Probar con las sesiones sintéticas visibles en la UI; no invitar contactos reales.
6. Mantener pagos, correo, WhatsApp y llamadas desactivados.

La migración no debe ejecutarse contra la D1 productiva. El rollback de beta consiste en retirar el deployment Preview y eliminar/recrear la D1 beta; producción queda fuera del paquete.

