import type { PushSubscriptionPayload } from '../api/types'

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * La clave VAPID viaja en base64url sin relleno; el navegador la quiere como bytes.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)

  for (let index = 0; index < raw.length; index++) {
    output[index] = raw.charCodeAt(index)
  }

  return output
}

export async function currentPushSubscription(): Promise<PushSubscriptionJSON | null> {
  if (!pushSupported()) {
    return null
  }

  // En desarrollo el SW no está registrado; `ready` quedaría pendiente para siempre.
  const registration = await navigator.serviceWorker.getRegistration()

  if (!registration) {
    return null
  }

  const subscription = await registration.pushManager.getSubscription()

  return subscription?.toJSON() ?? null
}

export async function enablePush(publicKey: string): Promise<PushSubscriptionPayload> {
  if (!pushSupported()) {
    throw new Error('Este navegador no soporta notificaciones push.')
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error('Permiso de notificaciones denegado. Actívalo en los ajustes del navegador.')
  }

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
    }))

  const json = subscription.toJSON()

  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error('El navegador no devolvió una suscripción válida.')
  }

  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    content_encoding: 'aes128gcm',
  }
}

export async function disablePush(): Promise<string | null> {
  if (!pushSupported()) {
    return null
  }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (subscription === null) {
    return null
  }

  const endpoint = subscription.endpoint
  await subscription.unsubscribe()

  return endpoint
}
