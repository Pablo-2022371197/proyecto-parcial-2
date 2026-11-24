# UTEQGram — Proyecto Parcial 2

Aplicación con frontend Material (heredado de UTEQGram) y backend Node + SQLite: login, roles `admin`/`user`, feed de posts y CRUD de usuarios. El pipeline de GitHub Actions ejecuta Playwright y **solo despliega en EC2 si las pruebas pasan**. OpenTelemetry envía logs, métricas y trazas a OpenObserve.

## Credenciales de demostración

| Sistema | Usuario | Contraseña | Uso |
| --- | --- | --- | --- |
| UTEQGram | `admin` | `Admin123!` | CRUD de usuarios + feed |
| UTEQGram | `user` | `User123!` | Solo feed de posts |
| OpenObserve | `admin@uteqgram.local` | `OpenObserve123!` | Logs, métricas, trazas, CI |

## Desarrollo local

Requisito: Node.js 22.5+.

```bash
npm install
npx playwright install chromium
npm start
```

- App: http://127.0.0.1:3000/login
- Health: http://127.0.0.1:3000/api/health

```bash
npx playwright test
```

`npm start` carga OpenTelemetry si existe `OTEL_EXPORTER_OTLP_ENDPOINT`. En local, `npm run start:plain` evita el exportador.

## Docker (app + OpenObserve + collector + node-exporter)

```bash
docker compose up -d --build
```

- App: http://localhost/login
- OpenObserve: http://localhost:5080

Guía de EC2 y secretos de GitHub: [deploy/ec2-setup.md](deploy/ec2-setup.md).

## Roles

- **user**: ve y crea posts. No puede llamar `POST/PUT/DELETE /api/users` (403).
- **admin**: lo anterior más CRUD de usuarios en `/admin/users`.
