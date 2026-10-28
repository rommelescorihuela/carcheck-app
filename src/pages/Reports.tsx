import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { ReportParams } from '../api/endpoints'
import type {
  ExpenseRow,
  MonthlyExpenseRow,
  VehicleExpenseRow,
} from '../api/types'
import { useOrganizations } from '../stores/organization'
import { useReports } from '../stores/reports'

function isoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function startOfYear(): string {
  return `${new Date().getFullYear()}-01-01`
}

function formatDay(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatMonth(value: string): string {
  return new Date(`${value}-01T00:00:00`).toLocaleDateString('es', {
    month: 'long',
    year: 'numeric',
  })
}

function money(value: number, currency: string): string {
  return `${currency} ${value.toLocaleString('es', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function Entries({ row }: { row: ExpenseRow }) {
  return (
    <span className="text-slate-500">
      {row.maintenance_entries} de mantenimiento · {row.fuel_entries} de combustible
    </span>
  )
}

function ExpenseTable<T extends ExpenseRow>({
  rows,
  describe,
  empty,
}: {
  rows: T[]
  describe: (row: T) => string
  empty: string
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">{empty}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Concepto</th>
            <th className="py-2 text-right">Mantenimiento</th>
            <th className="py-2 text-right">Combustible</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${describe(row)}-${row.currency}-${index}`} className="border-t border-slate-100">
              <td className="py-2 text-slate-800">{describe(row)}</td>
              <td className="py-2 text-right text-slate-700">
                {money(row.maintenance, row.currency)}
              </td>
              <td className="py-2 text-right text-slate-700">{money(row.fuel, row.currency)}</td>
              <td className="py-2 text-right font-medium text-slate-900">
                {money(row.total, row.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Reports() {
  const activeId = useOrganizations((state) => state.activeId)
  const organizations = useOrganizations((state) => state.organizations)
  const loadOrganizations = useOrganizations((state) => state.load)

  const report = useReports((state) => state.report)
  const loading = useReports((state) => state.loading)
  const exporting = useReports((state) => state.exporting)
  const apiError = useReports((state) => state.error)
  const loadReport = useReports((state) => state.load)
  const exportCsv = useReports((state) => state.exportCsv)

  const [range, setRange] = useState({ from: startOfYear(), to: isoDate(new Date()) })
  const [draft, setDraft] = useState(range)
  const [formError, setFormError] = useState<string | null>(null)

  const active = organizations.find((organization) => organization.id === activeId)

  const params = useMemo<ReportParams>(
    () => ({
      from: range.from,
      to: range.to,
      ...(activeId ? { organizationId: activeId } : { scope: 'personal' as const }),
    }),
    [activeId, range],
  )

  useEffect(() => {
    void loadOrganizations()
  }, [loadOrganizations])

  useEffect(() => {
    void loadReport(params)
  }, [loadReport, params])

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (draft.from > draft.to) {
      setFormError('La fecha "Desde" no puede ser posterior a "Hasta".')
      return
    }

    setFormError(null)
    setRange(draft)
  }

  const period = report?.period ?? range
  const hasExpenses = (report?.totals.length ?? 0) > 0
  const hasData = hasExpenses || (report?.billing.length ?? 0) > 0
  const error = formError ?? apiError

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500">
            Ámbito: {active ? active.name : 'Personal'} · del {formatDay(period.from)} al{' '}
            {formatDay(period.to)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void exportCsv(params)}
          disabled={!hasData || loading || exporting}
          className="rounded border border-teal-700 px-3 py-2 text-sm font-medium text-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? 'Exportando…' : 'Exportar CSV'}
        </button>
      </div>

      <form onSubmit={apply} className="flex flex-wrap items-end gap-3 rounded border border-slate-200 bg-white p-4">
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
          className="rounded bg-teal-700 px-3 py-2 text-sm font-medium text-white"
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

      {!loading && !hasExpenses && (
        <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No hay gastos en este periodo.
        </p>
      )}

      {!loading && hasExpenses && (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Total del periodo</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {report?.totals.map((row) => (
                <div key={row.currency} className="rounded border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-500">{row.currency}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {money(row.total, row.currency)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Mantenimiento {money(row.maintenance, row.currency)} · Combustible{' '}
                    {money(row.fuel, row.currency)}
                  </p>
                  <p className="text-xs text-slate-500">
                    <Entries row={row} />
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-800">Por vehículo</h2>
            <ExpenseTable<VehicleExpenseRow>
              rows={report?.vehicles ?? []}
              describe={(row) =>
                `${row.vehicle.make} ${row.vehicle.model}${row.vehicle.plate ? ` · ${row.vehicle.plate}` : ''} (${row.currency})`
              }
              empty="Sin gastos por vehículo en el periodo."
            />
          </section>

          <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-800">Por mes</h2>
            <ExpenseTable<MonthlyExpenseRow>
              rows={report?.monthly ?? []}
              describe={(row) => `${formatMonth(row.month)} (${row.currency})`}
              empty="Sin gastos por mes en el periodo."
            />
          </section>
        </>
      )}

      {!loading && (report?.billing.length ?? 0) > 0 && (
        <section className="space-y-2 rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">Suscripción de CarCheck</h2>
          {report?.billing.map((row) => (
            <p key={row.currency} className="text-sm text-slate-700">
              {money(row.total, row.currency)} ·{' '}
              {row.payments === 1 ? '1 pago aprobado' : `${row.payments} pagos aprobados`}
            </p>
          ))}
        </section>
      )}
    </div>
  )
}
