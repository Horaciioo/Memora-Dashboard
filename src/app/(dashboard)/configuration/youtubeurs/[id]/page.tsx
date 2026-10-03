import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CreatorLabel } from '@/components/elements/display/RecordLabel'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { CreatorChannelsPanel } from '@/composites/reference/CreatorChannelsPanel'
import { CreatorLeadsPanel } from '@/composites/reference/CreatorLeadsPanel'
import { TeamsBoard } from '@/composites/teams/TeamsBoard'
import { roleGroupedOptions } from '@/core/lib/forms/options'
import { prisma } from '@/core/lib/db'
import { readAnchors } from '@/core/services/auth/LeadService'
import { readTwitchChannel } from '@/core/services/platforms/ChannelService'
import { encadrementAccounts } from '@/core/services/reference/lookups'
import { readTeamBoard, teamFields } from '@/core/services/teams/TeamService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { CHANNEL_COPY } from '@/declarations/platforms/copy'
import { REFERENCE_COPY, REFERENCE_FIELD_COPY, YOUTUBER_COPY } from '@/declarations/reference/copy'

import { PAGE_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Read one creator
 * @param {string} id - Creator identifier
 * @return {Promise<object | null>} - Creator row
 */

const readYoutuber = (id: string) =>
  prisma.youtuber.findUnique({
    where: { id },
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

  const [board, fields, anchors, candidates, twitch] = await Promise.all([
    readTeamBoard(await scope(), id),
    teamFields(),
    readAnchors(id),
    encadrementAccounts(),
    readTwitchChannel(id),
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
        <CreatorLabel name={youtuber.name} image={youtuber.avatarUrl} size="lg" />
      </Section>
      <Section title={CHANNEL_COPY.title} description={CHANNEL_COPY.lead} padded>
        <CreatorChannelsPanel youtuberId={id} initialTwitch={twitch} canManage={access.isAdmin} />
      </Section>
      <Section
        title={REFERENCE_FIELD_COPY.leadsTitle}
        description={REFERENCE_FIELD_COPY.leadsLead}
        padded
      >
        <CreatorLeadsPanel
          youtuberId={id}
          initialAnchors={anchors}
          candidates={roleGroupedOptions(candidates)}
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
