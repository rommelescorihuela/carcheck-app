import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { BillingPayment, Plan, Subscription } from '../api/types'

vi.mock('../api/endpoints', () => ({
  listPlans: vi.fn(),
  billingOverview: vi.fn(),
  listBillingPayments: vi.fn(),
  startSubscription: vi.fn(),
  changeSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  reportPayment: vi.fn(),
  uploadPaymentProof: vi.fn(),
}))

import * as api from '../api/endpoints'
import { useBilling } from './billing'

const plan: Plan = {
  id: 1,
  code: 'familiar',
  name: 'Familiar',
  description: null,
  price: '7.99',
  currency: 'USD',
  interval: 'monthly',
  interval_label: 'Mensual',
  trial_days: 14,
  max_vehicles: 5,
  max_members: 5,
  sort: 2,
}

function makeSubscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: 1,
    plan,
    status: 'trialing',
    status_label: 'Prueba gratuita',
    effective_status: 'trialing',
    effective_status_label: 'Prueba gratuita',
    has_access: true,
    trial_ends_at: '2026-07-01T00:00:00Z',
    trial_days_left: 14,
    current_period_start: null,
    current_period_end: null,
    days_left: 14,
    canceled_at: null,
    payment_method: null,
    payment_method_label: null,
    created_at: '2026-06-15T00:00:00Z',
    updated_at: '2026-06-15T00:00:00Z',
    ...overrides,
  }
}

function makePayment(overrides: Partial<BillingPayment> = {}): BillingPayment {
  return {
    id: 1,
    subscription_id: 1,
    amount: '7.99',
    currency: 'USD',
    exchange_rate: '1.0000',
    amount_base: 7.99,
    method: 'transfer',
    method_label: 'Transferencia',
    reference: null,
    paid_on: '2026-06-15',
    status: 'pending',
    status_label: 'Pendiente',
    notes: null,
    proof: null,
    reviewed_at: null,
    created_at: '2026-06-15T00:00:00Z',
    ...overrides,
  }
}

describe('billing store', () => {
  beforeEach(() => {
    useBilling.setState({ plans: [], overview: null, payments: [] })
  })

  it('carga planes, suscripción y pagos', async () => {
    vi.mocked(api.listPlans).mockResolvedValueOnce([plan])
    vi.mocked(api.billingOverview).mockResolvedValueOnce({
      subscription: makeSubscription(),
      usage: { vehicles: 1, members: null },
      can_manage: true,
    })
    vi.mocked(api.listBillingPayments).mockResolvedValueOnce({
      data: [makePayment()],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      links: { first: null, last: null, prev: null, next: null },
    })

    await useBilling.getState().load()

    expect(useBilling.getState().plans).toHaveLength(1)
    expect(useBilling.getState().overview?.subscription?.status).toBe('trialing')
    expect(useBilling.getState().payments).toHaveLength(1)
  })

  it('actualiza la suscripción al elegir plan y al cancelar', async () => {
    useBilling.setState({
      overview: { subscription: null, usage: { vehicles: 0, members: null }, can_manage: true },
    })
    vi.mocked(api.startSubscription).mockResolvedValueOnce(makeSubscription())

    await useBilling.getState().subscribe(1)

    expect(useBilling.getState().overview?.subscription?.plan.name).toBe('Familiar')

    vi.mocked(api.cancelSubscription).mockResolvedValueOnce(
      makeSubscription({ status: 'canceled', effective_status: 'canceled', has_access: true }),
    )
    await useBilling.getState().cancel()

    expect(useBilling.getState().overview?.subscription?.status).toBe('canceled')
  })

  it('reporta un pago y lo antepone', async () => {
    vi.mocked(api.reportPayment).mockResolvedValueOnce(makePayment({ id: 2 }))

    await useBilling.getState().reportPayment({
      amount: 7.99,
      currency: 'USD',
      method: 'transfer',
      paid_on: '2026-06-15',
    })

    expect(useBilling.getState().payments[0].id).toBe(2)
  })
})
