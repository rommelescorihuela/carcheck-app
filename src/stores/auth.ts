import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginPayload, RegisterPayload } from '../api/endpoints'
import * as authApi from '../api/endpoints'
import { clearToken, getToken } from '../api/token'
import type { User } from '../api/types'
import { useOrganizations } from './organization'
import { useVehicles } from './vehicle'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest'

interface AuthState {
  user: User | null
  status: AuthStatus
  setUser: (user: User | null) => void
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  bootstrap: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'idle',

      setUser: (user) => set({ user, status: user ? 'authenticated' : 'guest' }),

      async login(payload) {
        const { user } = await authApi.login(payload)
        set({ user, status: 'authenticated' })
      },

      async register(payload) {
        const { user } = await authApi.register(payload)
        set({ user, status: 'authenticated' })
      },

      async logout() {
        try {
          await authApi.logout()
        } catch {
          // Aunque falle la red, cerramos sesión localmente.
        } finally {
          clearToken()
          useOrganizations.getState().reset()
          useVehicles.getState().reset()
          set({ user: null, status: 'guest' })
        }
      },

      async bootstrap() {
        if (!getToken()) {
          set({ user: null, status: 'guest' })

          return
        }

        try {
          const user = await authApi.me()
          set({ user, status: 'authenticated' })
        } catch {
          clearToken()
          set({ user: null, status: 'guest' })
        }
      },
    }),
    {
      name: 'carcheck.auth',
      // El token NO se persiste en el store: vive en src/api/token.ts.
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
