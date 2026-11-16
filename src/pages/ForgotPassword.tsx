import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/endpoints'
import { ApiError } from '../api/types'
import AuthShell from '../components/AuthShell'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage(null)

    try {
      await api.forgotPassword(email)
      setSent(true)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('No se pudo solicitar el enlace.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Recuperar contraseña</h1>

        {sent ? (
          <div className="space-y-4">
            <p className="rounded bg-emerald-50 p-3 text-sm text-emerald-800">
              Si el correo existe, te enviamos un enlace para restablecer la contraseña. Revisa
              también la carpeta de spam.
            </p>
            <Link to="/login" className="text-sm font-medium text-brand-700">
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600">
              Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña
              nueva.
            </p>

            {message && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Correo</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  autoComplete="email"
                  required
                />
                {errors.email?.[0] && (
                  <span className="text-sm text-red-600">{errors.email[0]}</span>
                )}
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
              >
                {submitting ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>

            <p className="text-sm text-slate-600">
              <Link to="/login" className="font-medium text-brand-700">
                Volver a iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthShell>
  )
}
