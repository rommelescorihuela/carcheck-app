import { Link } from 'react-router-dom'
import { useAuth } from '../stores/auth'

export default function Home() {
  const authenticated = useAuth((state) => state.status === 'authenticated')

  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 text-slate-900">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">CarCheck</h1>
        <p className="text-slate-600">
          Mantenimiento de tu vehículo, sin complicaciones.
        </p>
        {authenticated ? (
          <Link
            to="/organizaciones"
            className="inline-block rounded bg-teal-700 px-4 py-2 font-medium text-white"
          >
            Ir a mis organizaciones
          </Link>
        ) : (
          <div className="flex justify-center gap-3">
            <Link to="/register" className="rounded bg-teal-700 px-4 py-2 font-medium text-white">
              Crear cuenta
            </Link>
            <Link to="/login" className="rounded border border-slate-300 px-4 py-2 font-medium">
              Iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
