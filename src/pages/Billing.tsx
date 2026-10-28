import { useEffect } from 'react'
import type { BillingPaymentPayload } from '../api/endpoints'
import type { BillingPayment, EffectiveSubscriptionStatus, Plan } from '../api/types'
import { useBilling } from '../stores/billing'
import { useOrganizations } from '../stores/organization'
import PaymentForm from './PaymentForm'

const STATUS_CLASS: Record<EffectiveSubscriptionStatus, string> = {
  trialing: 'bg-teal-50 text-teal-700',
  active: 'bg-teal-50 text-teal-700',
  pending_payment: 'bg-amber-50 text-amber-700',
  canceled: 'bg-slate-100 text-slate-700',
  expired: 'bg-red-50 text-red-700',
}

const PAYMENT_CLASS: Record<BillingPayment['status'], string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-teal-50 text-teal-700',
  rejected: 'bg-red-50 text-red-700',
}

function money(value: string | number, currency: string): string {
  const amount = Number(value)

  return `${amount.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

function limits(plan: Plan): string {
  const vehicles = plan.max_vehicles === null ? 'Vehículos sin límite' : `Hasta ${plan.max_vehicles} vehículos`
  const members = plan.max_members === null ? 'miembros sin límite' : `hasta ${plan.max_members} miembros`

  return `${vehicles} · ${members}`
}

export default function Billing() {
  const activeId = useOrganizations((state) => state.activeId)
  const organizations = useOrganizations((state) => state.organizations)
  const loadOrganizations = useOrganizations((state) => state.load)

  const plans = useBilling((state) => state.plans)
  const overview = useBilling((state) => state.overview)
  const payments = useBilling((state) => state.payments)
  const loading = useBilling((state) => state.loading)
  const load = useBilling((state) => state.load)
  const subscribe = useBilling((state) => state.subscribe)
  const changePlan = useBilling((state) => state.changePlan)
  const cancel = useBilling((state) => state.cancel)
  const reportPayment = useBilling((state) => state.reportPayment)
  const uploadProof = useBilling((state) => state.uploadProof)

  const active = organizations.find((organization) => organization.id === activeId)
  const subscription = overview?.subscription ?? null
  const canManage = overview?.can_manage ?? false

  useEffect(() => {
    void loadOrganizations()
  }, [loadOrganizations])

  useEffect(() => {
    void load(activeId)
  }, [activeId, load])

  async function handleChoose(planId: number) {
    const hasCurrent = subscription !== null && subscription.has_access

    if (hasCurrent) {
      await changePlan(planId, activeId)
    } else {
      await subscribe(planId, activeId)
    }

    await load(activeId)
  }

  async function handleCancel() {
    await cancel(activeId)
    await load(activeId)
  }

  async function handlePayment(payload: BillingPaymentPayload, file: File | null) {
    const payment = await reportPayment(payload, activeId)

    if (file) {
      await uploadProof(payment.id, file)
    }

    await load(activeId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Facturación</h1>
        <p className="text-sm text-slate-500">Ámbito: {active ? active.name : 'Personal'}</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-800">Suscripción actual</h2>

        {subscription ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-semibold text-slate-900">{subscription.plan.name}</p>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${STATUS_CLASS[subscription.effective_status]}`}
              >
                {subscription.effective_status_label}
              </span>
              <span className="text-sm text-slate-600">
                {money(subscription.plan.price, subscription.plan.currency)} /{' '}
                {subscription.plan.interval_label.toLowerCase()}
              </span>
            </div>

            {subscription.effective_status === 'trialing' && (
              <p className="text-sm text-slate-600">
                Te quedan {subscription.trial_days_left ?? 0} días de prueba gratuita.
              </p>
            )}

            {subscription.current_period_end && (
              <p className="text-sm text-slate-600">
                Periodo actual hasta {subscription.current_period_end}
                {subscription.days_left !== null && ` (${subscription.days_left} días)`}.
              </p>
            )}

            {subscription.status === 'canceled' && subscription.has_access && (
              <p className="text-sm text-amber-700">
                Cancelada. Mantienes el acceso hasta {subscription.current_period_end}.
              </p>
            )}

            {overview && (
              <p className="text-sm text-slate-600">
                Uso: {overview.usage.vehicles}
                {subscription.plan.max_vehicles !== null && ` / ${subscription.plan.max_vehicles}`} vehículos
                {overview.usage.members !== null && (
                  <>
                    {' · '}
                    {overview.usage.members}
                    {subscription.plan.max_members !== null && ` / ${subscription.plan.max_members}`} miembros
                  </>
                )}
              </p>
            )}

            {canManage && subscription.status !== 'canceled' && (
              <button
                type="button"
                onClick={() => void handleCancel()}
                className="text-sm text-red-600"
              >
                Cancelar suscripción
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-600">
            Sin suscripción. Elige un plan para empezar {canManage ? '' : '(solo el propietario o un administrador puede hacerlo).'}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">Planes</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {plans.map((plan) => {
            const current = subscription?.plan.id === plan.id

            return (
              <div
                key={plan.id}
                className={`rounded border bg-white p-4 ${
                  current ? 'border-teal-600' : 'border-slate-200'
                }`}
              >
                <p className="font-semibold text-slate-900">{plan.name}</p>
                <p className="text-sm text-slate-600">
                  {money(plan.price, plan.currency)} / {plan.interval_label.toLowerCase()}
                </p>
                <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                <p className="mt-1 text-xs text-slate-500">{limits(plan)}</p>

                {canManage && (
                  <button
                    type="button"
                    aria-label={`Elegir plan ${plan.name}`}
                    disabled={current}
                    onClick={() => void handleChoose(plan.id)}
                    className="mt-3 w-full rounded bg-teal-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {current ? 'Plan actual' : subscription?.has_access ? 'Cambiar a este plan' : 'Elegir'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {canManage && subscription && (
        <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">Reportar un pago</h2>
          <p className="text-sm text-slate-600">
            Transfiere o paga por el método que prefieras y reporta el pago con su comprobante. Un
            administrador lo revisará.
          </p>
          <PaymentForm
            planPrice={subscription.plan.price}
            planCurrency={subscription.plan.currency}
            onSubmit={handlePayment}
          />
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-800">Pagos reportados</h2>
        <ul className="space-y-2">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 bg-white p-3"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {money(payment.amount, payment.currency)} · {payment.method_label}
                </p>
                <p className="text-sm text-slate-500">
                  {payment.paid_on}
                  {payment.reference && ` · ${payment.reference}`}
                  {payment.currency !== subscription?.plan.currency &&
                    ` · equivalente ${money(payment.amount_base, subscription?.plan.currency ?? 'USD')}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {payment.proof && (
                  <a
                    href={payment.proof.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-teal-700"
                  >
                    Comprobante
                  </a>
                )}
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${PAYMENT_CLASS[payment.status]}`}
                >
                  {payment.status_label}
                </span>
              </div>
            </li>
          ))}
          {!loading && payments.length === 0 && (
            <p className="text-sm text-slate-500">Sin pagos reportados.</p>
          )}
        </ul>
      </section>
    </div>
  )
}
