import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

/**
 * Marco de las pantallas de acceso: formulario a la izquierda y una foto real
 * con el grade del sistema a la derecha. En móvil solo queda el formulario.
 */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-svh bg-slate-50 md:grid-cols-2">
      <main className="flex flex-col justify-center overflow-y-auto px-6 py-10 md:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 font-semibold tracking-tight text-brand-700"
          >
            <span
              aria-hidden="true"
              className="h-7 w-7 rounded-[9px] bg-signal-500 shadow-[0_10px_22px_-12px_rgb(255_90_60/0.9)]"
            />
            CarCheck
          </Link>
          {children}
        </div>
      </main>

      <aside className="relative hidden overflow-hidden md:block">
        <div className="photo-grade absolute inset-0">
          <img src="/images/hero-driving.webp" alt="" className="h-full w-full object-cover" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-ink-900/40" />
        <div className="absolute inset-0 flex flex-col justify-end p-10">
          <p className="max-w-xs text-2xl font-medium leading-tight tracking-tight text-white">
            Todo el historial de tus carros, <em className="italic">en orden</em>.
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            Servicios, combustible, documentos y vencimientos. Un solo lugar, sin hojas de
            cálculo.
          </p>
        </div>
      </aside>
    </div>
  )
}
