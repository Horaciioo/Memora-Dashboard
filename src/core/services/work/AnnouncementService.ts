import 'server-only'

import { prisma } from '@/core/lib/db'
import { readRequiredText } from '@/core/lib/forms/values'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { reachableSession } from '@/core/services/recruitment/RecruitmentService'
import { projectVisibility } from '@/core/services/work/visibility'
import type { WorkViewer } from '@/core/services/work/visibility'
import { ROUTES } from '@/declarations/navigation'
import { ANNOUNCEMENT_COPY, ANNOUNCEMENT_PARAM } from '@/declarations/work/announcements'
import type { PermissionHelpers } from '@/types/auth'
import type { FormValues } from '@/types/forms'
import type { AnnouncementRow } from '@/types/work'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Every announcement written elsewhere in Memora, newest first
 * @param {WorkViewer} viewer - Who reads
 * @param {PermissionHelpers} access - What the viewer may open
 * @param {AccessScope} scope - Creator perimeter
 * @return {Promise<AnnouncementRow[]>} - Rows pointing back to their source
 */

export const listAnnouncements = async (
  viewer: WorkViewer,
  access: PermissionHelpers,
  scope: AccessScope
): Promise<AnnouncementRow[]> => {
  const [projects, departures, sessions] = await Promise.all([
    access.can(Permissions.CommunicationRead)
      ? prisma.communication.findMany({
          where: { project: projectVisibility(viewer) },
          include: { author: true, project: true },
        })
      : [],
    access.can(Permissions.AcademyManage)
      ? prisma.departureNotice.findMany({
          include: { account: true },
        })
      : [],
    access.can(Permissions.RecruitmentRead)
      ? prisma.recruitmentSession.findMany({
          where: scopedWhere('recruitmentSession', scope, { announcedAt: { not: null } }),
        })
      : [],
  ])

  const rows: AnnouncementRow[] = [
    ...projects.map((row) => ({
      id: `project:${row.id}`,
      source: 'project' as const,
      title: row.title,
      state: row.publishedAt ? ('announced' as const) : ('draft' as const),
      origin: row.project.title,
      at: (row.publishedAt ?? row.createdAt).toISOString(),
      person: row.author
        ? { id: row.author.id, name: row.author.displayName, src: row.author.avatarUrl }
        : null,
      href: `${ROUTES.project(row.projectId)}?${ANNOUNCEMENT_PARAM}=${row.id}`,
    })),
    ...departures.map((row) => ({
      id: `departure:${row.id}`,
      source: 'departure' as const,
      title: `${ANNOUNCEMENT_COPY.departure} - ${row.functionName}`,
      state: row.publishedAt ? ('announced' as const) : ('draft' as const),
      origin: row.account.displayName,
      at: (row.publishedAt ?? row.createdAt).toISOString(),
      person: {
        id: row.account.id,
        name: row.account.displayName,
        src: row.account.avatarUrl,
      },
      href: `${ROUTES.member(row.accountId)}?${ANNOUNCEMENT_PARAM}=${row.id}`,
    })),
    ...sessions.map((row) => ({
      id: `recruitment:${row.id}`,
      source: 'recruitment' as const,
      title: ANNOUNCEMENT_COPY.interviews,
      state: 'announced' as const,
      origin: row.name,
      at: row.announcedAt!.toISOString(),
      person: null,
      href: `${ROUTES.recruitment(row.id)}?${ANNOUNCEMENT_PARAM}=${row.id}`,
    })),
  ]

  return rows.sort((a, b) => b.at.localeCompare(a.at))
}

/**
 * Record the wording announced for the interviews of a session
 * @param {string} id - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<{ id: string }>} - Announced session
 */

export const announceSession = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<{ id: string }> => {
  await reachableSession(id, scope)

  await prisma.recruitmentSession.update({
    where: { id },
    data: { announcement: readRequiredText(values, 'announcement'), announcedAt: new Date() },
  })

  return { id }
}
