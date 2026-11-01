import 'server-only'

import { prisma } from '@/core/lib/db'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { SEARCH_GROUPS } from '@/declarations/ui/copy/navigation'
import { resolvePermissions } from '@/core/services/auth/PermissionsService'
import { readScope, scopedWhere } from '@/core/services/auth/ScopeService'
import { BELOW_LEAD_ROLES } from '@/core/services/members/MemberService'
import {
  meetingVisibility,
  projectVisibility,
  taskVisibility,
  workViewer,
} from '@/core/services/work/visibility'
import { searchPages, viewerOf } from '@/core/services/pages'
import { PAGES_COPY } from '@/declarations/pages/copy'
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
  const scope = await readScope(session, access)
  const viewer = workViewer(session, access)
  const take = SEARCH_SETTINGS.maxResultsPerGroup
  const contains = { contains: query, mode: 'insensitive' } as const
  const sections: SearchSection[] = []

  // Every family is gated by the permission that opens its page
  // Same gate as the moderator file
  if (access.isResponsable && access.can(Permissions.MemberRead)) {
    const rows = await prisma.account.findMany({
      where: scopedWhere('account', scope, {
        id: { not: session.id },
        ...(access.isAdmin ? {} : { role: { in: BELOW_LEAD_ROLES } }),
        OR: [{ displayName: contains }, { discordId: { contains: query } }],
      }),
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
            .join(', ') || undefined,
        href: ROUTES.member(row.id),
      })),
    })
  }

  if (access.can(Permissions.ProjectRead)) {
    const rows = await prisma.project.findMany({
      where: {
        AND: [
          scopedWhere('project', scope, { OR: [{ title: contains }, { description: contains }] }),
          projectVisibility(viewer),
        ],
      },
      include: { youtubers: true, state: true },
      take,
    })

    sections.push({
      group: 'projects',
      label: SEARCH_GROUPS.projects,
      hits: rows.map<SearchHit>((row) => ({
        id: row.id,
        group: 'projects',
        label: row.title,
        hint:
          [...row.youtubers.map((youtuber) => youtuber.name), row.state?.name]
            .filter(Boolean)
            .join(', ') || undefined,
        href: ROUTES.project(row.id),
      })),
    })
  }

  if (access.can(Permissions.TaskRead)) {
    const rows = await prisma.task.findMany({
      where: {
        AND: [
          scopedWhere('task', scope, { OR: [{ title: contains }, { description: contains }] }),
          taskVisibility(viewer),
        ],
      },
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
        hint: [row.owner?.displayName, row.state?.name].filter(Boolean).join(', ') || undefined,
        href: ROUTES.task(row.id),
      })),
    })
  }

  if (access.can(Permissions.MeetingRead)) {
    const rows = await prisma.meeting.findMany({
      where: {
        AND: [
          scopedWhere('meeting', scope, {
            OR: [
              { title: contains },
              ...(access.can(Permissions.MeetingContentRead) ? [{ introduction: contains }] : []),
            ],
          }),
          meetingVisibility(viewer),
        ],
      },
      take,
    })

    sections.push({
      group: 'meetings',
      label: SEARCH_GROUPS.meetings,
      hits: rows.map<SearchHit>((row) => ({
        id: row.id,
        group: 'meetings',
        label: row.title,
        hint: row.scheduledAt ? formatDay(row.scheduledAt) : undefined,
        href: ROUTES.meeting(row.id),
      })),
    })
  }

  if (access.can(Permissions.TeamRead)) {
    const rows = await prisma.team.findMany({
      where: scopedWhere('team', scope, { name: contains }),
      include: { leads: { include: { account: true } } },
      take,
    })

    sections.push({
      group: 'teams',
      label: SEARCH_GROUPS.teams,
      hits: rows.map<SearchHit>((row) => ({
        id: row.id,
        group: 'teams',
        label: row.name,
        hint: row.leads.map((lead) => lead.account.displayName).join(', ') || undefined,
        // Teams live in their creator's file
        href:
          row.youtuberId && access.can(Permissions.ReferenceRead)
            ? ROUTES.settingsRecord('youtubeurs', row.youtuberId)
            : ROUTES.teams,
      })),
    })
  }

  // Pages the member may open, nothing else
  const pages = await searchPages(viewerOf(session), query)
  sections.push({
    group: 'pages',
    label: SEARCH_GROUPS.pages,
    hits: pages.slice(0, take).map<SearchHit>((hit) => ({
      id: hit.id,
      group: 'pages',
      label: `${hit.icon ? `${hit.icon} ` : ''}${hit.title || PAGES_COPY.untitled}`,
      hint: hit.trail.join(' › ') || undefined,
      href: ROUTES.page(hit.id),
    })),
  })

  return sections.filter((section) => section.hits.length > 0)
}
