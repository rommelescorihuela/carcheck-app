import { request } from './client'
import { clearToken, setToken } from './token'
import type { AuthResponse, Member, Organization, OrganizationRole, User } from './types'

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
