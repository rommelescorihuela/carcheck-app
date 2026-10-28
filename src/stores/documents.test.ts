import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DocumentsSummary, VehicleDocument } from '../api/types'

vi.mock('../api/endpoints', () => ({
  listDocuments: vi.fn(),
  documentsSummary: vi.fn(),
  createDocument: vi.fn(),
  deleteDocument: vi.fn(),
  uploadDocumentFile: vi.fn(),
  deleteDocumentFile: vi.fn(),
}))

import * as api from '../api/endpoints'
import { useDocuments } from './documents'

function makeDocument(overrides: Partial<VehicleDocument> = {}): VehicleDocument {
  return {
    id: 1,
    vehicle_id: 1,
    kind: 'insurance',
    kind_label: 'Seguro',
    name: 'Seguro 2026',
    issuer: null,
    reference: null,
    issued_on: null,
    expires_on: '2026-12-31',
    notes: null,
    status: 'valid',
    days_left: 100,
    file: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const summary: DocumentsSummary = {
  total: 1,
  valid: 1,
  expiring: 0,
  expired: 0,
  next_expiration: null,
}

describe('documents store', () => {
  beforeEach(() => {
    useDocuments.setState({ documents: [], summary: null })
  })

  it('carga documentos y resumen del vehículo', async () => {
    vi.mocked(api.listDocuments).mockResolvedValueOnce({
      data: [makeDocument()],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      links: { first: null, last: null, prev: null, next: null },
    })
    vi.mocked(api.documentsSummary).mockResolvedValueOnce(summary)

    await useDocuments.getState().loadVehicle(1)

    expect(useDocuments.getState().documents).toHaveLength(1)
    expect(useDocuments.getState().summary?.total).toBe(1)
  })

  it('crea un documento y lo antepone', async () => {
    vi.mocked(api.createDocument).mockResolvedValueOnce(makeDocument({ id: 2 }))

    await useDocuments.getState().createDocument(1, {
      kind: 'insurance',
      name: 'Seguro 2026',
    })

    expect(useDocuments.getState().documents[0].id).toBe(2)
  })

  it('elimina un documento de la lista', async () => {
    useDocuments.setState({ documents: [makeDocument({ id: 1 })] })
    vi.mocked(api.deleteDocument).mockResolvedValueOnce(undefined)

    await useDocuments.getState().removeDocument(1)

    expect(useDocuments.getState().documents).toHaveLength(0)
  })

  it('actualiza el documento al subir y quitar el archivo', async () => {
    useDocuments.setState({ documents: [makeDocument({ id: 1 })] })

    vi.mocked(api.uploadDocumentFile).mockResolvedValueOnce(
      makeDocument({ id: 1, file: { id: 9, file_name: 'poliza.pdf', url: '/x', mime_type: 'application/pdf', size: 100 } }),
    )
    await useDocuments.getState().uploadFile(1, new File(['x'], 'poliza.pdf'))

    expect(useDocuments.getState().documents[0].file?.file_name).toBe('poliza.pdf')

    vi.mocked(api.deleteDocumentFile).mockResolvedValueOnce(makeDocument({ id: 1, file: null }))
    await useDocuments.getState().removeFile(1)

    expect(useDocuments.getState().documents[0].file).toBeNull()
  })
})
