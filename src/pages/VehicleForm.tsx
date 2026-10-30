import { useState, type FormEvent } from 'react'
import type { VehiclePayload } from '../api/endpoints'
import { ApiError, type FuelType, type Vehicle, type VehicleType } from '../api/types'

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: 'car', label: 'Auto' },
  { value: 'motorcycle', label: 'Moto' },
  { value: 'truck', label: 'Camión' },
  { value: 'other', label: 'Otro' },
]

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'diesel', label: 'Diésel' },
  { value: 'cng', label: 'GNC' },
  { value: 'electric', label: 'Eléctrico' },
  { value: 'hybrid', label: 'Híbrido' },
]

interface VehicleFormProps {
  initial?: Partial<Vehicle>
  submitLabel: string
  onSubmit: (payload: VehiclePayload) => Promise<void>
}

export default function VehicleForm({ initial, submitLabel, onSubmit }: VehicleFormProps) {
  const [make, setMake] = useState(initial?.make ?? '')
  const [model, setModel] = useState(initial?.model ?? '')
  const [year, setYear] = useState(initial?.year?.toString() ?? '')
  const [plate, setPlate] = useState(initial?.plate ?? '')
  const [vin, setVin] = useState(initial?.vin ?? '')
  const [type, setType] = useState<VehicleType>(initial?.type ?? 'car')
  const [fuelType, setFuelType] = useState<FuelType>(initial?.fuel_type ?? 'gasoline')
  const [odometer, setOdometer] = useState(initial?.odometer_km?.toString() ?? '0')
  const [color, setColor] = useState(initial?.color ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage(null)

    try {
      await onSubmit({
        make,
        model,
        year: year ? Number(year) : null,
        plate: plate || null,
        vin: vin || null,
        type,
        fuel_type: fuelType,
        odometer_km: odometer ? Number(odometer) : 0,
        color: color || null,
        notes: notes || null,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('No se pudo guardar el vehículo.')
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
          <span className="text-sm font-medium text-slate-700">Marca</span>
          <input
            value={make}
            onChange={(event) => setMake(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.make?.[0] && <span className="text-sm text-red-600">{errors.make[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Modelo</span>
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.model?.[0] && <span className="text-sm text-red-600">{errors.model[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Año</span>
          <input
            type="number"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          {errors.year?.[0] && <span className="text-sm text-red-600">{errors.year[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Placa</span>
          <input
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">VIN</span>
          <input
            value={vin}
            onChange={(event) => setVin(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          {errors.vin?.[0] && <span className="text-sm text-red-600">{errors.vin[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tipo</span>
          <select
            value={type}
            onChange={(event) => setType(event.target.value as VehicleType)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {VEHICLE_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Combustible</span>
          <select
            value={fuelType}
            onChange={(event) => setFuelType(event.target.value as FuelType)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {FUEL_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Odómetro (km)</span>
          <input
            type="number"
            value={odometer}
            onChange={(event) => setOdometer(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          {errors.odometer_km?.[0] && (
            <span className="text-sm text-red-600">{errors.odometer_km[0]}</span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Color</span>
          <input
            value={color}
            onChange={(event) => setColor(event.target.value)}
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
