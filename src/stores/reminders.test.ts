import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Reminder } from '../api/types'

vi.mock('../api/endpoints', () => ({
  listReminders: vi.fn(),
  dismissReminder: vi.fn(),
  syncReminders: vi.fn(),
}))

import * as api from '../api/endpoints'
import { useReminders } from './reminders'

function makeReminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: 1,
    kind: 'document',
    kind_label: 'Documento',
    title: 'Seguro: por vencer',
    body: 'Seguro 2026 vence en 10 días.',
    due_on: '2026-06-11',
    due_km: null,
    km_left: null,
    days_left: 10,
    status: 'upcoming',
    vehicle: { id: 4, make: 'Toyota', model: 'Corolla', plate: 'ABC-123' },
    url: '/recordatorios',
    created_at: '2026-06-01T10:00:00Z',
    ...overrides,
  }
}

describe('reminders store', () => {
  beforeEach(() => {
    useReminders.getState().reset()
    useReminders.setState({ loading: false, syncing: false })
  })

  it('carga recordatorios y sus contadores', async () => {
    vi.mocked(api.listReminders).mockResolvedValueOnce({
      data: [makeReminder(), makeReminder({ id: 2, status: 'overdue', days_left: -3 })],
      meta: { overdue: 1, upcoming: 1, total: 2 },
    })

    await useReminders.getState().load({ scope: 'personal' })

    expect(useReminders.getState().reminders).toHaveLength(2)
    expect(useReminders.getState().meta).toEqual({ overdue: 1, upcoming: 1, total: 2 })
    expect(api.listReminders).toHaveBeenCalledWith({ scope: 'personal' })
  })

  it('descarta un recordatorio y ajusta los contadores', async () => {
    vi.mocked(api.listReminders).mockResolvedValueOnce({
      data: [
        makeReminder({ id: 1, status: 'overdue' }),
        makeReminder({ id: 2, status: 'upcoming' }),
      ],
      meta: { overdue: 1, upcoming: 1, total: 2 },
    })
    vi.mocked(api.dismissReminder).mockResolvedValueOnce(undefined)

    await useReminders.getState().load()
    await useReminders.getState().dismiss(1)

    expect(api.dismissReminder).toHaveBeenCalledWith(1)
    expect(useReminders.getState().reminders.map((reminder) => reminder.id)).toEqual([2])
    expect(useReminders.getState().meta).toEqual({ overdue: 0, upcoming: 1, total: 1 })
  })

  it('sincroniza y recarga la lista con el mismo ámbito', async () => {
    vi.mocked(api.syncReminders).mockResolvedValueOnce({ created: 2, total: 2 })
    vi.mocked(api.listReminders).mockResolvedValueOnce({
      data: [makeReminder(), makeReminder({ id: 2 })],
      meta: { overdue: 0, upcoming: 2, total: 2 },
    })

    const result = await useReminders.getState().sync({ organizationId: 7 })

    expect(result).toEqual({ created: 2, total: 2 })
    expect(api.syncReminders).toHaveBeenCalledWith({ organizationId: 7 })
    expect(api.listReminders).toHaveBeenCalledWith({ organizationId: 7 })
    expect(useReminders.getState().reminders).toHaveLength(2)
    expect(useReminders.getState().syncing).toBe(false)
  })

  it('descarta respuestas obsoletas de carga', async () => {
    let resolveFirst: (value: Awaited<ReturnType<typeof api.listReminders>>) => void = () => {}
    vi.mocked(api.listReminders)
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve
        }),
      )
      .mockResolvedValueOnce({
        data: [makeReminder({ id: 9 })],
        meta: { overdue: 0, upcoming: 1, total: 1 },
      })

    const first = useReminders.getState().load({ scope: 'personal' })
    await useReminders.getState().load({ organizationId: 7 })

    resolveFirst({
      data: [makeReminder({ id: 1 })],
      meta: { overdue: 1, upcoming: 0, total: 1 },
    })
    await first

    expect(useReminders.getState().reminders.map((reminder) => reminder.id)).toEqual([9])
  })
})
