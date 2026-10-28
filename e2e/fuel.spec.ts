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

test('registrar dos cargas y ver el rendimiento en km/l', async ({ page }) => {
  await register(page, 'Dueño E2E', uniqueEmail('fuel'))

  // Crear vehículo.
  await page.getByRole('link', { name: 'Vehículos' }).click()
  await page.getByLabel('Marca').fill('Toyota')
  await page.getByLabel('Modelo').fill('Corolla')
  await page.getByRole('button', { name: 'Agregar' }).click()
  await expect(page.getByText('Toyota Corolla')).toBeVisible()

  // Ir al combustible del vehículo.
  await page.getByRole('link', { name: 'Ver', exact: true }).first().click()
  await page.getByRole('link', { name: 'Ver combustible' }).click()
  await expect(page).toHaveURL(/\/combustible$/)

  // Primera carga (tanque lleno, 1000 km).
  await page.getByLabel('Fecha', { exact: true }).fill('2026-06-01')
  await page.getByLabel('Odómetro (km)').fill('1000')
  await page.getByLabel('Litros').fill('40')
  await page.getByLabel('Precio por litro').fill('1')
  await page.getByRole('button', { name: 'Agregar', exact: true }).click()
  await expect(page.getByText(/40 USD/)).toBeVisible()

  // Segunda carga: 400 km con 40 L ⇒ 10 km/l.
  await page.getByLabel('Fecha', { exact: true }).fill('2026-06-15')
  await page.getByLabel('Odómetro (km)').fill('1400')
  await page.getByLabel('Litros').fill('40')
  await page.getByLabel('Precio por litro').fill('1')
  await page.getByRole('button', { name: 'Agregar', exact: true }).click()

  // El historial y el resumen muestran el rendimiento.
  await expect(page.getByText(/400 km · 10 km\/l/)).toBeVisible()
  await expect(page.getByText('10 km/l').first()).toBeVisible()
})
