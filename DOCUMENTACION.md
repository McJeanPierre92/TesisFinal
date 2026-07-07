# 🎓 Plataforma LMS — ULEAM

Sistema de Gestión de Aprendizaje (LMS) tipo Moodle simplificado, construido con **NestJS + Prisma + PostgreSQL** en el backend y **Next.js + React + Tailwind CSS** en el frontend.

> Proyecto de titulación — Universidad Laica Eloy Alfaro de Manabí (ULEAM)

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación y Ejecución](#instalación-y-ejecución)
6. [Usuarios de Prueba](#usuarios-de-prueba)
7. [Modelo de Datos](#modelo-de-datos)
8. [Estructura del Backend](#estructura-del-backend)
9. [Estructura del Frontend](#estructura-del-frontend)
10. [Sistema de Roles y Permisos](#sistema-de-roles-y-permisos)
11. [Funcionalidades Implementadas](#funcionalidades-implementadas)
12. [Decisiones de Diseño](#decisiones-de-diseño)
13. [Endpoints de la API](#endpoints-de-la-api)
14. [Comandos Útiles](#comandos-útiles)

---

## Visión General

Plataforma web para la gestión académica que permite:

- **Administradores** gestionar instituciones, niveles, materias, paralelos, estudiantes, profesores, matrículas, asignaciones y horarios.
- **Profesores** crear lecciones, tareas (de documento o cuestionarios auto-calificables), calificar entregas y registrar notas de parciales.
- **Alumnos** ver sus cursos, leer material de estudio, entregar tareas, responder cuestionarios, consultar notas y ver su horario semanal.

### Modelo académico

El sistema replica el modelo de un colegio/escuela:

```
Institución → Nivel (7mo, 8vo, 9no) → Paralelo (A, B, C)
                ↓
         Asignación Académica (Materia + Paralelo + Profesor)
                ↓
         Lecciones y Tareas → Entregas → Notas
```

---

## Stack Tecnológico

### Backend (`back-nest/`)

| Tecnología | Versión | Propósito |
|---|---|---|
| **NestJS** | ^10.4.17 | Framework principal de la API |
| **Prisma ORM** | ^6.13.0 (CLI) / ^6.16.3 (Client) | ORM y migraciones |
| **PostgreSQL** | 8.20.0 (driver `pg`) | Base de datos relacional |
| **Passport + JWT** | passport 0.7.0 / passport-jwt 4.0.1 | Autenticación con cookies httpOnly |
| **bcrypt** | ^6.0.0 | Hash de contraseñas |
| **class-validator + class-transformer** | 0.14.1 / 0.5.1 | Validación de DTOs |
| **Swagger** | ^8.1.1 | Documentación de API en `/docs` |
| **Helmet** | ^8.1.0 | Headers de seguridad |
| **@nestjs/throttler** | ^6.4.0 | Rate limiting (30 req/min, 500 req/hora) |
| **Multer** | ^1.4.5-lts.1 | Subida de archivos |
| **Express** | ^5.2.1 | Servidor HTTP |

### Frontend (`front-next/`)

| Tecnología | Versión | Propósito |
|---|---|---|
| **Next.js** | 16.1.0-canary.31 | Framework SSR/SSG (App Router) |
| **React** | 19.2.3 | Librería de UI |
| **TypeScript** | ^5.8.3 | Tipado estático |
| **Tailwind CSS** | ^4 (CSS-first) | Estilos utilitarios |
| **shadcn/ui (Radix UI)** | ~25 componentes | Componentes accesibles |
| **lucide-react** | ^0.537.0 | Iconografía |
| **motion (framer-motion)** | ^12.42.2 | Animaciones |
| **recharts** | 2.15.4 | Gráficos (barras, donas) |
| **react-hook-form + zod** | 7.62.0 / 4.0.15 | Formularios + validación |
| **@tanstack/react-table** | ^8.21.3 | Tablas con paginación/ordenamiento |
| **sonner** | ^2.0.7 | Notificaciones toast |
| **next-themes** | ^0.4.6 | Gestión de tema (claro) |
| **cmdk** | ^1.1.1 | Componente de comandos (Autocomplete) |
| **date-fns** | ^4.1.0 | Manipulación de fechas |

### Base de Datos

- **Motor:** PostgreSQL
- **Base de datos:** `systemLMS`
- **Schema:** `prod`
- **Conexión:** `postgresql://postgres:****@localhost:5432/systemLMS?schema=prod`

---

## Arquitectura del Proyecto

```
quality/
├── back-nest/          # API NestJS (puerto 7001)
│   ├── src/
│   │   ├── academic/        # Lógica de negocio académica (alumno/profesor)
│   │   ├── auth/            # Login, JWT, cambio de contraseña
│   │   ├── common/          # Guards, decorators, interceptors
│   │   ├── constants/       # Constantes y helpers (transformDecimals)
│   │   ├── institution/     # CRUD institución
│   │   ├── level/           # CRUD niveles
│   │   ├── subject/         # CRUD materias
│   │   ├── class-group/     # CRUD paralelos
│   │   ├── enrollment/      # CRUD matrículas
│   │   ├── teaching-assignment/ # CRUD asignaciones
│   │   ├── lesson/          # CRUD lecciones
│   │   ├── task/            # CRUD tareas
│   │   ├── schedule/        # CRUD horarios
│   │   ├── submission/      # CRUD entregas
│   │   ├── grade/           # CRUD calificaciones
│   │   ├── term-grade/      # CRUD notas de parcial
│   │   ├── uploads/         # Subida de archivos (Multer)
│   │   ├── user/            # CRUD usuarios
│   │   ├── role/            # CRUD roles
│   │   ├── permission/      # CRUD permisos
│   │   ├── role-permission/ # CRUD asignación permiso↔rol
│   │   ├── menu-section/    # CRUD secciones de menú
│   │   ├── storage/         # PrismaService + PrismaModule (@Global)
│   │   ├── middleware/      # Filtros de excepción, audit logger
│   │   └── interceptor/     # Anti-duplicados, transform decimals
│   ├── prisma/
│   │   ├── schema.prisma    # 20 modelos, 4 enums
│   │   ├── seed.ts          # Datos demo idempotentes
│   │   └── migrations/      # 3 migraciones
│   └── uploads/             # Archivos subidos (Multer diskStorage)
│
├── front-next/         # Frontend Next.js (puerto 3006)
│   ├── src/
│   │   ├── app/             # App Router (22 rutas)
│   │   │   ├── login/       # Pantalla de login
│   │   │   ├── lms/         # Plataforma LMS
│   │   │   │   ├── admin/   # 9 secciones CRUD del admin
│   │   │   │   ├── my-courses/   # Cursos del alumno + detalle
│   │   │   │   ├── my-grades/    # Notas del alumno
│   │   │   │   ├── my-schedule/  # Horario del alumno
│   │   │   │   ├── teacher/      # Vistas del profesor
│   │   │   │   ├── profile/      # Perfil + cambio de contraseña
│   │   │   │   └── layout.tsx    # Shell (sidebar oscuro + topbar)
│   │   │   └── layout.tsx       # Root layout (fuentes, ThemeProvider)
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── ui/          # ~31 primitivos shadcn/ui
│   │   │   ├── form/        # Autocomplete, ControllerFormField
│   │   │   ├── navigation/  # AppSidebar
│   │   │   ├── table/       # DataTable, DataTablePagination
│   │   │   └── shared/      # DrawerDialog, ModalDialog
│   │   ├── modules/         # Capa DDD (domain/application/infrastructure)
│   │   │   ├── academic/    # Repositorios API del LMS
│   │   │   ├── auth/        # Autenticación
│   │   │   ├── uploads/     # Subida de archivos
│   │   │   └── user/        # Repositorio de usuarios
│   │   ├── section/         # Vistas por feature
│   │   │   ├── lms/         # Dashboards, componentes LMS
│   │   │   └── admin/       # CRUDs del admin (columns, forms)
│   │   ├── context/         # AuthContext (sesión JWT)
│   │   ├── constants/       # subjectColors, iconMapping
│   │   ├── hooks/           # useCrud, useFormManagement, etc.
│   │   └── lib/             # apiFetch (wrapper con error handling), utils
│   └── public/              # logo-new.png
│
└── prototipo-lms.html   # Prototipo HTML navegable del diseño
```

---

## Requisitos Previos

- **Node.js** >= 20
- **pnpm** >= 9
- **PostgreSQL** >= 14
- **Navegador moderno** (Chrome, Firefox, Edge)

---

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd quality
```

### 2. Configurar la base de datos

Crear una base de datos PostgreSQL llamada `systemLMS`:

```sql
CREATE DATABASE "systemLMS";
```

### 3. Backend

```bash
cd back-nest

# Instalar dependencias
pnpm install

# Configurar variables de entorno
# Editar .env con tus credenciales de PostgreSQL:
# PORT=7001
# DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/systemLMS?schema=prod"
# JWT_SECRET=tu_secreto_jwt
# FRONTEND_URL=http://localhost:3006

# Aplicar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Ejecutar seed (datos demo)
npx prisma db seed

# Iniciar en modo desarrollo
pnpm start:dev
```

El backend corre en `http://localhost:7001`.
Swagger disponible en `http://localhost:7001/docs`.

### 4. Frontend

```bash
cd front-next

# Instalar dependencias
pnpm install

# Configurar variable de entorno
# .env.local:
# NEXT_PUBLIC_URL_API=http://localhost:7001/v1/promo/api

# Iniciar en modo desarrollo
pnpm dev
```

El frontend corre en `http://localhost:3006`.

---

## Usuarios de Prueba

Todos con password: **`123456`**

| Usuario | Rol | Descripción |
|---|---|---|
| `admin` | Administrador | Gestión completa del sistema |
| `profesor` | Profesor | Dicta Matemáticas en 8vo A |
| `alumno` | Alumno | Matriculado en 8vo A (5 materias) |
| `mperez` | Profesor | Lenguaje y Comunicación |
| `jloor` | Profesor | Ciencias Naturales |
| `amendoza` | Profesor | Estudios Sociales |
| `cvera` | Profesor | Inglés |
| `ltorres` | Profesor | (Extra) |
| `gsalinas` | Alumno | 8vo A |
| `vmendoza` | Alumno | 8vo A |
| `dcedenyo` | Alumno | 8vo A |
| `cribadeneira` | Alumno | 8vo A |
| `mgarcia` | Alumno | 8vo A |
| `spinto` | Alumno | 8vo A |
| `tbriones` | Alumno | 8vo A |

---

## Modelo de Datos

### 20 modelos en Prisma

**Sistema (RBAC):**
- `user` — Usuarios (admin, profesores, alumnos son el mismo modelo filtrado por `role`)
- `role` — Roles (admin, profesor, alumno)
- `permission` — Permisos (formato `modulo:accion`)
- `rolePermission` — Tabla intermedia rol↔permiso
- `menuSection` — Secciones del menú lateral
- `menuSectionPermission` — Asignación de menús por rol

**Académico:**
- `institution` — Institución educativa
- `level` — Nivel/Año (7mo, 8vo, 9no)
- `subject` — Materia
- `classGroup` — Paralelo (8vo A, 8vo B)
- `enrollment` — Matrícula (alumno ↔ paralelo)
- `teachingAssignment` — Asignación (materia + paralelo + profesor)
- `lesson` — Lección con contenido de texto
- `task` — Tarea (tipo `documento` o `examen`)
- `question` — Pregunta de cuestionario
- `option` — Opción de respuesta de una pregunta
- `schedule` — Bloque de horario (día + hora inicio + hora fin)
- `submission` — Entrega del alumno (archivo, comentario o respuestas)
- `grade` — Calificación de una entrega
- `termGrade` — Nota de parcial/trimestre

### 4 Enums

- `taskType` → `documento` | `examen`
- `submissionStatus` → `pendiente` | `entregada` | `calificada`
- `term` → `primerParcial` | `segundoParcial` | `tercerParcial` | `final`
- `weekDay` → `domingo` | `lunes` | `martes` | `miercoles` | `jueves` | `viernes` | `sabado`

### Restricciones de unicidad

- `classGroup`: `[levelId, parallel]` — no se repite "8vo A"
- `enrollment`: `[classGroupId, studentId]` — un alumno se matricula una vez por paralelo
- `teachingAssignment`: `[subjectId, classGroupId]` — una materia se asigna una vez por paralelo
- `submission`: `[taskId, studentId]` — una entrega por alumno por tarea
- `grade`: `submissionId @unique` — una nota por entrega
- `termGrade`: `[teachingAssignmentId, studentId, term]` — una nota por parcial

### Cascade deletes

Eliminar un registro padre borra automáticamente a sus dependientes:
- `institution` → `level`, `subject`, `classGroup` → (todo lo de abajo)
- `teachingAssignment` → `lesson`, `task`, `schedule`, `termGrade`
- `task` → `submission` → `grade`
- `lesson` → `task`

---

## Estructura del Backend

### Patrón por módulo

Cada módulo CRUD sigue el mismo patrón:

```
src/<module>/
├── dto/
│   ├── create-<module>.dto.ts    # DTO de creación (class-validator)
│   └── update-<module>.dto.ts    # DTO de edición (PartialType)
├── <module>.controller.ts        # Controlador (GET/POST/PATCH/DELETE)
├── <module>.service.ts           # Lógica de negocio (PrismaService)
└── <module>.module.ts            # Módulo NestJS
```

### Configuración global (`main.ts`)

- **Prefijo de rutas:** `v1/promo/api`
- **Puerto:** 7001
- **Body limit:** 10MB
- **ValidationPipe:** `whitelist`, `forbidNonWhitelisted`, `transform`, errores HTTP 406
- **CORS:** origin configurable (`FRONTEND_URL`), credentials: true
- **Helmet:** CSP estricto, HSTS, X-Frame-Options DENY
- **Rate limiting:** 30 req/min (short), 500 req/hora (long)
- **Swagger:** `/docs` (solo en desarrollo)
- **Cookies:** `cookie-parser` habilitado (JWT en cookie httpOnly)

### Seguridad

- **Autenticación:** JWT en cookie httpOnly (`session_id`)
- **Password hashing:** bcrypt (salt rounds 10)
- **Autorización:** Guards `JwtAuthGuard` + `PermissionsGuard` con `@RequirePermission('modulo', 'accion')`
- **Rate limiting:** ThrottlerBehindProxyGuard (detecta IP real tras proxy)
- **Audit logging:** Middleware que registra requests con status >= 400
- **Anti-duplicados:** Interceptor que bloquea POST/PATCH idénticos dentro de 5 segundos

### Manejo de errores (`GlobalExceptionFilter`)

Todos los errores de Prisma se traducen a mensajes en español:

| Error Prisma | Mensaje al usuario |
|---|---|
| P2002 (duplicado) | "Ya existe un {modelo} con esos datos ({campos}). Verifica que no esté duplicado." |
| P2003 (FK inválida) | "No se puede completar la operación porque el {campo} referenciado no existe." |
| P2025 (no encontrado) | "No se encontró el {modelo} solicitado." |
| Error genérico | "Ocurrió un error inesperado. Inténtalo nuevamente." |

---

## Estructura del Frontend

### App Router (22 rutas)

```
/login                    → Pantalla de login (split gradient)
/lms                      → Dashboard (cambia según rol)
/lms/my-courses           → Listado de materias (alumno)
/lms/my-courses/[id]      → Detalle de curso (lecciones + tareas)
/lms/my-grades            → Notas del alumno
/lms/my-schedule          → Horario semanal del alumno
/lms/teacher/assignments  → Clases del profesor + gestión de contenido
/lms/teacher/grading      → Calificar entregas
/lms/teacher/schedule     → Horario semanal del profesor
/lms/admin/institutions   → CRUD instituciones
/lms/admin/levels         → CRUD niveles
/lms/admin/subjects       → CRUD materias
/lms/admin/class-groups   → CRUD paralelos
/lms/admin/students       → Gestión de estudiantes
/lms/admin/teachers       → Gestión de profesores
/lms/admin/enrollments    → Matrículas
/lms/admin/teaching-assignments → Asignaciones
/lms/admin/schedule       → Gestión de horarios
/lms/profile              → Perfil + cambio de contraseña
```

### Arquitectura DDD (módulos)

```
src/modules/<feature>/
├── domain/              # Tipos TypeScript + interfaces (repositorios)
│   ├── academic.ts      # Tipos del dominio
│   ├── academicInputs.ts # Tipos de entrada (Create, Update, Submit)
│   └── academicRepository.ts # Interfaz del repositorio
├── application/         # Casos de uso (curried functions)
└── infrastructure/      # Implementación con fetch
    ├── apiAcademic.ts   # Repositorio del módulo academic
    └── apiCrud.ts       # Repositorios CRUD genéricos
```

### Fuentes

- **Inter** (sans-serif) — texto general
- **Playfair Display** (serif) — títulos y headings
- Cargadas vía `next/font/google`

### Diseño visual

- **Tema claro** con fondo cálido (`oklch(0.97 0.003 25)`)
- **Sidebar oscuro** estilo stone (`oklch(0.18 0.004 25)`)
- **Primario:** rojo oscuro (`oklch(0.39 0.19 25)` ≈ #7a2d2a)
- **Colores semánticos:** success (verde), warning (ámbar), info (azul)
- **Colores por materia:** paleta de 8 colores deterministas (azul, morado, verde, ámbar, rosa, cian, índigo, teal)
- **Animaciones:** motion (framer-motion) para entradas, hovers y count-up
- **Componentes:** shadcn/ui sobre Radix UI

---

## Sistema de Roles y Permisos

### Roles (3)

| Rol | Descripción |
|---|---|
| `admin` | Acceso total al sistema. Gestiona estructura académica y usuarios. |
| `profesor` | Gestiona su material (lecciones, tareas, cuestionarios). Califica entregas. |
| `alumno` | Ve sus cursos, entrega tareas, responde cuestionarios, consulta notas. |

### Permisos (51)

Formato: `modulo:accion` (ej: `institution:create`, `grade:update`)

- **12 módulos** × **4 acciones CRUD** (create, read, update, delete) = 48
- **3 permisos académicos especiales**: `academic:student-read`, `academic:teacher-read`, `academic:submit-task`

### Asignación por rol

- **admin** → TODOS los permisos
- **profesor** → lectura general + crear/editar/eliminar lecciones y tareas + calificar + `academic:teacher-read`
- **alumno** → `academic:student-read` + `academic:submit-task`

### Guards

- `JwtAuthGuard` — verifica el JWT en la cookie httpOnly
- `PermissionsGuard` — verifica que el usuario tenga el permiso requerido (`@RequirePermission`)
- `ThrottlerBehindProxyGuard` — rate limiting global

### Menús dinámicos

El sidebar se puebla dinámicamente desde el backend (`menuSection` + `menuSectionPermission`). Cada rol ve solo los menús que le corresponden.

---

## Funcionalidades Implementadas

### 🔐 Autenticación

- Login con cookie JWT httpOnly
- Logout (limpia cookie)
- Validación de sesión (`/auth/me`)
- Cambio de contraseña con verificación de contraseña actual
- Protección de rutas en el frontend (`ProtectedRoute` + `AuthContext`)

### 🏛️ Gestión Académica (Admin)

- CRUD completo de: instituciones, niveles, materias, paralelos
- Gestión de estudiantes y profesores (crear, editar, eliminar, activar/desactivar)
- Matrículas (asignar alumnos a paralelos)
- Asignaciones (asignar materas+paralelos a profesores)
- Gestión de horarios (bloques de clase con día y horas)
- Dashboard con gráficos (usuarios por rol, composición académica)

### 📚 Profesor

- Dashboard con clases de hoy y asignaciones
- Crear/editar/eliminar **lecciones** (con contenido de texto)
- Crear/editar/eliminar **tareas** de dos tipos:
  - **📄 Documento** — el alumno sube un archivo (PDF/DOCX/JPG)
  - **✍️ Cuestionario** — preguntas de opción múltiple con auto-calificación
- Constructor de cuestionarios: enunciado + opciones + marcar respuesta correcta
- Calificar entregas de tareas tipo documento (nota + retroalimentación)
- Registrar notas de parcial (primer parcial, segundo, tercero, final)
- Ver su horario semanal

### 🎓 Alumno

- Dashboard con resumen (tareas pendientes, gráficos, próximas entregas)
- Ver sus cursos (cards con color por materia)
- Leer lecciones en acordeón expandible
- Entregar tareas tipo documento (subir archivo + comentario)
- **Responder cuestionarios** (radio buttons, auto-calificación al instante)
- Consultar notas (promedio general + tabla con colores verde/ámbar/rojo)
- Ver su horario semanal (grilla o cards en móvil)
- Editar su perfil y cambiar contraseña

### 🗓️ Horarios

- Grilla semanal estilo "horario escolar" (Lun-Vie × 7:00-18:00)
- Bloques coloreados por materia
- Vista responsive: grilla en escritorio, cards apiladas en móvil
- Cada bloque muestra: materia, paralelo, horas, profesor

### 📊 Dashboard

- **Alumno:** 4 stat cards animadas, dona de distribución de tareas, próximas entregas con badges de urgencia
- **Profesor:** 4 stat cards, clases de hoy, asignaciones
- **Admin:** 4 stat cards, gráfico de barras (usuarios por rol), dona (composición académica), accesos rápidos

### ⚠️ Manejo de Errores

- Errores de Prisma traducidos a español con contexto del campo/modelo
- Frontend verifica `res.ok` en todas las llamadas API (`apiFetch` wrapper)
- Toasts informativos con mensajes claros y accionables

---

## Decisiones de Diseño

1. **Profesor/alumno son `user` filtrado por `role`** — no se crean modelos separados. Una persona existe independientemente de su rol.
2. **Sin relaciones cíclicas** — la jerarquía es unidireccional: `institution → level → classGroup → teachingAssignment → lesson/task → submission → grade`.
3. **N:M con tabla intermedia explícita** — `enrollment` y `teachingAssignment` son modelos completos (no relaciones implícitas de Prisma).
4. **Enums antes que tablas** — `taskType`, `submissionStatus`, `term`, `weekDay` son enums (sin tildes por requisito de Prisma).
5. **Auto-calificación de cuestionarios** — el backend compara respuestas y calcula la nota al instante; el profesor no necesita calificar cuestionarios.
6. **Material por paralelo** — cada paralelo (8vo A, 8vo B) tiene su propio material. Las lecciones y tareas cuelgan de `teachingAssignment` (materia+paralelo+profesor).
7. **Cascade delete** — borrar un registro padre elimina automáticamente a sus dependientes (configurado en el schema de Prisma).
8. **Seed idempotente** — el seed usa `upsert`/`findFirst` para poder ejecutarse múltiples veces sin duplicar datos.

---

## Endpoints de la API

### Autenticación (`/auth`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Iniciar sesión (set cookie JWT) |
| GET | `/auth/me` | Usuario actual |
| POST | `/auth/logout` | Cerrar sesión |
| POST | `/auth/change-password` | Cambiar contraseña (verifica actual) |

### CRUDs estándar (12 módulos)

Cada uno con: `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`

- `/institution`, `/level`, `/subject`, `/class-group`, `/enrollment`, `/teaching-assignment`, `/lesson`, `/task`, `/schedule`, `/submission`, `/grade`, `/term-grade`

### Académico (`/academic`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/academic/my-classes` | Clases del alumno |
| GET | `/academic/my-tasks` | Tareas del alumno |
| GET | `/academic/my-lessons` | Lecciones del alumno |
| GET | `/academic/my-grades` | Notas del alumno |
| POST | `/academic/submissions/:taskId` | Entregar tarea / cuestionario |
| GET | `/academic/teacher/assignments` | Asignaciones del profesor |
| GET | `/academic/teacher/lessons/:assignmentId` | Lecciones de una asignación |
| GET | `/academic/teacher/tasks/:assignmentId` | Tareas de una asignación |
| POST | `/academic/teacher/lessons` | Crear lección |
| PATCH | `/academic/teacher/lessons/:id` | Editar lección |
| DELETE | `/academic/teacher/lessons/:id` | Eliminar lección |
| POST | `/academic/teacher/tasks` | Crear tarea (documento o examen) |
| PATCH | `/academic/teacher/tasks/:id` | Editar tarea |
| DELETE | `/academic/teacher/tasks/:id` | Eliminar tarea |
| GET | `/academic/teacher/submissions/:taskId` | Entregas de una tarea |
| POST | `/academic/teacher/grades/:submissionId` | Calificar entrega |
| POST | `/academic/teacher/term-grades` | Registrar nota de parcial |

### Subida de archivos (`/uploads`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/uploads/submission-file` | Subir archivo de entrega (PDF/DOCX/JPG/PNG, máx 10MB) |

---

## Comandos Útiles

### Backend

```bash
# Desarrollo
pnpm start:dev

# Compilar
pnpm build

# Producción
pnpm start:prod

# Migraciones
npx prisma migrate dev --name <nombre>    # Crear migración
npx prisma migrate status                 # Ver estado
npx prisma migrate reset --force          # Resetear BD (¡cuidado!)

# Cliente Prisma
npx prisma generate                       # Regenerar cliente
npx prisma validate                       # Validar schema
npx prisma format                         # Formatear schema

# Seed
npx prisma db seed                        # Cargar datos demo

# Swagger
# Disponible en http://localhost:7001/docs (solo desarrollo)
```

### Frontend

```bash
# Desarrollo
pnpm dev

# Compilar
pnpm build

# Producción
pnpm start

# Lint
pnpm lint
```

---

## Migraciones

| # | Nombre | Fecha | Descripción |
|---|---|---|---|
| 1 | `add_inti` | 2026-07-03 | Schema inicial (RBAC + modelos académicos) |
| 2 | `add_cascade_delete` | 2026-07-04 | Cascade deletes en todas las FK |
| 3 | `add_quiz_system` | 2026-07-06 | Sistema de cuestionarios (taskType, question, option, answers) |

---

## Datos Demo (Seed)

El seed crea:

- **3 roles:** admin, profesor, alumno
- **51 permisos** asignados por rol
- **15 usuarios** (1 admin, 6 profesores, 8 alumnos)
- **1 institución:** ULEAM
- **3 niveles:** 7mo, 8vo, 9no
- **5 materias:** Matemáticas, Lenguaje y Comunicación, Ciencias Naturales, Estudios Sociales, Inglés
- **2 paralelos:** 8vo A, 8vo B
- **5 asignaciones:** cada materia con su profesor en 8vo A
- **11 bloques de horario** distribuidos Lun-Vie
- **10+ lecciones** con contenido de texto
- **8+ tareas** (incluyendo un cuestionario de 5 preguntas con auto-calificación)
- **6 entregas** de demo (calificadas y pendientes)
- **1 nota de parcial** (8.5 en Matemáticas)
- **18 secciones de menú** asignadas por rol

---

## Notas Finales

- El sistema está pensado para un **uso académico de titulación** — no es un Moodle production-ready, pero cubre los flujos esenciales de un LMS.
- El código sigue **convenciones consistentes**: camelCase singular en modelos Prisma, kebab-case en carpetas frontend, PascalCase en clases TypeScript.
- Los errores se muestran en **español claro y accionable** al usuario final.
- El diseño es **responsive** (móvil y escritorio) con sidebar oscuro y tema cálido.

---

*Documentación generada para el proyecto de titulación ULEAM LMS.*
