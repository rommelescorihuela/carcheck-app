import { create } from 'zustand'
import type { DocumentPayload } from '../api/endpoints'
import * as api from '../api/endpoints'
import type { DocumentsSummary, VehicleDocument } from '../api/types'

interface DocumentsState {
  documents: VehicleDocument[]
  summary: DocumentsSummary | null
  loading: boolean
  loadVehicle: (vehicleId: number) => Promise<void>
  createDocument: (vehicleId: number, payload: DocumentPayload) => Promise<VehicleDocument>
  removeDocument: (id: number) => Promise<void>
  uploadFile: (id: number, file: File) => Promise<void>
  removeFile: (id: number) => Promise<void>
  reset: () => void
}

export const useDocuments = create<DocumentsState>((set) => ({
  documents: [],
  summary: null,
  loading: false,

  async loadVehicle(vehicleId) {
    set({ loading: true })

    try {
      const [documents, summary] = await Promise.all([
        api.listDocuments(vehicleId),
        api.documentsSummary(vehicleId),
      ])
      set({ documents: documents.data, summary })
    } finally {
      set({ loading: false })
    }
  },

  async createDocument(vehicleId, payload) {
    const document = await api.createDocument(vehicleId, payload)
    set((state) => ({ documents: [document, ...state.documents] }))

    return document
  },

  async removeDocument(id) {
    await api.deleteDocument(id)
    set((state) => ({ documents: state.documents.filter((document) => document.id !== id) }))
  },

  async uploadFile(id, file) {
    const document = await api.uploadDocumentFile(id, file)
    set((state) => ({
      documents: state.documents.map((item) => (item.id === id ? document : item)),
    }))
  },

  async removeFile(id) {
    const document = await api.deleteDocumentFile(id)
    set((state) => ({
      documents: state.documents.map((item) => (item.id === id ? document : item)),
    }))
  },

  reset() {
    set({ documents: [], summary: null })
  },
}))
