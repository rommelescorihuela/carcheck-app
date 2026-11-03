import { describe, expect, it } from 'vitest'
import { apiBaseUrl } from './client'

describe('apiBaseUrl', () => {
  it('usa config.js cuando está definido en el servidor', () => {
    expect(apiBaseUrl('https://api.otro-dominio.com/api', 'https://api.carcheck.example/api')).toBe(
      'https://api.otro-dominio.com/api',
    )
  })

  it('cae al VITE_API_URL compilado cuando config.js está vacío', () => {
    expect(apiBaseUrl('', 'https://api.carcheck.example/api')).toBe(
      'https://api.carcheck.example/api',
    )
    expect(apiBaseUrl('   ', 'https://api.carcheck.example/api')).toBe(
      'https://api.carcheck.example/api',
    )
    expect(apiBaseUrl(undefined, 'https://api.carcheck.example/api')).toBe(
      'https://api.carcheck.example/api',
    )
  })

  it('quita las barras finales y cae a localhost sin configuración', () => {
    expect(apiBaseUrl('https://api.dominio.com/api///', undefined)).toBe(
      'https://api.dominio.com/api',
    )
    expect(apiBaseUrl(undefined, '')).toBe('http://localhost:8000/api')
  })
})
