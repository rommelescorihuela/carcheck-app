import { expect, test, type Page } from '@playwright/test'

const password = 'secret-password'

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`
}

// Fecha local a N días de hoy, en `YYYY-MM-DD` (el backend compara por día).
function isoInDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
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

test('un documento por vencer genera un recordatorio y se puede descartar', async ({ page }) => {
  await register(page, 'Dueño E2E', uniqueEmail('rec'))

  // Vehículo personal.
  await page.getByRole('link', { name: 'Vehículos' }).click()
  await page.getByLabel('Marca').fill('Toyota')
  await page.getByLabel('Modelo').fill('Corolla')
  await page.getByRole('button', { name: 'Agregar' }).click()
  await expect(page.getByText('Toyota Corolla')).toBeVisible()

  // Documento que vence en 10 días: entra en el umbral de aviso (30 días).
  await page.getByRole('link', { name: 'Ver', exact: true }).first().click()
  await page.getByRole('link', { name: 'Ver documentos' }).click()
  await expect(page).toHaveURL(/\/documentos$/)
  await page.getByLabel('Tipo').selectOption('insurance')
  await page.getByLabel('Nombre').fill('Seguro 2026')
  await page.getByLabel('Vence el (opcional)').fill(isoInDays(10))
  await page.getByRole('button', { name: 'Agregar', exact: true }).click()
  await expect(page.getByText('Seguro 2026')).toBeVisible()

  // Recordatorios: la primera pasada crea el aviso.
  await page.getByRole('link', { name: 'Recordatorios' }).click()
  await expect(page).toHaveURL(/\/recordatorios$/)
  await expect(page.getByText('No hay recordatorios en este ámbito.')).toBeVisible()

  await page.getByRole('button', { name: 'Comprobar ahora' }).click()
  await expect(page.getByText('Se creó 1 recordatorio.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Próximos (1)' })).toBeVisible()
  await expect(page.getByText('Seguro: por vencer')).toBeVisible()
  await expect(page.getByText('Toyota Corolla')).toBeVisible()
  await expect(page.getByText(/faltan 10 días/)).toBeVisible()

  // Descartar lo oculta solo para este usuario.
  await page.getByRole('button', { name: 'Descartar' }).click()
  await expect(page.getByText('No hay recordatorios en este ámbito.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Próximos (1)' })).toHaveCount(0)
})
