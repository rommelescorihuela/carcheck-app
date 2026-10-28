/* eslint-disable no-undef */
// Handlers de push importados por el service worker que genera Workbox.
self.addEventListener('push', (event) => {
  let payload = {}

  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = {}
  }

  const title = payload.title || 'CarCheck'
  const options = {
    body: payload.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    lang: 'es',
    data: {
      url: payload.url || payload.data?.url || '/notificaciones',
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = event.notification.data?.url || '/notificaciones'

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ('focus' in client) {
            if ('navigate' in client) {
              client.navigate(target)
            }

            return client.focus()
          }
        }

        return clients.openWindow(target)
      }),
  )
})
