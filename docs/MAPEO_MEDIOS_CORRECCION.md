# PLAN DE CORRECCIÓN DEL CATÁLOGO DE MEDIOS

**Estado:** 🟢 APLICADO EN LOCAL — pendiente de desplegar al servidor (§5)
**Fecha:** 2026-09-08 · *última actualización: 2026-09-12*
**BD medida:** `postgresql://localhost:5432/incidencias_cecom` — **149 542 incidencias**
**Evidencia previa:** `SISTEMA ANTIGUO DE INCIDENCIAS/cecom-incidence/docs/COMPARATIVA_CODIGOS_ANTIGUO_VS_NUEVO.md`

> ✅ **Ejecutado y verificado en la BD local** el 2026-09-08 (medio 9 ajustado a `BPD` el 2026-09-12).
> ⬜ **Pendiente en el servidor**: requiere el backend desplegado + `scripts/2026-09-08_rotacion_medios.sql`.

---

## 1. CATÁLOGO OBJETIVO

Seis medios, ni uno más.

| # | Medio | Código | Sale de | ¿Cambia el código? |
|---|---|---|---|---|
| 1 | **Incidencias de campo** | `R` | medio 1 (*Digitación*) | ❌ ya era `R` |
| 2 | **Incidencias de la central** | `C` | medio 2 (*Radio / cámaras*) | ⚠️ `G` → `C` |
| 3 | **Telefonía** | `T` | medio 4 (*Llamada fija*) | ⚠️ `C` → `T` |
| 4 | **WhatsApp** | `WA` | medio 8 | ❌ se queda igual |
| 5 | **Botón de Pánico Digital** | `BPD` | medio 9 (*Boletín / Prensa*) | ⚠️ `BP` → `BPD` |
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
| 9 | 15 incidencias **reales** (erradicación de comercio informal, patrullaje, retiro de letreros), jun-jul 2026 | Nunca fue *Boletín / Prensa* |

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

### 3.3 ⬜ WhatsApp se queda con `WA` — DESCARTADO

Se evaluó pasarlo a `W` (técnicamente sin riesgo: no existe ningún código `W`+dígito) y **se descartó**: cambiar esa letra no aporta nada y solo añadiría un segundo prefijo para el mismo medio dentro de 2026. WhatsApp conserva `WA`.

> Queda 1 código `W202600001` de una incidencia de prueba creada antes de revertirlo. No se reescribe; la secuencia `seq_incidencia_W_2026` queda inerte.

### 3.3b 🟢 Botón de Pánico pasa a `BPD` — SIN RIESGO

No existe ningún código `BPD…`, así que nace `seq_incidencia_BPD_2026` desde 1 → `BPD2026000001`.

Las 15 incidencias reales del medio 9 conservan sus `BP202600001`–`BP202600021`: **los códigos emitidos no se reescriben nunca**. El prefijo `BP` simplemente deja de emitirse.

> Hay además 34 códigos `BP…` que pertenecen a otros medios (28 al 1, 5 al 2, 1 al 4), de ediciones del medio posteriores al alta. Contar botones de pánico por la letra del código daría 49 en vez de 15.

### 3.4 🟠 Ambigüedad dentro de 2026 — INEVITABLE, PERO ACOTADA

Los códigos ya emitidos **no se reescriben nunca**. Consecuencia: dentro de 2026 un mismo prefijo significa dos cosas según cuándo se creó la incidencia.

| Prefijo | Antes del cambio | Después del cambio |
|---|---|---|
| `C2026…` | Llamadas (nº 1–6 207) | Central (nº ~6 208 en adelante) |
| `T2026…` | Transporte heredado (nº 1–593) | Telefonía (nº 601 en adelante) |
| `WA2026…` | WhatsApp | WhatsApp *(sin cambio)* |
| `G2026…` | Central | *(deja de emitirse)* |
| `BP2026…` | Botón de Pánico | *(deja de emitirse; ahora `BPD`)* |

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

- ✅ `PANICO_MEDIO_ID` → `9`, y el módulo de pánico ya genera `codigoIncidencia` (prefijo `BPD`). Antes creaba la incidencia **sin código**: el campo es `String? @unique`, Postgres acepta N nulos y la alerta se guardaba muda sin error.
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
6b. medio 9: codigo BP -> BPD, 'Botón de Pánico Digital'
7.  INSERT medio 10: codigo OV, 'Ojo Vigilante'
8.  setval de seq_incidencia_T_2026 a 600 ............... evita los duplicados lógicos
9.  Sincronizar prisma/seed.ts
10. Verificar con §7
```

`medio_reportes` no tiene índice único en `codigo` (solo la PK en `id`), así que la rotación no rompe ninguna restricción. Aun así conviene ejecutar los pasos 2-8 en una sola transacción.

---

## 6. ✅ DECISIONES TOMADAS

| Decisión | Resultado |
|---|---|
| Las 21 incidencias de Transporte | → **Telefonía** (medio 4). Sus códigos ya empezaban por `T`, la letra que hereda Telefonía, así que quedan alineadas. |
| La G mezclada (56 311) | **No se parte.** Bajo el criterio *"lo encontró la central"*, cámaras y torre caen ambas ahí legítimamente. Cero filas reclasificadas. |
| WhatsApp `WA` → `W` | **Descartado.** No aporta nada y añadiría un segundo prefijo para el mismo medio. |
| Letra de la Central | `C`, aceptando la ambigüedad acotada de 2026 (§3.4) en vez de una letra nueva sin deuda (`CE`). |
| Botón de Pánico | `BP` → **`BPD`**, *Botón de Pánico Digital*. |

### 6.1 ⚠️ Si algún día se reescribe el histórico

`nextval` **no mira la tabla**: solo incrementa su propio contador. Reescribir códigos a un prefijo sin resembrar su secuencia no falla ese día — falla semanas después, cuando la secuencia alcance el rango pisado y el operador reciba *"Ya existe una incidencia con ese código"*.

Después de **cualquier** reescritura, en la misma transacción:

```sql
SELECT setval('"seq_incidencia_T_2026"',
  (SELECT max((substring(substring("codigoIncidencia" from '[0-9]+$') from 5))::bigint)
     FROM incidencias WHERE "codigoIncidencia" ~ '^T2026[0-9]+$') + 1,
  true);
