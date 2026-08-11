#Airbnb PyFGroup — Backend

NestJS · TypeScript · Prisma · PostgreSQL · JWT.

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev   # http://localhost:4000/api/v1
```

Swagger: `http://localhost:4000/api/v1/docs`.
Arquitectura modular: cada módulo tiene `controllers`, `dto`, `entities`,
`interfaces` y `services` propios. Ver el README de la raíz para el detalle.
