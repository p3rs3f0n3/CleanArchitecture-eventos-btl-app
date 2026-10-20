# Arquitectura del proyecto — Gestión de Eventos BTL

Este documento explica QUÉ se construyó y POR QUÉ, capa por capa. Está pensado
para leerse en tramos cortos (cada sección, ~10-15 min). No hace falta leerlo
de una sentada — and si el profe pregunta algo puntual de tu proyecto, la
respuesta está acá.

**Contexto:** por falta de tiempo (solo ratos de almuerzo entre semana), el
código de las capas `application`, `infrastructure` y `presentation`, y la
mayoría de `domain`, lo escribió Claude siguiendo el patrón que Nelly ya había
validado y entendido en `Evento.ts` (constructor privado + `create()` +
invariantes + getters). Cada decisión de diseño no obvia está explicada acá
para que puedas defenderla si te preguntan.

---

## 1. El mapa completo (las 4 capas)

```
src/
├── domain/          → el negocio puro. CERO imports de Express, Prisma, etc.
│   ├── entities/     → Evento, Cliente, Personal, AsignacionEvento, Usuario, Reporte
│   ├── repositories/ → INTERFACES (contratos), no implementaciones
│   ├── services/     → interfaces para hashing de passwords y JWT
│   └── exceptions/   → errores propios (DomainError y subclases)
├── application/      → casos de uso: orquestan entidades + repositorios
│   ├── evento/, personal/, cliente/, auth/, reporte/, shared/
├── infrastructure/    → implementaciones concretas (Prisma, bcrypt, JWT)
│   ├── repositories/  → Prisma*Repository (implementan las interfaces de domain/)
│   ├── auth/          → BcryptPasswordHasher, JwtTokenGenerator
│   ├── database/      → cliente de Prisma (singleton)
│   ├── config/        → lectura y validación de variables de entorno
│   └── di.ts           → COMPOSITION ROOT: conecta todo
└── presentation/      → HTTP: controllers, rutas, middlewares
```

**La regla de dependencia** (repetila si te preguntan): las flechas de
dependencia SIEMPRE apuntan hacia adentro. `domain` no importa nada de las
otras 3 capas. `application` solo importa `domain`. `infrastructure` y
`presentation` importan `application` y `domain`, nunca al revés.

---

## 2. Capa DOMAIN — las entidades

Todas siguen el MISMO patrón que ya armaste vos en `Evento.ts`:
- **Constructor privado**: nadie puede hacer `new Cliente(datosSinValidar)`.
- **`static create(props)`**: la ÚNICA puerta de entrada. Valida invariantes
  y recién ahí construye el objeto.
- **Getters, sin setters**: los datos no se mutan libremente desde afuera.

| Entidad | Invariante clave que valida `create()` |
|---|---|
| `Evento` | `fechaFin` no puede ser anterior a `fechaInicio` |
| `Cliente` | Email de contacto con formato válido, nombre no vacío |
| `Personal` | Nombre y documento no vacíos |
| `Usuario` | Email válido; si `rol=CLIENTE` exige `clienteId`; si `rol=COORDINADOR/PRODUCTOR` exige `personalId` |
| `Reporte` | Debe traer foto Y/O observación — nunca ambos vacíos (tu regla de evidencia) |
| `AsignacionEvento` | Sin invariante propia — la regla de cruce de horario NO vive acá (ver sección 3) |

**Dato importante:** `Evento` tiene un método nuevo, `cambiarEstado()`, que no
estaba cuando lo escribiste vos. Las entidades de DDD no son solo datos —
también tienen comportamiento (métodos que cambian su propio estado interno
de forma controlada).

**`RolSistema` vs `TipoParticipacion`** — dos enums que parecen similares pero
NO son lo mismo, ojo con esto si te preguntan:
- `RolSistema` (en `Usuario.ts`): controla PERMISOS de acceso a la app (ADMIN,
  CLIENTE, COORDINADOR, PRODUCTOR). Solo lo tiene quien puede loguearse.
- `TipoParticipacion` (en `AsignacionEvento.ts`): el rol FUNCIONAL que cumple
  una persona en un evento puntual (COORDINADOR, PRODUCTOR, STAFF). El Staff
  nunca tiene `RolSistema` porque no loguea, pero sí tiene `TipoParticipacion`.

---

## 3. Capa APPLICATION — los casos de uso (acá viven TUS reglas de negocio)

Cada caso de uso es una clase con un `execute()`. Recibe las interfaces de
repositorio por constructor (nunca instancia Prisma directamente — eso lo
hace `di.ts`).

Los dos casos de uso más importantes de defender en una entrevista o ante el
profe, porque tienen la regla de negocio DIFERENCIADORA de tu proyecto:

### `AsignarPersonalAEventoUseCase`
Implementa: *"no puedo tener a una impulsadora en dos eventos distintos a la
misma hora"*. Busca TODOS los eventos donde esa persona ya está asignada
(`findEventosAsignadosByPersonalId`) y compara rangos de fecha con un helper
puro (`haySolapamiento`, en `application/shared/solapamiento.ts`). Si hay
cruce, tira `ConflictError` (→ HTTP 409).

**Por qué esto NO puede vivir en la entidad `AsignacionEvento`:** una entidad
solo conoce SUS PROPIOS datos. Esta regla necesita comparar contra TODAS las
demás asignaciones de esa persona — eso requiere el repositorio completo, que
solo el caso de uso tiene disponible.

