# Cambios Implementados — CECOM Backend & Frontend
**Fecha:** 2026-05-21  
**Sesión de desarrollo:** Implementación de funcionalidades en panico-backend, incidencias_cecom_back e incidencias_cecom_front

---

## RESUMEN GENERAL

Se implementaron las siguientes funcionalidades en esta sesión:

1. Roles Guard en endpoints de Alertas SJL
2. Sidebar restructurado con módulo "Alertas SJL" colapsable
3. Mapa en Vivo exclusivo para Alertas SJL
4. Sistema de Jurisdicciones por Usuario
5. Sistema de Roles Dinámico (módulos configurables desde BD)

---

## 1. ROLES GUARD EN PANICO-APP CONTROLLER

**Archivo:** `src/panico-app/panico-app.controller.ts`

### Qué se hizo
Se agregaron `RolesGuard` y el decorador `@Roles` a todos los endpoints del módulo de alertas SJL para restringir el acceso solo a roles autorizados.

### Endpoints protegidos con `@Roles('admin', 'supervisor', 'operador')`
- `GET  /panico-app/alertas`
- `POST /panico-app/alertas/:id/incidencia`
- `GET  /panico-app/stats`
- `PATCH /panico-app/alertas/:id/estado`
- `PATCH /panico-app/usuarios/bloquear`
- `PATCH /panico-app/usuarios/:id/desbloquear`
- `GET  /panico-app/usuarios`
- `GET  /panico-app/usuarios/:id/bloqueos`

### Endpoint SIN guard (autenticado por x-api-key)
- `POST /panico-app/webhook/nueva-alerta` — solo valida `PANICO_API_KEY` en el header

### Imports añadidos
```typescript
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
```

---

## 2. MÓDULO "ALERTAS SJL" COLAPSABLE EN SIDEBAR

**Archivo frontend:** `src/components/layout/Sidebar.tsx`  
**Archivo frontend:** `src/components/layout/AuthGuard.tsx`  
**Archivo backend:** `src/auth/constants/role-permissions.ts`

### Qué se hizo
Se reestructuró la barra lateral para que "Alertas SJL" sea un grupo colapsable igual al módulo SVI, con sub-items dentro.

### Sub-items de "Alertas SJL"
| Sub-item | Ruta | Icono |
|---|---|---|
| Incidencias App | `/alertas-sjl` | Smartphone |
| Vecinos App | `/vecinos-app` | Users2 |
| Mapa Alertas | `/alertas-sjl/mapa` | MapPin |

### Cambios en `role-permissions.ts`
- Se agregó el módulo `'alertas'` a la lista `MODULOS`
- Se asignó `'alertas'` a los roles: `admin`, `supervisor`, `operador`
- Se agregó `'metricas'` al rol `supervisor`

### Cambios en `AuthGuard.tsx`
```typescript
'/alertas-sjl': 'alertas',
'/vecinos-app': 'alertas',
'/alertas-sjl/mapa': 'alertas',   // cubierto por prefijo /alertas-sjl/
'/roles': 'usuarios',
```

---

## 3. MAPA EN VIVO DE ALERTAS SJL

### Archivos creados/modificados
| Archivo | Tipo |
|---|---|
| `src/hooks/usePanicoAlertas.ts` | Hook nuevo `usePanicoAlertasMapa` |
| `src/components/mapa/PanicoMapView.tsx` | Componente nuevo |
| `src/app/(dashboard)/alertas-sjl/mapa/page.tsx` | Página nueva |
| `src/app/(dashboard)/layout.tsx` | Añadido fullBleed para `/alertas-sjl/mapa` |

### Hook `usePanicoAlertasMapa`
```typescript
// Obtiene hasta 500 alertas con coordenadas, filtro opcional por fecha
usePanicoAlertasMapa(fecha?: string)
// QueryKey: ['panico', 'mapa', fecha]
// refetchInterval: 30 segundos
```

### Componente `PanicoMapView`
- Acepta `PanicoAlerta[]` (no `Incidencia[]`)
- Marcadores con colores por estado:
  - 🔴 `RECIBIDA` — rojo pulsante (urgente)
  - 🟡 `ATENDIENDO` — ámbar
  - 🟢 `FINALIZADA` — verde
  - ⚫ `FALSA` — gris
- Popup con: nombre, teléfono, dirección, fecha, estado, operador

### Página `/alertas-sjl/mapa`
- Panel izquierdo colapsable con:
  - Filtro de fecha ("Hoy" / "Todas" / fecha específica)
  - Control de capas (toggle por estado)
  - Leyenda
