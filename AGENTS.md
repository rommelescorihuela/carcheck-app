# AGENTS.md — CarCheck (PWA)

PWA que consume la API Laravel del repo vecino `../carcheck`. React 19 + TypeScript + Vite 8 +
React Router 7 + Zustand 5 + Tailwind 4; tests con Vitest 5 (happy-dom). El backend **no se toca
desde aquí**: si un endpoint falta o cambia, se corrige en `../carcheck` y se actualiza el cliente.
Textos de UI en **español**.

## Documentación

- `../carcheck/SPEC-MAP.md` y `../carcheck/SPEC-identity.md` — contrato del módulo `identity`.
- `../carcheck/tasks/plan.md` + `todo.md` — plan y estado.
- Contrato real de la API: `../carcheck/routes/api.php` y `../carcheck/app/Http/Controllers/Api/`.

## Comandos

```bash
cp .env.example .env        # VITE_API_URL (base sin barra final; por defecto http://localhost:8000/api)
npm install
npm run dev                 # Vite en http://localhost:5174 (requiere el backend en marcha)
npm run typecheck           # tsc -b --noEmit
npm run test                # Vitest en modo run (solo src/**)
npm run build               # tsc -b && vite build (genera dist/ + manifest + sw)
npx playwright test         # E2E: levanta backend (:8001) y frontend (:5174)
```

Verificación antes de dar algo por terminado: `npm run typecheck && npm run test && npm run build`.

## Arquitectura

- **API**: `src/api/client.ts` añade `Authorization: Bearer` desde `src/api/token.ts` y, ante 401,
  llama a `POST /token/refresh` **una vez** y reintenta (dedupe con `refreshPromise`; detecta si otra
  pestaña renovó el token vía evento `storage`). Endpoints en `src/api/endpoints.ts`; tipos en
  `src/api/types.ts`. Normaliza `VITE_API_URL` quitando la barra final.
- **Sesión**: `src/stores/auth.ts` (Zustand + persist). El token NO va en el store persistido, sino
  en `src/api/token.ts`. `bootstrap()` valida con `GET /user`.
- **Organización activa**: `src/stores/organization.ts` (persiste `activeId`; `null` = ámbito
  personal). Al cerrar sesión se hace `reset()`.
- **Rutas**: `src/router.tsx` — `RootLayout` (bootstrap) → `ProtectedRoute` → `AppShell`. Las rutas
  estáticas van **antes** que las de parámetro (`:id`).
- **PWA**: `vite-plugin-pwa`; el build genera `manifest.webmanifest` + `sw.js`. Íconos en
  `public/icons/`.

## Reglas y gotchas

- **No copiar código de `/var/www/html/extra/openGym`** (AGPL-3.0): solo referencia de UX/stack.
- TS estricto con `verbatimModuleSyntax`: usa `import type` para tipos; `noUnusedLocals` y
  `noUnusedParameters` rompen el build.
- Usa `ApiError.errors` (`Record<string, string[]>`) para errores por campo.
- El backend devuelve decimales como string: usa el tipo `Decimal`, no `number`.
- **Vitest solo corre `src/**`** (ver `vite.config.ts`); `e2e/` es de Playwright y Vitest no debe
  recogerlo.
- **E2E**: `playwright.config.ts` levanta el backend en `:8001` (Postgres `carcheck` migrado) y el
  frontend en `:5174`. El enlace de invitación se lee de `../carcheck/storage/logs/laravel.log`
  (backend con `MAIL_MAILER=log`, `QUEUE_CONNECTION=sync`). Requiere `npx playwright install chromium`.
  `e2e/admin.spec.ts` comprueba el panel `/admin` (necesita `php artisan migrate --seed` en el backend).

## CI

GitHub Actions (`.github/workflows/tests.yml`): `npm ci` → `typecheck` → `test` → `build`
(el E2E no corre en CI porque necesita backend + Postgres).

