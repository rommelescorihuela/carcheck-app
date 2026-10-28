import { request } from './client'
import { clearToken, setToken } from './token'
import type {
  AppNotification,
  AuthResponse,
  BillingPayment,
  DocumentsSummary,
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
  NotificationPreference,
  NotificationPreferencesData,
  OrganizationRole,
  Paginated,
  Plan,
  PushSubscriptionPayload,
  Reminder,
  ReminderMeta,
  ReminderSyncResult,
  Subscription,
  SubscriptionOverview,
  User,
  Vehicle,
  VehicleDocument,
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

export interface ReminderListParams {
  organizationId?: number | null
  scope?: 'personal'
}

function reminderQuery(params: ReminderListParams = {}): string {
  const search = new URLSearchParams()
  if (params.organizationId != null) {
    search.set('organization_id', String(params.organizationId))
  }
  if (params.scope) {
    search.set('scope', params.scope)
  }
  const query = search.toString()

  return query ? `?${query}` : ''
}

export async function listReminders(
  params: ReminderListParams = {},
): Promise<{ data: Reminder[]; meta: ReminderMeta }> {
  return request<{ data: Reminder[]; meta: ReminderMeta }>(`/reminders${reminderQuery(params)}`)
}

export async function dismissReminder(id: number): Promise<void> {
  await request(`/reminders/${id}/dismiss`, { method: 'POST' })
}

export async function syncReminders(
  params: ReminderListParams = {},
): Promise<ReminderSyncResult> {
  const data = await request<{ message: string; data: ReminderSyncResult }>(
    `/reminders/sync${reminderQuery(params)}`,
    { method: 'POST' },
  )

  return data.data
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

export interface DocumentPayload {
  kind: VehicleDocument['kind']
  name: string
  issuer?: string | null
  reference?: string | null
  issued_on?: string | null
  expires_on?: string | null
  notes?: string | null
}

export async function listDocuments(vehicleId: number): Promise<Paginated<VehicleDocument>> {
  return request<Paginated<VehicleDocument>>(`/vehicles/${vehicleId}/documents`)
}

export async function createDocument(
  vehicleId: number,
  payload: DocumentPayload,
): Promise<VehicleDocument> {
  const data = await request<{ data: VehicleDocument }>(`/vehicles/${vehicleId}/documents`, {
    method: 'POST',
    body: payload,
  })

  return data.data
}

export async function getDocument(id: number): Promise<VehicleDocument> {
  const data = await request<{ data: VehicleDocument }>(`/documents/${id}`)

  return data.data
}

export async function updateDocument(
  id: number,
  payload: DocumentPayload,
): Promise<VehicleDocument> {
  const data = await request<{ data: VehicleDocument }>(`/documents/${id}`, {
    method: 'PATCH',
    body: payload,
  })

  return data.data
}

export async function deleteDocument(id: number): Promise<void> {
  await request(`/documents/${id}`, { method: 'DELETE' })
}

export async function uploadDocumentFile(id: number, file: File): Promise<VehicleDocument> {
  const form = new FormData()
  form.append('file', file)
  const data = await request<{ data: VehicleDocument }>(`/documents/${id}/file`, {
    method: 'POST',
    body: form,
  })

  return data.data
}

export async function deleteDocumentFile(id: number): Promise<VehicleDocument> {
  const data = await request<{ data: VehicleDocument }>(`/documents/${id}/file`, {
    method: 'DELETE',
  })

  return data.data
}

export async function documentsSummary(vehicleId: number): Promise<DocumentsSummary> {
  const data = await request<{ data: DocumentsSummary }>(`/vehicles/${vehicleId}/documents-summary`)

  return data.data
}

export interface BillingPaymentPayload {
  amount: number
  currency: string
  exchange_rate?: number
  method: BillingPayment['method']
  reference?: string | null
  paid_on: string
  notes?: string | null
}

function orgSuffix(organizationId?: number | null): string {
  return organizationId ? `?organization_id=${organizationId}` : ''
}

function orgBody(organizationId?: number | null): { organization_id?: number } {
  return organizationId ? { organization_id: organizationId } : {}
}

export async function listPlans(): Promise<Plan[]> {
  const data = await request<{ data: Plan[] }>('/billing/plans')

  return data.data
}

export async function billingOverview(
  organizationId?: number | null,
): Promise<SubscriptionOverview> {
  const data = await request<{ data: SubscriptionOverview }>(
    `/billing/subscription${orgSuffix(organizationId)}`,
  )

  return data.data
}

export async function startSubscription(
  planId: number,
  organizationId?: number | null,
): Promise<Subscription> {
  const data = await request<{ data: Subscription }>('/billing/subscription', {
    method: 'POST',
    body: { plan_id: planId, ...orgBody(organizationId) },
  })

  return data.data
}

export async function changeSubscription(
  planId: number,
  organizationId?: number | null,
): Promise<Subscription> {
  const data = await request<{ data: Subscription }>('/billing/subscription', {
    method: 'PATCH',
    body: { plan_id: planId, ...orgBody(organizationId) },
  })

  return data.data
}

export async function cancelSubscription(
  organizationId?: number | null,
): Promise<Subscription> {
  const data = await request<{ data: Subscription }>('/billing/subscription', {
    method: 'DELETE',
    body: orgBody(organizationId),
  })

  return data.data
}

export async function listBillingPayments(
  organizationId?: number | null,
): Promise<Paginated<BillingPayment>> {
  return request<Paginated<BillingPayment>>(`/billing/payments${orgSuffix(organizationId)}`)
}

export async function reportPayment(
  payload: BillingPaymentPayload,
  organizationId?: number | null,
): Promise<BillingPayment> {
  const data = await request<{ data: BillingPayment }>('/billing/payments', {
    method: 'POST',
    body: { ...payload, ...orgBody(organizationId) },
  })

  return data.data
}

export async function uploadPaymentProof(
  paymentId: number,
  file: File,
): Promise<BillingPayment> {
  const form = new FormData()
  form.append('file', file)
  const data = await request<{ data: BillingPayment }>(`/billing/payments/${paymentId}/proof`, {
    method: 'POST',
    body: form,
  })

  return data.data
}

export async function deletePaymentProof(paymentId: number): Promise<BillingPayment> {
  const data = await request<{ data: BillingPayment }>(`/billing/payments/${paymentId}/proof`, {
    method: 'DELETE',
  })

  return data.data
}

export async function listNotifications(): Promise<Paginated<AppNotification>> {
  return request<Paginated<AppNotification>>('/notifications')
}

export async function notificationUnreadCount(): Promise<number> {
  const data = await request<{ data: { count: number } }>('/notifications/unread-count')

  return data.data.count
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const data = await request<{ data: AppNotification }>(`/notifications/${id}/read`, {
    method: 'POST',
  })

  return data.data
}

export async function markAllNotificationsRead(): Promise<void> {
  await request('/notifications/read-all', { method: 'POST' })
}

export async function deleteNotification(id: string): Promise<void> {
  await request(`/notifications/${id}`, { method: 'DELETE' })
}

export async function notificationPreferences(): Promise<NotificationPreferencesData> {
  const data = await request<{ data: NotificationPreferencesData }>('/notifications/preferences')

  return data.data
}

export async function updateNotificationPreferences(
  preferences: NotificationPreference[],
): Promise<NotificationPreferencesData> {
  const data = await request<{ data: NotificationPreferencesData }>('/notifications/preferences', {
    method: 'PUT',
    body: {
      preferences: preferences.map(({ category, in_app, email, push }) => ({
        category,
        in_app,
        email,
        push,
      })),
    },
  })

  return data.data
}

export async function pushPublicKey(): Promise<string | null> {
  const data = await request<{ data: { public_key: string | null } }>(
    '/notifications/push/public-key',
  )

  return data.data.public_key
}

export async function registerPushSubscription(
  payload: PushSubscriptionPayload,
): Promise<void> {
  await request('/notifications/push-subscriptions', { method: 'POST', body: payload })
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  await request('/notifications/push-subscriptions', {
    method: 'DELETE',
    body: { endpoint },
  })
}

export async function sendTestNotification(): Promise<AppNotification | null> {
  const data = await request<{ message: string; data: AppNotification | null }>(
    '/notifications/test',
    { method: 'POST' },
  )

  return data.data
}
