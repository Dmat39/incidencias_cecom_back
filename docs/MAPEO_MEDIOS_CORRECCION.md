# PLAN DE CORRECCIÓN DEL CATÁLOGO DE MEDIOS

**Estado:** 🟡 PLAN DEFINIDO — pendiente 1 decisión (§6) y de ejecutar
**Fecha:** 2026-09-08
**BD medida:** `postgresql://localhost:5432/incidencias_cecom` — **149 542 incidencias**
**Evidencia previa:** `SISTEMA ANTIGUO DE INCIDENCIAS/cecom-incidence/docs/COMPARATIVA_CODIGOS_ANTIGUO_VS_NUEVO.md`

> ✅ Ya aplicado: medio 9 renombrado a `Botón de Pánico` (2026-09-08).
> ⬜ El resto **no se ha ejecutado**.

---

## 1. CATÁLOGO OBJETIVO

Seis medios, ni uno más.

| # | Medio | Código | Sale de | ¿Cambia el código? |
|---|---|---|---|---|
| 1 | **Incidencias de campo** | `R` | medio 1 (*Digitación*) | ❌ ya era `R` |
| 2 | **Incidencias de la central** | `C` | medio 2 (*Radio / cámaras*) | ⚠️ `G` → `C` |
| 3 | **Telefonía** | `T` | medio 4 (*Llamada fija*) | ⚠️ `C` → `T` |
| 4 | **WhatsApp** | `W` | medio 8 | ⚠️ `WA` → `W` |
| 5 | **Botón de Pánico** | `BP` | medio 9 | ✅ hecho |
| 6 | **Ojo Vigilante** | `OV` | — *(nuevo, id 10)* | nace limpio |
| — | ~~Transporte~~ (medio 3) | ~~`T`~~ | **se elimina** | libera la `T` |

**Hay una rotación de letras**, no un simple renombrado:

```
   medio 3  T  -- se elimina -->  libera T
                                      |
   medio 4  C  --------------------->  T
                |
                +-- libera C
                       |
   medio 2  G  ------->  C

   medio 8  WA ------->  W       (la W estaba libre)
```

Por eso el orden de ejecución importa (§5).

---

## 2. POR QUÉ ESTE MAPEO (evidencia medida)

No es interpretación: se cruzaron las 149 542 incidencias por operador y por tipo de reportante.

| Medio | Evidencia | Conclusión |
|---|---|---|
| 1 | Operadores `DIGITADOR-CENTRO/NORTE/SUR` + `TORRE-OPERACIONES`; reportante **SERENAZGO 27 244** en 2026 | Lo reporta el **personal de campo** |
| 2 | Operadores = las 8 garitas `OP. CAMARAS` (Bayóvar, Zárate, Canto Rey, La Huayrona, Mariscal Cáceres, Santa Elizabeth, Caja de Agua, 10 de Octubre) | Lo detecta **la central** |
| 4 | De 6 053 incidencias de 2026, **5 904 son ANÓNIMO o CIUDADANO**; solo 142 serenazgo | **Llamadas** de la calle → Telefonía |
| 8 | Operadores `OPERADOR-WHATSAPP-*` | WhatsApp |
| 9 | 15 incidencias, todas jun-jul 2026, todas ya con prefijo `BP` | Botón de Pánico |

### 2.1 La G deja de ser un problema

En el análisis anterior el medio 2 figuraba como *"mezclado"*: 12 891 incidencias de cámaras contra 36 624 de radio, sin forma fiable de separarlas. Se planteaba una migración de riesgo sobre 56 311 filas.

**Con el criterio "incidencias encontradas por la central" esa mezcla desaparece:** las cámaras y la torre de operaciones son ambas *la central*. No estaba mezclado, estaba mal nombrado.

→ **No hay que reclasificar ninguna incidencia.** Se elimina la única migración de datos de riesgo que quedaba.

---

## 3. RIESGOS MEDIDOS

### 3.1 🟢 La central toma la `C` — SIN RIESGO

`seq_incidencia_C_2026` va por **6 207**. Los códigos `C2026…` existentes ocupan los números **1–6 207** (generados por esa secuencia) y luego **32 337–40 865** (heredados de la migración).

Consulta ejecutada: **0 códigos `C2026` entre 6 208 y 20 000.**

