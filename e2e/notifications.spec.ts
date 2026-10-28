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

test('aviso de prueba: llega a la bandeja, se marca leído y persisten las preferencias', async ({
  page,
}) => {
  await register(page, 'Dueño E2E', uniqueEmail('notif'))

  await page.getByRole('link', { name: /Notificaciones/ }).click()
  await expect(page).toHaveURL(/\/notificaciones$/)
  await expect(page.getByText('No tienes avisos sin leer.')).toBeVisible()

  await page.getByRole('button', { name: 'Enviar notificación de prueba' }).click()
  await expect(page.getByText('Notificación de prueba', { exact: true })).toBeVisible()
  await expect(page.getByText('1 sin leer')).toBeVisible()
  await expect(page.getByRole('link', { name: /Notificaciones/ })).toContainText('1')

  await page.getByRole('button', { name: 'Marcar leído' }).first().click()
  await expect(page.getByText('No tienes avisos sin leer.')).toBeVisible()

  await page.getByLabel('Sistema: Email').uncheck()
  await page.getByRole('button', { name: 'Guardar preferencias' }).click()
  await expect(page.getByText('Preferencias guardadas.')).toBeVisible()

  await page.reload()
  await expect(page.getByLabel('Sistema: Email')).not.toBeChecked()
  await expect(page.getByLabel('Sistema: Push')).toBeChecked()
})
