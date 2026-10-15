import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as api from '../api/endpoints'
import type { Organization } from '../api/types'

interface OrganizationState {
  organizations: Organization[]
  activeId: number | null
  loading: boolean
  load: () => Promise<void>
  create: (name: string) => Promise<Organization>
  setActive: (id: number | null) => void
  reset: () => void
}

export const useOrganizations = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organizations: [],
      activeId: null,
      loading: false,

      async load() {
        set({ loading: true })

        try {
          const organizations = await api.listOrganizations()
          set((state) => ({
            organizations,
            // Si la organización activa ya no está disponible, vuelve a "personal".
            activeId: organizations.some((organization) => organization.id === state.activeId)
              ? state.activeId
              : null,
          }))
        } finally {
          set({ loading: false })
        }
      },

      async create(name) {
        const organization = await api.createOrganization({ name })
        set((state) => ({
          organizations: [...state.organizations, organization],
          activeId: organization.id,
        }))
        // Recarga para traer el `pivot.role` de la nueva organización.
        await get().load()

        return organization
      },

      setActive(id) {
        set({ activeId: id })
      },

      reset() {
        set({ organizations: [], activeId: null })
      },
    }),
    {
      name: 'carcheck.organizations',
      // Solo se persiste la organización activa; la lista se recarga del backend.
      partialize: (state) => ({ activeId: state.activeId }),
    },
  ),
)