- Mapa en tiempo real: escucha `alerta-panico-nueva` y `alerta-panico-actualizada` via WebSocket

---

## 4. SISTEMA DE JURISDICCIONES POR USUARIO

### Problema resuelto
Algunos operadores solo deben ver alertas de zonas específicas (BAYOVAR, ZARATE, etc.). La detección de zona es automática via GeoJSON + coordenadas GPS de la alerta.

### Jurisdicciones del sistema
- MARISCAL CACERES
- 10 DE OCTUBRE
- BAYOVAR
- SANTA ELIZABETH
- CANTO REY
- ZARATE
- HUAYRONA
- CAJA DE AGUA

### Cambios en el Schema Prisma

**Nueva tabla:** `usuario_jurisdicciones_asignadas`
```prisma
model UsuarioJurisdiccionAsignada {
  usuarioId      Int
  jurisdiccionId Int
  usuario        Usuario      @relation(...)
  jurisdiccion   Jurisdiccion @relation(...)
  @@id([usuarioId, jurisdiccionId])
  @@map("usuario_jurisdicciones_asignadas")
}
```

**Relaciones añadidas:**
- `Usuario` → `jurisdiccionesAsignadas UsuarioJurisdiccionAsignada[]`
- `Jurisdiccion` → `usuariosAsignados UsuarioJurisdiccionAsignada[]`

**Aplicado con:** `npx prisma db push` (sin borrar datos)

### Nuevo endpoint
```
PATCH /usuarios/:id/jurisdicciones
Body: { "jurisdiccionIds": [1, 3, 5] }
Roles: admin, supervisor
```

### Lógica de filtrado (`panico-app.service.ts`)
```
Si usuario tiene jurisdicciones asignadas:
  → Pide 1000 alertas a panico-backend
  → Detecta jurisdicción de cada alerta (GeoJSON + GPS)
  → Filtra solo las de sus zonas
  → Re-pagina en CECOM
Si usuario NO tiene jurisdicciones:
  → Ve TODAS las alertas (comportamiento normal)
```

### Cambios en `auth/me`
Ahora retorna `jurisdiccionesAsignadas: number[]` adicional a los módulos.

### Cambios en el Frontend
| Archivo | Cambio |
|---|---|
| `src/types/index.ts` | Añadido `jurisdiccionesAsignadas?: number[]` a `UsuarioAuth` y nuevo tipo `Jurisdiccion` |
| `src/store/authStore.ts` | Añadido `jurisdiccionesAsignadas: number[]` y `setJurisdicciones()` |
| `src/components/layout/AuthGuard.tsx` | Guarda jurisdicciones del `me()` en el store |
| `src/app/(dashboard)/usuarios/page.tsx` | Nueva columna "Jurisdicciones" en tabla + multi-select en modal editar |

### Endpoint de catálogo
```
GET /catalogos/jurisdicciones
→ Retorna: [{ id, nombre, codigo }] — solo jurisdicciones habilitadas
```

---

## 5. SISTEMA DE ROLES DINÁMICO

### Problema resuelto
Antes los módulos por rol estaban hardcodeados en `role-permissions.ts`. Ahora se gestionan desde la base de datos: un admin puede crear roles nuevos y asignarles cualquier combinación de módulos sin tocar código.

### Tablas involucradas (ya existían en el schema)
```
roles          → Rol (nombre, descripcion)
permisos       → Módulo del sistema (nombre = key, descripcion = label legible)
rol_permisos   → Relación muchos-a-muchos Rol ↔ Permiso
```

### Módulos sembrados en BD (11 módulos)
| Nombre (key) | Descripción visible |
|---|---|
| `dashboard` | Dashboard |
| `incidencias` | Incidencias |
| `alertas` | Alertas SJL |
| `mapa` | Mapa en Vivo |
| `serenos` | Serenos |
| `usuarios` | Usuarios |
| `catalogos` | Catálogos |
| `reportes` | Reportes |
| `metricas` | Métricas |
| `auditoria` | Auditoría |
| `svi` | SVI |

### Asignación inicial de módulos por rol (igual que antes)
| Rol | Módulos |
|---|---|
| admin | Todos los 11 módulos |
| supervisor | dashboard, incidencias, alertas, mapa, usuarios, catalogos, reportes, metricas |
| operador | dashboard, incidencias, alertas, mapa |
| validador | dashboard, incidencias, svi |

### Nuevo módulo backend: `src/roles/`

**Archivos creados:**
- `src/roles/roles.service.ts`
- `src/roles/roles.controller.ts`
- `src/roles/roles.module.ts`

