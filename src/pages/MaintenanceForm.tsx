import { useState, type FormEvent } from 'react'
import type { MaintenanceRecordPayload } from '../api/endpoints'
import { ApiError, type MaintenanceItemKind, type MaintenanceRecord, type MaintenanceType } from '../api/types'

interface ItemRow {
  kind: MaintenanceItemKind
  description: string
  quantity: string
  unit_price: string
}

interface MaintenanceFormProps {
  types: MaintenanceType[]
  initial?: Partial<MaintenanceRecord>
  submitLabel: string
  onSubmit: (payload: MaintenanceRecordPayload) => Promise<void>
}

const KINDS: { value: MaintenanceItemKind; label: string }[] = [
  { value: 'part', label: 'Repuesto' },
  { value: 'labor', label: 'Mano de obra' },
  { value: 'other', label: 'Otro' },
]

function emptyRow(): ItemRow {
  return { kind: 'part', description: '', quantity: '1', unit_price: '0' }
}

export default function MaintenanceForm({
  types,
  initial,
  submitLabel,
  onSubmit,
}: MaintenanceFormProps) {
  const [typeId, setTypeId] = useState(initial?.maintenance_type_id?.toString() ?? '')
  const [performedOn, setPerformedOn] = useState(initial?.performed_on ?? '')
  const [odometer, setOdometer] = useState(initial?.odometer_km?.toString() ?? '')
  const [provider, setProvider] = useState(initial?.provider ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [nextDueKm, setNextDueKm] = useState(initial?.next_due_km?.toString() ?? '')
  const [nextDueDate, setNextDueDate] = useState(initial?.next_due_date ?? '')
  const [items, setItems] = useState<ItemRow[]>([emptyRow()])
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage(null)

    try {
      await onSubmit({
        maintenance_type_id: typeId ? Number(typeId) : null,
        performed_on: performedOn,
        odometer_km: Number(odometer),
        provider: provider || null,
        notes: notes || null,
        next_due_km: nextDueKm ? Number(nextDueKm) : null,
        next_due_date: nextDueDate || null,
        items: items
          .filter((row) => row.description.trim() !== '')
          .map((row) => ({
            kind: row.kind,
            description: row.description,
            quantity: Number(row.quantity),
            unit_price: Number(row.unit_price),
          })),
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('No se pudo guardar el mantenimiento.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {message && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{message}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tipo de servicio</span>
          <select
            value={typeId}
            onChange={(event) => setTypeId(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">—</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Fecha</span>
          <input
            type="date"
            value={performedOn}
            onChange={(event) => setPerformedOn(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.performed_on?.[0] && (
            <span className="text-sm text-red-600">{errors.performed_on[0]}</span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Odómetro (km)</span>
          <input
            type="number"
            value={odometer}
            onChange={(event) => setOdometer(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.odometer_km?.[0] && (
            <span className="text-sm text-red-600">{errors.odometer_km[0]}</span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Taller/proveedor</span>
          <input
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Próximo (km)</span>
          <input
            type="number"
            value={nextDueKm}
            onChange={(event) => setNextDueKm(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Próximo (fecha)</span>
          <input
            type="date"
            value={nextDueDate}
            onChange={(event) => setNextDueDate(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Notas</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          rows={2}
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Ítems</span>
        {items.map((row, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <select
              value={row.kind}
              onChange={(event) =>
                updateItem(index, { kind: event.target.value as MaintenanceItemKind })
              }
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              {KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
            <input
              value={row.description}
              onChange={(event) => updateItem(index, { description: event.target.value })}
              placeholder="Descripción"
              className="min-w-40 flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <input
              type="number"
              value={row.quantity}
              onChange={(event) => updateItem(index, { quantity: event.target.value })}
              placeholder="Cant."
              className="w-20 rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <input
              type="number"
              value={row.unit_price}
              onChange={(event) => updateItem(index, { unit_price: event.target.value })}
              placeholder="Precio"
              className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => setItems((rows) => rows.filter((_, i) => i !== index))}
              className="text-sm text-red-600"
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setItems((rows) => [...rows, emptyRow()])}
          className="text-sm font-medium text-teal-700"
        >
          + Añadir ítem
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-teal-700 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {submitting ? 'Guardando…' : submitLabel}
      </button>
    </form>
  )
}
