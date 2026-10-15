import { request } from './client'
import { clearToken, setToken } from './token'
import type {
  AuthResponse,
  FuelType,
  Member,
  Organization,
  OrganizationRole,
  Paginated,
  User,
  Vehicle,
  VehicleType,
} from './types'

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  currency?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })

  setToken(data.access_token)

  return data
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })

  setToken(data.access_token)

  return data
}

export async function logout(): Promise<void> {
  try {
    await request('/logout', { method: 'POST' })
  } finally {
    clearToken()
  }
}

export async function me(): Promise<User> {
  const data = await request<{ user: User }>('/user')

  return data.user
}

export async function listOrganizations(): Promise<Organization[]> {
  const data = await request<{ organizations: Organization[] }>('/organizations')

  return data.organizations
}

export async function createOrganization(payload: { name: string }): Promise<Organization> {
  const data = await request<{ organization: Organization }>('/organizations', {
    method: 'POST',
    body: payload,
  })

  return data.organization
}

export async function listMembers(organizationId: number): Promise<Member[]> {
  const data = await request<{ members: Member[] }>(`/organizations/${organizationId}/members`)

  return data.members
}

export async function updateMemberRole(
  organizationId: number,
  userId: number,
  role: Exclude<OrganizationRole, 'owner'>,
): Promise<void> {
  await request(`/organizations/${organizationId}/members/${userId}`, {
    method: 'PATCH',
    body: { role },
  })
}

export async function removeMember(organizationId: number, userId: number): Promise<void> {
  await request(`/organizations/${organizationId}/members/${userId}`, { method: 'DELETE' })
}

export async function inviteMember(
  organizationId: number,
  payload: { email: string; role: Exclude<OrganizationRole, 'owner'> },
): Promise<void> {
  await request(`/organizations/${organizationId}/invitations`, { method: 'POST', body: payload })
}

export async function acceptInvitation(token: string): Promise<Organization> {
  const data = await request<{ organization: Organization }>(`/invitations/${token}/accept`, {
    method: 'POST',
  })

  return data.organization
}

export interface VehiclePayload {
  make: string
  model: string
  year?: number | null
  plate?: string | null
  vin?: string | null
  type?: VehicleType
  fuel_type?: FuelType
  odometer_km?: number
  color?: string | null
  notes?: string | null
  organization_id?: number | null
}

export interface VehicleListParams {
  organizationId?: number | null
  scope?: 'personal'
}

export async function listVehicles(params: VehicleListParams = {}): Promise<Paginated<Vehicle>> {
  const search = new URLSearchParams()
  if (params.organizationId != null) {
    search.set('organization_id', String(params.organizationId))
  }
  if (params.scope) {
    search.set('scope', params.scope)
  }
  const query = search.toString()

  return request<Paginated<Vehicle>>(`/vehicles${query ? `?${query}` : ''}`)
}

export async function getVehicle(id: number): Promise<Vehicle> {
  const data = await request<{ data: Vehicle }>(`/vehicles/${id}`)

  return data.data
}

export async function createVehicle(payload: VehiclePayload): Promise<Vehicle> {
  const data = await request<{ data: Vehicle }>('/vehicles', { method: 'POST', body: payload })

  return data.data
}

export async function updateVehicle(id: number, payload: VehiclePayload): Promise<Vehicle> {
  const data = await request<{ data: Vehicle }>(`/vehicles/${id}`, {
    method: 'PATCH',
    body: payload,
  })

  return data.data
}

export async function deleteVehicle(id: number): Promise<void> {
  await request(`/vehicles/${id}`, { method: 'DELETE' })
}

export async function uploadVehiclePhoto(id: number, file: File): Promise<Vehicle> {
  const form = new FormData()
  form.append('photo', file)
  const data = await request<{ data: Vehicle }>(`/vehicles/${id}/photo`, {
    method: 'POST',
    body: form,
  })

  return data.data
}

export async function deleteVehiclePhoto(id: number): Promise<Vehicle> {
  const data = await request<{ data: Vehicle }>(`/vehicles/${id}/photo`, { method: 'DELETE' })

  return data.data
}

export async function transferVehicle(
  id: number,
  payload: { owner_type: 'user' | 'organization'; owner_id: number },
): Promise<Vehicle> {
  const data = await request<{ data: Vehicle }>(`/vehicles/${id}/transfer`, {
    method: 'POST',
    body: payload,
  })

  return data.data
}
