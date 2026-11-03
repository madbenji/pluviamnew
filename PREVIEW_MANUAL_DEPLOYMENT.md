# Preview aislado · bloqueo y procedimiento

## Estado verificado

En el entorno local no existe `wrangler`, `npx` ni una sesión OAuth/configuración Wrangler detectable. Por tanto no se pudo ejecutar `wrangler whoami`, comprobar cuenta/proyecto ni crear una URL Preview real. No se intentó instalar una herramienta ni desplegar por una ruta alternativa.

## Paquete correcto para Pages

El archivo de despliegue manual debe contener únicamente el contenido de `site/` en la raíz del ZIP. El paquete de código completo incluye pruebas, documentación histórica y artefactos no destinados a Pages.

Antes de subirlo en Cloudflare Dashboard:

1. Crear o seleccionar un proyecto Pages de Preview separado del proyecto productivo.
2. Confirmar que el despliegue corresponde a un entorno beta privado y que no reemplaza Production.
3. Crear una D1 nueva, físicamente separada, por ejemplo `pluviam-beta-staging`.
4. Ejecutar `migraciones/006_overdrive_beta.sql` sólo en esa D1.
5. Configurar el binding `DB_BETA` apuntando a esa D1. No agregar el binding `DB` productivo al Preview.
6. Configurar `BETA_MODE=true` y `BETA_ISOLATED=true`; mantener ausentes los secretos de pagos, correo, WhatsApp, Retell y IA.
7. Subir el ZIP de contenido de `site/` y comprobar las rutas `/colaborar/`, `/colaborar/mi-beehive/`, `/store/` y `/admin/`.
8. Verificar `GET /api/beta/status` antes de cualquier prueba: `binding=DB_BETA`, `productionBindingUsed=false`, `paymentsEnabled=false` y `emailsEnabled=false`.

No copiar D1 productiva, credenciales, variables de producción ni datos reales. Si el proyecto Pages o la D1 no pueden identificarse inequívocamente, detenerse.

