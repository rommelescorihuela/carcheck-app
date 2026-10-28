import { clearToken, getToken, setToken } from './token'
import { ApiError, type ApiErrorBody } from './types'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/+$/, '')

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  auth?: boolean
  retry?: boolean
}

export interface DownloadResult {
  blob: Blob
  filename: string
}

let refreshPromise: Promise<boolean> | null = null

async function refreshToken(): Promise<boolean> {
  refreshPromise ??= (async () => {
    const tokenBefore = getToken()

    try {
      if (!tokenBefore) {
        return false
      }

      const response = await fetch(`${BASE_URL}/token/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${tokenBefore}` },
      })

      if (!response.ok) {
        // Otra pestaña pudo renovar el token en paralelo mientras este fallaba.
        const tokenAfter = getToken()

        return tokenAfter !== null && tokenAfter !== tokenBefore
      }

      const data = (await response.json()) as { access_token: string }
      setToken(data.access_token)

      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: ApiErrorBody = {}

  try {
    body = (await response.json()) as ApiErrorBody
  } catch {
    // respuesta sin cuerpo JSON
  }

  return new ApiError(response.status, body.message ?? 'Error inesperado', body.errors ?? {})
}

/**
 * Ejecuta la petición y devuelve la respuesta cruda (JSON, blob o vacía). Centraliza el token,
 * la renovación ante 401 y la traducción de errores.
 */
async function send(path: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', body, auth = true, retry = true } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const token = auth ? getToken() : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  })

  // Ante 401, renovar el token UNA sola vez y reintentar.
  if (response.status === 401 && auth && retry && getToken()) {
    const refreshed = await refreshToken()
    if (refreshed) {
      return send(path, { ...options, retry: false })
    }

    clearToken()
  }

  if (!response.ok) {
    throw await toApiError(response)
  }

  return response
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options)

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

/**
 * Descarga autenticada de un archivo. No usa `window.open` porque el navegador no enviaría el
 * header `Authorization`.
 */
export async function download(
  path: string,
  options: RequestOptions = {},
): Promise<DownloadResult> {
  const response = await send(path, options)

  return {
    blob: await response.blob(),
    filename: filenameFrom(response.headers.get('Content-Disposition'), 'informe.csv'),
  }
}

function filenameFrom(header: string | null, fallback: string): string {
  if (!header) {
    return fallback
  }

  const encoded = /filename\*=(?:UTF-8'')?"?([^";]+)"?/i.exec(header)
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim())
    } catch {
      // cabecera mal formada: seguimos con `filename`
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(header)

  return plain ? plain[1].trim() : fallback
}
