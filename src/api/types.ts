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
