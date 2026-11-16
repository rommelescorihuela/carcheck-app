import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export default function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string
  updatedAt: string
  children: ReactNode
}) {
  return (
    <div className="min-h-svh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-semibold tracking-tight text-brand-700">
            CarCheck
          </Link>
          <Link to="/" className="text-sm font-medium text-brand-700">
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Última actualización: {updatedAt}</p>
        <div className="legal-prose mt-8 space-y-5 text-sm leading-relaxed text-slate-700">
          {children}
        </div>
      </main>
    </div>
  )
}
