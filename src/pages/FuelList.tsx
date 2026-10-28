import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { FuelEntryPayload } from '../api/endpoints'
import { useFuel } from '../stores/fuel'
import FuelForm from './FuelForm'

function number(value: number | null, digits = 2): string {
  return value === null ? '—' : value.toLocaleString('es', { maximumFractionDigits: digits })
}

export default function FuelList() {
  const { vehicleId } = useParams()
  const id = Number(vehicleId)

  const entries = useFuel((state) => state.entries)
  const summary = useFuel((state) => state.summary)
  const loading = useFuel((state) => state.loading)
  const loadVehicle = useFuel((state) => state.loadVehicle)
  const createEntry = useFuel((state) => state.createEntry)

  useEffect(() => {
    if (id) {
      void loadVehicle(id)
    }
  }, [id, loadVehicle])

  async function handleCreate(payload: FuelEntryPayload) {
    await createEntry(id, payload)
    // El resumen y el rendimiento dependen de todas las cargas: se recargan.
    await loadVehicle(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Combustible</h1>
        <Link to={`/vehiculos/${id}`} className="text-sm font-medium text-teal-700">
          Volver al vehículo
        </Link>
      </div>

      {summary && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Cargas</p>
            <p className="text-lg font-semibold text-slate-900">{summary.entries}</p>
          </div>
          <div className="rounded border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Litros</p>
            <p className="text-lg font-semibold text-slate-900">{number(summary.total_liters)}</p>
          </div>
          <div className="rounded border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Rendimiento</p>
            <p className="text-lg font-semibold text-slate-900">
              {number(summary.km_per_liter)} km/l
            </p>
          </div>
          <div className="rounded border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Costo por km</p>
            <p className="text-lg font-semibold text-slate-900">
              {number(summary.cost_per_km, 4)} {summary.currency}
            </p>
          </div>
        </section>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">Historial</h2>
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded border border-slate-200 bg-white p-3"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {entry.filled_on} · {number(Number(entry.liters))} L
                </p>
                <p className="text-sm text-slate-500">
                  {entry.total.toLocaleString('es')} {entry.currency}
                  {entry.distance_km !== null && ` · ${entry.distance_km} km`}
                  {entry.km_per_liter !== null && ` · ${number(entry.km_per_liter)} km/l`}
                  {!entry.full_tank && ' · carga parcial'}
                </p>
              </div>
              <span className="text-sm text-slate-500">{entry.station ?? ''}</span>
            </li>
          ))}
          {!loading && entries.length === 0 && (
            <p className="text-sm text-slate-500">Sin cargas registradas.</p>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Agregar carga</h2>
        <FuelForm submitLabel="Agregar" onSubmit={handleCreate} />
      </section>
    </div>
  )
}
