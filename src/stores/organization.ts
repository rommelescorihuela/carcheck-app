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

// Las respuestas de `load()` pueden llegar desordenadas (una petición vieja tarda más que otra
// nueva). Solo se aplica la última lanzada para no borrar la organización activa con datos viejos.
let loadSequence = 0

export const useOrganizations = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organizations: [],
      activeId: null,
      loading: false,

      async load() {
        const sequence = ++loadSequence
        set({ loading: true })

        try {
          const organizations = await api.listOrganizations()

          if (sequence !== loadSequence) {
            return
          }

          set((state) => ({
            organizations,
            // Si la organización activa ya no está disponible, vuelve a "personal".
            activeId: organizations.some((organization) => organization.id === state.activeId)
              ? state.activeId
              : null,
          }))
        } finally {
          if (sequence === loadSequence) {
            set({ loading: false })
          }
        }
      },

      async create(name) {
        const organization = await api.createOrganization({ name })

        // Se recarga antes de fijarla como activa: la lista trae el `pivot.role` que decide los
        // permisos, así el formulario no aparece con un rol desconocido y luego desaparece.
        try {
          await get().load()
        } catch {
          // La lista se reintenta al entrar en la sección; un fallo aquí no invalida la creación.
        }

        set({ activeId: organization.id })

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
