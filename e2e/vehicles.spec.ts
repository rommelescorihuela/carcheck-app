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

test('crear un vehículo personal y editar el odómetro', async ({ page }) => {
  await register(page, 'Dueño E2E', uniqueEmail('veh'))

  await page.getByRole('link', { name: 'Vehículos' }).click()
  await expect(page).toHaveURL(/\/vehiculos$/)

  await page.getByLabel('Marca').fill('Toyota')
  await page.getByLabel('Modelo').fill('Corolla')
  await page.getByLabel('Año').fill('2020')
  await page.getByRole('button', { name: 'Agregar' }).click()

  await expect(page.getByText('Toyota Corolla')).toBeVisible()

  await page.getByRole('link', { name: 'Ver' }).first().click()
  await expect(page.getByRole('heading', { name: /Toyota Corolla/ })).toBeVisible()

  await page.getByLabel('Odómetro actual').fill('12345')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()

  await expect(page.getByLabel('Odómetro actual')).toHaveValue('12345')
})