La central genera ~11 200/año. Quedan ~4 meses de 2026, así que la secuencia llegaría a ~9 900: muy lejos de 32 337. Y en 2027 nace `seq_incidencia_C_2027` desde 1, sin ningún código heredado con el que chocar.

**Conclusión: no hay colisión, ni ahora ni después.**

### 3.2 🟠 Telefonía toma la `T` — HAY QUE RESEMBRAR LA SECUENCIA

`seq_incidencia_T_2026` va por **27**, pero en 2026 conviven dos familias de códigos `T`:

| Familia | Dígitos | Cantidad | Rango |
|---|---|---|---|
| Heredada de la migración | 6 | 590 | `T2026000001` … `T2026000593` |
| Generada por el sistema nuevo | 5 | 27 | `T202600001` … `T202600027` |

Si telefonía arranca desde 28, sus códigos (`T202600028`…) tendrían **el mismo número lógico** que 563 códigos heredados (`T2026000028`…). No revienta el `UNIQUE` —son cadenas distintas— pero para un operador que teclea *"la T 28 de 2026"* **son el mismo código**.

**Mitigación (una línea):** adelantar la secuencia por encima del máximo heredado antes de conmutar.

```sql
SELECT setval('seq_incidencia_T_2026', 600, true);   -- máximo heredado = 593
```

Así el primer código de telefonía es `T202600601` y no se solapa con nada.

### 3.3 🟢 WhatsApp toma la `W` — SIN RIESGO

No existe ningún código que empiece por `W` seguido de dígito: los actuales son `WA…`, que es otro prefijo. Nace `seq_incidencia_W_2026` desde 1 → `W2026000001`.

### 3.4 🟠 Ambigüedad dentro de 2026 — INEVITABLE, PERO ACOTADA

Los códigos ya emitidos **no se reescriben nunca**. Consecuencia: dentro de 2026 un mismo prefijo significa dos cosas según cuándo se creó la incidencia.

| Prefijo | Antes del cambio | Después del cambio |
|---|---|---|
| `C2026…` | Llamadas (nº 1–6 207) | Central (nº ~6 208 en adelante) |
| `T2026…` | Transporte heredado (nº 1–593) | Telefonía (nº 601 en adelante) |
| `WA2026…` → `W2026…` | WhatsApp | WhatsApp |
| `G2026…` | Central | *(deja de emitirse)* |

**Desde el 1 de enero de 2027 esto desaparece:** las secuencias son anuales y ya no habrá códigos heredados con los que convivir. Cada prefijo significará una sola cosa.

**Regla permanente:** ningún reporte debe agrupar por la primera letra del código; siempre por `medioId`. Hoy ya hay un **36,9 %** de incidencias cuyo prefijo no corresponde a su `medioId`, porque editar el medio nunca regeneró el código.

---

## 4. QUÉ HAY QUE TOCAR EN EL CÓDIGO

### 4.1 🔴 BLOQUEANTE — `PREFIJOS` está hardcodeado

`src/incidencias/incidencias.service.ts:31`

```ts
const PREFIJOS: Record<number, string> = { 1:'R', 2:'G', 3:'T', 4:'C', 7:'R', 8:'WA', 9:'BP' };
const prefijo = medioId ? (PREFIJOS[medioId] ?? 'I') : 'I';   // línea 486
```

**Si se cambian los códigos en la BD sin tocar esto, no cambia nada: se seguirán emitiendo `G`, `C` y `WA` como hasta ahora.** Y Ojo Vigilante, al no estar en la lista, emitiría prefijo **`I`**.

*Ya ocurrió:* `seq_incidencia_I_2026` va por **9** con 0 filas de prefijo `I`.

**Corrección:** leer el prefijo de `medio_reportes.codigo`. La columna ya existe (`schema.prisma:16`) y ya está poblada. Con eso, crear o renombrar un medio desde el panel basta, sin volver a tocar código nunca más. Eliminar de paso `PREFIJOS[7]` (el medio 7 no existe).

### 4.2 Sincronizar el seed

`prisma/seed.ts:9-41` siembra las descripciones y códigos viejos. Debe quedar idéntico al catálogo final, con Ojo Vigilante y sin Transporte.

### 4.3 Ya resuelto

