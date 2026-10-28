import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { download, request } from './client'
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

  it('descarga un archivo autenticado y lee su nombre de la cabecera', async () => {
    setToken('token-1')

    const blob = new Blob(['Moneda,Total\nUSD,60.00\n'], { type: 'text/csv' })
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      blob: async () => blob,
      headers: new Headers({
        'Content-Disposition': 'attachment; filename="gastos_2026-01-01_2026-06-15.csv"',
      }),
    }))

    vi.stubGlobal('fetch', fetchMock)

    const result = await download('/reports/expenses/export')

    expect(result.blob).toBe(blob)
    expect(result.filename).toBe('gastos_2026-01-01_2026-06-15.csv')

    const [, init] = fetchMock.mock.calls[0] as unknown as [RequestInfo, RequestInit]
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-1')
  })

  it('usa un nombre por defecto si la respuesta no trae Content-Disposition', async () => {
    const blob = new Blob(['sin nombre'])
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      status: 200,
      blob: async () => blob,
      headers: new Headers(),
    })))

    const result = await download('/reports/expenses/export')

    expect(result.filename).toBe('informe.csv')
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
