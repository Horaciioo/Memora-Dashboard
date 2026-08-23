import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { TeamsBoard } from '@/composites/teams/TeamsBoard'
import { prisma } from '@/core/lib/db'
import { rowsToOptions } from '@/core/lib/forms/options'
import { readTeamBoard, teamFields } from '@/core/services/teams/TeamService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { TEAM_COPY } from '@/declarations/teams/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: TEAM_COPY.title }

/**
 * Team board
 * @return {Promise<JSX.Element>} - Team page
 */

export default async function TeamsPage() {
  const { access } = await requirePermission(Permissions.TeamRead)
  const [board, fields, youtubers] = await Promise.all([
    readTeamBoard(),
    teamFields(),
    prisma.youtuber.findMany({ orderBy: { position: 'asc' } }),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={TEAM_COPY.title} lead={TEAM_COPY.lead} />
      <TeamsBoard
        initialBoard={board}
        fields={fields}
        youtubers={rowsToOptions(youtubers)}
        canManage={access.can(Permissions.TeamManage)}
      />
    </div>
  )
}
