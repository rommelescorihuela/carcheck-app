import { create } from 'zustand'
import type { FuelEntryPayload } from '../api/endpoints'
import * as api from '../api/endpoints'
import type { FuelEntry, FuelSummary } from '../api/types'

interface FuelState {
  entries: FuelEntry[]
  summary: FuelSummary | null
  loading: boolean
  loadVehicle: (vehicleId: number) => Promise<void>
  createEntry: (vehicleId: number, payload: FuelEntryPayload) => Promise<FuelEntry>
  removeEntry: (id: number) => Promise<void>
  reset: () => void
}

export const useFuel = create<FuelState>((set) => ({
  entries: [],
  summary: null,
  loading: false,

  async loadVehicle(vehicleId) {
    set({ loading: true })

    try {
      const [entries, summary] = await Promise.all([
        api.listFuelEntries(vehicleId),
        api.fuelSummary(vehicleId),
      ])
      set({ entries: entries.data, summary })
    } finally {
      set({ loading: false })
    }
  },

  async createEntry(vehicleId, payload) {
    const entry = await api.createFuelEntry(vehicleId, payload)
    set((state) => ({ entries: [entry, ...state.entries] }))

    return entry
  },

  async removeEntry(id) {
    await api.deleteFuelEntry(id)
    set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) }))
  },

  reset() {
    set({ entries: [], summary: null })
  },
}))
