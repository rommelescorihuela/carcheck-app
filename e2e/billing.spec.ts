import { expect, test, type Page } from '@playwright/test'

const password = 'secret-password'

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`
}

async function register(page: Page, name: string, email: string): Promise<void> {
  await page.goto('/register')
  await page.getByLabel('Nombre').fill(name)
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña', { exact: true }).fill(password)
  await page.getByLabel('Repite la contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL(/\/organizaciones$/)
}

test('elegir un plan arranca la prueba gratuita', async ({ page }) => {
  await register(page, 'Dueño E2E', uniqueEmail('billing'))

  await page.getByRole('link', { name: 'Facturación' }).click()
  await expect(page).toHaveURL(/\/facturacion$/)

  // Sin suscripción todavía.
  await expect(page.getByText('Sin suscripción.')).toBeVisible()

  // Elegir el plan Familiar (tiene 14 días de prueba).
  await page.getByRole('button', { name: 'Elegir plan Familiar' }).click()

  await expect(page.getByText('Prueba gratuita', { exact: true })).toBeVisible()
  await expect(page.getByText(/Te quedan 14 días de prueba gratuita/)).toBeVisible()
  await expect(page.getByText('Reportar un pago')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Elegir plan Familiar' })).toBeDisabled()
})
