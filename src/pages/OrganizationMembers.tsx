import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as api from '../api/endpoints'
import { ApiError, type Member, type OrganizationRole } from '../api/types'
import { useAuth } from '../stores/auth'
import { useOrganizations } from '../stores/organization'
import { roleLabels } from '../lib/roles'

export default function OrganizationMembers() {
  const { id } = useParams()
  const navigate = useNavigate()
  const organizationId = Number(id)

  const organizations = useOrganizations((state) => state.organizations)
  const loadOrganizations = useOrganizations((state) => state.load)
  const currentUser = useAuth((state) => state.user)

  const organization = organizations.find((item) => item.id === organizationId)
  const myRole: OrganizationRole | undefined = organization?.pivot?.role
  const canManage = myRole === 'owner' || myRole === 'admin'
  const isOwner = myRole === 'owner'

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(organization?.name ?? '')
  const [nameMessage, setNameMessage] = useState<string | null>(null)
  const [savingName, setSavingName] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'driver'>('member')
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

  useEffect(() => {
    if (organization) {
      setName(organization.name)
    }
  }, [organizationId, organization?.name])

  async function changeRole(member: Member, role: 'admin' | 'member' | 'driver') {
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

  async function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingName(true)
    setNameMessage(null)

    try {
      const updated = await api.updateOrganization(organizationId, { name })
      setName(updated.name)
      await loadOrganizations()
      setNameMessage('Nombre actualizado.')
    } catch (exception) {
      setNameMessage(
        exception instanceof ApiError ? exception.message : 'No se pudo renombrar la organización.',
      )
    } finally {
      setSavingName(false)
    }
  }

  async function transfer(member: Member) {
    setActionMessage(null)

    try {
      await api.transferOrganization(organizationId, member.id)
      await loadOrganizations()
      await refresh()
      setActionMessage(`${member.name} es ahora el propietario.`)
    } catch (exception) {
      setActionMessage(
        exception instanceof ApiError ? exception.message : 'No se pudo transferir la propiedad.',
      )
    }
  }

  async function removeOrganization() {
    setDeleting(true)
    setActionMessage(null)

    try {
      await api.deleteOrganization(organizationId)
      await loadOrganizations()
      navigate('/organizaciones')
    } catch (exception) {
      setActionMessage(
        exception instanceof ApiError ? exception.message : 'No se pudo eliminar la organización.',
      )
      setDeleting(false)
    }
  }

  async function leave() {
    setDeleting(true)
    setActionMessage(null)

    try {
      await api.leaveOrganization(organizationId)
      await loadOrganizations()
      navigate('/organizaciones')
    } catch (exception) {
      setActionMessage(
        exception instanceof ApiError ? exception.message : 'No se pudo salir de la organización.',
      )
      setDeleting(false)
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
      {actionMessage && (
        <p className="rounded bg-slate-50 p-3 text-sm text-slate-700">{actionMessage}</p>
      )}
      {loading && <p className="text-sm text-slate-500">Cargando…</p>}

      {canManage && (
        <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">Nombre de la organización</h2>
          {nameMessage && <p className="text-sm text-slate-600">{nameMessage}</p>}
          <form onSubmit={rename} className="flex flex-wrap gap-2" noValidate>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Nombre de la organización"
              className="min-w-0 flex-1 basis-full rounded border border-slate-300 px-3 py-2 sm:basis-0"
              required
            />
            <button
              type="submit"
              disabled={savingName}
              className="rounded bg-brand-700 px-4 py-2 font-medium text-white disabled:opacity-60"
            >
              {savingName ? 'Guardando…' : 'Guardar nombre'}
            </button>
          </form>
        </section>
      )}

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
                  <span className="ml-2 text-xs text-slate-500">(tú)</span>
                )}
              </p>
              <p className="text-sm text-slate-500">{member.email}</p>
            </div>

            <div className="flex items-center gap-3">
              {canManage && member.role !== 'owner' ? (
                <>
                  {isOwner ? (
                    <select
                      value={member.role}
                      onChange={(event) =>
                        void changeRole(
                          member,
                          event.target.value as 'admin' | 'member' | 'driver',
                        )
                      }
                      aria-label={`Rol de ${member.name}`}
                      className="rounded border border-slate-300 px-2 py-1 text-sm"
                    >
                      <option value="driver">Conductor</option>
                      <option value="member">Miembro</option>
                      <option value="admin">Administrador</option>
                    </select>
                  ) : (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {roleLabels[member.role]}
                    </span>
                  )}
                  {(isOwner || member.role !== 'admin') && (
                    <button
                      type="button"
                      onClick={() => void remove(member)}
                      className="text-sm text-red-600"
                    >
                      Quitar
                    </button>
                  )}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => void transfer(member)}
                      className="text-sm font-medium text-brand-700"
                    >
                      Hacer propietario
                    </button>
                  )}
                </>
              ) : (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {roleLabels[member.role]}
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

          <form onSubmit={invite} className="flex flex-wrap gap-2" noValidate>
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="Correo del invitado"
              aria-label="Correo del invitado"
              className="min-w-0 flex-1 basis-full rounded border border-slate-300 px-3 py-2 sm:basis-0"
              required
            />
            <select
              value={inviteRole}
              onChange={(event) =>
                setInviteRole(event.target.value as 'admin' | 'member' | 'driver')
              }
              aria-label="Rol del invitado"
              className="rounded border border-slate-300 px-2 py-2 text-sm"
            >
              <option value="driver">Conductor</option>
              <option value="member">Miembro</option>
              {isOwner && <option value="admin">Administrador</option>}
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

      {myRole && myRole !== 'owner' && (
        <section className="space-y-3 rounded border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-800">Salir de la organización</h2>
          <p className="text-sm text-slate-600">
            Dejarás de ver los vehículos y registros compartidos. Podrás volver si te invitan de
            nuevo.
          </p>
          <button
            type="button"
            onClick={() => void leave()}
            disabled={deleting}
            className="rounded border border-slate-300 px-4 py-2 font-medium text-slate-700 disabled:opacity-60"
          >
            {deleting ? 'Saliendo…' : 'Salir de la organización'}
          </button>
        </section>
      )}

      {isOwner && (
        <section className="space-y-3 rounded border border-red-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-red-700">Eliminar organización</h2>
          <p className="text-sm text-slate-600">
            Se eliminarán la organización y sus vehículos compartidos. El historial de pagos se
            conserva por facturación. Esta acción no se puede deshacer.
          </p>

          {confirmDelete ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void removeOrganization()}
                disabled={deleting}
                className="rounded bg-red-600 px-4 py-2 font-medium text-white disabled:opacity-60"
              >
                {deleting ? 'Eliminando…' : 'Sí, eliminar organización'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded border border-slate-300 px-4 py-2 font-medium text-slate-700"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="rounded border border-red-300 px-4 py-2 font-medium text-red-700"
            >
              Eliminar organización
            </button>
          )}
        </section>
      )}
    </div>
  )
}
