/**
 * Configuración en tiempo de ejecución (public/config.js).
 *
 * Permite apuntar la PWA a otra API sin recompilar: útil en hosting compartido,
 * donde no hay Node. En desarrollo (`vite dev`) se ignora a propósito.
 */
interface Window {
  __CARCHECK_CONFIG__?: {
    apiUrl?: string
  }
}
