import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from './client'
import { clearToken, getToken, setToken } from './token'
import { ApiError } from './types'

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response
}

describe('api client', () => {
  beforeEach(() => {
    clearToken()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renueva el token una sola vez ante un 401 y reintenta', async () => {
    setToken('old-token')

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.endsWith('/token/refresh')) {
        return jsonResponse(200, { access_token: 'new-token', token_type: 'Bearer' })
      }

      const headers = (init?.headers ?? {}) as Record<string, string>
      if (headers.Authorization === 'Bearer new-token') {
        return jsonResponse(200, { user: { id: 1, name: 'Ana' } })
      }

      return jsonResponse(401, { message: 'Unauthenticated.' })
    })

    vi.stubGlobal('fetch', fetchMock)

    const data = await request<{ user: { id: number } }>('/user')

    expect(data.user.id).toBe(1)
    expect(getToken()).toBe('new-token')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('limpia el token si el refresh también falla', async () => {
    setToken('old-token')

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)

      if (url.endsWith('/token/refresh')) {
        return jsonResponse(401, { message: 'Unauthenticated.' })
      }

      return jsonResponse(401, { message: 'Unauthenticated.' })
    })

    vi.stubGlobal('fetch', fetchMock)

    await expect(request('/user')).rejects.toBeInstanceOf(ApiError)
    expect(getToken()).toBeNull()
  })
})
