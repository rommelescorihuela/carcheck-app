import { create } from 'zustand'
import * as api from '../api/endpoints'
import type { ReportParams } from '../api/endpoints'
import { ApiError, type ExpenseReport } from '../api/types'
import { saveBlob } from '../lib/download'

interface ReportsState {
  report: ExpenseReport | null
  loading: boolean
  exporting: boolean
  error: string | null
  load: (params?: ReportParams) => Promise<void>
  exportCsv: (params?: ReportParams) => Promise<void>
  reset: () => void
}

// Igual que en el resto de stores: una respuesta vieja no debe pisar a una más nueva.
let loadSequence = 0

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof ApiError ? cause.message : fallback
}

export const useReports = create<ReportsState>((set) => ({
  report: null,
  loading: false,
  exporting: false,
  error: null,

  async load(params) {
    const sequence = ++loadSequence
    set({ loading: true, error: null })

    try {
      const report = await api.expenseReport(params)

      if (sequence === loadSequence) {
        set({ report })
      }
    } catch (cause) {
      if (sequence === loadSequence) {
        set({ report: null, error: errorMessage(cause, 'No se pudo cargar el informe.') })
      }
    } finally {
      if (sequence === loadSequence) {
        set({ loading: false })
      }
    }
  },

  async exportCsv(params) {
    set({ exporting: true, error: null })

    try {
      const { blob, filename } = await api.exportExpenseReport(params)
      saveBlob(blob, filename)
    } catch (cause) {
      set({ error: errorMessage(cause, 'No se pudo exportar el informe.') })
    } finally {
      set({ exporting: false })
    }
  },

  reset() {
    loadSequence++
    set({ report: null, loading: false, exporting: false, error: null })
  },
}))
