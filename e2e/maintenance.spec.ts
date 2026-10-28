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

test('registrar un mantenimiento con ítem y ver el total', async ({ page }) => {
  await register(page, 'Dueño E2E', uniqueEmail('maint'))

  // Crear vehículo.
  await page.getByRole('link', { name: 'Vehículos' }).click()
  await page.getByLabel('Marca').fill('Toyota')
  await page.getByLabel('Modelo').fill('Corolla')
  await page.getByRole('button', { name: 'Agregar' }).click()
  await expect(page.getByText('Toyota Corolla')).toBeVisible()

  // Ir al mantenimiento del vehículo.
  await page.getByRole('link', { name: 'Ver', exact: true }).first().click()
  await page.getByRole('link', { name: 'Ver mantenimiento' }).click()
  await expect(page).toHaveURL(/\/mantenimiento$/)

  // Registrar el servicio con un ítem.
  await page.getByLabel('Fecha', { exact: true }).fill('2026-06-01')
  await page.getByLabel('Odómetro (km)').fill('1000')
  await page.getByPlaceholder('Descripción').fill('Aceite 5W30')
  await page.getByPlaceholder('Cant.').fill('2')
  await page.getByPlaceholder('Precio').fill('10')
  await page.getByRole('button', { name: 'Agregar', exact: true }).click()

  // Aparece en el historial con el total calculado.
  await expect(page.getByText(/20 USD/)).toBeVisible()

  // El detalle muestra el ítem.
  await page.getByRole('link', { name: 'Ver', exact: true }).first().click()
  await expect(page.getByText('Aceite 5W30')).toBeVisible()
})
