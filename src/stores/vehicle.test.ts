import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Vehicle } from '../api/types'

vi.mock('../api/endpoints', () => ({
  listVehicles: vi.fn(),
  createVehicle: vi.fn(),
  updateVehicle: vi.fn(),
  deleteVehicle: vi.fn(),
}))

import * as api from '../api/endpoints'
import { useVehicles } from './vehicle'

function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 1,
    owner_type: 'App\\Models\\User',
    owner_id: 1,
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    plate: null,
    vin: null,
    type: 'car',
    fuel_type: 'gasoline',
    odometer_km: 1000,
    color: null,
    notes: null,
    photo_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('vehicle store', () => {
  beforeEach(() => {
    useVehicles.setState({ vehicles: [] })
  })

  it('carga la lista', async () => {
    vi.mocked(api.listVehicles).mockResolvedValueOnce({
      data: [makeVehicle()],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
      links: { first: null, last: null, prev: null, next: null },
    })

    await useVehicles.getState().load()

    expect(useVehicles.getState().vehicles).toHaveLength(1)
  })

  it('crea un vehículo y lo antepone', async () => {
    vi.mocked(api.createVehicle).mockResolvedValueOnce(makeVehicle({ id: 2 }))

    await useVehicles.getState().create({ make: 'Ford', model: 'Fiesta' })

    expect(useVehicles.getState().vehicles[0].id).toBe(2)
  })

  it('actualiza el vehículo en la lista', async () => {
    useVehicles.setState({ vehicles: [makeVehicle({ id: 1, odometer_km: 1000 })] })
    vi.mocked(api.updateVehicle).mockResolvedValueOnce(makeVehicle({ id: 1, odometer_km: 2000 }))

    await useVehicles.getState().update(1, { make: 'Toyota', model: 'Corolla', odometer_km: 2000 })

    expect(useVehicles.getState().vehicles[0].odometer_km).toBe(2000)
  })

  it('elimina el vehículo de la lista', async () => {
    useVehicles.setState({ vehicles: [makeVehicle({ id: 1 })] })
    vi.mocked(api.deleteVehicle).mockResolvedValueOnce(undefined)

    await useVehicles.getState().remove(1)

    expect(useVehicles.getState().vehicles).toHaveLength(0)
  })
})
