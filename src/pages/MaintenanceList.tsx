import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { MaintenanceRecordPayload } from '../api/endpoints'
import type { MaintenanceDue } from '../api/types'
import { useMaintenance } from '../stores/maintenance'
import MaintenanceForm from './MaintenanceForm'

const STATUS_CLASS: Record<MaintenanceDue['status'], string> = {
  ok: 'text-brand-700',
  soon: 'text-amber-600',
  due: 'text-red-600',
}

export default function MaintenanceList() {
  const { vehicleId } = useParams()
  const id = Number(vehicleId)

  const types = useMaintenance((state) => state.types)
  const records = useMaintenance((state) => state.records)
  const due = useMaintenance((state) => state.due)
  const loading = useMaintenance((state) => state.loading)
  const loadTypes = useMaintenance((state) => state.loadTypes)
  const loadVehicle = useMaintenance((state) => state.loadVehicle)
  const createRecord = useMaintenance((state) => state.createRecord)

  useEffect(() => {
    void loadTypes()
  }, [loadTypes])

  useEffect(() => {
    if (id) {
      void loadVehicle(id)
    }
  }, [id, loadVehicle])

  async function handleCreate(payload: MaintenanceRecordPayload) {
    await createRecord(id, payload)
    await loadVehicle(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mantenimiento</h1>
        <Link to={`/vehiculos/${id}`} className="text-sm font-medium text-brand-700">
          Volver al vehículo
        </Link>
      </div>

      {due.length > 0 && (
        <section className="space-y-2 rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">Próximos servicios</h2>
          <ul className="space-y-1">
            {due.map((item) => (
              <li
                key={item.maintenance_type.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-700">{item.maintenance_type.name}</span>
                <span className={STATUS_CLASS[item.status]}>
                  {item.due_km !== null ? `${item.due_km.toLocaleString('es')} km` : ''}
                  {item.due_date !== null ? ` · ${item.due_date}` : ''}
                  {` (${item.status})`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">Historial</h2>
        <ul className="space-y-2">
          {records.map((record) => (
            <li
              key={record.id}
              className="flex items-center justify-between rounded border border-slate-200 bg-white p-3"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {record.type?.name ?? 'Servicio'} · {record.performed_on}
                </p>
                <p className="text-sm text-slate-500">
                  {record.odometer_km.toLocaleString('es')} km ·{' '}
                  {record.total.toLocaleString('es')} {record.currency}
                </p>
              </div>
              <Link
                to={`/mantenimiento/${record.id}`}
                className="text-sm font-medium text-brand-700"
              >
                Ver
              </Link>
            </li>
          ))}
          {!loading && records.length === 0 && (
            <p className="text-sm text-slate-500">Sin mantenimientos.</p>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Agregar mantenimiento</h2>
        <MaintenanceForm types={types} submitLabel="Agregar" onSubmit={handleCreate} />
      </section>
    </div>
  )
}
