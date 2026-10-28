import { useEffect, useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../api/endpoints'
import { ApiError, type MaintenanceRecord } from '../api/types'

export default function MaintenanceDetail() {
  const { recordId } = useParams()
  const id = Number(recordId)
  const navigate = useNavigate()

  const [record, setRecord] = useState<MaintenanceRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true

    api
      .getMaintenanceRecord(id)
      .then((data) => {
        if (active) {
          setRecord(data)
        }
      })
      .catch((exception: unknown) => {
        if (active) {
          setError(exception instanceof ApiError ? exception.message : 'No se pudo cargar.')
        }
      })

    return () => {
      active = false
    }
  }, [id])

  async function run(action: () => Promise<MaintenanceRecord>) {
    setBusy(true)
    setError(null)

    try {
      setRecord(await action())
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'No se pudo completar la acción.')
    } finally {
      setBusy(false)
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      await run(() => api.uploadMaintenanceAttachment(id, file))
    }
  }

  async function handleDelete() {
    await api.deleteMaintenanceRecord(id)
    navigate(`/vehiculos/${record?.vehicle_id}/mantenimiento`)
  }

  if (!record) {
    return (
      <div className="space-y-3">
        {error ? (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
        ) : (
          <p className="text-sm text-slate-500">Cargando…</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {record.type?.name ?? 'Mantenimiento'}
        </h1>
        <Link
          to={`/vehiculos/${record.vehicle_id}/mantenimiento`}
          className="text-sm font-medium text-teal-700"
        >
          Volver
        </Link>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <section className="space-y-2 rounded border border-slate-200 bg-white p-4 text-sm">
        <p>
          <span className="text-slate-500">Fecha:</span> {record.performed_on}
        </p>
        <p>
          <span className="text-slate-500">Odómetro:</span>{' '}
          {record.odometer_km.toLocaleString('es')} km
        </p>
        {record.provider && (
          <p>
            <span className="text-slate-500">Taller:</span> {record.provider}
          </p>
        )}
        {record.notes && (
          <p>
            <span className="text-slate-500">Notas:</span> {record.notes}
          </p>
        )}
        <p>
          <span className="text-slate-500">Total:</span> {record.total.toLocaleString('es')}{' '}
          {record.currency}
        </p>
        {record.next_due_km !== null && (
          <p>
            <span className="text-slate-500">Próximo km:</span>{' '}
            {record.next_due_km.toLocaleString('es')}
          </p>
        )}
        {record.next_due_date && (
          <p>
            <span className="text-slate-500">Próxima fecha:</span> {record.next_due_date}
          </p>
        )}
      </section>

      <section className="space-y-2 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-800">Ítems</h2>
        <ul className="space-y-1 text-sm">
          {record.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between">
              <span className="text-slate-700">
                {item.description} <span className="text-slate-400">({item.kind})</span>
              </span>
              <span className="text-slate-600">
                {item.quantity} × {item.unit_price}
              </span>
            </li>
          ))}
          {record.items.length === 0 && <p className="text-slate-500">Sin ítems.</p>}
        </ul>
      </section>

      <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-800">Adjuntos</h2>
        <ul className="space-y-1 text-sm">
          {record.attachments.map((file) => (
            <li key={file.id} className="flex items-center justify-between">
              <a href={file.url} target="_blank" rel="noreferrer" className="text-teal-700">
                {file.file_name}
              </a>
              <button
                type="button"
                onClick={() => void run(() => api.deleteMaintenanceAttachment(id, file.id))}
                disabled={busy}
                className="text-red-600"
              >
                Quitar
              </button>
            </li>
          ))}
          {record.attachments.length === 0 && <p className="text-slate-500">Sin adjuntos.</p>}
        </ul>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => void handleUpload(event)}
          disabled={busy}
          className="text-sm"
        />
      </section>

      <button type="button" onClick={() => void handleDelete()} className="text-sm text-red-600">
        Eliminar mantenimiento
      </button>
    </div>
  )
}
