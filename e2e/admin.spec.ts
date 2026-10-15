import { expect, test } from '@playwright/test'

const BACKEND = 'http://127.0.0.1:8001'

// Requiere la BD de dev migrada y sembrada (`php artisan migrate --seed`),
// que crea `admin@carcheck.test` (super_admin) con contraseña `password`.
test('super_admin entra al panel y ve los recursos', async ({ page }) => {
  await page.goto(`${BACKEND}/admin/login`)

  await page.getByRole('textbox', { name: 'Correo electrónico' }).fill('admin@carcheck.test')
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('password')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('link', { name: /organizaciones/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /usuarios/i })).toBeVisible()
})