### `CambiarEstadoEventoUseCase`
Implementa: *"no puede cambiar de estado sin foto y/o reporte de ese
momento"*. En vez de reinventar la validación, REUTILIZA `Reporte.create()` —
si intentás pasar a `INICIADO` o `FINALIZADO` sin foto ni observación,
`Reporte.create()` tira el error automáticamente (misma validación que ya
viste en la entidad, sin duplicar código).

---

## 4. Capa INFRASTRUCTURE — Prisma, bcrypt, JWT

- **`di.ts`** es el "composition root": el único archivo que conecta
  implementaciones concretas con los casos de uso. Los controllers importan
  `useCases` desde ahí, listos para usar.
- **`Prisma*Repository`**: cada uno implementa una interfaz de `domain/repositories/`
  y traduce entre filas de la base (Prisma) y entidades de dominio, con una
  función `toDomain()` propia.
- **`PasswordHasher` / `TokenGenerator`**: son PUERTOS (interfaces en
  `domain/services/`) con implementaciones concretas acá (`bcryptjs`,
  `jsonwebtoken`). Los casos de uso de auth nunca importan `bcryptjs`
  directamente — si mañana cambiás de librería, ningún caso de uso se entera.

### ⚠️ Cambio grande de Prisma 7 (para que lo sepas si algo falla)

Desde Prisma 7, la URL de conexión YA NO va en `schema.prisma`. Ahora hay que
pasarle un **driver adapter** (`@prisma/adapter-pg`) directo al
`PrismaClient`, y también configurarlo en `prisma.config.ts` (para que el CLI
de migraciones sepa conectarse). Si ves código o tutoriales viejos con
`url = env("DATABASE_URL")` en el schema, es de una versión anterior — la
nuestra ya no funciona así.

### Riesgo conocido y aceptado

`npm audit` reporta 4 vulnerabilidades "high" — están DENTRO de las
dependencias internas de `prisma` (el CLI), en librerías (`mysql2`,
`deepmerge-ts`) para soportar OTROS motores de base de datos que ni usamos
(nosotros usamos PostgreSQL). Como `prisma` es una dependencia de desarrollo
(no corre en producción), decidimos no arreglarlo ahora — el fix automático
bajaría Prisma a una versión anterior y rompería cosas, por un riesgo que no
se ejecuta en el servidor real. Si preguntan: "es un riesgo conocido,
evaluado y aceptado por bajo impacto real".

---

## 5. Capa PRESENTATION — HTTP

- **`errorHandler.ts`**: traduce las excepciones de dominio a códigos HTTP
  (`NotFoundError`→404, `ConflictError`→409, `UnauthorizedError`→401,
  `InvalidPropValueError`→400). Es la ÚNICA capa que sabe qué es un "404".
- **Express 5** reenvía automáticamente los errores de funciones `async` al
  `errorHandler` — por eso los controllers no tienen try/catch, ni falta un
  wrapper "asyncHandler" (necesario en Express 4, no acá).
- **`authMiddleware.ts`**: `requireAuth` valida el JWT del header
  `Authorization: Bearer <token>`. `requireRol(...)` (se usa después de
  `requireAuth`) valida que el usuario tenga alguno de los roles permitidos
  para esa ruta.
- **Endpoints principales:**
  - `POST /api/auth/register`, `POST /api/auth/login`
  - `POST /api/clientes`, `GET /api/clientes`
  - `POST /api/eventos`, `GET /api/eventos/cliente/:clienteId`, `PATCH /api/eventos/:id/estado`
  - `POST /api/personal`, `GET /api/personal/disponibles`, `POST /api/personal/asignaciones`
  - `POST /api/reportes`
  - `GET /health` (para el requisito de "Health Check" del entregable)

---

## 6. Qué quedó FUERA del alcance (a propósito, por tiempo)

Los archivos `Sede.ts`, `Premio.ts`, `Rol.ts`, `Permiso.ts` existen pero están
vacíos con un comentario explicando por qué. Si te preguntan: "el modelo de
dominio los identificó como entidades legítimas, pero se recortó el alcance
del MVP por tiempo real de entrega — quedaron documentados para una v2".

En su lugar: `Rol` de sistema es un enum simple dentro de `Usuario` (sin
tabla de permisos granulares), y `Evento` no tiene ubicación estructurada
todavía (se puede agregar como campo simple).

---

## 7. Cómo correrlo en tu máquina

1. Crear `backend/.env` (contenido en el chat con Claude — no se pudo escribir
   automáticamente por seguridad).
2. Tener PostgreSQL corriendo local (o usar Docker más adelante, en la clase
   de despliegue).
3. Desde `backend/`:
   ```bash
   npm run prisma:migrate    # crea las tablas según prisma/schema.prisma
   npm run dev               # levanta el servidor con recarga automática
   ```
4. Probar: `GET http://localhost:3000/health` debería devolver `{"status":"ok"}`.

---

## 8. Frontend (React 19 + Vite + Tailwind)

Mismo patrón de capas que el backend, adaptado a frontend (igual que el repo
real del curso que revisamos): `domain` (entidades simples + interfaces de
repositorio), `application` (casos de uso delgados), `infrastructure`
(`ApiClient` + `Api*Repository` que hablan HTTP con el backend, `di.ts`,
`SessionStorage`), `presentation` (contexto de auth, rutas, hooks, páginas).

- **`SessionStorage`**: guarda token + usuario en `localStorage` para que un
  F5 no cierre la sesión (el backend no tiene endpoint `/me` en este MVP).
