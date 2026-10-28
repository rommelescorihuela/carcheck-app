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

export type OrganizationRole = 'owner' | 'admin' | 'member'

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
