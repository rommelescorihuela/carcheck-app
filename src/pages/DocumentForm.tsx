import { useState, type FormEvent } from 'react'
import type { DocumentPayload } from '../api/endpoints'
import { ApiError, type DocumentKind, type VehicleDocument } from '../api/types'

export const DOCUMENT_KINDS: { value: DocumentKind; label: string }[] = [
  { value: 'insurance', label: 'Seguro' },
  { value: 'inspection', label: 'Revisión' },
  { value: 'tax', label: 'Impuesto' },
  { value: 'license', label: 'Licencia' },
  { value: 'other', label: 'Otro' },
]

interface DocumentFormProps {
  initial?: Partial<VehicleDocument>
  submitLabel: string
  onSubmit: (payload: DocumentPayload) => Promise<void>
}

export default function DocumentForm({ initial, submitLabel, onSubmit }: DocumentFormProps) {
  const [kind, setKind] = useState<DocumentKind>(initial?.kind ?? 'insurance')
  const [name, setName] = useState(initial?.name ?? '')
  const [issuer, setIssuer] = useState(initial?.issuer ?? '')
  const [reference, setReference] = useState(initial?.reference ?? '')
  const [issuedOn, setIssuedOn] = useState(initial?.issued_on ?? '')
  const [expiresOn, setExpiresOn] = useState(initial?.expires_on ?? '')
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
        kind,
        name,
        issuer: issuer || null,
        reference: reference || null,
        issued_on: issuedOn || null,
        expires_on: expiresOn || null,
        notes: notes || null,
      })
      setName('')
      setIssuer('')
      setReference('')
      setIssuedOn('')
      setExpiresOn('')
      setNotes('')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('No se pudo guardar el documento.')
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
          <span className="text-sm font-medium text-slate-700">Tipo</span>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as DocumentKind)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {DOCUMENT_KINDS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.kind?.[0] && <span className="text-sm text-red-600">{errors.kind[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nombre</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seguro todo riesgo 2026"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          {errors.name?.[0] && <span className="text-sm text-red-600">{errors.name[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Emisor (opcional)</span>
          <input
            value={issuer}
            onChange={(event) => setIssuer(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          {errors.issuer?.[0] && <span className="text-sm text-red-600">{errors.issuer[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Número de referencia (opcional)</span>
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
          <span className="text-sm font-medium text-slate-700">Fecha de emisión (opcional)</span>
          <input
            type="date"
            value={issuedOn}
            onChange={(event) => setIssuedOn(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          {errors.issued_on?.[0] && (
            <span className="text-sm text-red-600">{errors.issued_on[0]}</span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Vence el (opcional)</span>
          <input
            type="date"
            value={expiresOn}
            onChange={(event) => setExpiresOn(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
          {errors.expires_on?.[0] && (
            <span className="text-sm text-red-600">{errors.expires_on[0]}</span>
          )}
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
