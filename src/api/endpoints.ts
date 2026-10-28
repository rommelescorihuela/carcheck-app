import { request } from './client'
import { clearToken, setToken } from './token'
import type {
  AuthResponse,
  FuelEntry,
  FuelSummary,
  FuelType,
  MaintenanceDue,
  MaintenanceItemKind,
  MaintenancePlan,
  MaintenanceRecord,
  MaintenanceType,
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

export interface MaintenanceRecordPayload {
  maintenance_type_id?: number | null
  performed_on: string
  odometer_km: number
  provider?: string | null
  notes?: string | null
  next_due_km?: number | null
  next_due_date?: string | null
  items?: {
    kind: MaintenanceItemKind
    description: string
    quantity: number
    unit_price: number
  }[]
}

export async function listMaintenanceTypes(): Promise<MaintenanceType[]> {
  const data = await request<{ data: MaintenanceType[] }>('/maintenance-types')

  return data.data
}

export async function createMaintenanceType(payload: {
  name: string
  interval_km?: number | null
  interval_months?: number | null
  organization_id?: number | null
}): Promise<MaintenanceType> {
  const data = await request<{ data: MaintenanceType }>('/maintenance-types', {
    method: 'POST',
    body: payload,
  })

  return data.data
}

export async function listMaintenancePlans(vehicleId: number): Promise<MaintenancePlan[]> {
  const data = await request<{ data: MaintenancePlan[] }>(
    `/vehicles/${vehicleId}/maintenance-plans`,
  )

  return data.data
}

export async function upsertMaintenancePlan(
  vehicleId: number,
  typeId: number,
  payload: { interval_km?: number | null; interval_months?: number | null },
): Promise<MaintenancePlan> {
  const data = await request<{ data: MaintenancePlan }>(
    `/vehicles/${vehicleId}/maintenance-plans/${typeId}`,
    { method: 'PUT', body: payload },
  )

  return data.data
}

export async function listMaintenanceRecords(
  vehicleId: number,
): Promise<Paginated<MaintenanceRecord>> {
  return request<Paginated<MaintenanceRecord>>(`/vehicles/${vehicleId}/maintenance-records`)
}

export async function createMaintenanceRecord(
  vehicleId: number,
  payload: MaintenanceRecordPayload,
): Promise<MaintenanceRecord> {
  const data = await request<{ data: MaintenanceRecord }>(
    `/vehicles/${vehicleId}/maintenance-records`,
    { method: 'POST', body: payload },
  )

  return data.data
}

export async function getMaintenanceRecord(id: number): Promise<MaintenanceRecord> {
  const data = await request<{ data: MaintenanceRecord }>(`/maintenance-records/${id}`)

  return data.data
}

export async function updateMaintenanceRecord(
  id: number,
  payload: MaintenanceRecordPayload,
): Promise<MaintenanceRecord> {
  const data = await request<{ data: MaintenanceRecord }>(`/maintenance-records/${id}`, {
    method: 'PATCH',
    body: payload,
  })

  return data.data
}

export async function deleteMaintenanceRecord(id: number): Promise<void> {
  await request(`/maintenance-records/${id}`, { method: 'DELETE' })
}

export async function uploadMaintenanceAttachment(
  recordId: number,
  file: File,
): Promise<MaintenanceRecord> {
  const form = new FormData()
  form.append('file', file)
  const data = await request<{ data: MaintenanceRecord }>(
    `/maintenance-records/${recordId}/attachments`,
    { method: 'POST', body: form },
  )

  return data.data
}

export async function deleteMaintenanceAttachment(
  recordId: number,
  mediaId: number,
): Promise<MaintenanceRecord> {
  const data = await request<{ data: MaintenanceRecord }>(
    `/maintenance-records/${recordId}/attachments/${mediaId}`,
    { method: 'DELETE' },
  )

  return data.data
}

export async function maintenanceDue(vehicleId: number): Promise<MaintenanceDue[]> {
  const data = await request<{ data: MaintenanceDue[] }>(`/vehicles/${vehicleId}/maintenance-due`)

  return data.data
}

export interface FuelEntryPayload {
  filled_on: string
  odometer_km: number
  liters: number
  unit_price: number
  full_tank?: boolean
  station?: string | null
  notes?: string | null
}

export async function listFuelEntries(vehicleId: number): Promise<Paginated<FuelEntry>> {
  return request<Paginated<FuelEntry>>(`/vehicles/${vehicleId}/fuel-entries`)
}

export async function createFuelEntry(
  vehicleId: number,
  payload: FuelEntryPayload,
): Promise<FuelEntry> {
  const data = await request<{ data: FuelEntry }>(`/vehicles/${vehicleId}/fuel-entries`, {
    method: 'POST',
    body: payload,
  })

  return data.data
}

export async function getFuelEntry(id: number): Promise<FuelEntry> {
  const data = await request<{ data: FuelEntry }>(`/fuel-entries/${id}`)

  return data.data
}

export async function updateFuelEntry(
  id: number,
  payload: FuelEntryPayload,
): Promise<FuelEntry> {
  const data = await request<{ data: FuelEntry }>(`/fuel-entries/${id}`, {
    method: 'PATCH',
    body: payload,
  })

  return data.data
}

export async function deleteFuelEntry(id: number): Promise<void> {
  await request(`/fuel-entries/${id}`, { method: 'DELETE' })
}

export async function fuelSummary(vehicleId: number): Promise<FuelSummary> {
  const data = await request<{ data: FuelSummary }>(`/vehicles/${vehicleId}/fuel-summary`)

  return data.data
}