- **`AuthGuard`**: redirige a `/login` si no hay usuario logueado.
- **Dashboard con 3 pestañas**: Clientes, Eventos, Personal — para no armar
  routing más complejo del necesario dado el tiempo disponible.
- **Nota de alcance**: el registro por UI solo ofrece rol ADMIN/COORDINADOR
  (no CLIENTE/PRODUCTOR), porque esos requieren un `clienteId`/`personalId`
  que primero hay que crear desde el dashboard. Documentado en
  `RegisterPage.tsx`.

**Verificado navegando de verdad** (no solo compilando): registro, login,
persistencia entre pestañas, cambio de estado con evidencia (falla sin
foto/observación, funciona con ella), y creación de personal — todo contra
el backend real con PostgreSQL.

**Cómo correrlo:**
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```
(No hace falta `.env` — si no existe `VITE_API_URL`, usa `http://localhost:3000/api` por defecto.)

## 9. Roles y permisos (RBAC) — quién puede hacer qué

Reestructurado a partir de una observación real tuya jugando con la app: el ADMIN NO debe gestionar eventos — esa es responsabilidad exclusiva del COORDINADOR ("amo y señor" del evento). El ADMIN es soporte técnico de cuentas **y dueño de todo el catálogo** (clientes, staff, categorías, coordinadores/productores). El COORDINADOR gestiona eventos y, para armarlos, **elige** de listas que ya existen — no crea catálogo.

| Acción | ADMIN | COORDINADOR | PRODUCTOR |
|---|---|---|---|
| Crear evento / asignar staff / agregar puntos | ❌ | ✅ (exclusivo) | ❌ (solo lectura) |
| **Cambiar estado del evento** | ❌ | ❌ | ✅ (**exclusivo**) |
| Crear cliente | ✅ (**exclusivo**) | ❌ (solo elige de la lista) | ❌ |
| **Editar / activar-desactivar cliente** | ✅ (**exclusivo**) | ❌ | ❌ |
| Crear acceso (usuario/contraseña) de un Cliente | ✅ (exclusivo) | ❌ | ❌ |
| Crear personal/staff, subir foto | ✅ (**exclusivo**) | ❌ (solo elige de la lista al asignar) | ❌ |
| Crear/editar categorías de personal | ✅ (**exclusivo**) | ❌ (solo lista, para elegir al asignar) | ❌ |
| Crear Coordinador/Productor | ✅ (exclusivo) | ❌ | ❌ |
| Ver/bloquear cuentas, resetear contraseñas (cualquier rol) | ✅ (exclusivo) | ❌ | ❌ |

**Novedades de dominio:**
- `Cliente.activo` — un cliente inactivo se marca visualmente (badge gris) en toda la UI. Solo `ActualizarClienteUseCase` / `CambiarEstadoActivoClienteUseCase` (ambos ADMIN-only) lo tocan.
- `Usuario.activo` — una cuenta bloqueada (`activo: false`) no puede loguearse (`LoginUseCase` lo valida y devuelve "Tu cuenta está bloqueada"). Solo el ADMIN puede bloquear/desbloquear (`CambiarEstadoActivoUsuarioUseCase`) o resetear la contraseña sin pedir la anterior (`ResetearPasswordUseCase`, distinto de `CambiarPasswordUseCase` que es self-service).

**Frontend:** las pestañas del dashboard ahora dependen del rol (`TABS_POR_ROL` en `DashboardPage.tsx`) — el ADMIN ya no ve "Eventos", y tiene en cambio "Administración" (panel exclusivo para bloquear cuentas y resetear contraseñas) y "Coordinadores/Productores" (el COORDINADOR no ve esta última en absoluto). En "Clientes" y "Personal", hacer click en un registro carga sus datos en el panel izquierdo: editable solo para ADMIN, de solo lectura para los demás roles; el formulario de "crear" solo se renderiza si `puedeCrear` (= `esAdmin`) — el COORDINADOR ve directamente la lista para elegir, sin panel de creación.

**Modal de gestión del evento (2026-09-29):** `EventosPanel.tsx` se reestructuró — ya no hay botones sueltos por evento ("Cambiar estado"/"Asignar personal"/"Puntos") que expanden secciones inline en la lista. Ahora la lista es solo un resumen clickeable (imagen, nombre, fechas, badge de estado, contador de "Staff" y "Puntos" precargado para todos los eventos) y al hacer click se abre un **modal** (`eventoGestionandoId` guarda solo el ID; el evento se busca en vivo en el array `eventos` para que cualquier cambio —estado, imagen— se refleje al toque sin re-fetch). Al crear un evento nuevo, el modal se abre automáticamente. Adentro: resumen de "Staff asignado" (con nombre real de cada persona, vía un catálogo de Personal cargado aparte del que usa el buscador de "disponibles", para que no se pisen) y "Puntos", cada uno con su propio form colapsable de "+ agregar" (exclusivo COORDINADOR), y "Cambiar estado" (exclusivo PRODUCTOR, antes también lo podía el COORDINADOR).

Para el resumen de staff se agregó `GET /eventos/:eventoId/asignaciones` (`ListarAsignacionesPorEventoUseCase`, back y front), simétrico a como ya existía `GET /eventos/:eventoId/sedes`.

