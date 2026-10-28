import { create } from 'zustand'
import type { MaintenanceRecordPayload } from '../api/endpoints'
import * as api from '../api/endpoints'
import type { MaintenanceDue, MaintenanceRecord, MaintenanceType } from '../api/types'

interface MaintenanceState {
  types: MaintenanceType[]
  records: MaintenanceRecord[]
  due: MaintenanceDue[]
  loading: boolean
  loadTypes: () => Promise<void>
  loadVehicle: (vehicleId: number) => Promise<void>
  createRecord: (vehicleId: number, payload: MaintenanceRecordPayload) => Promise<MaintenanceRecord>
  removeRecord: (id: number) => Promise<void>
  reset: () => void
}

export const useMaintenance = create<MaintenanceState>((set) => ({
  types: [],
  records: [],
  due: [],
  loading: false,

  async loadTypes() {
    set({ types: await api.listMaintenanceTypes() })
  },

  async loadVehicle(vehicleId) {
    set({ loading: true })

    try {
      const [records, due] = await Promise.all([
        api.listMaintenanceRecords(vehicleId),
        api.maintenanceDue(vehicleId),
      ])
      set({ records: records.data, due })
    } finally {
      set({ loading: false })
    }
  },

  async createRecord(vehicleId, payload) {
    const record = await api.createMaintenanceRecord(vehicleId, payload)
    set((state) => ({ records: [record, ...state.records] }))

    return record
  },

  async removeRecord(id) {
    await api.deleteMaintenanceRecord(id)
    set((state) => ({ records: state.records.filter((item) => item.id !== id) }))
  },

  reset() {
    set({ types: [], records: [], due: [] })
  },
}))
