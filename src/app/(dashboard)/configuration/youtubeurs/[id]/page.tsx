import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Status } from '@/components/elements/display/Status'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { CreatorFile } from '@/composites/reference/CreatorFile'
import { prisma } from '@/core/lib/db'
import { readAnchors } from '@/core/services/auth/LeadService'
import { readChannels } from '@/core/services/platforms/ChannelService'
import { readCreatorTeams } from '@/core/services/teams/CreatorTeamService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { REFERENCE_COPY, REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'

import { PAGE_STYLES } from '@/declarations/ui/variants'
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
 * Creator file
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Creator file
 */

export default async function YoutuberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { access, scope } = await requirePermission(Permissions.ReferenceRead)

  const youtuber = await readYoutuber(id)
  if (!youtuber) notFound()

  const [teams, anchors, channels] = await Promise.all([
    readCreatorTeams(id, await scope()),
    readAnchors(id),
    readChannels(id),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={youtuber.name}
        image={youtuber.bannerUrl}
        actions={
          youtuber.archived ? (
            <Status label={REFERENCE_FIELD_COPY.archivedBadge} tone="neutral" icon="hidden" />
          ) : undefined
        }
      />
      <CreatorFile
        youtuberId={id}
        name={youtuber.name}
        avatarUrl={youtuber.avatarUrl}
        bannerUrl={youtuber.bannerUrl}
        channels={channels}
        anchors={anchors}
        teams={teams}
        canManageTeams={access.can(Permissions.TeamManage)}
        canManageCreator={access.isAdmin}
      />
    </div>
  )
}
