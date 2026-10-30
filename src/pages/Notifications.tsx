import { useEffect, useState } from 'react'
import * as api from '../api/endpoints'
import { ApiError, type AppNotification, type NotificationPreference } from '../api/types'
import { currentPushSubscription, disablePush, enablePush, pushSupported } from '../lib/push'
import { useNotifications } from '../stores/notifications'

const CATEGORY_CLASS: Record<AppNotification['category'], string> = {
  system: 'bg-slate-100 text-slate-700',
  billing: 'bg-brand-50 text-brand-700',
  maintenance: 'bg-amber-50 text-amber-700',
  documents: 'bg-violet-50 text-violet-700',
  reminders: 'bg-brand-50 text-brand-700',
}

const CHANNELS: { key: 'in_app' | 'email' | 'push'; label: string }[] = [
  { key: 'in_app', label: 'En la app' },
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
]

function formatDate(value: string): string {
  return new Date(value).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Notifications() {
  const notifications = useNotifications((state) => state.notifications)
  const unreadCount = useNotifications((state) => state.unreadCount)
  const preferences = useNotifications((state) => state.preferences)
  const pushConfigured = useNotifications((state) => state.pushConfigured)
  const loading = useNotifications((state) => state.loading)
  const load = useNotifications((state) => state.load)
  const markRead = useNotifications((state) => state.markRead)
  const markAllRead = useNotifications((state) => state.markAllRead)
  const remove = useNotifications((state) => state.remove)
  const savePreferences = useNotifications((state) => state.savePreferences)
  const sendTest = useNotifications((state) => state.sendTest)

  const [draft, setDraft] = useState<NotificationPreference[]>([])
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setDraft(preferences)
  }, [preferences])

  useEffect(() => {
    let cancelled = false

    async function detect() {
      if (!pushSupported()) {
        return
      }

      const subscription = await currentPushSubscription()

      if (!cancelled) {
        setPushEnabled(subscription !== null)
      }
    }

    void detect()

    return () => {
      cancelled = true
    }
  }, [])

  function showError(cause: unknown, fallback: string) {
    if (cause instanceof ApiError) {
      setError(cause.message)
    } else if (cause instanceof Error) {
      setError(cause.message)
    } else {
      setError(fallback)
    }
  }

  async function handleMarkRead(id: string) {
    setError(null)

    try {
      await markRead(id)
    } catch (cause) {
      showError(cause, 'No se pudo marcar el aviso como leído.')
    }
  }

  async function handleMarkAll() {
    setError(null)

    try {
      await markAllRead()
    } catch (cause) {
      showError(cause, 'No se pudieron marcar los avisos como leídos.')
    }
  }

  async function handleRemove(id: string) {
    setError(null)

    try {
      await remove(id)
    } catch (cause) {
      showError(cause, 'No se pudo eliminar el aviso.')
    }
  }

  async function handleSavePreferences() {
    setError(null)
    setMessage(null)

    try {
      await savePreferences(draft)
      setMessage('Preferencias guardadas.')
    } catch (cause) {
      showError(cause, 'No se pudieron guardar las preferencias.')
    }
  }

  async function handleTest() {
    setError(null)
    setMessage(null)

    try {
      const notification = await sendTest()
      setMessage(
        notification === null
          ? 'Enviada por los canales externos (tienes la bandeja desactivada).'
          : 'Notificación de prueba enviada.',
      )
    } catch (cause) {
      showError(cause, 'No se pudo enviar la notificación de prueba.')
    }
  }

  async function handlePushToggle() {
    setError(null)
    setMessage(null)
    setPushBusy(true)

    try {
      if (pushEnabled) {
        const endpoint = await disablePush()

        if (endpoint) {
          await api.removePushSubscription(endpoint)
        }

        setPushEnabled(false)
        setMessage('Push desactivado en este dispositivo.')
      } else {
        const publicKey = await api.pushPublicKey()

        if (publicKey === null) {
          setError('El servidor no tiene el push configurado.')
          return
        }

        const subscription = await enablePush(publicKey)
        await api.registerPushSubscription(subscription)
        setPushEnabled(true)
        setMessage('Push activado en este dispositivo.')
      }
    } catch (cause) {
      showError(cause, 'No se pudo cambiar el estado del push.')
    } finally {
      setPushBusy(false)
    }
  }

  function changePreference(
    category: NotificationPreference['category'],
    channel: 'in_app' | 'email' | 'push',
    value: boolean,
  ) {
    setDraft((current) =>
      current.map((preference) =>
        preference.category === category ? { ...preference, [channel]: value } : preference,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
          <p className="text-sm text-slate-500">
            {unreadCount === 0 ? 'No tienes avisos sin leer.' : `${unreadCount} sin leer`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleMarkAll()}
            disabled={unreadCount === 0}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Marcar todo como leído
          </button>
          <button
            type="button"
            onClick={() => void handleTest()}
            className="rounded bg-brand-700 px-3 py-2 text-sm font-medium text-white"
          >
            Enviar notificación de prueba
          </button>
        </div>
      </div>

      {message && (
        <p className="rounded bg-brand-50 p-3 text-sm text-brand-800" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-800">Push en este dispositivo</h2>

        {!pushSupported() && (
          <p className="text-sm text-slate-600">Este navegador no soporta notificaciones push.</p>
        )}

        {pushSupported() && !pushConfigured && (
          <p className="text-sm text-slate-600">
            El servidor no tiene el push configurado (faltan las claves VAPID). Los avisos siguen
            llegando a la bandeja y por email.
          </p>
        )}

        {pushSupported() && pushConfigured && (
          <button
            type="button"
            onClick={() => void handlePushToggle()}
            disabled={pushBusy}
            className="rounded border border-brand-700 px-3 py-2 text-sm font-medium text-brand-700 disabled:opacity-60"
          >
            {pushEnabled ? 'Desactivar push en este dispositivo' : 'Activar push en este dispositivo'}
          </button>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Bandeja</h2>

        {loading && <p className="text-sm text-slate-500">Cargando…</p>}

        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`rounded border bg-white p-3 ${
                notification.read_at === null ? 'border-brand-300' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="flex items-center gap-2 font-medium text-slate-800">
                    {notification.read_at === null && (
                      <>
                        <span
                          aria-hidden="true"
                          className="inline-block h-2 w-2 rounded-full bg-brand-600"
                        />
                        <span className="sr-only">Sin leer</span>
                      </>
                    )}
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-600">{notification.body}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${CATEGORY_CLASS[notification.category]}`}
                >
                  {notification.category_label}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {notification.read_at === null && (
                  <button
                    type="button"
                    onClick={() => void handleMarkRead(notification.id)}
                    className="text-brand-700"
                  >
                    Marcar leído
                  </button>
                )}
                {notification.url && (
                  <a href={notification.url} className="text-brand-700">
                    Ver
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => void handleRemove(notification.id)}
                  className="text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
          {!loading && notifications.length === 0 && (
            <p className="text-sm text-slate-500">Sin avisos por ahora.</p>
          )}
        </ul>
      </section>

      <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-800">Qué avisos quiero recibir</h2>
        <p className="text-sm text-slate-600">
          Elige por categoría los canales. Los cambios aplican a los próximos avisos.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Categoría</th>
                {CHANNELS.map((channel) => (
                  <th key={channel.key} className="px-3 py-2">
                    {channel.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {draft.map((preference) => (
                <tr key={preference.category} className="border-t border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-700">
                    {preference.category_label}
                  </td>
                  {CHANNELS.map((channel) => (
                    <td key={channel.key} className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label={`${preference.category_label}: ${channel.label}`}
                        checked={preference[channel.key]}
                        onChange={(event) =>
                          changePreference(preference.category, channel.key, event.target.checked)
                        }
                        className="h-4 w-4 accent-brand-700"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={() => void handleSavePreferences()}
          className="rounded bg-brand-700 px-4 py-2 text-sm font-medium text-white"
        >
          Guardar preferencias
        </button>
      </section>
    </div>
  )
}
