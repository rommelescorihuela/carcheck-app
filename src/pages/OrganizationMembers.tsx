import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../api/endpoints'
import { ApiError, type Member, type OrganizationRole } from '../api/types'
import { useAuth } from '../stores/auth'
import { useOrganizations } from '../stores/organization'

export default function OrganizationMembers() {
  const { id } = useParams()
  const organizationId = Number(id)

  const organizations = useOrganizations((state) => state.organizations)
  const loadOrganizations = useOrganizations((state) => state.load)
  const currentUser = useAuth((state) => state.user)

  const organization = organizations.find((item) => item.id === organizationId)
  const myRole: OrganizationRole | undefined = organization?.pivot?.role
  const canManage = myRole === 'owner' || myRole === 'admin'

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)
  const [inviting, setInviting] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setMembers(await api.listMembers(organizationId))
    } catch (exception) {
      setError(
        exception instanceof ApiError ? exception.message : 'No se pudieron cargar los miembros.',
      )
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    // Recarga para tener el `pivot.role` del usuario en la organización.
    void loadOrganizations()
  }, [loadOrganizations])

  useEffect(() => {
    if (organizationId) {
      void refresh()
    }
  }, [organizationId, refresh])

  async function changeRole(member: Member, role: 'admin' | 'member') {
    try {
      await api.updateMemberRole(organizationId, member.id, role)
      await refresh()
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'No se pudo cambiar el rol.')
    }
  }

  async function remove(member: Member) {
    try {
      await api.removeMember(organizationId, member.id)
      await refresh()
    } catch (exception) {
      setError(exception instanceof ApiError ? exception.message : 'No se pudo quitar al miembro.')
    }
  }

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setInviting(true)
    setInviteMessage(null)

    try {
      await api.inviteMember(organizationId, { email: inviteEmail, role: inviteRole })
      setInviteEmail('')
      setInviteMessage('Invitación enviada.')
    } catch (exception) {
      setInviteMessage(
        exception instanceof ApiError ? exception.message : 'No se pudo enviar la invitación.',
      )
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {organization?.name ?? 'Organización'}
        </h1>
        <Link to="/organizaciones" className="text-sm font-medium text-brand-700">
          Volver
        </Link>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      <ul className="space-y-2">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center justify-between rounded border border-slate-200 bg-white p-3"
          >
            <div>
              <p className="font-medium text-slate-800">
                {member.name}
                {member.id === currentUser?.id && (
                  <span className="ml-2 text-xs text-slate-400">(tú)</span>
                )}
              </p>
              <p className="text-sm text-slate-500">{member.email}</p>
            </div>

            <div className="flex items-center gap-3">
              {canManage && member.role !== 'owner' ? (
                <>
                  <select
                    value={member.role}
                    onChange={(event) =>
                      void changeRole(member, event.target.value as 'admin' | 'member')
                    }
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => void remove(member)}
                    className="text-sm text-red-600"
                  >
                    Quitar
                  </button>
                </>
              ) : (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {member.role}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {canManage && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Invitar miembro</h2>

          {inviteMessage && (
            <p className="rounded bg-slate-50 p-3 text-sm text-slate-700">{inviteMessage}</p>
          )}

          <form onSubmit={invite} className="flex gap-2" noValidate>
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="Correo del invitado"
              aria-label="Correo del invitado"
              className="flex-1 rounded border border-slate-300 px-3 py-2"
              required
            />
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as 'admin' | 'member')}
              aria-label="Rol del invitado"
              className="rounded border border-slate-300 px-2 py-2 text-sm"
            >
              <option value="member">member</option>
              <option value="admin">admin</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
            >
              {inviting ? 'Enviando…' : 'Invitar'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
