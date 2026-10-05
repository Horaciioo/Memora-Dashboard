import type { Metadata } from 'next'
import { Badge } from '@/components/elements/display/Badge'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { PageHeader } from '@/components/structures/PageHeader'
import { LegacyTrackView } from '@/composites/legacy/LegacyTrackView'
import { readOwnTrack } from '@/core/services/academy/LegacyService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LEGACY_COPY } from '@/declarations/academy/legacy/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LEGACY_COPY.ownTitle }

/**
 * The member's own Legacy track
 * @return {Promise<JSX.Element>} - Own Legacy page
 */

export default async function MyLegacyPage() {
  const { session } = await requirePermission(Permissions.LegacySelf)
  const own = await readOwnTrack(session.id)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={LEGACY_COPY.ownTitle} />
      {own ? (
        <LegacyTrackView detail={own} canGrade={false} canDecide={false} isOwner />
      ) : (
        <EmptyState
          figure="academy"
          title={LEGACY_COPY.ownEmptyTitle}
          description={LEGACY_COPY.ownEmptyDescription}
          action={<Badge label={LEGACY_COPY.ownEmptyTitle} tone="neutral" />}
        />
      )}
    </div>
  )
}