**Asignar personal: búsqueda por categoría + selección múltiple (2026-09-29):** el form de "+ Asignar" dentro del modal cambió de "elegí UNA persona de un `<select>` + elegí un rol (Coordinador/Productor/Staff)" a: un `<select>` para filtrar por categoría de STAFF (Bartender, DJ, Modelo, etc. — igual que `PersonalPanel.tsx`), y una lista de checkboxes con los disponibles en ese horario para esa categoría (o todas, si no se filtra), pudiendo tildar una o varias personas a la vez. Ya NO se pide "rol en el evento": la asignación siempre es `tipoParticipacion='STAFF'`, fijo en el código — decisión de Nelly ("a ellos no se les asigna rol como está a hoy"). Se excluyó también a las personas de categorías de GESTIÓN (Coordinador/Productor) de esta lista, aunque el endpoint de "disponibles" las devuelva junto con el staff, porque asignarles `tipoParticipacion=STAFF` no tenía sentido una vez sacado el selector de rol.

El submit asigna a cada seleccionado uno por uno (no en paralelo): si el cruce de horario rechaza a alguno, los demás igual quedan asignados y el error muestra el nombre de quién falló, sin perder la selección de las personas que sí fallaron (para reintentar) ni cerrar el modal hasta que no queden errores.

**Verificado navegando de verdad como Coordinador** (cuenta de prueba creada, probada y luego desactivada): filtro por categoría, selección múltiple de 2 personas en un solo submit, y confirmación de que quedaron con badge STAFF sin pedir rol.

**Nueva entidad Ciudad + resumen de categoría en Staff (2026-09-29):** dos ajustes sobre el modal de gestión del evento:

1. **"Staff asignado" ahora muestra la categoría** de cada persona (ej: "Bartender", "Impulsador/a") en vez de repetir "STAFF" para todos — dato que ya no aportaba nada útil desde que la asignación quedó fija en STAFF. El lookup es `categoriasPorId.get(personalPorId.get(a.personalId)?.categoriaId)`.
2. **Ciudad pasó de texto libre a ser una entidad** (`Ciudad`: id + nombre), mismo criterio que Categoria — catálogo abierto que crece con cada cliente. `Sede.ciudad` (string) se reemplazó por `Sede.ciudadId` (FK). Migración `20260929165537_agrega_ciudad`: crea la tabla `ciudades`, siembra un registro por cada valor DISTINTO que ya existía en `sedes.ciudad` (para no dejar huérfana ninguna Sede vieja), agrega `ciudadId` a `sedes` con el backfill hecho por match de nombre, y recién ahí vuelve `NOT NULL` y borra la columna vieja — mismo patrón de migración ya usado para Categoria.

**SOLO ADMIN crea ciudades** (decisión de Nelly, mismo criterio que clientes/staff/categorías): `POST /ciudades` es `requireRol(ADMIN)`; `GET /ciudades` queda abierto a cualquier autenticado (el Coordinador necesita listarlas para el `<select>` de "Puntos", y Productor/Cliente para resolver el nombre al ver el resumen). Como el Coordinador (que arma los Puntos) y el Admin (que carga ciudades) no comparten ninguna pantalla — Admin no ve la pestaña "Eventos" — la gestión de Ciudades se agregó como una sección nueva dentro de `AdministracionPanel.tsx` (ya exclusiva de Admin), no dentro del flujo de Sede. Si el Coordinador intenta armar un Punto sin que haya ninguna ciudad cargada todavía, el `<select>` se lo dice explícitamente en vez de fallar en silencio.

**Verificado navegando de verdad**: como Admin, se cargó "Bogota" y "Medellin" (además de "Cali", que ya venía del backfill de la migración); como Coordinador, se agregó un punto nuevo eligiendo "Medellin" del desplegable y se confirmó que el resumen del evento lo muestra resuelto por nombre ("Estadio Panamericano — Calle 5 con Cra 100, Medellin"), no por id.

**Bugs pre-existentes encontrados al probar el modal como Productor real (no solo compilando):** `GET /clientes` y `GET /personal` estaban restringidos a ADMIN+COORDINADOR — ni PRODUCTOR ni CLIENTE podían listarlos, aunque los dos tienen esas pestañas en `TABS_POR_ROL`. Sin este fix, Productor/Cliente jamás podían llegar a la pestaña "Eventos" (que depende de tener un cliente seleccionado) ni ver los nombres del staff asignado ("Persona no encontrada"). Se abrieron los dos GET a `requireAuth` sin restricción de rol, mismo criterio que ya tenían sedes/asignaciones ("ver queda abierto a cualquier autenticado").

**Duplicados de Ciudad/Categoría: mayúsculas Y tildes (2026-09-29):** el chequeo de "ya existe" recién agregado (`findByNombre`) usaba `findUnique` exacto — Nelly encontró que "cali" (minúscula) pasaba junto a "Cali". Primer fix: `findFirst` con `mode: "insensitive"` (Prisma/Postgres). Segundo hallazgo, mismo día: `mode: "insensitive"` ignora mayúsculas pero NO tildes — "calí" seguía coleándose como ciudad distinta de "Cali". Fix final: `domain/shared/normalizarTexto.ts` (`normalizarParaComparar`, usa `.normalize("NFD").replace(/[̀-ͯ]/g, "")` para sacar tildes + `.toLowerCase()`), aplicado en memoria sobre `findAll()` en ambos repositorios Prisma — se descartó meter la extensión `unaccent` de Postgres por ser overkill para un catálogo de este tamaño.

**Borrar Ciudad (2026-09-29):** `EliminarCiudadUseCase` — antes de borrar, chequea con `SedeRepository.findByCiudadId` si hay algún Punto que la use; si hay, `ConflictError` (409, "hay N punto(s) de evento que la usan") en vez de dejar que la FK `sedes.ciudadId` (`ON DELETE RESTRICT`) rompa con un error crudo de Postgres. `DELETE /ciudades/:id` es ADMIN-only. En el frontend, cada badge de ciudad en `AdministracionPanel.tsx` tiene un "×" con `window.confirm` antes de borrar.

