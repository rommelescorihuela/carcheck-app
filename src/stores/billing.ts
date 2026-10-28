import { create } from 'zustand'
import type { BillingPaymentPayload } from '../api/endpoints'
import * as api from '../api/endpoints'
import type { BillingPayment, Plan, Subscription, SubscriptionOverview } from '../api/types'

interface BillingState {
  plans: Plan[]
  overview: SubscriptionOverview | null
  payments: BillingPayment[]
  loading: boolean
  load: (organizationId?: number | null) => Promise<void>
  subscribe: (planId: number, organizationId?: number | null) => Promise<Subscription>
  changePlan: (planId: number, organizationId?: number | null) => Promise<Subscription>
  cancel: (organizationId?: number | null) => Promise<void>
  reportPayment: (
    payload: BillingPaymentPayload,
    organizationId?: number | null,
  ) => Promise<BillingPayment>
  uploadProof: (paymentId: number, file: File) => Promise<void>
  reset: () => void
}

export const useBilling = create<BillingState>((set) => ({
  plans: [],
  overview: null,
  payments: [],
  loading: false,

  async load(organizationId) {
    set({ loading: true })

    try {
      const [plans, overview, payments] = await Promise.all([
        api.listPlans(),
        api.billingOverview(organizationId),
        api.listBillingPayments(organizationId),
      ])
      set({ plans, overview, payments: payments.data })
    } finally {
      set({ loading: false })
    }
  },

  async subscribe(planId, organizationId) {
    const subscription = await api.startSubscription(planId, organizationId)
    set((state) =>
      state.overview ? { overview: { ...state.overview, subscription } } : { overview: state.overview },
    )

    return subscription
  },

  async changePlan(planId, organizationId) {
    const subscription = await api.changeSubscription(planId, organizationId)
    set((state) =>
      state.overview ? { overview: { ...state.overview, subscription } } : { overview: state.overview },
    )

    return subscription
  },

  async cancel(organizationId) {
    const subscription = await api.cancelSubscription(organizationId)
    set((state) =>
      state.overview ? { overview: { ...state.overview, subscription } } : { overview: state.overview },
    )
  },

  async reportPayment(payload, organizationId) {
    const payment = await api.reportPayment(payload, organizationId)
    set((state) => ({ payments: [payment, ...state.payments] }))

    return payment
  },

  async uploadProof(paymentId, file) {
    const payment = await api.uploadPaymentProof(paymentId, file)
    set((state) => ({
      payments: state.payments.map((item) => (item.id === paymentId ? payment : item)),
    }))
  },

  reset() {
    set({ plans: [], overview: null, payments: [] })
  },
}))
