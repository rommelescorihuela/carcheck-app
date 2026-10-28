import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ExpenseReport } from '../api/types'
import { ApiError } from '../api/types'

vi.mock('../api/endpoints', () => ({
  expenseReport: vi.fn(),
  exportExpenseReport: vi.fn(),
}))

vi.mock('../lib/download', () => ({
  saveBlob: vi.fn(),
}))

import * as api from '../api/endpoints'
import { saveBlob } from '../lib/download'
import { useReports } from './reports'

function makeReport(overrides: Partial<ExpenseReport> = {}): ExpenseReport {
  return {
    period: { from: '2026-01-01', to: '2026-06-15' },
    totals: [
      {
        currency: 'USD',
        maintenance: 20,
        fuel: 40,
        total: 60,
        maintenance_entries: 1,
        fuel_entries: 1,
      },
    ],
    vehicles: [],
    monthly: [],
    billing: [],
    ...overrides,
  }
}

describe('reports store', () => {
  beforeEach(() => {
    useReports.getState().reset()
    vi.clearAllMocks()
  })

  it('carga el informe con los filtros recibidos', async () => {
    const report = makeReport()
    vi.mocked(api.expenseReport).mockResolvedValueOnce(report)

    await useReports.getState().load({ from: '2026-01-01', to: '2026-06-15', scope: 'personal' })

    expect(api.expenseReport).toHaveBeenCalledWith({
      from: '2026-01-01',
      to: '2026-06-15',
      scope: 'personal',
    })
    expect(useReports.getState().report).toEqual(report)
    expect(useReports.getState().error).toBeNull()
    expect(useReports.getState().loading).toBe(false)
  })

  it('descarta una respuesta vieja que llega después de una nueva', async () => {
    let resolveFirst: (report: ExpenseReport) => void = () => {}
    const first = new Promise<ExpenseReport>((resolve) => {
      resolveFirst = resolve
    })
    const newest = makeReport({ period: { from: '2026-02-01', to: '2026-02-28' } })

    vi.mocked(api.expenseReport)
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce(newest)

    const firstLoad = useReports.getState().load({ from: '2026-01-01' })
    await useReports.getState().load({ from: '2026-02-01' })

    resolveFirst(makeReport())
    await firstLoad

    expect(useReports.getState().report).toEqual(newest)
    expect(useReports.getState().loading).toBe(false)
  })

  it('guarda el mensaje de error y vacía el informe anterior', async () => {
    vi.mocked(api.expenseReport)
      .mockRejectedValueOnce(new ApiError(422, 'El periodo no es válido.', { to: ['Inválido'] }))

    await useReports.getState().load()

    expect(useReports.getState().report).toBeNull()
    expect(useReports.getState().error).toBe('El periodo no es válido.')
    expect(useReports.getState().loading).toBe(false)
  })

  it('exporta el CSV y lo entrega al navegador con su nombre', async () => {
    const blob = new Blob(['Moneda,Total\nUSD,60.00\n'], { type: 'text/csv' })
    vi.mocked(api.exportExpenseReport).mockResolvedValueOnce({
      blob,
      filename: 'gastos_2026-01-01_2026-06-15.csv',
    })

    await useReports.getState().exportCsv({ from: '2026-01-01', to: '2026-06-15' })

    expect(api.exportExpenseReport).toHaveBeenCalledWith({
      from: '2026-01-01',
      to: '2026-06-15',
    })
    expect(saveBlob).toHaveBeenCalledWith(blob, 'gastos_2026-01-01_2026-06-15.csv')
    expect(useReports.getState().exporting).toBe(false)
    expect(useReports.getState().error).toBeNull()
  })

  it('informa si la exportación falla', async () => {
    vi.mocked(api.exportExpenseReport).mockRejectedValueOnce(new ApiError(500, 'Fallo del servidor.'))

    await useReports.getState().exportCsv()

    expect(useReports.getState().exporting).toBe(false)
    expect(useReports.getState().error).toBe('Fallo del servidor.')
    expect(saveBlob).not.toHaveBeenCalled()
  })

  it('reset limpia el estado', async () => {
    vi.mocked(api.expenseReport).mockResolvedValueOnce(makeReport())
    await useReports.getState().load()

    useReports.getState().reset()

    expect(useReports.getState().report).toBeNull()
    expect(useReports.getState().error).toBeNull()
  })
})
