import { useState, type FormEvent } from 'react'
import type { FuelEntryPayload } from '../api/endpoints'
import { ApiError, type FuelEntry } from '../api/types'

interface FuelFormProps {
  initial?: Partial<FuelEntry>
  submitLabel: string
  onSubmit: (payload: FuelEntryPayload) => Promise<void>
}

export default function FuelForm({ initial, submitLabel, onSubmit }: FuelFormProps) {
  const [filledOn, setFilledOn] = useState(initial?.filled_on ?? '')
  const [odometer, setOdometer] = useState(initial?.odometer_km?.toString() ?? '')
  const [liters, setLiters] = useState(initial?.liters ?? '')
  const [unitPrice, setUnitPrice] = useState(initial?.unit_price ?? '')
  const [fullTank, setFullTank] = useState(initial?.full_tank ?? true)
  const [station, setStation] = useState(initial?.station ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const total = Number(liters || 0) * Number(unitPrice || 0)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage(null)

    try {
      await onSubmit({
        filled_on: filledOn,
        odometer_km: Number(odometer),
        liters: Number(liters),
        unit_price: Number(unitPrice),
        full_tank: fullTank,
        station: station || null,
        notes: notes || null,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('No se pudo guardar la carga.')
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
          <span className="text-sm font-medium text-slate-700">Fecha</span>
          <input
            type="date"
            value={filledOn}
            onChange={(event) => setFilledOn(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.filled_on?.[0] && (
            <span className="text-sm text-red-600">{errors.filled_on[0]}</span>
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
          <span className="text-sm font-medium text-slate-700">Litros</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={liters}
            onChange={(event) => setLiters(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.liters?.[0] && (
            <span className="text-sm text-red-600">{errors.liters[0]}</span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Precio por litro</span>
          <input
            type="number"
            step="0.001"
            min="0"
            value={unitPrice}
            onChange={(event) => setUnitPrice(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.unit_price?.[0] && (
            <span className="text-sm text-red-600">{errors.unit_price[0]}</span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Estación (opcional)</span>
          <input
            value={station}
            onChange={(event) => setStation(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          {errors.station?.[0] && (
            <span className="text-sm text-red-600">{errors.station[0]}</span>
          )}
        </label>

        <label className="flex items-center gap-2 self-end pb-2">
          <input
            type="checkbox"
            checked={fullTank}
            onChange={(event) => setFullTank(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm font-medium text-slate-700">Tanque lleno</span>
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

      <p className="text-sm text-slate-600">
        Total: <span className="font-medium text-slate-900">{total.toFixed(2)}</span>
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {submitting ? 'Guardando…' : submitLabel}
      </button>
    </form>
  )
}
