-- Ejecutar una vez únicamente después del respaldo y la revisión de movimientos BBVA existentes.
-- Preflight antes de crear índice:
-- SELECT provider_payment_id, COUNT(*) AS n FROM payment_attempts WHERE provider='bbva' AND state='paid' AND provider_payment_id IS NOT NULL GROUP BY provider_payment_id HAVING n>1;
-- Si devuelve filas: STOP, investigar duplicaciones antes de esta migración.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bbva_evidencia_pagada_unica
ON payment_attempts(provider_payment_id)
WHERE provider='bbva' AND state='paid' AND provider_payment_id IS NOT NULL;