- ✅ `PANICO_MEDIO_ID` → `9`, y el módulo de pánico ya genera `codigoIncidencia` con prefijo `BP`.
- ✅ Cambiar el medio al editar una incidencia queda restringido a `admin` (`PATCH /incidencias/:id` y `/:id/atencion`).

---

## 5. ORDEN DE EJECUCIÓN

El orden importa porque las letras rotan: hay que liberar la `T` antes de asignarla, y la `C` antes de reasignarla.

```
0.  pg_dump de respaldo: medio_reportes + incidencias(id, medioId, codigoIncidencia)
1.  Arreglar PREFIJOS (leer de medio_reportes.codigo)   <- ANTES de tocar la BD
2.  Mover las 21 incidencias del medio 3 ................ ver §6
3.  DELETE medio 3 (Transporte) ......................... libera la T
4.  medio 4: codigo C -> T, descripcion -> 'Telefonía' .. libera la C
5.  medio 2: codigo G -> C, descripcion -> 'Incidencias de la central'
6.  medio 1: descripcion -> 'Incidencias de campo' ...... (código R sin cambio)
7.  medio 8: codigo WA -> W
8.  INSERT medio 10: codigo OV, 'Ojo Vigilante'
9.  SELECT setval('seq_incidencia_T_2026', 600, true) ... evita los duplicados lógicos
10. Sincronizar prisma/seed.ts
11. Verificar con §7
```

`medio_reportes` no tiene índice único en `codigo` (solo la PK en `id`), así que la rotación no rompe ninguna restricción. Aun así conviene ejecutar los pasos 2-8 en una sola transacción.

---

## 6. ⬜ ÚNICA DECISIÓN PENDIENTE

**¿A qué medio pasan las 21 incidencias de Transporte antes de borrarlo?**

Son 21 filas de jun-jul 2026, con códigos `T2026000xxx`. No hay operadores ni ninguna otra FK apuntando al medio 3, así que solo hay que reasignar esas 21.

| Opción | A favor | En contra |
|---|---|---|
| **A. A Telefonía** (medio 4, que hereda la `T`) | Sus códigos ya empiezan por `T`, el prefijo cuadraría con el medio | No fueron llamadas telefónicas |
| **B. A Incidencias de campo** (medio 1) | Es lo más parecido: un incidente de transporte lo detecta el personal en la calle | Sus códigos dirán `T` y el medio será `R` |
| **C. A la Central** (medio 2) | — | Lo mismo que B, y menos probable |

Con 21 filas el impacto es despreciable en cualquier caso. **A y B son ambas razonables.**

---

## 7. VERIFICACIÓN

```sql
-- Catálogo final: deben salir exactamente 6 filas
SELECT id, codigo, descripcion, habilitado FROM medio_reportes ORDER BY id;

-- Ninguna incidencia debe quedar apuntando al medio 3
SELECT count(*) FROM incidencias WHERE "medioId" = 3;              -- esperado: 0

-- El total no puede cambiar
SELECT count(*) FROM incidencias;                                  -- esperado: 149 542

-- Sin códigos nulos
SELECT count(*) FROM incidencias WHERE "codigoIncidencia" IS NULL; -- esperado: 0

-- Estado de las secuencias (T debe quedar en 600)
SELECT sequencename, last_value FROM pg_sequences
WHERE sequencename LIKE 'seq_incidencia%' ORDER BY 1;

-- Tras crear una incidencia de prueba por medio, confirmar el prefijo
SELECT m.descripcion, m.codigo, i."codigoIncidencia"
FROM incidencias i JOIN medio_reportes m ON m.id = i."medioId"
ORDER BY i.id DESC LIMIT 10;
```

---

## 8. RESUMEN

| | |
|---|---|
| Incidencias reclasificadas | **21** (solo las de Transporte) |
| Códigos históricos reescritos | **0** |
| Medios que cambian de letra | 3 (`G→C`, `C→T`, `WA→W`) |
| Medios nuevos | 1 (Ojo Vigilante) |
| Medios eliminados | 1 (Transporte) |
| Riesgo de colisión de códigos | Ninguno, tras resembrar `seq_incidencia_T_2026` |
| Bloqueante técnico | Arreglar `PREFIJOS` antes que nada |
