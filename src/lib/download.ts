/**
 * Guarda un blob como archivo usando un enlace temporal. Necesario porque la descarga va
 * autenticada con Bearer y `window.open` no enviaría el token.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename

  document.body.append(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}
