import { create } from 'zustand'
import * as api from '../api/endpoints'
import type { AppNotification, NotificationPreference } from '../api/types'

interface NotificationsState {
  notifications: AppNotification[]
  unreadCount: number
  preferences: NotificationPreference[]
  pushConfigured: boolean
  loading: boolean
  load: () => Promise<void>
  loadUnreadCount: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
  savePreferences: (preferences: NotificationPreference[]) => Promise<void>
  sendTest: () => Promise<AppNotification | null>
  reset: () => void
}

export const useNotifications = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: [],
  pushConfigured: false,
  loading: false,

  async load() {
    set({ loading: true })

    try {
      const [notifications, unreadCount, preferences] = await Promise.all([
        api.listNotifications(),
        api.notificationUnreadCount(),
        api.notificationPreferences(),
      ])
      set({
        notifications: notifications.data,
        unreadCount,
        preferences: preferences.preferences,
        pushConfigured: preferences.push_configured,
      })
    } finally {
      set({ loading: false })
    }
  },

  async loadUnreadCount() {
    const count = await api.notificationUnreadCount()
    set({ unreadCount: count })
  },

  async markRead(id) {
    const updated = await api.markNotificationRead(id)
    const wasUnread = get().notifications.some(
      (notification) => notification.id === id && notification.read_at === null,
    )

    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? updated : notification,
      ),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }))
  },

  async markAllRead() {
    await api.markAllNotificationsRead()
    const now = new Date().toISOString()

    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.read_at === null ? { ...notification, read_at: now } : notification,
      ),
      unreadCount: 0,
    }))
  },

  async remove(id) {
    const wasUnread = get().notifications.some(
      (notification) => notification.id === id && notification.read_at === null,
    )

    await api.deleteNotification(id)

    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }))
  },

  async savePreferences(preferences) {
    const data = await api.updateNotificationPreferences(preferences)
    set({ preferences: data.preferences, pushConfigured: data.push_configured })
  },

  async sendTest() {
    const notification = await api.sendTestNotification()

    if (notification) {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: notification.read_at === null ? state.unreadCount + 1 : state.unreadCount,
      }))
    }

    return notification
  },

  reset() {
    set({
      notifications: [],
      unreadCount: 0,
      preferences: [],
      pushConfigured: false,
    })
  },
}))
