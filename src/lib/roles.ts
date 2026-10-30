import type { OrganizationRole } from '../api/types'

/** Nombres de rol tal como los ve una persona de la organización. */
export const roleLabels: Record<OrganizationRole, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  member: 'Miembro',
  driver: 'Conductor',
}

export function roleLabel(role: OrganizationRole): string {
  return roleLabels[role] ?? role
}
