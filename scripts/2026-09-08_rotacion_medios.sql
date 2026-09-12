-- ============================================================================
-- ROTACIÓN DEL CATÁLOGO DE MEDIOS  ·  2026-09-08
-- ----------------------------------------------------------------------------
-- Deja el catálogo en 6 medios:
--   R  Incidencias de campo      (sin cambio de letra)
--   C  Incidencias de la central (antes G)
--   T  Telefonía                 (antes C · "Llamada fija")
--   WA WhatsApp                  (sin cambios)
--   BPD Botón de Pánico Digital  (antes BP · 'Boletín / Prensa')
--   OV Ojo Vigilante             (nuevo)
-- y elimina Transporte, cuyas 21 incidencias pasan a Telefonía.
--
-- REQUISITO PREVIO: desplegar el backend con generarCodigo() leyendo el
-- prefijo de medio_reportes.codigo. Sin ese cambio este script es INERTE:
-- el sistema seguiría emitiendo G, C y WA como hasta ahora.
--
-- NO reescribe ningún código ya emitido. Solo 21 incidencias cambian de medio.
--
-- Antes de ejecutar, respaldar:
--   pg_dump -t medio_reportes --data-only --column-inserts > backup_medios.sql
--   \copy (SELECT id,"medioId","codigoIncidencia" FROM incidencias) TO 'bk.csv' CSV HEADER
--
-- Ejecutar con:
--   psql -h HOST -U USER -d incidencias_cecom -v ON_ERROR_STOP=1 -f este_archivo.sql
-- ============================================================================

BEGIN;

-- ── Estado inicial (para el log) ────────────────────────────────────────────
SELECT id, codigo, descripcion FROM medio_reportes ORDER BY id;

-- ── 1) Las 21 de Transporte pasan a Telefonía ───────────────────────────────
-- Van al medio 4 porque sus códigos ya empiezan por T, que es justo la letra
-- que el medio 4 hereda: así esas 21 quedan alineadas en vez de sumar ruido.
UPDATE incidencias SET "medioId" = 4 WHERE "medioId" = 3;

-- ── 2) Borrar Transporte → libera la letra T ────────────────────────────────
-- No hay operadores ni otras FK apuntando al medio 3 (verificado).
DELETE FROM medio_reportes WHERE id = 3 AND codigo = 'T';

-- ── 3) Telefonía toma la T → libera la C ────────────────────────────────────
UPDATE medio_reportes
   SET codigo = 'T', descripcion = 'Telefonía', "updatedAt" = now()
 WHERE id = 4 AND codigo = 'C';

-- ── 4) La central toma la C ─────────────────────────────────────────────────
UPDATE medio_reportes
   SET codigo = 'C', descripcion = 'Incidencias de la central', "updatedAt" = now()
 WHERE id = 2 AND codigo = 'G';

-- ── 5) Campo conserva la R, solo cambia el nombre ───────────────────────────
UPDATE medio_reportes
   SET descripcion = 'Incidencias de campo', "updatedAt" = now()
 WHERE id = 1 AND codigo = 'R';

-- ── 6) WhatsApp NO se toca ──────────────────────────────────────────────────
-- Se evaluó pasarlo de WA a W y se descartó: cambiar esa letra no aporta nada
-- y solo añadiría un segundo prefijo para el mismo medio dentro de 2026.
-- WhatsApp conserva WA y sus 16 489 códigos siguen siendo los únicos suyos.

-- ── 6b) Botón de Pánico Digital ────────────────────────────────
-- El medio 9 estaba etiquetado 'Boletín / Prensa', que nunca fue lo que era.
-- Pasa a BPD. Sus 15 incidencias reales conservan sus códigos BP2026000xx
-- (los códigos emitidos no se reescriben); desde ahora se emite BPD.
UPDATE medio_reportes
   SET codigo = 'BPD', descripcion = 'Botón de Pánico Digital', "updatedAt" = now()
 WHERE id = 9 AND codigo = 'BP';

-- ── 7) Ojo Vigilante (nuevo) ────────────────────────────────────────────────
INSERT INTO medio_reportes (id, codigo, descripcion, habilitado, numeracion, "createdAt", "updatedAt")
VALUES (10, 'OV', 'Ojo Vigilante', true, 10, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Reajustar la secuencia del id por si se insertan medios desde el panel
SELECT setval(
  pg_get_serial_sequence('medio_reportes', 'id'),
  (SELECT max(id) FROM medio_reportes),
  true
);

-- ── 8) Adelantar la secuencia de la T ───────────────────────────────────────
-- En 2026 conviven códigos T heredados de 6 dígitos (T2026000001..T2026000593)
-- con los generados por el sistema nuevo de 5 (T202600001..T202600027).
-- Si Telefonía arrancara en 28, sus códigos tendrían el MISMO número lógico
-- que 563 heredados: distintos como cadena, idénticos para quien los teclea.
-- Arrancando en 601 no se solapa con ninguno.
-- Ojo: el nombre lleva mayúscula y la secuencia se creó entrecomillada, así
-- que hay que citarla dentro del literal o Postgres la busca en minúsculas.
-- El CREATE la cubre por si aún no existiera (arrancaría en 1 y volvería a
-- solaparse con los heredados).
DO $$
BEGIN
  EXECUTE 'CREATE SEQUENCE IF NOT EXISTS "seq_incidencia_T_2026" START 1';
  PERFORM setval('"seq_incidencia_T_2026"', 600, true);
END $$;

-- ── Estado final ────────────────────────────────────────────────────────────
SELECT id, codigo, descripcion, habilitado FROM medio_reportes ORDER BY id;

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (ejecutar después del COMMIT)
-- ============================================================================
-- SELECT id, codigo, descripcion FROM medio_reportes ORDER BY id;   -- 6 filas
-- SELECT count(*) FROM incidencias WHERE "medioId" = 3;             -- 0
-- SELECT count(*) FROM incidencias;                                 -- 149 542
-- SELECT count(*) FROM incidencias WHERE "codigoIncidencia" IS NULL;-- 0
-- SELECT sequencename, last_value FROM pg_sequences
--   WHERE sequencename LIKE 'seq_incidencia%' ORDER BY 1;           -- T_2026 = 600
