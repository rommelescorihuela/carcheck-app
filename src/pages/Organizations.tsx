import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../api/types'
import { useOrganizations } from '../stores/organization'

export default function Organizations() {
  const organizations = useOrganizations((state) => state.organizations)
  const activeId = useOrganizations((state) => state.activeId)
  const loading = useOrganizations((state) => state.loading)
  const load = useOrganizations((state) => state.load)
  const create = useOrganizations((state) => state.create)
  const setActive = useOrganizations((state) => state.setActive)

  const [name, setName] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    void load()
  }, [load])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage(null)

    try {
      await create(name)
      setName('')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('No se pudo crear la organización.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Mis organizaciones</h1>

      <section className="space-y-2">
        <label className="flex items-center gap-3 rounded border border-slate-200 bg-white p-3">
          <input
            type="radio"
            name="active"
            checked={activeId === null}
            onChange={() => setActive(null)}
          />
          <span className="font-medium text-slate-800">Personal</span>
          <span className="text-sm text-slate-500">Solo mis vehículos</span>
        </label>

        {loading && <p className="text-sm text-slate-500">Cargando…</p>}

        {organizations.map((organization) => (
          <div
            key={organization.id}
            className="flex items-center justify-between rounded border border-slate-200 bg-white p-3"
          >
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="active"
                checked={activeId === organization.id}
                onChange={() => setActive(organization.id)}
              />
              <span className="font-medium text-slate-800">{organization.name}</span>
              {organization.pivot && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {organization.pivot.role}
                </span>
              )}
            </label>
            <Link
              to={`/organizaciones/${organization.id}`}
              className="text-sm font-medium text-brand-700"
            >
              Ver miembros
            </Link>
          </div>
        ))}

        {!loading && organizations.length === 0 && (
          <p className="text-sm text-slate-500">Aún no perteneces a ninguna organización.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Crear organización</h2>

        {message && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{message}</p>}

        <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre de la organización"
            className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {submitting ? 'Creando…' : 'Crear'}
          </button>
        </form>
        {errors.name?.[0] && <span className="text-sm text-red-600">{errors.name[0]}</span>}
      </section>
    </div>
  )
}
