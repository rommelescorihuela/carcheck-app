import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '../api/types'

vi.mock('../api/endpoints', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
}))

import * as authApi from '../api/endpoints'
import { useAuth } from './auth'

const user: User = {
  id: 1,
  name: 'Ana',
  email: 'ana@example.com',
  currency: 'USD',
  email_verified_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('auth store', () => {
  beforeEach(() => {
    vi.mocked(authApi.logout).mockReset()
    localStorage.clear()
  })

  it('limpia la sesión local aunque el logout de la API falle', async () => {
    vi.mocked(authApi.logout).mockRejectedValueOnce(new Error('network'))
    useAuth.setState({ user, status: 'authenticated' })

    await useAuth.getState().logout()

    expect(useAuth.getState().user).toBeNull()
    expect(useAuth.getState().status).toBe('guest')
  })
})