**Visibilidad de eventos por identidad, no solo por rol (2026-09-29):** hasta acá, todos los roles que podían ver los eventos de un cliente veían LOS MISMOS eventos — el filtro era por rol (Coordinador/Productor/Cliente pueden entrar a "Eventos"), no por persona. Nelly pidió algo más fino: **cada Coordinador ve solo los eventos que ÉL creó**, y **cada Productor ve solo los eventos donde quedó asignado como responsable**.

- `Evento` ganó `creadoPorId` (nullable — los eventos de antes de este campo quedan sin dueño, no se les asigna un dueño falso). Migración `20260929191055_agrega_creado_por_evento`: `ALTER TABLE eventos ADD COLUMN "creadoPorId" TEXT` + FK a `usuarios(id)` `ON DELETE SET NULL`. `CrearEventoUseCase` ahora recibe `creadoPorId` (viene de `req.usuario.usuarioId`, el JWT — el frontend no lo manda).
- `ListarEventosPorClienteUseCase` se reescribió para filtrar según quién pregunta: COORDINADOR → `!e.creadoPorId || e.creadoPorId === usuarioId`; PRODUCTOR → busca su `personalId` (vía `UsuarioRepository`) y cruza contra `AsignacionEventoRepository.findByPersonalId` (nuevo método) filtrando `tipoParticipacion === PRODUCTOR`; ADMIN/CLIENTE → sin filtro.

**Bug propio encontrado al reiniciar y probar de verdad (2026-09-29):** la primera versión filtraba COORDINADOR con `creadoPorId === usuarioId` estricto — como TODOS los eventos reales de Nelly son de antes de que este campo existiera (`creadoPorId: null`), literalmente ningún Coordinador veía nada, ni siquiera los eventos que él mismo había armado antes de hoy. Corregido: `!e.creadoPorId || e.creadoPorId === usuarioId` — un evento sin creador registrado se muestra a CUALQUIER Coordinador (fallback de compatibilidad para datos de antes de la migración); el filtro estricto de "solo lo que yo creé" aplica nada más a los eventos que sí tienen un creador guardado, es decir, todo lo creado de acá en adelante.
- Volvió la asignación de **Productor a un evento** (se había sacado del flujo de staff hace unas rondas, cuando ese flujo pasó a ser solo STAFF) — pero como sección propia: "Productor a cargo" en el modal de `EventosPanel.tsx`, separada de "Staff asignado" (cada `AsignacionEvento` ahora se filtra por `tipoParticipacion` para no aparecer en las dos listas a la vez). Reutiliza el mismo caso de uso genérico `AsignarPersonalAEventoUseCase` (ya soportaba cualquier `tipoParticipacion`, incluida la regla de "no cruce de horario") — no hizo falta tocar el backend para esta parte, solo agregar el flujo en el frontend con `tipoParticipacion: 'PRODUCTOR'` fijo y la lista filtrada a la categoría "Productor".

**El Productor pierde la pestaña "Clientes" (2026-09-29):** Nelly: "el productor no debería ver la pestaña de clientes, ya que él solo ve los eventos para poder hacer seguimiento." Problema estructural que esto destapó: "Eventos" dependía de elegir un cliente primero en "Clientes" (`clienteSeleccionado` en `DashboardPage.tsx`) — sin esa pestaña, el Productor no tenía forma de llegar a NINGÚN evento, y sus eventos asignados pueden ser de clientes distintos (no de uno solo).

Se armó una vista propia para el Productor, en paralelo a `EventosPanel.tsx` (que sigue siendo la del Coordinador):
- Backend: `GET /eventos/asignados` (PRODUCTOR-only) — `ListarEventosAsignadosUseCase` resuelve el `personalId` del usuario y devuelve sus eventos vía `AsignacionEventoRepository.findByPersonalId` + `EventoRepository.findByIds` (método nuevo), sin pasar por ningún `clienteId`.
- Frontend: `MisEventosPanel.tsx` (nuevo) + `useEventosAsignados.ts` (nuevo hook, sin `clienteId`) — versión recortada del modal de `EventosPanel.tsx`: se ve el cliente dueño de cada evento (resuelto internamente, sin pestaña propia), Staff asignado y Puntos en solo lectura, y la única acción es "Cambiar estado" (gateada también por si el cliente de ESE evento puntual está inactivo). Sin crear evento, sin asignar personal/productor, sin agregar puntos, sin subir imagen — el Productor nunca hizo nada de eso.
- `TABS_POR_ROL.PRODUCTOR` pasó de `['clientes', 'eventos', 'mi cuenta']` a `['eventos', 'mi cuenta']`; `DashboardPage.tsx` renderiza `MisEventosPanel` en la pestaña "eventos" cuando el rol es PRODUCTOR, y `EventosPanel` (con el flujo de `clienteSeleccionado`) para los demás roles que la usan.

**Bug encontrado al probar "Mis eventos" de verdad:** el resumen de Staff no mostraba la categoría de nadie para el Productor — `GET /categorias` estaba restringido a ADMIN+COORDINADOR (igual que ya había pasado antes con `/clientes` y `/personal`). El Productor nunca podía traer el catálogo, así que `categoriasPorId` quedaba siempre vacío y todo el staff caía al fallback "—". Se abrió `GET /categorias` a `requireAuth` sin restricción de rol, mismo criterio ya aplicado a clientes/personal/sedes/asignaciones. Verificado con `fetch` directo: antes del fix el endpoint hubiera devuelto 401/403 para Productor; después, 200 y "Isabella Barreiro Jordán → DJ" resuelto correctamente.

