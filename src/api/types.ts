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
