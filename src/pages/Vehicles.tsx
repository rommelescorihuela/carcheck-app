import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { VehiclePayload } from '../api/endpoints'
import { useFleet } from '../stores/fleet'
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

  const importCsv = useFleet((state) => state.importCsv)
  const importing = useFleet((state) => state.importing)
  const imported = useFleet((state) => state.imported)
  const importError = useFleet((state) => state.error)

  const [file, setFile] = useState<File | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

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

  async function handleImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!file) {
      return
    }

    const result = await importCsv(file, activeId)

    if (result) {
      setFile(null)

      if (fileInput.current) {
        fileInput.current.value = ''
      }

      await load(activeId ? { organizationId: activeId } : { scope: 'personal' })
    }
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
            <Link to={`/vehiculos/${vehicle.id}`} className="text-sm font-medium text-brand-700">
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

      {canCreate && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Importar desde CSV</h2>
          <p className="text-sm text-slate-600">
            Para flotas: sube un archivo con las columnas <strong>marca</strong> y{' '}
            <strong>modelo</strong>. También se aceptan año, placa, VIN, tipo, combustible,
            kilometraje, color y notas. Separa con coma o punto y coma.
          </p>

          <form onSubmit={handleImport} className="flex flex-wrap items-end gap-3" noValidate>
            <div className="text-sm">
              <span className="block font-medium text-slate-700">Archivo CSV</span>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <input
                  ref={fileInput}
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="peer sr-only"
                />
                <label
                  htmlFor="csv-file"
                  className="cursor-pointer rounded border border-slate-300 px-3 py-2 font-medium text-slate-700 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-700"
                >
                  Elegir archivo
                </label>
                <span className="text-slate-600">
                  {file ? file.name : 'Ningún archivo seleccionado'}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={!file || importing}
              className="rounded bg-brand-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {importing ? 'Importando…' : 'Importar'}
            </button>
          </form>

          {importError && (
            <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
              {importError}
            </p>
          )}

          {imported && (
            <div className="rounded border border-slate-200 bg-white p-3 text-sm">
              <p className="font-medium text-slate-800">
                {imported.created === 1
                  ? 'Se agregó 1 vehículo.'
                  : `Se agregaron ${imported.created} vehículos.`}
                {imported.failed > 0 &&
                  ` ${imported.failed} ${imported.failed === 1 ? 'fila quedó fuera' : 'filas quedaron fuera'}.`}
              </p>
              {imported.remaining !== null && (
                <p className="mt-1 text-slate-600">
                  Te quedan {imported.remaining} de {imported.limit} vehículos en el plan.
                </p>
              )}
              {imported.errors.length > 0 && (
                <ul className="mt-2 space-y-1 text-red-700">
                  {imported.errors.map((error) => (
                    <li key={`${error.line}-${error.message}`}>
                      Línea {error.line}: {error.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
