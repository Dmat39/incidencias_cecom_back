# PENDIENTE — Incidencias duplicadas desde una alerta de pánico

**Estado:** ⬜ Analizado, sin implementar
**Fecha del análisis:** 2026-09-12
**Prioridad:** media — no rompe nada hoy, pero permite datos duplicados
**Doc relacionado:** [`MAPEO_MEDIOS_CORRECCION.md`](./MAPEO_MEDIOS_CORRECCION.md)

---

## 1. EL PROBLEMA



Una misma alerta del botón de pánico puede terminar con **dos o más incidencias** en CECOM.

La protección actual es **solo visual**: el botón *"Crear incidencia"* se oculta si la pantalla detectó que la alerta ya tiene una. No hay ninguna validación en el backend por el camino que se usa de verdad.

### 1.1 Cómo se produce

```
10:00:00  Operador A abre la alerta #123  ->  su pantalla ve el boton
10:00:02  Operador B abre la alerta #123  ->  su pantalla tambien lo ve

10:00:10  A pulsa "Crear incidencia"  ->  se crea BPD2026000005   OK
          (la pantalla de B no se entera, sigue mostrando el boton)

10:00:15  B pulsa "Crear incidencia"  ->  se crea BPD2026000006   DUPLICADO
```

### 1.2 Por qué el backend no lo frena

Hay **dos** caminos para crear una incidencia desde una alerta, y solo uno valida:

| Camino | Endpoint | ¿Valida duplicados? | ¿Se usa? |
|---|---|---|---|
| Endpoint de pánico | `POST /panico-app/alertas/:id/incidencia` | ✅ Sí (`ConflictException`) | ❌ **No** |
| Redirección al formulario | `POST /incidencias` | ❌ **No** | ✅ Sí |

El botón llama a `confirmarCrearIncidencia()` (`alertas-sjl/page.tsx:302`), que marca la alerta como FINALIZADA y luego hace `irACrearIncidencia()` → redirige a `/incidencias/nueva` con los datos prellenados. Se guarda con `POST /incidencias`, un endpoint genérico que no sabe nada de alertas.

> El hook `useCrearIncidencia()` (`hooks/usePanicoAlertas.ts:184`) **sí** llama al endpoint de pánico, pero **ningún componente lo usa**. Quedó huérfano: alguien empezó por ahí, vio que hacía falta el formulario completo, y cambió a la redirección.

---

## 2. PROBLEMA SECUNDARIO — el filtro de más

La consulta que detecta si una alerta ya tiene incidencia (`panico-app.service.ts:244`) exige **dos** condiciones:

```ts
where: {
  medioId: this.MEDIO_ID,                                          // <- de mas
  OR: alertaIds.map((id) => ({ descripcion: { contains: `ID Alerta App: #${id}` } })),
}
```

La marca `ID Alerta App: #123` ya es única por sí sola. El `medioId` no aporta nada y abre este caso:

```
1. Se crea la incidencia de la alerta #123 con medio Boton de Panico Digital
2. Un admin le cambia el medio a Radio (por error o criterio)
3. La consulta ya no la encuentra (su medio ya no es 9)
4. La alerta vuelve a mostrar "Crear incidencia"
5. Alguien lo pulsa -> segunda incidencia
```

**Incoherencia:** el endpoint de pánico valida **solo por la marca**, sin mirar el medio (`panico-app.service.ts:104-111`). El listado es el único que pone la condición extra.

---

## 3. OPCIONES EVALUADAS

| | A. Usar el endpoint de pánico | B. Validar la marca en `POST /incidencias` |
|---|---|---|
| Trabajo | Rehacer el flujo | ~6 líneas |
| Qué toca | Front **y** back | Solo **back** |
| Funcionalidad | ❌ Se pierde el formulario | ✅ Se mantiene todo |
| Riesgo | Medio | Bajo |