**Backfill de `creadoPorId` (2026-09-29, a pedido explícito de Nelly):** los 4 eventos reales preexistentes (huérfanos, `creadoPorId: null`) se actualizaron para quedar con `correo@hotmail.com` (el Coordinador real que usa) como dueño — vía script puntual de Prisma (`updateMany`), no vía la UI (no existe today un caso de uso para "reasignar dueño de un evento", no se armó uno solo para esto). El evento de prueba con dueño propio no se tocó. El fallback "sin dueño → visible a cualquier Coordinador" sigue en el código como red de seguridad para el futuro (ej: si se borra una cuenta y su FK cae en `SET NULL`), aunque ya no tiene ningún registro real que cubrir hoy.

**Verificado con dos Coordinadores y un Productor reales, no solo con uno:** Coordinador A crea un evento nuevo → lo ve, y NO ve el evento viejo "Becatón..." (sin `creadoPorId`). Coordinador B (cuenta nueva de prueba) → no ve NINGÚN evento de ese cliente, ni el de A ni el viejo. Se asigna el Productor de prueba como responsable del evento de A → el Productor ve SOLO ese evento, no el "Becatón" (donde nunca lo asignaron como Productor, aunque sí hay staff asignado ahí de pruebas anteriores).

**Verificado con los tres casos reales**: "CALÍ" (mayúscula + tilde) contra "Cali" ya existente → 409; borrar la "calí" duplicada de prueba (sin Sedes que la usaran) → 204 OK; intentar borrar "Cali" (con 3 Sedes reales usándola) → 409 con el conteo exacto.

**Pestaña "Personal" sacada del Coordinador (2026-09-29):** Nelly notó que, tras el pivote a "todo el catálogo es admin-only", esa pestaña no le servía de nada al Coordinador — solo lista de solo-lectura, sin ninguna acción disponible (crear/editar/foto ya eran ADMIN-only). La asignación real de staff a un evento vive en el modal de gestión, no ahí. Se sacó `'personal'` de `TABS_POR_ROL.COORDINADOR` en `DashboardPage.tsx`. No se tocó el backend: `GET /personal` sigue abierto porque `EventosPanel.tsx` lo llama directo para el catálogo de nombres del resumen "Staff asignado".

**Cliente inactivo bloquea TODO sobre sus eventos, no solo crear uno nuevo (2026-09-29):** Nelly encontró que, aunque ya estaba bloqueado *crear* un evento para un cliente inactivo, se le podía seguir agregando puntos, asignando personal, cambiando estado y subiendo imagen a los eventos QUE YA EXISTÍAN de ese cliente. Se agregó la misma validación (`if (!cliente?.activo) throw ConflictError`) en los 4 casos de uso que operan sobre un evento existente — `CrearSedeUseCase`, `AsignarPersonalAEventoUseCase`, `CambiarEstadoEventoUseCase`, `SubirImagenEventoUseCase` — todos ahora reciben `ClienteRepository` inyectado y validan `evento.clienteId` antes de tocar nada. En el frontend, `EventosPanel.tsx` ya recibía `cliente` como prop, así que se usó `cliente.activo` para ocultar los 4 botones de acción dentro del modal ("+ Asignar", "+ Agregar punto", "Cambiar estado", "Subir/cambiar imagen") y mostrar un banner explicativo en su lugar.

**Verificado navegando de verdad, incluyendo saltarse la UI a propósito:** con un evento real de un cliente ya inactivo (ACME BTL), se confirmó que el modal oculta las 4 acciones y muestra el banner; después, desde la consola del navegador logueada como ese mismo Coordinador, se hizo un `fetch` directo a `POST /eventos/:id/sedes` (sin pasar por el formulario) y el backend lo rechazó con 409 y el mensaje correcto — confirma que la autoridad real es el backend, no el ocultamiento de botones en la UI.

**Decisión de arquitectura (2026-09-29):** inicialmente el Coordinador podía crear clientes y staff nuevo "sobre la marcha" al armar un evento (para no frenar el flujo). Se revirtió: TODO el catálogo maestro (clientes, personal, categorías, coordinadores/productores) pasó a ser exclusivo de ADMIN. Razón tuya: separar responsabilidades con claridad — el Coordinador opera eventos con lo que ya existe, el ADMIN mantiene los datos maestros. Se aplicó en las tres capas: rutas (`requireRol(ADMIN)` en los POST de cliente/personal/categoría), frontend (gate `puedeCrear`/`esAdmin` en los formularios), y se simplificó `CrearPersonalUseCase` sacando el chequeo de rol que ya no hace falta porque la ruta lo filtra antes de llegar al caso de uso.

**Gotcha real que encontramos y vale la pena que sepas:** con `tsx watch` corriendo muchísimo tiempo y muchos archivos cambiando muy rápido seguidos, el auto-reload puede quedar "colgado" sirviendo código viejo desde memoria sin avisar (sin error visible). Si alguna vez ves un comportamiento que no coincide con el código que estás mirando, el primer paso de diagnóstico es: `Ctrl+C` y `npm run dev` de nuevo, tanto en frontend como backend.

## 10. Módulo de Administración — funcionalidades extendidas

