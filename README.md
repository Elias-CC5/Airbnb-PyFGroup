# PyFGroup — Plataforma de alquiler de alojamientos

Plataforma web completa de alquiler de alojamientos vacacionales y turísticos en Perú.
Arquitectura cliente-servidor **totalmente separada**: NestJS + PostgreSQL + Prisma en el backend,
Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 en el frontend.

> *Wasi* significa **casa** en quechua.

---

## Tabla de contenido

1. [Requisitos](#1-requisitos)
2. [Instalación rápida](#2-instalación-rápida)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Instalación del backend](#4-instalación-del-backend)
5. [Instalación del frontend](#5-instalación-del-frontend)
6. [PostgreSQL](#6-postgresql)
7. [Prisma](#7-prisma)
8. [Migraciones](#8-migraciones)
9. [Seed (datos de prueba)](#9-seed-datos-de-prueba)
10. [Ejecutar el proyecto](#10-ejecutar-el-proyecto)
11. [API](#11-api)
12. [Swagger](#12-swagger)
13. [Crear un administrador](#13-crear-un-administrador)
14. [Subida de imágenes](#14-subida-de-imágenes)
15. [WhatsApp](#15-whatsapp)
16. [Deployment](#16-deployment)
17. [Arquitectura y decisiones](#17-arquitectura-y-decisiones)
18. [Seguridad](#18-seguridad)

---

## 1. Requisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20 LTS (recomendado 22) |
| npm | 10 |
| PostgreSQL | 14 (recomendado 16) |
| Docker (opcional) | 24 |

---

## 2. Instalación rápida

### Opción A — Docker (todo en un comando)

```bash
docker compose up -d
docker compose exec backend npm run seed
```

- Frontend → http://localhost:3000
- API → http://localhost:4000/api/v1
- Swagger → http://localhost:4000/api/v1/docs

### Opción B — Manual

```bash
# 1. Base de datos (con Docker sólo para Postgres)
docker compose up -d postgres

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev          # http://localhost:4000

# 3. Frontend (en otra terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                # http://localhost:3000
```

---

## 3. Variables de entorno

Nunca escribas secretos en el código ni subas `.env` al repositorio.
Cada proyecto tiene su propio `.env.example` documentado.

### `backend/.env`

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | Puerto de la API (4000) |
| `API_PREFIX` | Prefijo global (`api/v1`) |
| `FRONTEND_URL` | URL del frontend |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL |
| `JWT_SECRET` | Secreto del access token (mín. 24 caracteres) |
| `JWT_EXPIRES_IN` | Duración del access token (`15m`) |
| `JWT_REFRESH_SECRET` | Secreto del refresh token (distinto del anterior) |
| `JWT_REFRESH_EXPIRES_IN` | Duración del refresh (`7d`) |
| `COOKIE_SECURE` | `true` en producción (HTTPS) |
| `THROTTLE_TTL` / `THROTTLE_LIMIT` | Rate limiting global |
| `STORAGE_DRIVER` | `local` o `cloudinary` |
| `MAX_UPLOAD_SIZE_MB` | Tamaño máximo por imagen |
| `CLOUDINARY_*` | Credenciales si usas Cloudinary |
| `WHATSAPP_DEFAULT_PHONE` | Número de soporte (formato internacional sin `+`) |

> La app **valida las variables al arrancar** (`src/config/env.validation.ts`).
> Si falta un secreto crítico, no levanta. Fail fast.

### `frontend/.env.local`

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL pública de la API (navegador) |
| `API_INTERNAL_URL` | URL interna para SSR (en Docker: `http://backend:4000/api/v1`) |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio (metadata, sitemap, Open Graph) |
| `NEXT_PUBLIC_SITE_NAME` | Nombre de marca |
| `NEXT_PUBLIC_WHATSAPP_PHONE` | WhatsApp de soporte |

---

## 4. Instalación del backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
```

---

## 5. Instalación del frontend

```bash
cd frontend
cp .env.example .env.local
npm install
```

---

## 6. PostgreSQL

Con Docker:

```bash
docker compose up -d postgres
```

Manual:

```sql
CREATE DATABASE wasi_peru;
CREATE USER wasi WITH ENCRYPTED PASSWORD 'wasi_password';
GRANT ALL PRIVILEGES ON DATABASE wasi_peru TO wasi;
```

Luego ajusta `DATABASE_URL` en `backend/.env`.

> **Nota:** PostgreSQL es el motor de base de datos. *PostgREST* es otra cosa
> (una capa que expone Postgres como API) y **no** se usa en este proyecto:
> el acceso a datos pasa siempre por NestJS + Prisma.

---

## 7. Prisma

El esquema vive en `backend/prisma/schema.prisma` y modela:

`User` · `RefreshToken` · `PasswordReset` · `Department` · `Province` · `District` ·
`Location` · `Category` · `Amenity` · `PropertyAmenity` · `Property` · `PropertyImage` ·
`AvailabilityBlock` · `Reservation` · `Review` · `Favorite` · `ContactMessage` · `Setting`

Comandos útiles:

```bash
npm run prisma:generate    # regenera el cliente tipado
npm run prisma:studio      # explorador visual de la BD
```

---

## 8. Migraciones

```bash
# desarrollo (crea y aplica)
npx prisma migrate dev --name init

# producción (sólo aplica migraciones existentes)
npx prisma migrate deploy
```

---

## 9. Seed (datos de prueba)

```bash
npm run seed
```

Genera 10 departamentos con provincias y distritos, 8 categorías, 18 amenidades,
18 alojamientos con fotos, 8 reservas en distintos estados, reseñas y favoritos.

**Credenciales generadas — SÓLO DESARROLLO. Cámbialas antes de producción:**

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@wasi.pe` | `Admin123!` |
| Anfitrión | `anfitrion@wasi.pe` | `Anfitrion123!` |
| Usuario | `lucia@correo.com` | `Usuario123!` |

Puedes cambiar las del administrador con `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`.

---

## 10. Ejecutar el proyecto

```bash
# backend
cd backend && npm run start:dev

# frontend
cd frontend && npm run dev
```

Verificaciones recomendadas tras cambios importantes:

```bash
cd backend  && npm run build && npm test
cd frontend && npm run typecheck && npm run build
```

---

## 11. API

Prefijo global: `/api/v1`

| Recurso | Endpoints principales |
|---|---|
| Auth | `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `GET /auth/me` · `POST /auth/forgot-password` · `POST /auth/reset-password` |
| Users | `GET /users/me` · `PATCH /users/me` · `GET /users` *(admin)* · `PATCH /users/:id/role` *(admin)* |
| Properties | `GET /properties` · `GET /properties/featured` · `GET /properties/slug/:slug` · `POST /properties` *(admin)* · `PATCH /properties/:id` *(admin)* · `DELETE /properties/:id` *(admin)* |
| Categories | `GET /categories` · `POST /categories` *(admin)* |
| Amenities | `GET /amenities` · `GET /amenities/grouped` |
| Locations | `GET /locations/departments` · `.../provinces` · `.../districts` |
| Availability | `POST /availability/properties/:id/check` · `GET /availability/properties/:id/occupied` |
| Reservations | `POST /reservations` · `GET /reservations/me` · `PATCH /reservations/:id/cancel` · `GET /reservations` *(admin)* |
| Reviews | `GET /reviews/property/:id` · `POST /reviews` |
| Favorites | `GET /favorites` · `POST /favorites/:propertyId/toggle` |
| Uploads | `POST /uploads/properties/:id/images` *(admin)* |
| WhatsApp | `GET /whatsapp/properties/:id/link` |
| Admin | `GET /admin/dashboard` · `.../reservations-series` · `.../top-properties` |
| Health | `GET /health` |

Ejemplo:

```bash
curl "http://localhost:4000/api/v1/properties?department=cusco&guests=4&sort=price_asc"
```

---

## 12. Swagger

Disponible en desarrollo:

```
http://localhost:4000/api/v1/docs
```

Usa **Authorize** con el `accessToken` que devuelve `/auth/login`.

---

## 13. Crear un administrador

**Opción 1 — seed:** define `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` y ejecuta `npm run seed`.

**Opción 2 — promover una cuenta existente:**

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tucorreo@dominio.com';
```

**Opción 3 — desde el panel:** un administrador puede cambiar roles en `/admin/usuarios`.

---

## 14. Subida de imágenes

El almacenamiento está detrás de una interfaz (`StorageProvider`), por lo que el
proveedor es intercambiable sin tocar la lógica de negocio.

| Driver | Cuándo usarlo |
|---|---|
| `local` | Desarrollo. Guarda en `backend/uploads/` y sirve en `/uploads/...` |
| `cloudinary` | Producción. Optimización y CDN automáticos |

Para añadir **AWS S3** o **Supabase Storage**: crea una clase que implemente
`StorageProvider` (`upload` y `remove`) y regístrala en el factory de
`uploads.module.ts`. Nada más cambia.

Validaciones aplicadas: tipo MIME permitido (`jpeg`, `png`, `webp`, `avif`),
tamaño máximo configurable y máximo de 10 archivos por petición.

---

## 15. WhatsApp

Cada alojamiento tiene un botón **Contactar por WhatsApp** que abre `https://wa.me/<número>`
con un mensaje ya redactado (alojamiento, ubicación, fechas y huéspedes).

- Backend: `GET /api/v1/whatsapp/properties/:id/link` — plantilla centralizada.
- Frontend: `buildWhatsappUrl()` genera el enlace sin round-trip.

El módulo está aislado para poder integrar **WhatsApp Business API** más adelante:
bastaría con añadir un método `sendTemplate()` a `WhatsappService`.

---

## 16. Deployment

**Frontend (Vercel)**

```
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api/v1
API_INTERNAL_URL=https://api.tudominio.com/api/v1
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

**Backend (Railway, Render, Fly.io o VPS)**

```bash
docker build --target production -t wasi-backend ./backend
npx prisma migrate deploy
```

Checklist antes de producción:

- [ ] `JWT_SECRET` y `JWT_REFRESH_SECRET` nuevos y aleatorios (`openssl rand -base64 48`)
- [ ] `COOKIE_SECURE=true` y HTTPS activo
- [ ] `CORS_ORIGINS` con el dominio real, sin `localhost`
- [ ] `STORAGE_DRIVER=cloudinary` (o S3)
- [ ] Credenciales del seed cambiadas o eliminadas
- [ ] Backups automáticos de PostgreSQL

---

## 17. Arquitectura y decisiones

```
wasi-peru/
├── backend/            NestJS · REST · Prisma · PostgreSQL
│   ├── src/
│   │   ├── auth/       controllers · dto · guards · strategies · interfaces · services
│   │   ├── users/      controllers · dto · entities · services
│   │   ├── properties/ controllers · dto · entities · interfaces · services
│   │   ├── categories/ amenities/ locations/
│   │   ├── availability/ reservations/ reviews/ favorites/
│   │   ├── uploads/    admin/ whatsapp/
│   │   ├── common/     decorators · filters · guards · interceptors · pipes · utils
│   │   ├── config/     app · jwt · storage · whatsapp · validación de env
│   │   └── database/   PrismaService
│   └── prisma/         schema.prisma · seed.ts
│
└── frontend/           Next.js 15 · App Router · Tailwind v4
    └── src/
        ├── app/        (public) · (auth) · (dashboard) · admin
        ├── components/ ui · layout · shared
        ├── features/   auth · properties · reservations · favorites ·
        │               reviews · search · admin · whatsapp · home
        │               (cada una con components · hooks · services · schemas · types)
        ├── services/api  endpoints y query keys centralizados
        ├── lib/        api-client · format · seo · utils
        ├── store/      estado de sesión (Zustand)
        ├── types/ constants/ hooks/ utils/
```

**Decisiones clave**

- **Prisma sobre TypeORM.** Cliente tipado a partir del esquema, migraciones
  deterministas y mejores mensajes de error. Un solo archivo describe todo el modelo.
- **Separación estricta.** El frontend no contiene lógica de negocio: sólo consume
  la API. Toda regla (disponibilidad, precios, permisos) vive en el backend.
- **JWT + refresh con rotación.** El access token (15 min) se guarda **en memoria**;
  el refresh (7 días) viaja en cookie **HttpOnly** y se **rota** en cada uso. Los
  refresh se guardan **hasheados** y pueden revocarse individualmente o en bloque.
- **Guard global.** Todo endpoint exige JWT salvo que se marque con `@Public()`:
  es imposible exponer un endpoint por olvido.
- **Roles jerárquicos.** `USER < HOST < ADMIN < SUPER_ADMIN`. `HOST` y `SUPER_ADMIN`
  ya existen en el modelo, listos para activarse sin migración.
- **Disponibilidad como fuente única de verdad.** `AvailabilityService` resuelve
  solapamientos; la creación de reserva **revalida dentro de la transacción**, lo que
  evita la doble reserva por condición de carrera.
- **Borrado lógico** (`deletedAt`) en usuarios y alojamientos: el histórico de
  reservas y reseñas nunca se rompe.
- **Filtros en la URL.** La búsqueda es compartible, indexable y el botón "atrás" funciona.
- **SEO real.** Slugs (`/alojamiento/casa-moderna-cusco`), metadata dinámica,
  Open Graph, JSON-LD `LodgingBusiness`, `sitemap.xml` y `robots.txt`.
- **Responsabilidad única.** Ningún archivo concentra la página completa:
  `PropertyCard`, `PropertyGallery`, `PropertyAmenities`, `BookingCard`,
  `ReviewsSection` son piezas independientes y reutilizables.

**Estados de la interfaz.** Cada vista que consume la API maneja los cuatro
estados: *cargando* (skeletons), *éxito*, *vacío* (`EmptyState`) y *error*
(`ErrorState` con reintento).

---

## 18. Seguridad

| Medida | Implementación |
|---|---|
| Hash de contraseñas | Argon2id (`PasswordService`) |
| Tokens | JWT + refresh rotativo, almacenado hasheado (SHA-256) |
| Cookies | `HttpOnly`, `SameSite=Lax`, `Secure` en producción |
| Autorización | `JwtAuthGuard` global + `RolesGuard` jerárquico |
| Validación | DTOs con `class-validator`, `whitelist` + `forbidNonWhitelisted` |
| Rate limiting | `@nestjs/throttler` global, más estricto en login y registro |
| Cabeceras | Helmet + cabeceras de seguridad en Next.js |
| CORS | Lista blanca por variable de entorno |
| Errores | Filtro global: mensajes normalizados, sin filtrar internals |
| Uploads | Validación MIME, límite de tamaño y de cantidad |
| Enumeración de usuarios | Login y recuperación devuelven mensajes genéricos |
| Secretos | Sólo en `.env`, validados al arrancar, nunca en el cliente |

---

## Licencia

MIT — úsalo, modifícalo y publícalo como quieras.
