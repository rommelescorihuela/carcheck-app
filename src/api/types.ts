export type Decimal = string

export interface User {
  id: number
  name: string
  email: string
  currency: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  access_token: string
  token_type: 'Bearer'
}

export interface ApiErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'driver'

export interface Organization {
  id: number
  name: string
  slug: string
  owner_id: number
  currency: string
  timezone: string
  members_count?: number
  pivot?: {
    role: OrganizationRole
    joined_at: string | null
  }
}

export interface Member {
  id: number
  name: string
  email: string
  role: OrganizationRole
  joined_at: string | null
}

export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'other'

export type FuelType = 'gasoline' | 'diesel' | 'cng' | 'electric' | 'hybrid'

export interface Vehicle {
  id: number
  owner_type: string
  owner_id: number
  make: string
  model: string
  year: number | null
  plate: string | null
  vin: string | null
  type: VehicleType
  fuel_type: FuelType
  odometer_km: number
  color: string | null
  notes: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface Paginated<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}

export type MaintenanceItemKind = 'labor' | 'part' | 'other'

export interface MaintenanceType {
  id: number
  name: string
  slug: string | null
  interval_km: number | null
  interval_months: number | null
  is_global: boolean
  owner_type: string | null
  owner_id: number | null
}

export interface MaintenanceItem {
  id: number
  kind: MaintenanceItemKind
  description: string
  quantity: Decimal
  unit_price: Decimal
}

export interface MaintenanceAttachment {
  id: number
  file_name: string
  url: string
}

export interface MaintenanceRecord {
  id: number
  vehicle_id: number
  recorded_by: string | null
  maintenance_type_id: number | null
  type: MaintenanceType | null
  performed_on: string
  odometer_km: number
  provider: string | null
  notes: string | null
  next_due_km: number | null
  next_due_date: string | null
  currency: string
  total: number
  items: MaintenanceItem[]
  attachments: MaintenanceAttachment[]
  created_at: string
  updated_at: string
}

export interface MaintenancePlan {
  id: number
  vehicle_id: number
  maintenance_type_id: number
  interval_km: number | null
  interval_months: number | null
  type: MaintenanceType
}

export interface MaintenanceDue {
  maintenance_type: { id: number; name: string }
  due_km: number | null
  due_date: string | null
  status: 'ok' | 'soon' | 'due'
  source: 'plan' | 'manual'
}

export interface FuelEntry {
  id: number
  vehicle_id: number
  recorded_by: string | null
  filled_on: string
  odometer_km: number
  liters: Decimal
  unit_price: Decimal
  total: number
  currency: string
  full_tank: boolean
  station: string | null
  notes: string | null
  distance_km: number | null
  km_per_liter: number | null
  cost_per_km: number | null
  created_at: string
  updated_at: string
}

export interface FuelSummary {
  entries: number
  total_liters: number
  total_cost: number
  distance_km: number
  km_per_liter: number | null
  cost_per_km: number | null
  currency: string
  last_filled_on: string | null
}

export type DocumentKind = 'insurance' | 'inspection' | 'tax' | 'license' | 'other'

export type DocumentStatusValue = 'valid' | 'expiring' | 'expired'

export interface DocumentFile {
  id: number
  file_name: string
  url: string
  mime_type: string
  size: number
}

export interface VehicleDocument {
  id: number
  vehicle_id: number
  kind: DocumentKind
  kind_label: string
  name: string
  issuer: string | null
  reference: string | null
  issued_on: string | null
  expires_on: string | null
  notes: string | null
  status: DocumentStatusValue
  days_left: number | null
  file: DocumentFile | null
  created_at: string
  updated_at: string
}

export interface DocumentsSummary {
  total: number
  valid: number
  expiring: number
  expired: number
  next_expiration: {
    id: number
    name: string
    kind: DocumentKind
    kind_label: string
    expires_on: string
    days_left: number
  } | null
}


export type PlanInterval = 'monthly' | 'yearly'

export interface Plan {
  id: number
  code: string
  name: string
  description: string | null
  price: Decimal
  currency: string
  interval: PlanInterval
  interval_label: string
  trial_days: number
  max_vehicles: number | null
  max_members: number | null
  sort: number
}

export type SubscriptionStatusValue = 'trialing' | 'pending_payment' | 'active' | 'canceled'

export type EffectiveSubscriptionStatus = SubscriptionStatusValue | 'expired'