A partir de pruebas reales jugando con la app se agregaron: ver/editar/activar-desactivar Personal (staff y gestión, mismo patrón que Cliente), subida real de fotos para el staff (`multer`, guardadas en `backend/uploads/personal/`, servidas en `/uploads`), el panel de Administración ahora muestra a qué Cliente/Personal pertenece cada cuenta, y la cascada: desactivar un Cliente o un Personal con acceso bloquea automáticamente su cuenta (`CambiarEstadoActivoClienteUseCase`/`CambiarEstadoActivoPersonalUseCase`).

**Validación de campos** (`src/domain/shared/validadores.ts`, backend): funciones reutilizables (`validarSoloDigitos`, `validarSoloLetras`, `validarNumeroPositivo`, etc.) usadas por `Cliente.create()`/`actualizarDatos()` y `Personal.create()`/`actualizarDatos()`. El frontend replica las mismas reglas con `pattern`/`inputMode`/`min`/`max` en los inputs — pero es solo UX (feedback inmediato); la autoridad real es el dominio del backend, que es el que de verdad protege los datos.

**Gotcha real que encontramos:** al agregar una validación más estricta a un campo que YA tenía datos cargados (ej: teléfono debía pasar a ser "solo dígitos"), había registros viejos de pruebas que no cumplían la regla nueva — eso rompía la reconstrucción de esas filas al leerlas (`Entidad.create()` se ejecuta también al LEER de la base, no solo al crear). Antes de aplicar una validación más estricta a un campo existente, hay que revisar los datos ya cargados y corregir lo que no cumpla, no solo pensar en los datos nuevos.

## 11. Módulo de Informes (Productor → Coordinador → Cliente)

Primer punto del "análisis de gaps" contra el boceto original de la app (ver charla del 2026-09-29) — resultó mucho más grande de lo que parecía al principio: no era "mostrar lo que ya existe", era un documento con flujo de estados.

**Entidad nueva, separada de `Reporte`:** `Reporte` (la evidencia obligatoria de cada cambio de estado, con `momento` INICIO/DURANTE/FINALIZACION) sigue existiendo tal cual, sin tocar. `Informe` es otra cosa: **UN solo documento por evento** (`eventoId @unique`) que pasa por 4 estados:

```
BORRADOR (lo arma el Productor) → ENVIADO (el Productor cierra su parte) → AJUSTADO (el Coordinador lo revisó) → PUBLICADO (recién ahí lo ve el Cliente)
```

**El contenido es un registro append-only, no campos que se pisan.** Primera versión tenía `novedades`/`observaciones`/`relacionPremios` como texto libre que cada guardado reemplazaba — Nelly probó el flujo real y encontró dos problemas: el segundo guardado borraba el primero, y el Productor podía seguir editando indefinidamente porque nunca "entregaba" nada. Se reemplazó por `EntradaInforme` (tabla `entradas_informe`, migración `20261004004621_informe_entradas_y_enviado`): cada aporte queda como una fila con `tipo` (NOVEDAD/OBSERVACION/PREMIO), `texto`, `autorId` y `createdAt`. Son inmutables — si alguien se equivoca, suma otra entrada; no hay editar ni borrar entradas. La migración pasó el contenido viejo de los informes de prueba a este formato antes de borrar las columnas, para no perder datos.

Además una galería de fotos (`FotoInforme`, uno-a-muchos, entidad separada — se adelantó acá el trabajo que iba a ser el punto 5 de la lista de gaps, "galería de fotos", porque el Informe la necesitaba de entrada).

**Reglas de quién edita qué, según estado** (`application/informe/permisosInforme.ts`, un solo helper compartido por los casos de uso para no repetir la lógica):
- No existe todavía: SOLO el Productor asignado a ese evento (vía `AsignacionEvento` tipoParticipacion=PRODUCTOR) puede crearlo (sumando su primera entrada o foto).
- BORRADOR: Productor asignado O Coordinador dueño del evento pueden sumar entradas y fotos.
- ENVIADO / AJUSTADO: SOLO el Coordinador dueño puede seguir sumando — el Productor ya cerró su parte y queda bloqueado (validado en backend, no solo ocultando el botón en el front).
- PUBLICADO: nadie edita.
- Transición BORRADOR→ENVIADO: acción explícita del **Productor** ("Enviar al Coordinador") — con confirmación en el front porque es irreversible para él.
- Transición ENVIADO→AJUSTADO: acción explícita del Coordinador ("Marcar como ajustado").
- Transición AJUSTADO→PUBLICADO: acción explícita del Coordinador ("Publicar") — recién ahí el Cliente lo puede ver.
- El Cliente NUNCA edita: solo ve, y solo si el estado es PUBLICADO (antes de eso, `GET /informes/evento/:id` le devuelve `null`, como si no existiera).

**Backend:** `Informe`/`FotoInforme`/`EntradaInforme` (entidades + repos), casos de uso (`ObtenerInformePorEvento`, `AgregarEntradaInforme`, `AgregarFotoInforme`, `EliminarFotoInforme`, `EnviarInforme`, `MarcarInformeAjustado`, `PublicarInforme`), `InformeController.ts`, `informeRoutes.ts` montado en `/api/informes`. Todas las acciones devuelven siempre la MISMA forma (`{...informe, fotos, entradas}`) para que el frontend no tenga que distinguir casos.

**Pendiente, no bloqueante:** el frontend muestra el autor de cada entrada por `autorId`, no por nombre — para mostrarlo por nombre hace falta resolver el usuario en el backend antes de serializar.

**Frontend:** un solo componente `InformeSeccion.tsx`, insertado tal cual dentro de `EventosPanel.tsx` (Coordinador/Cliente) Y `MisEventosPanel.tsx` (Productor) — evita duplicar toda la lógica de estados/permisos en los dos lugares donde aparece.