```

Las **comillas dobles dentro del literal** son obligatorias: sin ellas Postgres busca el nombre en minúsculas y falla.

Normalizar también el relleno: hoy conviven códigos de 5 y 6 dígitos (`T202600028` y `T2026000028` son cadenas distintas con el mismo número lógico; ya hay 38 pares así en 2026). Reescribir sin unificar el ancho multiplica el problema.

Y el límite que ningún script resuelve: los códigos emitidos están en oficios, actas y partes fuera del sistema. Reescribirlos rompe esas referencias.

---

## 7. VERIFICACIÓN

```sql
-- Catálogo final: deben salir exactamente 6 filas
SELECT id, codigo, descripcion, habilitado FROM medio_reportes ORDER BY id;

-- Ninguna incidencia debe quedar apuntando al medio 3
SELECT count(*) FROM incidencias WHERE "medioId" = 3;              -- esperado: 0

-- El total no puede cambiar (149 542 al momento del análisis, + las creadas después)
SELECT count(*) FROM incidencias;

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
| Incidencias reclasificadas | **21** (solo las de Transporte → Telefonía) |
| Códigos históricos reescritos | **0** |
| Medios que cambian de letra | 3 (`G→C` central, `C→T` telefonía, `BP→BPD` pánico) |
| Medios que solo cambian de nombre | 2 (campo, y WhatsApp sin tocar) |
| Medios nuevos | 1 (Ojo Vigilante `OV`) |
| Medios eliminados | 1 (Transporte) |
| Riesgo de colisión de códigos | Ninguno, tras resembrar `seq_incidencia_T_2026` |
| Bloqueante técnico | Arreglar `PREFIJOS` antes que nada — **ya hecho** |

### 8.1 Catálogo resultante

| id | Código | Medio | Antes |
|---|---|---|---|
| 1 | `R` | Incidencias de campo | `R` · *Digitación* |
| 2 | `C` | Incidencias de la central | `G` · *Radio / cámaras* |
| 4 | `T` | Telefonía | `C` · *Llamada fija* |
| 8 | `WA` | WhatsApp | `WA` · *WhatsApp* |
| 9 | `BPD` | Botón de Pánico Digital | `BP` · *Boletín / Prensa* |
| 10 | `OV` | Ojo Vigilante | *no existía* |

### 8.2 Verificado en local (2026-09-08)

Incidencias de prueba creadas tras la rotación, todas con el prefijo correcto:

```
OV202600001   Ojo Vigilante   <- la prueba clave: ese medio no existía,
                                 con el PREFIJOS viejo habría salido 'I'
T202600601     Telefonía      <- arrancó en 601, el setval funcionó
C202606208/09  Central        <- continúa desde 6 208, sin colisión
BP202600022    Pánico         <- antes del cambio a BPD
```

> Esas 6 filas (ids 149710–149715) son datos de prueba en la BD de producción. Conviene borrarlas.

### 8.3 Cómo leer un código antiguo

El prefijo refleja el medio que tenía la incidencia **al momento de crearse**, con el significado que esa letra tenía **entonces**:

| Prefijo | Si se creó antes del 2026-09-08 | Después |
|---|---|---|
| `R` | Radio / campo | Campo *(igual)* |
| `G` | Central | *ya no se emite* |
| `C` | Llamada fija | Central |
| `T` | Transporte | Telefonía |
| `WA` | WhatsApp | WhatsApp *(igual)* |
| `BP` | Botón de Pánico | *ya no se emite; ahora `BPD`* |

Alineación real medida sobre los 149 542 códigos, antes de la rotación:

| Prefijo | Códigos | Coinciden con su medio | |
|---|---|---|---|
| `R` | 100 835 | 66 071 | 66 % |
| `WA` | 16 489 | 10 950 | 66 % |
| `C` | 14 442 | 6 042 | 42 % |
| `G` | 11 200 | 11 194 | 99,9 % |
| `T` | 6 527 | 21 | **0,3 %** |
| `BP` | 49 | 15 | 31 % |

Los antiguos `C` del medio 4 (6 042) **siguen bien clasificados**: "llamada fija" *es* telefonía, es el mismo medio renombrado. Solo su letra es la vieja.

Los antiguos `T`, en cambio, pertenecen casi todos a campo (3 693) y central (2 811). Ya estaban desalineados antes de la rotación — no lo causó este cambio — pero ahora que la `T` significa Telefonía, *parecen* telefonía sin serlo.

**Por eso, regla permanente: ningún reporte agrupa por la primera letra del código. Siempre por `medioId`.** Revisar `reportes.service.ts:106` y `:237`, que exponen el código en los Excel.
