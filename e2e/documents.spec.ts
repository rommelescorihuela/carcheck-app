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

test('registrar un documento vencido y ver el estado', async ({ page }) => {
  await register(page, 'Dueño E2E', uniqueEmail('doc'))

  // Crear vehículo.
  await page.getByRole('link', { name: 'Vehículos' }).click()
  await page.getByLabel('Marca').fill('Toyota')
  await page.getByLabel('Modelo').fill('Corolla')
  await page.getByRole('button', { name: 'Agregar' }).click()
  await expect(page.getByText('Toyota Corolla')).toBeVisible()

  // Ir a los documentos del vehículo.
  await page.getByRole('link', { name: 'Ver', exact: true }).first().click()
  await page.getByRole('link', { name: 'Ver documentos' }).click()
  await expect(page).toHaveURL(/\/documentos$/)

  // Documento vencido.
  await page.getByLabel('Tipo').selectOption('insurance')
  await page.getByLabel('Nombre').fill('Seguro 2025')
  await page.getByLabel('Vence el (opcional)').fill('2025-01-01')
  await page.getByRole('button', { name: 'Agregar', exact: true }).click()

  await expect(page.getByText('Seguro 2025')).toBeVisible()
  await expect(page.getByText('Vencido', { exact: true })).toBeVisible()
})
