import { create } from 'zustand'
import * as api from '../api/endpoints'
import type { ReminderListParams } from '../api/endpoints'
import type { Reminder, ReminderMeta, ReminderSyncResult } from '../api/types'

interface RemindersState {
  reminders: Reminder[]
  meta: ReminderMeta
  loading: boolean
  syncing: boolean
  load: (params?: ReminderListParams) => Promise<void>
  dismiss: (id: number) => Promise<void>
  sync: (params?: ReminderListParams) => Promise<ReminderSyncResult>
  reset: () => void
}

const EMPTY_META: ReminderMeta = { overdue: 0, upcoming: 0, total: 0 }

// Igual que en organizaciones: una respuesta vieja no debe pisar a una más nueva.
let loadSequence = 0

export const useReminders = create<RemindersState>((set, get) => ({
  reminders: [],
  meta: EMPTY_META,
  loading: false,
  syncing: false,

  async load(params) {
    const sequence = ++loadSequence
    set({ loading: true })

    try {
      const page = await api.listReminders(params)

      if (sequence !== loadSequence) {
        return
      }

      set({ reminders: page.data, meta: page.meta })
    } finally {
      if (sequence === loadSequence) {
        set({ loading: false })
      }
    }
  },

  async dismiss(id) {
    const dismissed = get().reminders.find((reminder) => reminder.id === id)

    await api.dismissReminder(id)

    set((state) => {
      const reminders = state.reminders.filter((reminder) => reminder.id !== id)

      if (dismissed === undefined) {
        return { reminders }
      }

      return {
        reminders,
        meta: {
          overdue: state.meta.overdue - (dismissed.status === 'overdue' ? 1 : 0),
          upcoming: state.meta.upcoming - (dismissed.status === 'upcoming' ? 1 : 0),
          total: Math.max(0, state.meta.total - 1),
        },
      }
    })
  },

  async sync(params) {
    set({ syncing: true })

    try {
      const result = await api.syncReminders(params)
      await get().load(params)

      return result
    } finally {
      set({ syncing: false })
    }
  },

  reset() {
    loadSequence++
    set({ reminders: [], meta: EMPTY_META })
  },
}))
