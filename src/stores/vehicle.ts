import { create } from 'zustand'
import type { VehicleListParams, VehiclePayload } from '../api/endpoints'
import * as api from '../api/endpoints'
import type { Vehicle } from '../api/types'

interface VehicleState {
  vehicles: Vehicle[]
  loading: boolean
  load: (params?: VehicleListParams) => Promise<void>
  create: (payload: VehiclePayload) => Promise<Vehicle>
  update: (id: number, payload: VehiclePayload) => Promise<Vehicle>
  remove: (id: number) => Promise<void>
  reset: () => void
}

export const useVehicles = create<VehicleState>((set) => ({
  vehicles: [],
  loading: false,

  async load(params) {
    set({ loading: true })

    try {
      const page = await api.listVehicles(params)
      set({ vehicles: page.data })
    } finally {
      set({ loading: false })
    }
  },

  async create(payload) {
    const vehicle = await api.createVehicle(payload)
    set((state) => ({ vehicles: [vehicle, ...state.vehicles] }))

    return vehicle
  },

  async update(id, payload) {
    const vehicle = await api.updateVehicle(id, payload)
    set((state) => ({ vehicles: state.vehicles.map((item) => (item.id === id ? vehicle : item)) }))

    return vehicle
  },

  async remove(id) {
    await api.deleteVehicle(id)
    set((state) => ({ vehicles: state.vehicles.filter((item) => item.id !== id) }))
  },

  reset() {
    set({ vehicles: [] })
  },
}))
