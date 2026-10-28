import { useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { useNotifications } from '../stores/notifications'
import { useOrganizations } from '../stores/organization'

export default function AppShell() {
  const user = useAuth((state) => state.user)
  const logout = useAuth((state) => state.logout)

  const organizations = useOrganizations((state) => state.organizations)
  const activeId = useOrganizations((state) => state.activeId)
  const active = organizations.find((organization) => organization.id === activeId)

  const unreadCount = useNotifications((state) => state.unreadCount)
  const loadUnreadCount = useNotifications((state) => state.loadUnreadCount)

  useEffect(() => {
    void loadUnreadCount()
  }, [loadUnreadCount])

  return (
    <div className="min-h-svh bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold text-teal-700">
            CarCheck
          </Link>
          <NavLink
            to="/organizaciones"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'font-medium text-teal-700' : 'text-slate-600'}`
            }
          >
            Organizaciones
          </NavLink>
          <NavLink
            to="/vehiculos"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'font-medium text-teal-700' : 'text-slate-600'}`
            }
          >
            Vehículos
          </NavLink>
          <NavLink
            to="/facturacion"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'font-medium text-teal-700' : 'text-slate-600'}`
            }
          >
            Facturación
          </NavLink>
          <NavLink
            to="/recordatorios"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'font-medium text-teal-700' : 'text-slate-600'}`
            }
          >
            Recordatorios
          </NavLink>
          <NavLink
            to="/reportes"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'font-medium text-teal-700' : 'text-slate-600'}`
            }
          >
            Reportes
          </NavLink>
          <NavLink
            to="/notificaciones"
            className={({ isActive }) =>
              `flex items-center gap-1 text-sm ${isActive ? 'font-medium text-teal-700' : 'text-slate-600'}`
            }
          >
            Notificaciones
            {unreadCount > 0 && (
              <span className="rounded-full bg-teal-700 px-1.5 py-0.5 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {active ? active.name : 'Personal'}
          </span>
          <span className="text-slate-500">{user?.name}</span>
          <button
            type="button"
            onClick={() => void logout()}
            className="text-slate-600 hover:text-slate-900"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4">
        <Outlet />
      </main>
    </div>
  )
}
