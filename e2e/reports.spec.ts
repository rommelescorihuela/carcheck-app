import { expect, test, type Page } from '@playwright/test'

const password = 'secret-password'

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`
}

// Fecha local en `YYYY-MM-DD`; el informe usa el año en curso como periodo por defecto.
function isoDate(date: Date): string {
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

test('el informe suma mantenimiento y combustible por vehículo y mes', async ({ page }) => {
  const today = isoDate(new Date())
  await register(page, 'Dueño E2E', uniqueEmail('report'))

  // Vehículo.
  await page.getByRole('link', { name: 'Vehículos' }).click()
  await page.getByLabel('Marca').fill('Toyota')
  await page.getByLabel('Modelo').fill('Corolla')
  await page.getByRole('button', { name: 'Agregar' }).click()
  await expect(page.getByText('Toyota Corolla')).toBeVisible()

  // Mantenimiento: 2 × 10 = 20 USD.
  await page.getByRole('link', { name: 'Ver', exact: true }).first().click()
  await page.getByRole('link', { name: 'Ver mantenimiento' }).click()
  await page.getByLabel('Fecha', { exact: true }).fill(today)
  await page.getByLabel('Odómetro (km)').fill('1000')
  await page.getByPlaceholder('Descripción').fill('Aceite 5W30')
  await page.getByPlaceholder('Cant.').fill('2')
  await page.getByPlaceholder('Precio').fill('10')
  await page.getByRole('button', { name: 'Agregar', exact: true }).click()
  await expect(page.getByText(/20 USD/)).toBeVisible()

  // Combustible: 40 L × 1 = 40 USD.
  await page.getByRole('link', { name: 'Volver al vehículo' }).click()
  await page.getByRole('link', { name: 'Ver combustible' }).click()
  await page.getByLabel('Fecha', { exact: true }).fill(today)
  await page.getByLabel('Odómetro (km)').fill('1400')
  await page.getByLabel('Litros').fill('40')
  await page.getByLabel('Precio por litro').fill('1')
  await page.getByRole('button', { name: 'Agregar', exact: true }).click()
  await expect(page.getByText(/40 USD/)).toBeVisible()

  // Informe del año en curso: 60 USD en total.
  await page.getByRole('link', { name: 'Reportes' }).click()
  await expect(page).toHaveURL(/\/reportes$/)
  await expect(page.getByRole('heading', { name: 'Reportes' })).toBeVisible()
  await expect(page.getByText('USD 60,00').first()).toBeVisible()
  await expect(page.getByText(/Mantenimiento USD 20,00/)).toBeVisible()
  await expect(page.getByText(/Combustible USD 40,00/)).toBeVisible()
  await expect(page.getByText('Toyota Corolla (USD)')).toBeVisible()

  // Un periodo sin gastos deja el informe vacío.
  await page.getByLabel('Desde').fill('2025-01-01')
  await page.getByLabel('Hasta').fill('2025-12-31')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByText('No hay gastos en este periodo.')).toBeVisible()
  await expect(page.getByText('USD 60,00')).toHaveCount(0)
})
