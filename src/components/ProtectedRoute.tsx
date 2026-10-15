import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../stores/auth'

export default function ProtectedRoute() {
  const status = useAuth((state) => state.status)
  const location = useLocation()

  if (status === 'idle' || status === 'loading') {
    return <div className="grid min-h-svh place-items-center text-slate-500">Cargando…</div>
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
