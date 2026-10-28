import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { VehiclePayload } from '../api/endpoints'
import { useOrganizations } from '../stores/organization'
import { useVehicles } from '../stores/vehicle'
import VehicleForm from './VehicleForm'

export default function Vehicles() {
  const activeId = useOrganizations((state) => state.activeId)
  const organizations = useOrganizations((state) => state.organizations)
  const loadOrganizations = useOrganizations((state) => state.load)
  const vehicles = useVehicles((state) => state.vehicles)
  const loading = useVehicles((state) => state.loading)
  const load = useVehicles((state) => state.load)
  const create = useVehicles((state) => state.create)

  const active = organizations.find((organization) => organization.id === activeId)
  const canCreate =
    activeId === null || active?.pivot?.role === 'owner' || active?.pivot?.role === 'admin'
  // La organización activa puede venir persistida de una sesión anterior y llegar en la lista
  // unos milisegundos después: mientras no se conozca su rol no se niega el permiso.
  const rolePending = activeId !== null && active === undefined

  useEffect(() => {
    void loadOrganizations()
  }, [loadOrganizations])

  useEffect(() => {
    void load(activeId ? { organizationId: activeId } : { scope: 'personal' })
  }, [activeId, load])

  async function handleCreate(payload: VehiclePayload) {
    await create(activeId ? { ...payload, organization_id: activeId } : payload)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vehículos</h1>
        <p className="text-sm text-slate-500">Ámbito: {active ? active.name : 'Personal'}</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      <ul className="space-y-2">
        {vehicles.map((vehicle) => (
          <li
            key={vehicle.id}
            className="flex items-center justify-between rounded border border-slate-200 bg-white p-3"
          >
            <div>
              <p className="font-medium text-slate-800">
                {vehicle.make} {vehicle.model}
                {vehicle.year ? ` (${vehicle.year})` : ''}
              </p>
              <p className="text-sm text-slate-500">
                {vehicle.plate ?? 'Sin placa'} · {vehicle.odometer_km.toLocaleString('es')} km
              </p>
            </div>
            <Link to={`/vehiculos/${vehicle.id}`} className="text-sm font-medium text-teal-700">
              Ver
            </Link>
          </li>
        ))}
        {!loading && vehicles.length === 0 && (
          <p className="text-sm text-slate-500">No hay vehículos en este ámbito.</p>
        )}
      </ul>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Agregar vehículo</h2>
        {canCreate ? (
          <VehicleForm submitLabel="Agregar" onSubmit={handleCreate} />
        ) : rolePending ? (
          <p className="text-sm text-slate-500">Cargando…</p>
        ) : (
          <p className="text-sm text-slate-500">
            No tienes permiso para agregar vehículos en esta organización.
          </p>
        )}
      </section>
    </div>
  )
}
