import 'server-only'

import { prisma } from '@/core/lib/db'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { SEARCH_GROUPS } from '@/declarations/ui/copy/navigation'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { formatDay } from '@/utils/format/dates'
import type { SessionUser } from '@/types/auth'
import type { SearchHit, SearchSection } from '@/types/search'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Run the global search
 * @param {string} term - Raw search term
 * @param {SessionUser} session - Signed-in member
 * @return {Promise<SearchSection[]>} - Grouped results
 */

export const search = async (term: string, session: SessionUser): Promise<SearchSection[]> => {
  const query = term.trim()
  if (query.length < SEARCH_SETTINGS.minLength) return []

  const access = resolvePermissions(session)
  const take = SEARCH_SETTINGS.maxResultsPerGroup
  const contains = { contains: query, mode: 'insensitive' } as const
  const sections: SearchSection[] = []

  // Every family is gated by the permission that opens its page
  if (access.can(Permissions.MemberRead)) {
    const rows = await prisma.account.findMany({
      where: { OR: [{ displayName: contains }, { discordId: { contains: query } }] },
      include: { division: true, youtubers: true },
      take,
    })

    sections.push({
      group: 'members',
      label: SEARCH_GROUPS.members,
      hits: rows.map<SearchHit>((row) => ({
        id: row.id,
        group: 'members',
        label: row.displayName,
        hint:
          [row.division?.name, ...row.youtubers.map((youtuber) => youtuber.name)]
            .filter(Boolean)
            .join(' · ') || undefined,
        href: ROUTES.member(row.id),
      })),
    })
  }

  if (access.can(Permissions.ProjectRead)) {
    const rows = await prisma.project.findMany({
      where: { OR: [{ title: contains }, { description: contains }] },
      include: { youtuber: true, state: true },
      take,
    })

    sections.push({
      group: 'projects',
      label: SEARCH_GROUPS.projects,
      hits: rows.map<SearchHit>((row) => ({
        id: row.id,
        group: 'projects',
        label: row.title,
        hint: [row.youtuber?.name, row.state?.name].filter(Boolean).join(' · ') || undefined,
        href: ROUTES.project(row.id),
      })),
    })
  }

  if (access.can(Permissions.TaskRead)) {
    const rows = await prisma.task.findMany({
      where: { OR: [{ title: contains }, { description: contains }] },
      include: { owner: true, state: true },
      take,
    })

    sections.push({
      group: 'tasks',
      label: SEARCH_GROUPS.tasks,
      hits: rows.map<SearchHit>((row) => ({
        id: row.id,
        group: 'tasks',
        label: row.title,
        hint: [row.owner?.displayName, row.state?.name].filter(Boolean).join(' · ') || undefined,
        href: ROUTES.task(row.id),
      })),
    })
  }

  if (access.can(Permissions.MeetingRead)) {
    const rows = await prisma.meeting.findMany({
      where: { OR: [{ title: contains }, { introduction: contains }] },
      take,
    })

    sections.push({
      group: 'meetings',
      label: SEARCH_GROUPS.meetings,
      hits: rows.map<SearchHit>((row) => ({
        id: row.id,
        group: 'meetings',
        label: row.title,
        hint: formatDay(row.scheduledAt),
        href: ROUTES.meeting(row.id),
      })),
    })
  }

  if (access.can(Permissions.TeamRead)) {
    const rows = await prisma.team.findMany({
      where: { name: contains },
      include: { lead: true },
      take,
    })

    sections.push({
      group: 'teams',
      label: SEARCH_GROUPS.teams,
      hits: rows.map<SearchHit>((row) => ({
        id: row.id,
        group: 'teams',
        label: row.name,
        hint: row.lead?.displayName ?? undefined,
        href: ROUTES.teams,
      })),
    })
  }

  return sections.filter((section) => section.hits.length > 0)
}