### Endpoints de Roles
| Método | Ruta | Acción | Roles |
|---|---|---|---|
| GET | `/roles` | Lista todos los roles con módulos y conteo de usuarios | admin |
| GET | `/roles/permisos` | Lista los 11 módulos disponibles | admin |
| GET | `/roles/:id` | Detalle de un rol | admin |
| POST | `/roles` | Crea un rol nuevo | admin |
| PATCH | `/roles/:id` | Edita nombre/descripción del rol | admin |
| PATCH | `/roles/:id/permisos` | Reasigna módulos al rol | admin |
| DELETE | `/roles/:id` | Elimina rol (solo si no tiene usuarios) | admin |

### Cambio en `auth/me` — ahora dinámico
**Antes:**
```typescript
// Leía de role-permissions.ts (hardcodeado)
modulosPermitidos: getModulosForRoles(user.roles)
```

**Ahora:**
```typescript
// Lee de la BD: roles → rol_permisos → permisos
const rolesConPermisos = await this.prisma.rol.findMany({
  where: { nombre: { in: user.roles } },
  include: { permisos: { include: { permiso: true } } },
});
// Devuelve unión de módulos de todos los roles del usuario
```

### Registrado en `app.module.ts`
```typescript
import { RolesModule } from './roles/roles.module';
// ...
imports: [..., RolesModule]
```

### Frontend — Página `/roles`

**Archivo:** `src/app/(dashboard)/roles/page.tsx`

**Funcionalidades:**
- Vista en cards: cada card muestra nombre, descripción, badges de módulos (con colores), contador de usuarios asignados
- Botón "Nuevo rol" → modal con:
  - Campo nombre
  - Campo descripción
  - Grid de módulos con toggle (selección múltiple)
- Botón editar → mismo modal pre-llenado
- Botón eliminar → modal de confirmación (desactivado si el rol tiene usuarios)

**Colores de módulos en la UI:**
- Dashboard → azul
- Incidencias → rojo
- Alertas SJL → naranja
- Mapa en Vivo → teal
- Serenos → índigo
- Usuarios → púrpura
- Catálogos → amarillo
- Reportes → rosa
- Métricas → cyan
- Auditoría → gris
- SVI → verde

**Visible en:** Sidebar → ítem "Roles" con ícono `ShieldCheck`, visible solo para módulo `usuarios` (admin/supervisor)

---

## 6. SEED ACTUALIZADO

**Archivo:** `prisma/seed.ts`

Se añadió al seed existente (sin borrar datos):
- Creación de 11 registros en tabla `permisos` via `upsert` (seguro de correr múltiples veces)
- Creación de registros en `rol_permisos` via `upsert`
- El rol `validador` ahora se guarda en variable para poder asignarle permisos

**Comando para correr el seed:**
```bash
npm run prisma:seed
```

---

## 7. NOTIFICACIONES EN TIEMPO REAL (WebSocket)

### GlobalPanicoNotifier
**Archivo:** `src/components/layout/GlobalPanicoNotifier.tsx` (nuevo)  
**Montado en:** `src/app/(dashboard)/layout.tsx`

Escucha `alerta-panico-nueva` desde **cualquier página** del dashboard y muestra un toast con animación pulsante. Si el operador ya está en `/alertas-sjl`, no muestra el toast (evita duplicados).

### Lock exclusivo de alertas
Cuando un operador abre el detalle de una alerta SJL, emite `panico:join` al servidor con ACK. Si otro operador ya la tiene abierta, el servidor responde `{ ok: false, tomadaPor: 'nombre' }` y no abre el panel.

Al cerrar el panel sin finalizar, se emite `panico:leave` y el estado revierte a `RECIBIDA`.

---

## 8. PANICO-BACKEND — WEBHOOK A CECOM

**Archivo:** `src/alerts/alerts.service.ts` (en panico-backend)

Cuando se crea una nueva alerta en el app móvil, panico-backend notifica a CECOM via HTTP POST:

```
POST http://localhost:3002/api/v1/panico-app/webhook/nueva-alerta
Headers: x-api-key: panico_sjl_cecom_2026_secret
Body: { "alertaId": 123 }
```

CECOM backend emite el evento WebSocket `alerta-panico-nueva` a todos los operadores conectados.

**Variables de entorno necesarias en panico-backend `.env`:**
```env
CECOM_URL=http://localhost:3002
CECOM_API_KEY=panico_sjl_cecom_2026_secret
```

**Variable de entorno en CECOM backend `.env`:**
```env
PANICO_API_KEY=panico_sjl_cecom_2026_secret
```

---

## 9. ESTRUCTURA DE ARCHIVOS NUEVOS/MODIFICADOS

