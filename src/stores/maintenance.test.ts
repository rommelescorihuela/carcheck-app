import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MaintenanceRecord } from '../api/types'

vi.mock('../api/endpoints', () => ({
  listMaintenanceRecords: vi.fn(),
  maintenanceDue: vi.fn(),
  createMaintenanceRecord: vi.fn(),
  deleteMaintenanceRecord: vi.fn(),
}))

import * as api from '../api/endpoints'
import { useMaintenance } from './maintenance'

function makeRecord(overrides: Partial<MaintenanceRecord> = {}): MaintenanceRecord {
  return {
    id: 1,
    vehicle_id: 1,
    recorded_by: null,
    maintenance_type_id: null,
    type: null,
    performed_on: '2026-01-01',
    odometer_km: 1000,
    provider: null,
    notes: null,
    next_due_km: null,
    next_due_date: null,
    currency: 'USD',
    total: 0,
    items: [],
    attachments: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('maintenance store', () => {
  beforeEach(() => {
    useMaintenance.setState({ types: [], records: [], due: [] })
  })

  it('carga registros y próximos de un vehículo', async () => {
    vi.mocked(api.listMaintenanceRecords).mockResolvedValueOnce({
      data: [makeRecord()],
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
      links: { first: null, last: null, prev: null, next: null },
    })
    vi.mocked(api.maintenanceDue).mockResolvedValueOnce([
      {
        maintenance_type: { id: 1, name: 'Aceite' },
        due_km: 5000,
        due_date: null,
        status: 'ok',
        source: 'plan',
      },
    ])

    await useMaintenance.getState().loadVehicle(1)

    expect(useMaintenance.getState().records).toHaveLength(1)
    expect(useMaintenance.getState().due).toHaveLength(1)
  })

  it('crea un registro y lo antepone', async () => {
    vi.mocked(api.createMaintenanceRecord).mockResolvedValueOnce(makeRecord({ id: 2 }))

    await useMaintenance.getState().createRecord(1, { performed_on: '2026-01-01', odometer_km: 1 })

    expect(useMaintenance.getState().records[0].id).toBe(2)
  })

  it('elimina un registro de la lista', async () => {
    useMaintenance.setState({ records: [makeRecord({ id: 1 })] })
    vi.mocked(api.deleteMaintenanceRecord).mockResolvedValueOnce(undefined)

    await useMaintenance.getState().removeRecord(1)

    expect(useMaintenance.getState().records).toHaveLength(0)
  })
})
