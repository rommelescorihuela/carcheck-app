import { useEffect, useState } from 'react'
import { ApiError, type Reminder } from '../api/types'
import { useOrganizations } from '../stores/organization'
import { useReminders } from '../stores/reminders'

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function timing(reminder: Reminder): string {
  const parts: string[] = []

  if (reminder.days_left !== null && reminder.due_on !== null) {
    parts.push(
      reminder.days_left < 0
        ? `Venció el ${formatDate(reminder.due_on)} (hace ${Math.abs(reminder.days_left)} días)`
        : reminder.days_left === 0
          ? 'Vence hoy'
          : `Vence el ${formatDate(reminder.due_on)} (faltan ${reminder.days_left} días)`,
    )
  }

  if (reminder.km_left !== null && reminder.due_km !== null) {
    parts.push(
      reminder.km_left <= 0
        ? `Toca a los ${reminder.due_km.toLocaleString('es')} km`
        : `Faltan ${reminder.km_left.toLocaleString('es')} km (a los ${reminder.due_km.toLocaleString('es')})`,
    )
  }

  return parts.join(' · ')
}

function ReminderCard({
  reminder,
  onDismiss,
}: {
  reminder: Reminder
  onDismiss: (id: number) => void
}) {
  return (
    <li className="rounded border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-800">
            {reminder.title}
            <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {reminder.kind_label}
            </span>
          </p>
          <p className="text-sm text-slate-600">{reminder.vehicle.make} {reminder.vehicle.model}
            {reminder.vehicle.plate ? ` · ${reminder.vehicle.plate}` : ''}
          </p>
          <p className="text-sm text-slate-500">{timing(reminder)}</p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(reminder.id)}
          className="rounded border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700"
        >
          Descartar
        </button>
      </div>
    </li>
  )
}

export default function Reminders() {
  const activeId = useOrganizations((state) => state.activeId)
  const organizations = useOrganizations((state) => state.organizations)
  const loadOrganizations = useOrganizations((state) => state.load)

  const reminders = useReminders((state) => state.reminders)
  const meta = useReminders((state) => state.meta)
  const loading = useReminders((state) => state.loading)
  const syncing = useReminders((state) => state.syncing)
  const load = useReminders((state) => state.load)
  const dismiss = useReminders((state) => state.dismiss)
  const sync = useReminders((state) => state.sync)

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const active = organizations.find((organization) => organization.id === activeId)

  useEffect(() => {
    void loadOrganizations()
  }, [loadOrganizations])

  useEffect(() => {
    setMessage(null)
    void load(activeId ? { organizationId: activeId } : { scope: 'personal' })
  }, [activeId, load])

  async function handleSync() {
    setMessage(null)
    setError(null)

    try {
      const result = await sync(activeId ? { organizationId: activeId } : { scope: 'personal' })

      setMessage(
        result.created === 1
          ? 'Se creó 1 recordatorio.'
          : `Se crearon ${result.created} recordatorios.`,
      )
    } catch (cause) {
      showError(cause, 'No se pudieron comprobar los recordatorios.')
    }
  }

  async function handleDismiss(id: number) {
    setMessage(null)
    setError(null)

    try {
      await dismiss(id)
    } catch (cause) {
      showError(cause, 'No se pudo descartar el recordatorio.')
    }
  }

  function showError(cause: unknown, fallback: string) {
    if (cause instanceof ApiError) {
      setError(cause.message)
    } else if (cause instanceof Error) {
      setError(cause.message)
    } else {
      setError(fallback)
    }
  }

  const overdue = reminders.filter((reminder) => reminder.status === 'overdue')
  const upcoming = reminders.filter((reminder) => reminder.status === 'upcoming')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recordatorios</h1>
          <p className="text-sm text-slate-500">
            Ámbito: {active ? active.name : 'Personal'} · {meta.overdue} vencidos ·{' '}
            {meta.upcoming} próximos
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleSync()}
          disabled={syncing}
          className="rounded bg-brand-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {syncing ? 'Comprobando…' : 'Comprobar ahora'}
        </button>
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

      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      {!loading && reminders.length === 0 && (
        <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No hay recordatorios en este ámbito. Los documentos por vencer y los mantenimientos
          próximos aparecen aquí.
        </p>
      )}

      {overdue.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-red-700">Vencidos ({overdue.length})</h2>
          <ul className="space-y-2">
            {overdue.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} onDismiss={handleDismiss} />
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Próximos ({upcoming.length})</h2>
          <ul className="space-y-2">
            {upcoming.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} onDismiss={handleDismiss} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