### Backend (`incidencias_cecom_back/src/`)
```
roles/
  roles.controller.ts     ← NUEVO
  roles.service.ts        ← NUEVO
  roles.module.ts         ← NUEVO
panico-app/
  panico-app.controller.ts  ← MODIFICADO (RolesGuard, filtro jurisdicción, user.id)
  panico-app.service.ts     ← MODIFICADO (filtro por jurisdicción, usePanicoAlertasMapa)
auth/
  auth.service.ts           ← MODIFICADO (me() lee módulos desde BD, jurisdicciones)
  constants/
    role-permissions.ts     ← MODIFICADO (módulo 'alertas' añadido, metricas a supervisor)
usuarios/
  usuarios.service.ts       ← MODIFICADO (asignarJurisdicciones, SELECT incluye jurisdicciones)
  usuarios.controller.ts    ← MODIFICADO (endpoint PATCH /:id/jurisdicciones)
catalogos/
  catalogos.service.ts      ← MODIFICADO (findJurisdicciones con select, findPermisos)
  catalogos.controller.ts   ← MODIFICADO (GET /catalogos/jurisdicciones ya existía)
app.module.ts               ← MODIFICADO (RolesModule añadido)
prisma/
  schema.prisma             ← MODIFICADO (UsuarioJurisdiccionAsignada, relaciones)
  seed.ts                   ← MODIFICADO (permisos y rol_permisos añadidos)
```

### Frontend (`incidencias_cecom_front/src/`)
```
app/(dashboard)/
  roles/
    page.tsx                ← NUEVO (gestión de roles y módulos)
  alertas-sjl/
    mapa/
      page.tsx              ← NUEVO (mapa de alertas SJL)
  layout.tsx                ← MODIFICADO (GlobalPanicoNotifier, fullBleed /alertas-sjl/mapa)
  usuarios/
    page.tsx                ← MODIFICADO (columna + modal jurisdicciones)
components/
  layout/
    Sidebar.tsx             ← MODIFICADO (grupo Alertas SJL colapsable, ítem Roles)
    AuthGuard.tsx           ← MODIFICADO (rutas alertas, roles, vecinos)
    GlobalPanicoNotifier.tsx ← NUEVO (notificación global alertas pánico)
  mapa/
    PanicoMapView.tsx       ← NUEVO (mapa para PanicoAlerta[])
hooks/
  usePanicoAlertas.ts       ← MODIFICADO (usePanicoAlertasMapa añadido)
store/
  authStore.ts              ← MODIFICADO (jurisdiccionesAsignadas, setJurisdicciones)
types/
  index.ts                  ← MODIFICADO (UsuarioAuth + tipo Jurisdiccion)
```

---

## 10. COMANDOS ÚTILES

```bash
# Seed de la base de datos (seguro de correr múltiples veces)
npm run prisma:seed

# Aplicar cambios de schema sin migración (desarrollo)
npx prisma db push

# Regenerar cliente Prisma (requiere detener el servidor primero)
npx prisma generate

# Ver la BD en interfaz gráfica
npm run prisma:studio

# Iniciar en modo desarrollo
npm run start:dev
```

---

## 11. NOTAS IMPORTANTES

### ⚠️ Reinicio del backend necesario
Después de cualquier `prisma db push` o `prisma generate`, es necesario reiniciar el servidor NestJS ya que el DLL de Prisma queda bloqueado mientras el proceso está corriendo.

```bash
# 1. Detener el servidor (Ctrl+C)
# 2. Regenerar cliente
npx prisma generate
# 3. Reiniciar
npm run start:dev
```

### ⚠️ role-permissions.ts — ahora es solo referencia
El archivo `src/auth/constants/role-permissions.ts` ya NO controla los módulos en tiempo de ejecución. El `auth/me` ahora lee directamente de la BD. El archivo se mantiene solo como referencia/documentación de la estructura original.

Si agregas un módulo nuevo:
1. Insertar en tabla `permisos` (o via `/roles/permisos` en el seed)
2. Asignar a roles via `PATCH /roles/:id/permisos` en la UI
3. No es necesario tocar `role-permissions.ts`

### ⚠️ Jurisdicciones — detección por GeoJSON
La asignación de jurisdicción a una alerta es **automática**: el sistema lee las coordenadas GPS de la alerta y usa el archivo `data/juridiccion.geojson` para determinar en qué zona cae. Si la alerta cae fuera de todas las jurisdicciones, se usa `PANICO_JURISDICCION_DEFAULT_ID` (default: 8).

Un operador sin jurisdicciones asignadas ve **todas** las alertas.

---

*Documentación generada el 2026-05-21*
