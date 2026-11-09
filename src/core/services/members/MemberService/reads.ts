import 'server-only'
import { prisma } from '@/core/lib/db'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { notFound } from '@/core/lib/errors'
import { readTemporaryValues } from '@/core/services/members/seats'
import { activeAbsenceFilter, toAbsence } from '@/core/services/absences/AbsenceService'
import { toMemberNote } from '@/core/services/members/MemberFileService'
import { PAGINATION_SETTINGS } from '@/declarations/configurations/settings'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import type { MemberAbsence, MemberDetail, MemberSummary } from '@/types/members'
import { MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { AbsenceStatuses, FunctionKinds } from '@/utils/constants/workflow'
import { BELOW_LEAD_ROLES } from '@/core/services/members/MemberService/rules'
import { SUMMARY_INCLUDE, toSummary } from '@/core/services/members/MemberService/shape'

// Accepted juniors await their form
const AWAITING_PIM = {
  role: MemberRoles.Junior,
  status: MemberStatuses.Pending,
  academyJuniors: { some: { candidateId: { not: null }, confirmedAt: null } },
}

/**
 * Read every moderator, a Responsable only reads those below them
 * @param {AccessScope} scope - Perimeter
 * @param {boolean} [isAdmin] - Viewer sits at admin level
 * @param {MemberRoleName[]} [roles] - Only these levels, whoever asks
 * @return {Promise<MemberSummary[]>} - List rows
 */

export const listMembers = async (
  scope: AccessScope,
  isAdmin = false,
  roles?: MemberRoleName[]
): Promise<MemberSummary[]> => {
  const levels = roles ?? (isAdmin ? null : BELOW_LEAD_ROLES)
  const rows = await prisma.account.findMany({
    where: scopedWhere('account', scope, {
      ...(levels ? { role: { in: levels } } : {}),
      ...(roles ? {} : { NOT: AWAITING_PIM }),
    }),
    include: {
      ...SUMMARY_INCLUDE,
      _count: { select: { notesReceived: true, absences: { where: activeAbsenceFilter() } } },
    },
    orderBy: { displayName: 'asc' },
  })

  return rows.map((row) =>
    toSummary(row, { notesCount: row._count.notesReceived, isAbsent: row._count.absences > 0 })
  )
}

/**
 * Read one moderator file
 * @param {string} id - Account identifier
 * @param {boolean} canReadNotes - Member may read private remarks
 * @return {Promise<MemberDetail>} - Full file
 */

export const readMember = async (id: string, canReadNotes = false): Promise<MemberDetail> => {
  const row = await prisma.account.findUnique({
    where: { id },
    include: {
      ...SUMMARY_INCLUDE,
      socialLinks: { orderBy: { position: 'asc' } },
      absences: {
        include: { reviewer: true },
        orderBy: { startDate: 'desc' },
        take: PAGINATION_SETTINGS.defaultPerPage,
      },
      teamMemberships: { include: { team: true } },
      _count: {
        select: {
          notesReceived: true,
          projectAssists: true,
          ownedTasks: true,
          meetingSeats: true,
        },
      },
    },
  })

  if (!row) throw notFound()

  // Never queried at all when the reader may not open them
  const notes = canReadNotes
    ? await prisma.accountNote.findMany({
        where: { accountId: id },
        include: { author: true },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      })
    : []

  const absences: MemberAbsence[] = row.absences.map((absence) =>
    toAbsence(absence, row.displayName)
  )

  const now = new Date()
  const isAbsent = row.absences.some(
    (absence) =>
      absence.status === AbsenceStatuses.Approved &&
      absence.startDate <= now &&
      absence.endDate >= now
  )

  return {
    summary: toSummary(row, { notesCount: row._count.notesReceived, isAbsent }),
    values: {
      displayName: row.displayName,
      discordId: row.discordId,
      role: row.role,
      status: row.status,
      divisionId: row.divisionId,
      youtuberIds: row.youtubers.map((youtuber) => youtuber.id),
      primaryFunctionIds: row.functions
        .filter((held) => held.jobFunction.kind === FunctionKinds.Primary)
        .map((held) => held.functionId),
      secondaryFunctionIds: row.functions
        .filter((held) => held.jobFunction.kind === FunctionKinds.Secondary)
        .map((held) => held.functionId),
      ...(await readTemporaryValues(id)),
      timezone: row.timezone,
      birthday: row.birthday ? row.birthday.toISOString().slice(0, 10) : null,
      joinedAt: row.joinedAt.toISOString().slice(0, 10),
      leftAt: row.leftAt ? row.leftAt.toISOString().slice(0, 10) : null,
      languages: row.languages,
      celebrateBirthday: row.celebrateBirthday,
    },
    birthday: row.birthday?.toISOString() ?? null,
    celebrateBirthday: row.celebrateBirthday,
    languages: row.languages,
    leftAt: row.leftAt?.toISOString() ?? null,
    erased: row.anonymisedAt !== null,
    notes: notes.map(toMemberNote),
    socials: row.socialLinks.map((link) => ({
      id: link.id,
      networkId: link.networkId,
      label: link.label,
      handle: link.handle,
      url: link.url,
      accent: link.accent,
    })),
    absences,
    teams: row.teamMemberships.map((membership) => membership.team.name),
    projectCount: row._count.projectAssists,
    taskCount: row._count.ownedTasks,
    meetingCount: row._count.meetingSeats,
  }
}

/**
 * Absence review labels
 * @type {typeof ABSENCE_STATUS_REGISTRY}
 */

export const ABSENCE_STATUSES = ABSENCE_STATUS_REGISTRY
