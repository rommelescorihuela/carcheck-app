import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FuelEntry, FuelSummary } from '../api/types'

vi.mock('../api/endpoints', () => ({
  listFuelEntries: vi.fn(),
  fuelSummary: vi.fn(),
  createFuelEntry: vi.fn(),
  deleteFuelEntry: vi.fn(),
}))

import * as api from '../api/endpoints'
import { useFuel } from './fuel'

function makeEntry(overrides: Partial<FuelEntry> = {}): FuelEntry {
  return {
    id: 1,
    vehicle_id: 1,
    filled_on: '2026-01-01',
    odometer_km: 1000,
    liters: '40.00',
    unit_price: '1.000',
    total: 40,
    currency: 'USD',
    full_tank: true,
    station: null,
    notes: null,
    distance_km: null,
    km_per_liter: null,
    cost_per_km: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const summary: FuelSummary = {
  entries: 1,
  total_liters: 40,
  total_cost: 40,
  distance_km: 0,
  km_per_liter: null,
  cost_per_km: null,
  currency: 'USD',
  last_filled_on: '2026-01-01',
}

describe('fuel store', () => {
  beforeEach(() => {
    useFuel.setState({ entries: [], summary: null })
  })

  it('carga cargas y resumen del vehículo', async () => {
    vi.mocked(api.listFuelEntries).mockResolvedValueOnce({
      data: [makeEntry()],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      links: { first: null, last: null, prev: null, next: null },
    })
    vi.mocked(api.fuelSummary).mockResolvedValueOnce(summary)

    await useFuel.getState().loadVehicle(1)

    expect(useFuel.getState().entries).toHaveLength(1)
    expect(useFuel.getState().summary?.total_liters).toBe(40)
  })

  it('crea una carga y la antepone', async () => {
    vi.mocked(api.createFuelEntry).mockResolvedValueOnce(makeEntry({ id: 2 }))

    await useFuel.getState().createEntry(1, {
      filled_on: '2026-01-01',
      odometer_km: 1000,
      liters: 40,
      unit_price: 1,
    })

    expect(useFuel.getState().entries[0].id).toBe(2)
  })

  it('elimina una carga de la lista', async () => {
    useFuel.setState({ entries: [makeEntry({ id: 1 })] })
    vi.mocked(api.deleteFuelEntry).mockResolvedValueOnce(undefined)

    await useFuel.getState().removeEntry(1)

    expect(useFuel.getState().entries).toHaveLength(0)
  })
})
