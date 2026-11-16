import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../api/endpoints'
import { ApiError } from '../api/types'
import { useAuth } from '../stores/auth'

const CURRENCIES = [
  { code: 'USD', label: 'Dólar estadounidense (USD)' },
  { code: 'VES', label: 'Bolívar (VES)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'COP', label: 'Peso colombiano (COP)' },
]

export default function Account() {
  const user = useAuth((state) => state.user)
  const setUser = useAuth((state) => state.setUser)
  const logout = useAuth((state) => state.logout)

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currency, setCurrency] = useState(user?.currency ?? 'USD')
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({})
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({})
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  const [deletePassword, setDeletePassword] = useState('')
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string[]>>({})
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileErrors({})
    setProfileMessage(null)

    try {
      const updated = await api.updateProfile({ name, email, currency })
      setUser(updated)
      setProfileMessage('Datos guardados.')
    } catch (error) {
      if (error instanceof ApiError) {
        setProfileErrors(error.errors)
        setProfileMessage(error.message)
      } else {
        setProfileMessage('No se pudieron guardar los datos.')
      }
    } finally {
      setSavingProfile(false)
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingPassword(true)
    setPasswordErrors({})
    setPasswordMessage(null)

    try {
      await api.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      })
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirmation('')
      setPasswordMessage('Contraseña actualizada. Las demás sesiones se cerraron.')
    } catch (error) {
      if (error instanceof ApiError) {
        setPasswordErrors(error.errors)
        setPasswordMessage(error.message)
      } else {
        setPasswordMessage('No se pudo cambiar la contraseña.')
      }
    } finally {
      setSavingPassword(false)
    }
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDeleting(true)
    setDeleteErrors({})
    setDeleteMessage(null)

    try {
      await api.deleteAccount(deletePassword)
      await logout()
    } catch (error) {
      if (error instanceof ApiError) {
        setDeleteErrors(error.errors)
        setDeleteMessage(error.message)
      } else {
        setDeleteMessage('No se pudo eliminar la cuenta.')
      }
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Mi cuenta</h1>
        <Link to="/organizaciones" className="text-sm font-medium text-brand-700">
          Organizaciones
        </Link>
      </div>

      <section className="space-y-4 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-800">Datos personales</h2>

        {profileMessage && (
          <p className="rounded bg-slate-50 p-3 text-sm text-slate-700">{profileMessage}</p>
        )}

        <form onSubmit={saveProfile} className="space-y-4" noValidate>
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
            {profileErrors.name?.[0] && (
              <span className="text-sm text-red-600">{profileErrors.name[0]}</span>
            )}
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
            {profileErrors.email?.[0] && (
              <span className="text-sm text-red-600">{profileErrors.email[0]}</span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Moneda</span>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
            {profileErrors.currency?.[0] && (
              <span className="text-sm text-red-600">{profileErrors.currency[0]}</span>
            )}
          </label>

          <button
            type="submit"
            disabled={savingProfile}
            className="rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {savingProfile ? 'Guardando…' : 'Guardar datos'}
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-800">Contraseña</h2>

        {passwordMessage && (
          <p className="rounded bg-slate-50 p-3 text-sm text-slate-700">{passwordMessage}</p>
        )}

        <form onSubmit={savePassword} className="space-y-4" noValidate>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Contraseña actual</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              autoComplete="current-password"
              required
            />
            {passwordErrors.current_password?.[0] && (
              <span className="text-sm text-red-600">{passwordErrors.current_password[0]}</span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Contraseña nueva</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              autoComplete="new-password"
              required
            />
            {passwordErrors.password?.[0] && (
              <span className="text-sm text-red-600">{passwordErrors.password[0]}</span>
            )}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Repite la contraseña nueva</span>
            <input
              type="password"
              value={newPasswordConfirmation}
              onChange={(event) => setNewPasswordConfirmation(event.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={savingPassword}
            className="rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {savingPassword ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded border border-red-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-red-700">Eliminar cuenta</h2>
        <p className="text-sm text-slate-600">
          Se borrarán tus vehículos personales y tus datos de acceso. Si eres propietario de una
          organización, primero transfiérela o elimínala desde «Organizaciones».
        </p>

        {deleteMessage && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-700">{deleteMessage}</p>
        )}

        {confirmingDelete ? (
          <form onSubmit={deleteAccount} className="space-y-3" noValidate>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Escribe tu contraseña para confirmar
              </span>
              <input
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                autoComplete="current-password"
                required
              />
              {deleteErrors.password?.[0] && (
                <span className="text-sm text-red-600">{deleteErrors.password[0]}</span>
              )}
              {deleteErrors.account?.[0] && (
                <span className="text-sm text-red-600">{deleteErrors.account[0]}</span>
              )}
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={deleting}
                className="rounded bg-red-600 px-4 py-2 font-medium text-white disabled:opacity-60"
              >
                {deleting ? 'Eliminando…' : 'Eliminar definitivamente'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded border border-slate-300 px-4 py-2 font-medium text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded border border-red-300 px-4 py-2 font-medium text-red-700"
          >
            Eliminar mi cuenta
          </button>
        )}
      </section>
    </div>
  )
}
