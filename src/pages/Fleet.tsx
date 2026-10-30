import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { FleetParams } from '../api/endpoints'
import type { ExpenseRow, FleetVehicleRow } from '../api/types'
import { useFleet } from '../stores/fleet'
import { useOrganizations } from '../stores/organization'

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function startOfMonth(): string {
  const now = new Date()

  return isoDate(new Date(now.getFullYear(), now.getMonth(), 1))
}

function formatDay(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function money(value: number, currency: string): string {
  return `${currency} ${value.toLocaleString('es', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function totalSpend(totals: ExpenseRow[]): string {
  if (totals.length === 0) {
    return '—'
  }

  return totals.map((row) => money(row.total, row.currency)).join(' · ')
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function DocumentBadge({ row }: { row: FleetVehicleRow }) {
  if (row.documents.expired > 0) {
    return (
      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        {row.documents.expired} vencido{row.documents.expired === 1 ? '' : 's'}
      </span>
    )
  }

  if (row.documents.expiring > 0) {
    return (
      <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        {row.documents.expiring} por vencer
      </span>
    )
  }

  return <span className="text-xs text-slate-500">Al día</span>
}

function MaintenanceBadge({ row }: { row: FleetVehicleRow }) {
  if (row.maintenance_due > 0) {
    return (
      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
        {row.maintenance_due} pendiente{row.maintenance_due === 1 ? '' : 's'}
      </span>
    )
  }

  if (row.maintenance_soon > 0) {
    return (
      <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
        {row.maintenance_soon} próximo{row.maintenance_soon === 1 ? '' : 's'}
      </span>
    )
  }

  return <span className="text-xs text-slate-500">Al día</span>
}

function VehicleName({ row }: { row: FleetVehicleRow }) {
  return (
    <>
      <Link to={`/vehiculos/${row.vehicle.id}`} className="font-medium text-brand-700">
        {row.vehicle.make} {row.vehicle.model}
      </Link>
      <span className="block text-xs text-slate-500">
        {row.vehicle.plate ?? 'Sin placa'} · {row.vehicle.odometer_km.toLocaleString('es')} km
      </span>
    </>
  )
}

function VehicleRow({ row }: { row: FleetVehicleRow }) {
  return (
    <tr className="border-t border-slate-100">
      <td className="py-2 pr-3">
        <VehicleName row={row} />
      </td>
      <td className="whitespace-nowrap py-2 pl-2 text-right text-slate-700">
        {money(row.total, row.currency)}
      </td>
      <td className="whitespace-nowrap py-2 pl-2 text-right">
        <DocumentBadge row={row} />
      </td>
      <td className="whitespace-nowrap py-2 pl-2 text-right">
        <MaintenanceBadge row={row} />
      </td>
    </tr>
  )
}

/**
 * En el teléfono una tabla de cuatro columnas obliga a desplazar en horizontal y se pierden las
 * alertas. Se muestran tarjetas con la misma información.
 */
function VehicleCard({ row }: { row: FleetVehicleRow }) {
  return (
    <li className="rounded border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <VehicleName row={row} />
        </div>
        <p className="whitespace-nowrap text-sm font-semibold text-slate-800">
          {money(row.total, row.currency)}
        </p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-slate-500">Documentos</p>
          <div className="mt-1">
            <DocumentBadge row={row} />
          </div>
        </div>
        <div>
          <p className="text-slate-500">Mantenimiento</p>
          <div className="mt-1">
            <MaintenanceBadge row={row} />
          </div>
        </div>
      </div>
    </li>
  )
}

export default function Fleet() {
  const activeId = useOrganizations((state) => state.activeId)
  const organizations = useOrganizations((state) => state.organizations)
  const loadOrganizations = useOrganizations((state) => state.load)

  const summary = useFleet((state) => state.summary)
  const loading = useFleet((state) => state.loading)
  const apiError = useFleet((state) => state.error)
  const load = useFleet((state) => state.load)

  const [range, setRange] = useState({ from: startOfMonth(), to: isoDate(new Date()) })
  const [draft, setDraft] = useState(range)
  const [formError, setFormError] = useState<string | null>(null)

  const active = organizations.find((organization) => organization.id === activeId)

  const params = useMemo<FleetParams>(
    () => ({
      from: range.from,
      to: range.to,
      ...(activeId ? { organizationId: activeId } : {}),
    }),
    [activeId, range],
  )

  useEffect(() => {
    void loadOrganizations()
  }, [loadOrganizations])

  useEffect(() => {
    void load(params)
  }, [load, params])

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (draft.from > draft.to) {
      setFormError('La fecha "Desde" no puede ser posterior a "Hasta".')
      return
    }

    setFormError(null)
    setRange(draft)
  }

  const error = formError ?? apiError
  const period = summary?.period ?? range
  const vehicles = summary?.vehicles
  const hasVehicles = (vehicles?.total ?? 0) > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Flota</h1>
        <p className="text-sm text-slate-500">
          Ámbito: {active ? active.name : 'Personal'} · del {formatDay(period.from)} al{' '}
          {formatDay(period.to)}
        </p>
      </div>

      <form
        onSubmit={apply}
        className="flex flex-wrap items-end gap-3 rounded border border-slate-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="block font-medium text-slate-700">Desde</span>
          <input
            type="date"
            value={draft.from}
            onChange={(event) => setDraft({ ...draft, from: event.target.value })}
            className="mt-1 rounded border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="text-sm">
          <span className="block font-medium text-slate-700">Hasta</span>
          <input
            type="date"
            value={draft.to}
            onChange={(event) => setDraft({ ...draft, to: event.target.value })}
            className="mt-1 rounded border border-slate-300 px-2 py-1"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-brand-700 px-3 py-2 text-sm font-medium text-white"
        >
          Aplicar
        </button>
      </form>

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      {!loading && summary && !hasVehicles && (
        <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p>Todavía no hay vehículos en este ámbito.</p>
          <Link to="/vehiculos" className="mt-2 inline-block font-medium text-brand-700">
            Agregar el primer vehículo
          </Link>
        </div>
      )}

      {!loading && summary && hasVehicles && (
        <>
          <section aria-label="Resumen de la flota" className="grid gap-3 sm:grid-cols-2">
            <Stat
              label="Vehículos"
              value={String(vehicles?.total ?? 0)}
              hint={`${vehicles?.without_activity ?? 0} sin gastos en el periodo`}
            />
            <Stat label="Gasto del periodo" value={totalSpend(summary.totals)} hint="Combustible y mantenimiento" />
            <Stat
              label="Documentos vencidos"
              value={String(summary.documents.expired)}
              hint={`${summary.documents.expiring} por vencer · ${
                vehicles?.with_expired_documents === 1
                  ? '1 vehículo afectado'
                  : `${vehicles?.with_expired_documents ?? 0} vehículos afectados`
              }`}
            />
            <Stat
              label="Servicios pendientes"
              value={String(vehicles?.with_due_maintenance ?? 0)}
              hint="Vehículos con mantenimiento vencido"
            />
          </section>

          <section className="rounded border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-800">Combustible</h2>
            <p className="mt-1 text-sm text-slate-600">
              {summary.fuel.entries === 0
                ? 'Sin cargas registradas en el periodo.'
                : `${summary.fuel.liters.toLocaleString('es')} litros en ${summary.fuel.entries} ${
                    summary.fuel.entries === 1 ? 'carga' : 'cargas'
                  }`}
            </p>
            {summary.fuel.costs.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {summary.fuel.costs.map((row) => (
                  <li key={row.currency}>
                    {money(row.cost ?? 0, row.currency)} · precio medio{' '}
                    {(row.avg_price ?? 0).toLocaleString('es', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 3,
                    })}{' '}
                    por litro
                  </li>
                ))}
              </ul>
            )}
          </section>

          {summary.alerts.length > 0 && (
            <section className="rounded border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-lg font-semibold text-amber-900">Requiere atención</h2>
              <ul className="mt-2 space-y-1 text-sm text-amber-900">
                {summary.alerts.map((alert, index) => (
                  <li key={`${alert.kind}-${alert.vehicle_id}-${alert.label}-${index}`}>
                    <Link to={`/vehiculos/${alert.vehicle_id}`} className="font-medium underline">
                      {alert.vehicle}
                    </Link>
                    {' · '}
                    {alert.kind === 'document' ? 'Documento' : 'Mantenimiento'}: {alert.label}
                    {alert.days_left !== null && alert.days_left < 0
                      ? ` (venció hace ${Math.abs(alert.days_left)} días)`
                      : ''}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-800">Vehículos</h2>
            {/* La tabla se desplaza en horizontal en pantallas estrechas: necesita foco de teclado. */}
            <div className="hidden sm:block">
              <div
                role="region"
                aria-label="Detalle por vehículo"
                tabIndex={0}
                className="overflow-x-auto rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
              >
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th scope="col" className="py-2">Vehículo</th>
                      <th scope="col" className="py-2 text-right">Gasto</th>
                      <th scope="col" className="py-2 text-right">Documentos</th>
                      <th scope="col" className="py-2 text-right">Mantenimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.rows.map((row) => (
                      <VehicleRow key={row.vehicle.id} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ul className="space-y-2 sm:hidden">
              {summary.rows.map((row) => (
                <VehicleCard key={row.vehicle.id} row={row} />
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