**Bug real encontrado al probar la subida de fotos (no solo compilando):** `multer` con `diskStorage` NO crea la carpeta destino sola — `uploads/informes/` no existía en disco (a diferencia de `uploads/personal/` y `uploads/eventos/`, creadas a mano en algún momento anterior), y la primera subida de foto tiraba un 500 crudo. Esto es un bug de portabilidad real: en un despliegue de cero (Docker, por ejemplo) NINGUNA de las tres carpetas existiría. Se arregló de raíz en `uploadMiddleware.ts` — `crearUploaderDeImagenes` ahora hace `fs.mkdirSync(destino, { recursive: true })` antes de armar el storage, para las tres carpetas (personal/eventos/informes), no solo la nueva.

**Verificado el flujo completo con 3 identidades reales, no solo compilando:**
1. Productor arma el informe (novedades + observaciones + premios + 1 foto) → queda en BORRADOR.
2. Coordinador lo ve (aunque no lo creó él) y le agrega una observación propia — confirma que BORRADOR permite editar a los dos roles.
3. Coordinador marca "Ajustado".
4. Productor intenta seguir editando → rechazado con 401 y el mensaje exacto ("Solo el Coordinador puede seguir editando un informe ya ajustado").
5. Cliente consulta el informe ANTES de que se publique → `null` (como si no existiera).
6. Coordinador publica.
7. Cliente vuelve a consultar → ahora sí ve el contenido completo y la foto.

## 12. Lo que sigue (no está armado todavía)

- **Testing** — no hay tests escritos en este MVP por foco de tiempo.
- **Nombre del autor en las entradas del Informe** (ver sección 11).

## 13. Entregable final: Docker y despliegue

Contenerización armada DESPUÉS de que todo funcionara local, para el entregable del curso.

**`backend/Dockerfile`** (multi-stage, `node:22-slim`, no `alpine` — el motor
de Prisma necesita glibc/openssl y en `alpine` (musl) da problemas conocidos):
1. `build`: instala TODAS las dependencias con **pnpm** (`pnpm install --frozen-lockfile`) y corre `pnpm run build` (tsc).
2. `runtime`: instala solo dependencias de producción, copia `prisma/` y corre `prisma generate`, copia el `dist/` ya compilado del stage anterior. El `CMD` corre `npx prisma migrate deploy && node dist/server.js` — las migraciones se aplican recién al ARRANCAR el contenedor (no al buildear la imagen), porque la base de datos no existe todavía en build time.

**Decisión: el backend pasó de npm a pnpm.** El enunciado del entregable lo pide explícitamente para el Dockerfile del backend. Esto obligó a mover `prisma` de `devDependencies` a `dependencies` en `package.json` — si se queda en dev, `npx prisma migrate deploy` no existe en la imagen de runtime (que instala solo prod deps). El frontend se quedó en npm: el enunciado no lo pide ahí y cambiar sin necesidad agrega riesgo.

**Gotcha de pnpm:** desde pnpm 10+, los scripts `postinstall`/`preinstall` de las dependencias (Prisma, esbuild) se bloquean por seguridad salvo que se aprueben explícitamente. Se resolvió con `pnpm approve-builds --all`, que generó `backend/pnpm-workspace.yaml` (`allowBuilds: {...}`) — ese archivo se commitea, así que el Docker build no se traba por esto en otra máquina.

**`frontend/Dockerfile`** (multi-stage): build con Vite + Nginx para servir el estático. `VITE_API_URL` es un build **ARG**, no una variable de entorno de runtime — Vite lo inlinea en el JS al momento de buildear, así que si cambia la URL del backend hay que volver a buildear la imagen del frontend, no alcanza con reiniciar el contenedor.

**`frontend/nginx.conf`:** el front usa `BrowserRouter` (no `HashRouter`), así que necesita `try_files $uri $uri/ /index.html;` — sin esto, recargar la página en una ruta como `/eventos/123` tira 404 de Nginx porque ese archivo no existe en disco.

**`docker-compose.yml`** (raíz del repo): `postgres:18-alpine` + `backend` + `frontend`, con healthchecks (Postgres vía `pg_isready`, backend vía `GET /health`) y `depends_on: condition: service_healthy` para que el backend no arranque antes de que Postgres esté listo. Dos volúmenes persistentes: `postgres_data` (la base) y `backend_uploads` (`/app/uploads` — sin esto, las fotos de personal/eventos/informes se pierden cada vez que se recrea el contenedor, mismo criterio que la nota de `uploadMiddleware.ts`). Variables de entorno (`JWT_SECRET`, `POSTGRES_PASSWORD`, `PUBLIC_URL`, `VITE_API_URL`) se leen de un `.env` en la raíz (no versionado — Claude no pudo escribir un `.env.example` por una regla de seguridad del entorno; los nombres de variable están documentados acá arriba).

**`.github/workflows/ci.yml`** (opcional según el enunciado, incluido igual): en cada push/PR a `main`, buildea las dos imágenes con `docker/build-push-action` (sin `push`) — valida que los Dockerfiles compilen antes de llegar a main.

**Pendiente — necesita una decisión de Nelly, no técnica:** dónde vive el repo de GitHub (cuenta, nombre, público o privado con acceso al instructor) y dónde se despliega en la nube (VPS propia vs. un PaaS). Sin eso no se puede completar la Parte 2 y 3 del entregable (despliegue funcional + enlaces).
