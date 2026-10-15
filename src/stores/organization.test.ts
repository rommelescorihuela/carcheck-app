import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Organization } from '../api/types'

vi.mock('../api/endpoints', () => ({
  listOrganizations: vi.fn(),
  createOrganization: vi.fn(),
}))

import * as api from '../api/endpoints'
import { useOrganizations } from './organization'

const organization: Organization = {
  id: 1,
  name: 'Taller Central',
  slug: 'taller-central',
  owner_id: 1,
  currency: 'USD',
  timezone: 'America/Caracas',
}

describe('organization store', () => {
  beforeEach(() => {
    useOrganizations.setState({ organizations: [], activeId: null })
  })

  it('carga las organizaciones y conserva la activa válida', async () => {
    vi.mocked(api.listOrganizations).mockResolvedValueOnce([organization])
    useOrganizations.setState({ activeId: 1 })

    await useOrganizations.getState().load()

    expect(useOrganizations.getState().organizations).toHaveLength(1)
    expect(useOrganizations.getState().activeId).toBe(1)
  })

  it('vuelve a personal si la organización activa desaparece', async () => {
    vi.mocked(api.listOrganizations).mockResolvedValueOnce([])
    useOrganizations.setState({ activeId: 99 })

    await useOrganizations.getState().load()

    expect(useOrganizations.getState().activeId).toBeNull()
  })

  it('crea una organización y la deja activa', async () => {
    vi.mocked(api.createOrganization).mockResolvedValueOnce(organization)

    await useOrganizations.getState().create('Taller Central')

    expect(useOrganizations.getState().activeId).toBe(1)
    expect(useOrganizations.getState().organizations).toHaveLength(1)
  })
})
