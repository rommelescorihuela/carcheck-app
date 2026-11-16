import { useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import * as api from '../api/endpoints'
import { ApiError } from '../api/types'
import AuthShell from '../components/AuthShell'

export default function ResetPassword() {
  const { token = '' } = useParams()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage(null)

    try {
      await api.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setDone(true)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('No se pudo restablecer la contraseña.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>

        {done ? (
          <div className="space-y-4">
            <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-800">
              Contraseña restablecida. Ya puedes iniciar sesión.
            </p>
            <Link to="/login" className="text-sm font-medium text-brand-700">
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              {email ? `Cuenta: ${email}. ` : ''}Elige una contraseña de al menos 8 caracteres.
            </p>

            {message && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Contraseña nueva</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  autoComplete="new-password"
                  required
                />
                {errors.password?.[0] && (
                  <span className="text-sm text-red-600">{errors.password[0]}</span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Repite la contraseña</span>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  autoComplete="new-password"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitting || !token || !email}
                className="w-full rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
              >
                {submitting ? 'Guardando…' : 'Restablecer contraseña'}
              </button>
            </form>

            {(!token || !email) && (
              <p className="rounded bg-amber-50 p-3 text-sm text-amber-800">
                El enlace no incluye los datos necesarios. Solicita uno nuevo.
              </p>
            )}

            <p className="text-sm text-slate-600">
              <Link to="/recuperar" className="font-medium text-brand-700">
                Solicitar otro enlace
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthShell>
  )
}