**La A se descarta.** El endpoint solo acepta `tipoCasoId`, `subTipoCasoId` y `operadorId`; todo lo demás lo rellena con valores fijos del `.env`. El operador perdería poder ajustar descripción, dirección, severidad, evidencias y serenos. Es el callejón que ya se recorrió una vez (de ahí el hook huérfano).

---

## 4. SOLUCIÓN RECOMENDADA (opción B)

Dos cambios, ambos en el backend, ambos en el mismo commit. **El front no se toca.**

### 4.1 Validar la marca al crear

En `incidencias.service.ts`, dentro de `create()`, antes del `INSERT`:

```
1. Buscar en dto.descripcion el patron /ID Alerta App: #(\d+)/
2. Si aparece, buscar si ya existe otra incidencia con esa misma marca
3. Si existe -> ConflictException con el codigo de la que ya esta
   ("Ya existe la incidencia BPD2026000005 para la alerta #123")
4. Si no existe -> crear normal
```

Por qué esto es lo correcto:

- **Cierra los dos problemas de golpe.** Aunque el botón reaparezca por un cambio de medio, el backend rechaza el duplicado.
- **Es una red, no un candado visual.** Protege sin importar por dónde entre la petición.
- **El mensaje nombra el código que ya existe**, así el operador puede ir a buscarlo en vez de quedarse a ciegas.

### 4.2 Quitar el filtro de más

En `panico-app.service.ts:244`, borrar la línea `medioId: this.MEDIO_ID` de la consulta del listado, para que coincida con el criterio que ya usa el endpoint de pánico.

---

## 5. LIMITACIÓN CONOCIDA

La validación del §4.1 deja una **ventana de milisegundos** entre la comprobación y el `INSERT`. Si dos peticiones llegan exactamente a la vez, ambas podrían pasar.

Pasar de una ventana de **minutos** (la actual, que depende de cuándo cada pantalla cargó) a una de **milisegundos** resuelve el problema en la práctica a esta escala.

### 5.1 La solución definitiva, si algún día hace falta

Sacar la marca del texto libre y darle una columna propia con restricción de unicidad en la base de datos:

```prisma
model Incidencia {
  // ...
  panicAlertId Int? @unique
}
```

Con eso es Postgres quien garantiza que no haya dos incidencias para la misma alerta, sin ventanas de carrera. Implica migración de schema y rellenar la columna en el histórico a partir de la marca del texto, así que solo vale la pena si el volumen de alertas crece o si aparecen duplicados reales.

---

## 6. VERIFICACIÓN

```sql
-- ¿Hay ya duplicados? (debe devolver 0 filas)
SELECT substring(descripcion from 'ID Alerta App: #([0-9]+)') AS alerta,
       count(*), array_agg("codigoIncidencia")
FROM incidencias
WHERE descripcion LIKE '%ID Alerta App: #%'
GROUP BY 1 HAVING count(*) > 1;

-- Incidencias nacidas de una alerta, y con qué medio quedaron
SELECT "medioId", count(*) FROM incidencias
WHERE descripcion LIKE '%ID Alerta App: #%' GROUP BY 1;
```

> Medido el 2026-09-12 en la BD **local**: 0 incidencias con la marca. Ese flujo nunca se había usado ahí. **Falta correrlo en producción**: si aparece alguna con `medioId` distinto de 9, su alerta ya está mostrando el botón otra vez.

---

## 7. ARCHIVOS IMPLICADOS

| Archivo | Qué |
|---|---|
| `src/incidencias/incidencias.service.ts` | `create()` — añadir la validación (§4.1) |
| `src/panico-app/panico-app.service.ts:244` | quitar `medioId` del listado (§4.2) |
| `src/panico-app/panico-app.service.ts:104` | la validación que **sí** existe, como referencia |
| `incidencias_cecom_front/src/app/(dashboard)/alertas-sjl/page.tsx:302` | `confirmarCrearIncidencia()` — el flujo actual |
| `incidencias_cecom_front/src/hooks/usePanicoAlertas.ts:184` | `useCrearIncidencia()` — hook huérfano, candidato a borrar |
