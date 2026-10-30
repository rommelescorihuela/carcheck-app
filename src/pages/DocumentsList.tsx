import { useEffect, type ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { DocumentPayload } from '../api/endpoints'
import type { DocumentStatusValue } from '../api/types'
import { useDocuments } from '../stores/documents'
import DocumentForm from './DocumentForm'

const STATUS_LABEL: Record<DocumentStatusValue, string> = {
  valid: 'Vigente',
  expiring: 'Por vencer',
  expired: 'Vencido',
}

const STATUS_CLASS: Record<DocumentStatusValue, string> = {
  valid: 'bg-brand-50 text-brand-700',
  expiring: 'bg-amber-50 text-amber-700',
  expired: 'bg-red-50 text-red-700',
}

function daysText(daysLeft: number | null): string {
  if (daysLeft === null) {
    return 'Sin vencimiento'
  }

  if (daysLeft < 0) {
    const days = Math.abs(daysLeft)
    return `Venció hace ${days} ${days === 1 ? 'día' : 'días'}`
  }

  return `Vence en ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'}`
}

export default function DocumentsList() {
  const { vehicleId } = useParams()
  const id = Number(vehicleId)

  const documents = useDocuments((state) => state.documents)
  const summary = useDocuments((state) => state.summary)
  const loading = useDocuments((state) => state.loading)
  const loadVehicle = useDocuments((state) => state.loadVehicle)
  const createDocument = useDocuments((state) => state.createDocument)
  const removeDocument = useDocuments((state) => state.removeDocument)
  const uploadFile = useDocuments((state) => state.uploadFile)
  const removeFile = useDocuments((state) => state.removeFile)

  useEffect(() => {
    if (id) {
      void loadVehicle(id)
    }
  }, [id, loadVehicle])

  async function handleCreate(payload: DocumentPayload) {
    await createDocument(id, payload)
    await loadVehicle(id)
  }

  async function handleFile(documentId: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      await uploadFile(documentId, file)
      await loadVehicle(id)
    }
  }

  async function handleRemove(documentId: number) {
    await removeDocument(documentId)
    await loadVehicle(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
        <Link to={`/vehiculos/${id}`} className="text-sm font-medium text-brand-700">
          Volver al vehículo
        </Link>
      </div>

      {summary && (
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
              <p className="text-lg font-semibold text-slate-900">{summary.total}</p>
            </div>
            <div className="rounded border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Vigentes</p>
              <p className="text-lg font-semibold text-brand-700">{summary.valid}</p>
            </div>
            <div className="rounded border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Por vencer</p>
              <p className="text-lg font-semibold text-amber-600">{summary.expiring}</p>
            </div>
            <div className="rounded border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Vencidos</p>
              <p className="text-lg font-semibold text-red-600">{summary.expired}</p>
            </div>
          </div>

          {summary.next_expiration && (
            <p className="text-sm text-slate-600">
              Próximo vencimiento: <span className="font-medium text-slate-900">
                {summary.next_expiration.name}
              </span>{' '}
              ({summary.next_expiration.expires_on}) —{' '}
              {daysText(summary.next_expiration.days_left)}
            </p>
          )}
        </section>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">Documentos del vehículo</h2>
        <ul className="space-y-2">
          {documents.map((document) => (
            <li key={document.id} className="rounded border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-800">{document.name}</p>
                  <p className="text-sm text-slate-500">
                    {document.kind_label}
                    {document.issuer && ` · ${document.issuer}`}
                    {document.reference && ` · ${document.reference}`}
                    {document.expires_on && ` · vence ${document.expires_on}`}
                  </p>
                  <p className="text-sm text-slate-500">{daysText(document.days_left)}</p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${STATUS_CLASS[document.status]}`}
                >
                  {STATUS_LABEL[document.status]}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {document.file ? (
                  <>
                    <a
                      href={document.file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-700"
                    >
                      {document.file.file_name}
                    </a>
                    <button
                      type="button"
                      onClick={() => void removeFile(document.id).then(() => loadVehicle(id))}
                      className="text-red-600"
                    >
                      Quitar archivo
                    </button>
                  </>
                ) : (
                  <span className="text-slate-500">Sin archivo.</span>
                )}
                <label className="cursor-pointer text-brand-700">
                  {document.file ? 'Reemplazar archivo' : 'Subir archivo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(event) => void handleFile(document.id, event)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void handleRemove(document.id)}
                  className="text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
          {!loading && documents.length === 0 && (
            <p className="text-sm text-slate-500">Sin documentos registrados.</p>
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Agregar documento</h2>
        <DocumentForm submitLabel="Agregar" onSubmit={handleCreate} />
      </section>
    </div>
  )
}
