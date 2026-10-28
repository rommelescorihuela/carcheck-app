import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppNotification, NotificationPreference } from '../api/types'

vi.mock('../api/endpoints', () => ({
  listNotifications: vi.fn(),
  notificationUnreadCount: vi.fn(),
  notificationPreferences: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  deleteNotification: vi.fn(),
  updateNotificationPreferences: vi.fn(),
  sendTestNotification: vi.fn(),
}))

import * as api from '../api/endpoints'
import { useNotifications } from './notifications'

function makeNotification(overrides: Partial<AppNotification> = {}): AppNotification {
  return {
    id: '1e2f3a4b-0000-4000-8000-000000000000',
    category: 'system',
    category_label: 'Sistema',
    title: 'Aviso',
    body: 'Cuerpo',
    url: null,
    payload: {},
    read_at: null,
    created_at: '2026-06-15T10:00:00Z',
    ...overrides,
  }
}

const preferences: NotificationPreference[] = [
  { category: 'system', category_label: 'Sistema', in_app: true, email: true, push: true },
]

describe('notifications store', () => {
  beforeEach(() => {
    useNotifications.setState({
      notifications: [],
      unreadCount: 0,
      preferences: [],
      pushConfigured: false,
    })
  })

  it('carga bandeja, contador y preferencias', async () => {
    vi.mocked(api.listNotifications).mockResolvedValueOnce({
      data: [makeNotification()],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      links: { first: null, last: null, prev: null, next: null },
    })
    vi.mocked(api.notificationUnreadCount).mockResolvedValueOnce(1)
    vi.mocked(api.notificationPreferences).mockResolvedValueOnce({
      preferences,
      push_configured: true,
    })

    await useNotifications.getState().load()

    expect(useNotifications.getState().notifications).toHaveLength(1)
    expect(useNotifications.getState().unreadCount).toBe(1)
    expect(useNotifications.getState().pushConfigured).toBe(true)
  })

  it('marca uno como leído y descuenta el contador una sola vez', async () => {
    useNotifications.setState({ notifications: [makeNotification()], unreadCount: 1 })
    vi.mocked(api.markNotificationRead).mockResolvedValue(
      makeNotification({ read_at: '2026-06-15T11:00:00Z' }),
    )

    await useNotifications.getState().markRead('1e2f3a4b-0000-4000-8000-000000000000')
    await useNotifications.getState().markRead('1e2f3a4b-0000-4000-8000-000000000000')

    expect(useNotifications.getState().unreadCount).toBe(0)
    expect(useNotifications.getState().notifications[0].read_at).not.toBeNull()
  })

  it('elimina un aviso y ajusta el contador', async () => {
    useNotifications.setState({ notifications: [makeNotification()], unreadCount: 1 })
    vi.mocked(api.deleteNotification).mockResolvedValueOnce(undefined)

    await useNotifications.getState().remove('1e2f3a4b-0000-4000-8000-000000000000')

    expect(useNotifications.getState().notifications).toHaveLength(0)
    expect(useNotifications.getState().unreadCount).toBe(0)
  })

  it('el aviso de prueba se antepone y suma al contador', async () => {
    vi.mocked(api.sendTestNotification).mockResolvedValueOnce(
      makeNotification({ id: 'nuevo', title: 'Notificación de prueba' }),
    )

    await useNotifications.getState().sendTest()

    expect(useNotifications.getState().notifications[0].title).toBe('Notificación de prueba')
    expect(useNotifications.getState().unreadCount).toBe(1)
  })

  it('guarda preferencias y actualiza el estado del push', async () => {
    vi.mocked(api.updateNotificationPreferences).mockResolvedValueOnce({
      preferences: [{ ...preferences[0], push: false }],
      push_configured: true,
    })

    await useNotifications.getState().savePreferences([{ ...preferences[0], push: false }])

    expect(useNotifications.getState().preferences[0].push).toBe(false)
    expect(useNotifications.getState().pushConfigured).toBe(true)
  })
})
