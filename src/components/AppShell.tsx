import { useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../stores/auth'
import { useNotifications } from '../stores/notifications'
import { useOrganizations } from '../stores/organization'

type IconProps = { path: string }

function Icon({ path }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  )
}

const TABS = [
  { to: '/vehiculos', label: 'Vehículos', icon: 'M3 13.5 5 8h14l2 5.5M4.5 13.5h15v5h-15zM7 18.5v2M17 18.5v2' },
  { to: '/flota', label: 'Flota', icon: 'M4 7h7v10H4zM13 5h7v7h-7zM13 14h7v5h-7z' },
  { to: '/reportes', label: 'Gastos', icon: 'M4 19V5M4 19h16M8 16V11M12 16V7M16 16v-3' },
  { to: '/recordatorios', label: 'Avisos', icon: 'M12 4a5 5 0 0 0-5 5v4l-2 3h14l-2-3V9a5 5 0 0 0-5-5zM10 19a2 2 0 0 0 4 0' },
  { to: '/organizaciones', label: 'Cuenta', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0' },
]

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
      <header
        className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="font-semibold tracking-tight text-brand-700">
            CarCheck
          </Link>

          {/* Nav horizontal: solo en pantallas con espacio. En móvil manda la barra inferior. */}
          <nav aria-label="Principal" className="order-2 hidden md:block">
            <div className="flex items-center gap-4">
              {[
                ['/organizaciones', 'Organizaciones'],
                ['/flota', 'Flota'],
                ['/vehiculos', 'Vehículos'],
                ['/facturacion', 'Facturación'],
                ['/recordatorios', 'Recordatorios'],
                ['/reportes', 'Reportes'],
                ['/notificaciones', 'Notificaciones'],
              ].map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `text-sm ${isActive ? 'font-medium text-brand-700' : 'text-slate-600 hover:text-slate-900'}`
                  }
                >
                  {label}
                  {to === '/notificaciones' && unreadCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-signal-500 px-1.5 py-0.5 text-xs font-medium text-white">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="order-3 flex items-center gap-3 text-sm md:order-2">
            <Link
              to="/notificaciones"
              aria-label={
                unreadCount > 0 ? `Notificaciones (${unreadCount} sin leer)` : 'Notificaciones'
              }
              className="relative grid h-9 w-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Icon path="M12 4a5 5 0 0 0-5 5v4l-2 3h14l-2-3V9a5 5 0 0 0-5-5zM10 19a2 2 0 0 0 4 0" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-signal-500 ring-2 ring-white" />
              )}
            </Link>
            <span className="hidden rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800 sm:inline">
              {active ? active.name : 'Personal'}
            </span>
            <span className="hidden text-slate-500 sm:inline">{user?.name}</span>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full px-2 py-1 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Espacio para la barra inferior + zona segura del iPhone. */}
      <main className="mx-auto max-w-3xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-4 md:pb-8">
        <Outlet />
      </main>

      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/70 bg-white/92 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `relative flex min-h-12 flex-1 flex-col items-center gap-1 py-2 text-[0.65rem] font-medium ${
                  isActive ? 'text-brand-700' : 'text-slate-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative grid h-6 place-items-center">
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -inset-x-2 inset-y-0 rounded-full bg-brand-50"
                      />
                    )}
                    <span className="relative">
                      <Icon path={tab.icon} />
                    </span>
                  </span>
                  {tab.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-signal-500"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
