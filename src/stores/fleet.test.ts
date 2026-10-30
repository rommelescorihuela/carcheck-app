import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FleetSummary, VehicleImportResult } from '../api/types'
import { ApiError } from '../api/types'

vi.mock('../api/endpoints', () => ({
  fleetSummary: vi.fn(),
  importVehicles: vi.fn(),
}))

import * as api from '../api/endpoints'
import { useFleet } from './fleet'

function makeSummary(overrides: Partial<FleetSummary> = {}): FleetSummary {
  return {
    period: { from: '2026-10-01', to: '2026-10-30' },
    vehicles: {
      total: 2,
      with_expired_documents: 1,
      with_due_maintenance: 0,
      without_activity: 1,
    },
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
    fuel: { entries: 1, liters: 40, costs: [] },
    maintenance: { records: 1, costs: [] },
    documents: { total: 2, expired: 1, expiring: 0 },
    alerts: [],
    rows: [],
    ...overrides,
  }
}

function makeImport(overrides: Partial<VehicleImportResult> = {}): VehicleImportResult {
  return {
    created: 2,
    failed: 1,
    limit: 25,
    remaining: 21,
    errors: [{ line: 4, message: 'El VIN está repetido en el archivo.' }],
    ...overrides,
  }
}

describe('fleet store', () => {
  beforeEach(() => {
    useFleet.getState().reset()
    vi.clearAllMocks()
  })

  it('carga el resumen con los filtros recibidos', async () => {
    const summary = makeSummary()
    vi.mocked(api.fleetSummary).mockResolvedValueOnce(summary)

    await useFleet.getState().load({ organizationId: 7, from: '2026-10-01', to: '2026-10-30' })

    expect(api.fleetSummary).toHaveBeenCalledWith({
      organizationId: 7,
      from: '2026-10-01',
      to: '2026-10-30',
    })
    expect(useFleet.getState().summary).toEqual(summary)
    expect(useFleet.getState().error).toBeNull()
    expect(useFleet.getState().loading).toBe(false)
  })

  it('descarta una respuesta vieja que llega después de una nueva', async () => {
    let resolveFirst: (summary: FleetSummary) => void = () => {}
    const first = new Promise<FleetSummary>((resolve) => {
      resolveFirst = resolve
    })
    const newest = makeSummary({ period: { from: '2026-09-01', to: '2026-09-30' } })

    vi.mocked(api.fleetSummary).mockReturnValueOnce(first).mockResolvedValueOnce(newest)

    const firstLoad = useFleet.getState().load({ from: '2026-10-01' })
    await useFleet.getState().load({ from: '2026-09-01' })

    resolveFirst(makeSummary())
    await firstLoad

    expect(useFleet.getState().summary).toEqual(newest)
    expect(useFleet.getState().loading).toBe(false)
  })

  it('guarda el mensaje de error y vacía el resumen anterior', async () => {
    vi.mocked(api.fleetSummary).mockRejectedValueOnce(new ApiError(500, 'Fallo del servidor.'))

    await useFleet.getState().load()

    expect(useFleet.getState().summary).toBeNull()
    expect(useFleet.getState().error).toBe('Fallo del servidor.')
    expect(useFleet.getState().loading).toBe(false)
  })

  it('importa un CSV y devuelve el resultado fila a fila', async () => {
    const result = makeImport()
    const file = new File(['marca,modelo\nToyota,Corolla\n'], 'flota.csv', { type: 'text/csv' })
    vi.mocked(api.importVehicles).mockResolvedValueOnce(result)

    const imported = await useFleet.getState().importCsv(file, 7)

    expect(api.importVehicles).toHaveBeenCalledWith(file, 7)
    expect(imported).toEqual(result)
    expect(useFleet.getState().imported).toEqual(result)
    expect(useFleet.getState().importing).toBe(false)
    expect(useFleet.getState().error).toBeNull()
  })

  it('informa si la importación falla y no deja resultado', async () => {
    const file = new File(['x'], 'flota.csv', { type: 'text/csv' })
    vi.mocked(api.importVehicles).mockRejectedValueOnce(new ApiError(422, 'El CSV no es válido.'))

    const imported = await useFleet.getState().importCsv(file, null)

    expect(imported).toBeNull()
    expect(useFleet.getState().imported).toBeNull()
    expect(useFleet.getState().importing).toBe(false)
    expect(useFleet.getState().error).toBe('El CSV no es válido.')
  })

  it('reset limpia el estado', async () => {
    vi.mocked(api.fleetSummary).mockResolvedValueOnce(makeSummary())
    await useFleet.getState().load()

    useFleet.getState().reset()

    expect(useFleet.getState().summary).toBeNull()
    expect(useFleet.getState().imported).toBeNull()
    expect(useFleet.getState().error).toBeNull()
  })
})
