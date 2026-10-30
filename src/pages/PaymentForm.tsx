import { useState, type FormEvent } from 'react'
import type { BillingPaymentPayload } from '../api/endpoints'
import { ApiError, type PaymentMethodValue } from '../api/types'

const METHODS: { value: PaymentMethodValue; label: string }[] = [
  { value: 'transfer', label: 'Transferencia' },
  { value: 'mobile_payment', label: 'Pago móvil' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'binance', label: 'Binance' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'other', label: 'Otro' },
]

const CURRENCIES = ['USD', 'EUR', 'VES']

interface PaymentFormProps {
  planPrice: string
  planCurrency: string
  onSubmit: (payload: BillingPaymentPayload, file: File | null) => Promise<void>
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function PaymentForm({ planPrice, planCurrency, onSubmit }: PaymentFormProps) {
  const [amount, setAmount] = useState(planPrice)
  const [currency, setCurrency] = useState(planCurrency)
  const [exchangeRate, setExchangeRate] = useState('1')
  const [method, setMethod] = useState<PaymentMethodValue>('transfer')
  const [reference, setReference] = useState('')
  const [paidOn, setPaidOn] = useState(today())
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const needsRate = currency !== planCurrency

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage(null)

    try {
      await onSubmit(
        {
          amount: Number(amount),
          currency,
          exchange_rate: needsRate ? Number(exchangeRate) : 1,
          method,
          reference: reference || null,
          paid_on: paidOn,
          notes: notes || null,
        },
        file,
      )
      setReference('')
      setNotes('')
      setFile(null)
      setMessage('Pago reportado. Queda pendiente de aprobación.')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('No se pudo reportar el pago.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {message && (
        <p className="rounded bg-slate-50 p-3 text-sm text-slate-700">{message}</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Monto</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.amount?.[0] && <span className="text-sm text-red-600">{errors.amount[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Moneda</span>
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {CURRENCIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.currency?.[0] && <span className="text-sm text-red-600">{errors.currency[0]}</span>}
        </label>

        {needsRate && (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              Tasa ({currency} por 1 {planCurrency})
            </span>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              value={exchangeRate}
              onChange={(event) => setExchangeRate(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              required
            />
            {errors.exchange_rate?.[0] && (
              <span className="text-sm text-red-600">{errors.exchange_rate[0]}</span>
            )}
          </label>
        )}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Método</span>
          <select
            value={method}
            onChange={(event) => setMethod(event.target.value as PaymentMethodValue)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {METHODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.method?.[0] && <span className="text-sm text-red-600">{errors.method[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Referencia (opcional)</span>
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          {errors.reference?.[0] && (
            <span className="text-sm text-red-600">{errors.reference[0]}</span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Fecha del pago</span>
          <input
            type="date"
            value={paidOn}
            onChange={(event) => setPaidOn(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.paid_on?.[0] && <span className="text-sm text-red-600">{errors.paid_on[0]}</span>}
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Notas (opcional)</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          rows={2}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Comprobante (imagen o PDF)</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mt-1 text-sm"
        />
        {errors.file?.[0] && <span className="text-sm text-red-600">{errors.file[0]}</span>}
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
      >
        {submitting ? 'Enviando…' : 'Reportar pago'}
      </button>
    </form>
  )
}