export interface Subscription {
  id: number
  plan: Plan
  status: SubscriptionStatusValue
  status_label: string
  effective_status: EffectiveSubscriptionStatus
  effective_status_label: string
  has_access: boolean
  trial_ends_at: string | null
  trial_days_left: number | null
  current_period_start: string | null
  current_period_end: string | null
  days_left: number | null
  canceled_at: string | null
  payment_method: string | null
  payment_method_label: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionOverview {
  subscription: Subscription | null
  usage: { vehicles: number; members: number | null }
  can_manage: boolean
}

export type PaymentMethodValue =
  | 'transfer'
  | 'mobile_payment'
  | 'zelle'
  | 'binance'
  | 'cash'
  | 'other'

export type PaymentStatusValue = 'pending' | 'approved' | 'rejected'

export interface BillingPayment {
  id: number
  subscription_id: number
  amount: Decimal
  currency: string
  exchange_rate: Decimal
  amount_base: number
  method: PaymentMethodValue
  method_label: string
  reference: string | null
  paid_on: string
  status: PaymentStatusValue
  status_label: string
  notes: string | null
  proof: { id: number; file_name: string; url: string } | null
  reviewed_at: string | null
  created_at: string
}


export type NotificationCategory =
  | 'system'
  | 'billing'
  | 'maintenance'
  | 'documents'
  | 'reminders'

export interface AppNotification {
  id: string
  category: NotificationCategory
  category_label: string
  title: string
  body: string
  url: string | null
  payload: Record<string, unknown>
  read_at: string | null
  created_at: string
}

export interface NotificationPreference {
  category: NotificationCategory
  category_label: string
  in_app: boolean
  email: boolean
  push: boolean
}

export interface NotificationPreferencesData {
  preferences: NotificationPreference[]
  push_configured: boolean
}

export type ReminderKind = 'maintenance' | 'document'

export type ReminderStatus = 'overdue' | 'upcoming'

export interface Reminder {
  id: number
  kind: ReminderKind
  kind_label: string
  title: string
  body: string
  due_on: string | null
  due_km: number | null
  km_left: number | null
  days_left: number | null
  status: ReminderStatus
  vehicle: {
    id: number
    make: string
    model: string
    plate: string | null
  }
  url: string
  created_at: string
}

export interface ReminderMeta {
  overdue: number
  upcoming: number
  total: number
}

export interface ReminderSyncResult {
  created: number
  total: number
}

export interface ExpenseRow {
  currency: string
  maintenance: number
  fuel: number
  total: number
  maintenance_entries: number
  fuel_entries: number
}

export interface VehicleExpenseRow extends ExpenseRow {
  vehicle: { id: number; make: string; model: string; plate: string | null }
}

export interface MonthlyExpenseRow extends ExpenseRow {
  month: string
}

export interface BillingExpenseRow {
  currency: string
  payments: number
  total: number
}

export interface ExpenseReport {
  period: { from: string; to: string }
  totals: ExpenseRow[]
  vehicles: VehicleExpenseRow[]
  monthly: MonthlyExpenseRow[]
  billing: BillingExpenseRow[]
}

export interface PushSubscriptionPayload {
  endpoint: string
  keys: { p256dh: string; auth: string }
  content_encoding: 'aes128gcm' | 'aesgcm'
}

export interface FleetAlert {
  kind: 'document' | 'maintenance'
  vehicle_id: number
  vehicle: string
  label: string
  days_left: number | null
}

export interface FleetVehicleRow {
  vehicle: {
    id: number
    make: string
    model: string
    plate: string | null
    odometer_km: number
  }
  currency: string
  fuel: { entries: number; cost: number }
  maintenance: { records: number; cost: number }
  total: number
  documents: { expired: number; expiring: number }
  maintenance_due: number
  maintenance_soon: number
}

export interface FleetCurrencyTotal {
  currency: string
  liters?: number
  cost?: number
  avg_price?: number
}

export interface FleetSummary {
  period: { from: string; to: string }
  vehicles: {
    total: number
    with_expired_documents: number
    with_due_maintenance: number
    without_activity: number
  }
  totals: ExpenseRow[]
  fuel: { entries: number; liters: number; costs: FleetCurrencyTotal[] }
  maintenance: { records: number; costs: FleetCurrencyTotal[] }
  documents: { total: number; expired: number; expiring: number }
  alerts: FleetAlert[]
  rows: FleetVehicleRow[]
}

export interface VehicleImportError {
  line: number
  message: string
}

export interface VehicleImportResult {
  created: number
  failed: number
  limit: number | null
  remaining: number | null
  errors: VehicleImportError[]
}

export class ApiError extends Error {
  status: number

  errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}
