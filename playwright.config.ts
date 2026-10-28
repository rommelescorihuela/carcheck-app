import { defineConfig, devices } from '@playwright/test'

const FRONTEND_PORT = 5174
const BACKEND_PORT = 8001
const baseURL = `http://127.0.0.1:${FRONTEND_PORT}`

export default defineConfig({
  testDir: './e2e',
  // Todas las specs comparten la misma base de datos y el mismo `php artisan serve` (un solo
  // proceso): en paralelo se pisan los datos y las peticiones se encolan. Una sola worker.
  workers: 1,
  fullyParallel: false,
  // `php artisan serve` arranca en frío y el registro/invitación encadenan varias peticiones.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      // Requiere PostgreSQL migrado (db `carcheck`) y el seeder ejecutado.
      command: `php artisan serve --port=${BACKEND_PORT}`,
      cwd: '../carcheck',
      url: `http://127.0.0.1:${BACKEND_PORT}/up`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        // El correo se renderiza de inmediato al log (storage/logs/laravel.log).
        QUEUE_CONNECTION: 'sync',
        MAIL_MAILER: 'log',
        // Cache en memoria por request: desactiva el rate limiter (register/login)
        // para que corridas repetidas del E2E no den 429.
        CACHE_STORE: 'array',
      },
    },
    {
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_API_URL: `http://127.0.0.1:${BACKEND_PORT}/api`,
      },
    },
  ],
})
