import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const logFile = resolve(here, '../../carcheck/storage/logs/laravel.log')

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

test('registro → organización → invitación → aceptación', async ({ browser }) => {
  const ownerEmail = uniqueEmail('owner')
  const inviteeEmail = uniqueEmail('invitee')

  const ownerContext = await browser.newContext()
  const owner = await ownerContext.newPage()

  await register(owner, 'Dueño E2E', ownerEmail)

  await owner.getByPlaceholder('Nombre de la organización').fill('Taller E2E')
  await owner.getByRole('button', { name: 'Crear', exact: true }).click()
  await expect(owner.getByText('Taller E2E').first()).toBeVisible()

  await owner.getByRole('link', { name: 'Ver miembros' }).first().click()
  await owner.getByLabel('Correo del invitado').fill(inviteeEmail)
  await owner.getByRole('button', { name: 'Invitar' }).click()
  await expect(owner.getByText('Invitación enviada.')).toBeVisible()

  // El enlace de aceptación se envía por correo; con MAIL_MAILER=log queda en el log.
  const matches = [...readFileSync(logFile, 'utf8').matchAll(/\/invitaciones\/([A-Za-z0-9]+)/g)]
  expect(matches.length).toBeGreaterThan(0)
  const token = matches[matches.length - 1][1]

  const inviteeContext = await browser.newContext()
  const invitee = await inviteeContext.newPage()

  await register(invitee, 'Invitado E2E', inviteeEmail)
  await invitee.goto(`/invitaciones/${token}`)
  await expect(invitee.getByText(/Te uniste a/)).toBeVisible()

  await ownerContext.close()
  await inviteeContext.close()
})
