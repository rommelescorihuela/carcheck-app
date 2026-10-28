import { useEffect, useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../api/endpoints'
import type { VehiclePayload } from '../api/endpoints'
import { ApiError, type Vehicle } from '../api/types'
import { useAuth } from '../stores/auth'
import { useOrganizations } from '../stores/organization'
import { useVehicles } from '../stores/vehicle'
import VehicleForm from './VehicleForm'

export default function VehicleDetail() {
  const { id } = useParams()
  const vehicleId = Number(id)
  const navigate = useNavigate()

  const currentUserId = useAuth((state) => state.user?.id)
  const organizations = useOrganizations((state) => state.organizations)
  const loadOrganizations = useOrganizations((state) => state.load)
  const removeFromStore = useVehicles((state) => state.remove)

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [odometer, setOdometer] = useState('')
  const [transferTarget, setTransferTarget] = useState('personal')

  useEffect(() => {
    let active = true

    api
      .getVehicle(vehicleId)
      .then((data) => {
        if (!active) {
          return
        }
        setVehicle(data)
        setOdometer(String(data.odometer_km))
      })
      .catch((exception: unknown) => {
        if (active) {
          setError(exception instanceof ApiError ? exception.message : 'No se pudo cargar.')
        }
      })

    return () => {
      active = false
    }
  }, [vehicleId])

  useEffect(() => {
    if (organizations.length === 0) {
      void loadOrganizations()
    }
  }, [organizations.length, loadOrganizations])

  async function run(action: () => Promise<Vehicle>) {
    setBusy(true)
    setError(null)

    try {
      const updated = await action()
      setVehicle(updated)
      setOdometer(String(updated.odometer_km))
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'No se pudo completar la acción.')
    } finally {
      setBusy(false)
    }
  }

  async function handleEdit(payload: VehiclePayload) {
    await run(() => api.updateVehicle(vehicleId, payload))
  }

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      await run(() => api.uploadVehiclePhoto(vehicleId, file))
    }
  }

  async function handleDeletePhoto() {
    await run(() => api.deleteVehiclePhoto(vehicleId))
  }

  async function handleOdometer() {
    if (!vehicle) {
      return
    }
    await run(() =>
      api.updateVehicle(vehicleId, {
        make: vehicle.make,
        model: vehicle.model,
        odometer_km: Number(odometer),
      }),
    )
  }

  async function handleTransfer() {
    if (!vehicle || currentUserId === undefined) {
      return
    }

    await run(() =>
      api.transferVehicle(
        vehicleId,
        transferTarget === 'personal'
          ? { owner_type: 'user', owner_id: currentUserId }
          : { owner_type: 'organization', owner_id: Number(transferTarget) },
      ),
    )
  }

  async function handleDelete() {
    await removeFromStore(vehicleId)
    navigate('/vehiculos')
  }

  if (!vehicle) {
    return (
      <div className="space-y-3">
        <Link to="/vehiculos" className="text-sm font-medium text-teal-700">
          Volver
        </Link>
        {error ? (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
        ) : (
          <p className="text-sm text-slate-500">Cargando…</p>
        )}
      </div>
    )
  }

  const isPersonal = vehicle.owner_type.endsWith('User')
  const orgRole = isPersonal
    ? undefined
    : organizations.find((organization) => organization.id === vehicle.owner_id)?.pivot?.role
  const canManage = isPersonal
    ? vehicle.owner_id === currentUserId
    : orgRole === 'owner' || orgRole === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {vehicle.make} {vehicle.model}
        </h1>
        <Link to="/vehiculos" className="text-sm font-medium text-teal-700">
          Volver
        </Link>
      </div>

      <Link
        to={`/vehiculos/${vehicleId}/mantenimiento`}
        className="inline-block text-sm font-medium text-teal-700"
      >
        Ver mantenimiento
      </Link>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!canManage && (
        <p className="rounded bg-slate-50 p-3 text-sm text-slate-500">
          Solo lectura: no tienes permiso para modificar este vehículo.
        </p>
      )}

      <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-800">Foto</h2>
        {vehicle.photo_url ? (
          <img src={vehicle.photo_url} alt="Vehículo" className="h-48 w-full rounded object-cover" />
        ) : (
          <p className="text-sm text-slate-500">Sin foto.</p>
        )}
        {canManage && (
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => void handlePhoto(event)}
              disabled={busy}
              className="text-sm"
            />
            {vehicle.photo_url && (
              <button
                type="button"
                onClick={() => void handleDeletePhoto()}
                disabled={busy}
                className="text-sm text-red-600"
              >
                Eliminar foto
              </button>
            )}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-800">Odómetro</h2>
        {canManage ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={odometer}
              onChange={(event) => setOdometer(event.target.value)}
              aria-label="Odómetro actual"
              className="w-40 rounded border border-slate-300 px-3 py-2"
            />
            <span className="text-sm text-slate-500">km</span>
            <button
              type="button"
              onClick={() => void handleOdometer()}
              disabled={busy}
              className="rounded bg-teal-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Guardar
            </button>
          </div>
        ) : (
          <p className="text-slate-800">{vehicle.odometer_km.toLocaleString('es')} km</p>
        )}
      </section>

      {canManage && (
        <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">Traspasar</h2>
          <div className="flex items-center gap-2">
            <select
              value={transferTarget}
              onChange={(event) => setTransferTarget(event.target.value)}
              className="rounded border border-slate-300 px-2 py-2 text-sm"
            >
              <option value="personal">Mi cuenta personal</option>
              {organizations.map((organization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void handleTransfer()}
              disabled={busy}
              className="rounded border border-teal-700 px-3 py-2 text-sm font-medium text-teal-700 disabled:opacity-60"
            >
              Traspasar
            </button>
          </div>
        </section>
      )}

      {canManage && (
        <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">Editar</h2>
          <VehicleForm initial={vehicle} submitLabel="Guardar cambios" onSubmit={handleEdit} />
        </section>
      )}

      {canManage && (
        <button type="button" onClick={() => void handleDelete()} className="text-sm text-red-600">
          Eliminar vehículo
        </button>
      )}
    </div>
  )
}
