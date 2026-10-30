import { create } from 'zustand'
import * as api from '../api/endpoints'
import type { FleetParams } from '../api/endpoints'
import { ApiError, type FleetSummary, type VehicleImportResult } from '../api/types'

interface FleetState {
  summary: FleetSummary | null
  loading: boolean
  error: string | null
  importing: boolean
  imported: VehicleImportResult | null
  load: (params?: FleetParams) => Promise<void>
  importCsv: (file: File, organizationId?: number | null) => Promise<VehicleImportResult | null>
  reset: () => void
}

// Igual que en el resto de stores: una respuesta vieja no debe pisar a una más nueva.
let loadSequence = 0

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof ApiError ? cause.message : fallback
}

export const useFleet = create<FleetState>((set) => ({
  summary: null,
  loading: false,
  error: null,
  importing: false,
  imported: null,

  async load(params) {
    const sequence = ++loadSequence
    set({ loading: true, error: null })

    try {
      const summary = await api.fleetSummary(params)

      if (sequence === loadSequence) {
        set({ summary })
      }
    } catch (cause) {
      if (sequence === loadSequence) {
        set({ summary: null, error: errorMessage(cause, 'No se pudo cargar la flota.') })
      }
    } finally {
      if (sequence === loadSequence) {
        set({ loading: false })
      }
    }
  },

  async importCsv(file, organizationId) {
    set({ importing: true, error: null, imported: null })

    try {
      const result = await api.importVehicles(file, organizationId)
      set({ imported: result })

      return result
    } catch (cause) {
      set({ error: errorMessage(cause, 'No se pudo importar el archivo.') })

      return null
    } finally {
      set({ importing: false })
    }
  },

  reset() {
    loadSequence++
    set({ summary: null, loading: false, error: null, importing: false, imported: null })
  },
}))
