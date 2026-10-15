const STORAGE_KEY = 'carcheck.token'

let memoryToken: string | null = null

// Mantén la caché en memoria sincronizada cuando otra pestaña renueva el token.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      memoryToken = event.newValue
    }
  })
}

export function getToken(): string | null {
  if (memoryToken === null) {
    memoryToken = localStorage.getItem(STORAGE_KEY)
  }

  return memoryToken
}

export function setToken(token: string): void {
  memoryToken = token
  localStorage.setItem(STORAGE_KEY, token)
}

export function clearToken(): void {
  memoryToken = null
  localStorage.removeItem(STORAGE_KEY)
}
