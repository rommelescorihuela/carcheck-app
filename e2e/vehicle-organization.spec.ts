import { expect, test, type Page } from '@playwright/test'

const password = 'secret-password'

// PNG 1x1 válido para la subida de foto.
const pngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC'

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

test('vehículo de organización: crear, subir foto y traspasar a personal', async ({ page }) => {
  await register(page, 'Dueño de flota', uniqueEmail('flota'))

  // Crear organización (queda activa). Se asserta el radio de la organización: el nombre del
  // usuario aparece en la cabecera y `getByText` lo confundiría con la organización creada.
  await page.getByPlaceholder('Nombre de la organización').fill('Flota E2E')
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await expect(page.getByRole('radio', { name: /Flota E2E/ })).toBeChecked()

  // Crear un vehículo en el ámbito de la organización.
  await page.getByRole('link', { name: 'Vehículos' }).click()
  await expect(page).toHaveURL(/\/vehiculos$/)
  await page.getByLabel('Marca').fill('Chevrolet')
  await page.getByLabel('Modelo').fill('Aveo')
  await page.getByRole('button', { name: 'Agregar' }).click()
  await expect(page.getByText('Chevrolet Aveo')).toBeVisible()

  // Detalle y subida de foto.
  await page.getByRole('link', { name: 'Ver' }).first().click()
  await expect(page.getByRole('heading', { name: /Chevrolet Aveo/ })).toBeVisible()

  await page.locator('input[type=file]').setInputFiles({
    name: 'carro.png',
    mimeType: 'image/png',
    buffer: Buffer.from(pngBase64, 'base64'),
  })
  await expect(page.locator('img[alt="Vehículo"]')).toBeVisible()

  // Traspasar la organización → cuenta personal (el usuario es owner).
  await page.getByRole('button', { name: 'Traspasar' }).click()
  await expect(page.locator('img[alt="Vehículo"]')).toBeVisible()

  // Cambiar al ámbito personal y comprobar que el vehículo está ahí.
  await page.getByRole('link', { name: 'Organizaciones' }).click()
  await page.getByRole('radio', { name: 'Personal' }).check()
  await page.getByRole('link', { name: 'Vehículos' }).click()
  await expect(page.getByText('Chevrolet Aveo')).toBeVisible()
})
