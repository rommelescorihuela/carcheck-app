import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/types'
import { useAuth } from '../stores/auth'

export default function Register() {
  const register = useAuth((state) => state.register)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setMessage(null)

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/organizaciones')
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.errors)
        setMessage(error.message)
      } else {
        setMessage('No se pudo crear la cuenta.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>

      {message && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Nombre</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            autoComplete="name"
            required
          />
          {errors.name?.[0] && <span className="text-sm text-red-600">{errors.name[0]}</span>}
        </label>

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
          {errors.email?.[0] && <span className="text-sm text-red-600">{errors.email[0]}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Contraseña</span>
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
          disabled={submitting}
          className="w-full rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-sm text-slate-600">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-medium text-brand-700">
          Iniciar sesión
        </Link>
      </p>
    </main>
  )
}
