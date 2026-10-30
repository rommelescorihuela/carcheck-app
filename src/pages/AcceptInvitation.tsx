import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../api/endpoints'
import { ApiError } from '../api/types'
import { useAuth } from '../stores/auth'
import { useOrganizations } from '../stores/organization'

type AcceptState = 'working' | 'done' | 'error'

export default function AcceptInvitation() {
  const { token } = useParams()
  const status = useAuth((state) => state.status)
  const loadOrganizations = useOrganizations((state) => state.load)

  const [state, setState] = useState<AcceptState>('working')
  const [message, setMessage] = useState<string>('Aceptando invitación…')
  const started = useRef(false)

  useEffect(() => {
    if (status !== 'authenticated' || !token || started.current) {
      return
    }

    started.current = true
    setState('working')
    setMessage('Aceptando invitación…')

    api
      .acceptInvitation(token)
      .then(async (organization) => {
        await loadOrganizations()
        setMessage(`Te uniste a ${organization.name}.`)
        setState('done')
      })
      .catch((error: unknown) => {
        setMessage(
          error instanceof ApiError ? error.message : 'No se pudo aceptar la invitación.',
        )
        setState('error')
      })
  }, [status, token, loadOrganizations])

  if (status !== 'authenticated') {
    return (
      <main className="grid min-h-svh place-items-center p-6 text-center">
        <div className="space-y-3">
          <h1 className="text-xl font-semibold text-slate-900">Invitación a CarCheck</h1>
          <p className="text-slate-600">Inicia sesión con el correo invitado para aceptarla.</p>
          <Link to="/login" className="inline-block rounded bg-brand-700 px-4 py-2 text-white">
            Iniciar sesión
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="grid min-h-svh place-items-center p-6 text-center">
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-slate-900">Invitación a CarCheck</h1>
        <p className={state === 'error' ? 'text-red-600' : 'text-slate-600'}>{message}</p>
        {state === 'done' && (
          <Link
            to="/organizaciones"
            className="inline-block rounded bg-brand-700 px-4 py-2 text-white"
          >
            Ver mis organizaciones
          </Link>
        )}
      </div>
    </main>
  )
}
