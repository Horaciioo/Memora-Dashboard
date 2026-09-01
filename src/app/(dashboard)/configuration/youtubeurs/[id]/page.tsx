import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { CreatorLeadsPanel } from '@/composites/reference/CreatorLeadsPanel'
import { TeamsBoard } from '@/composites/teams/TeamsBoard'
import { prisma } from '@/core/lib/db'
import { readAnchors } from '@/core/services/auth/LeadService'
import { encadrementAccounts } from '@/core/services/reference/lookups'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { readTeamBoard, teamFields } from '@/core/services/teams/TeamService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { REFERENCE_COPY, REFERENCE_FIELD_COPY, YOUTUBER_COPY } from '@/declarations/reference/copy'
import { METRIC_BLOCK } from '@/declarations/ui/blocks'

import { PAGE_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read one creator and everything counted against them
 * @param {string} id - Creator identifier
 * @return {Promise<object | null>} - Creator row
 */

const readYoutuber = (id: string) =>
  prisma.youtuber.findUnique({
    where: { id },
    include: { _count: { select: { accounts: true, projects: true, teams: true } } },
  })

/**
 * Name the browser tab after the creator
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const youtuber = await readYoutuber(id)

  return { title: youtuber?.name ?? REFERENCE_COPY.title }
}

/**
 * Creator file, its teams managed straight from here
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Creator file
 */

export default async function YoutuberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { access, scope } = await requirePermission(Permissions.ReferenceRead)

  const youtuber = await readYoutuber(id)
  if (!youtuber) notFound()

  const [board, fields, anchors, candidates] = await Promise.all([
    readTeamBoard(await scope(), id),
    teamFields(),
    readAnchors(id),
    encadrementAccounts(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={youtuber.handle ?? YOUTUBER_COPY.noHandle}
        title={youtuber.name}
        actions={
          youtuber.archived ? (
            <Badge label={REFERENCE_FIELD_COPY.archivedBadge} tone="neutral" icon="hidden" />
          ) : undefined
        }
      />
      <Section padded>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={youtuber.name} src={youtuber.avatarUrl} size="lg" />
          <span className={METRIC_BLOCK.row}>
            <span className={METRIC_BLOCK.entry}>
              <span className={METRIC_BLOCK.value}>{youtuber._count.accounts}</span>
              <span className={METRIC_BLOCK.label}>{YOUTUBER_COPY.moderators}</span>
            </span>
            <span className={METRIC_BLOCK.entry}>
              <span className={METRIC_BLOCK.value}>{youtuber._count.projects}</span>
              <span className={METRIC_BLOCK.label}>{YOUTUBER_COPY.projects}</span>
            </span>
            <span className={METRIC_BLOCK.entry}>
              <span className={METRIC_BLOCK.value}>{youtuber._count.teams}</span>
              <span className={METRIC_BLOCK.label}>{YOUTUBER_COPY.teams}</span>
            </span>
          </span>
          {youtuber.accent && (
            <Badge label={youtuber.name} accent={youtuber.accent} tone={'brand'} icon="youtuber" />
          )}
        </div>
      </Section>
      <Section
        title={REFERENCE_FIELD_COPY.leadsTitle}
        description={REFERENCE_FIELD_COPY.leadsLead}
        padded
      >
        <CreatorLeadsPanel
          youtuberId={id}
          initialAnchors={anchors}
          candidates={candidates.map((account) => ({
            value: account.id,
            label: account.displayName,
            hint: ROLE_REGISTRY.label(account.role),
            image: account.avatarUrl,
          }))}
          teams={board.teams.map((team) => ({ value: team.id, label: team.name }))}
          canManage={access.isAdmin}
        />
      </Section>
      <Section
        title={YOUTUBER_COPY.teamsTitle}
        description={YOUTUBER_COPY.teamsLead}
        bare
        className={SECTION_STYLES.wrapper}
      >
        <TeamsBoard
          initialBoard={board}
          fields={fields}
          canManage={access.can(Permissions.TeamManage)}
          youtuberId={id}
        />
      </Section>
    </div>
  )
}
