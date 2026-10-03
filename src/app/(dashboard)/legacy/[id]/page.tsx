import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { LegacyTrackView } from '@/composites/legacy/LegacyTrackView'
import { readTrack } from '@/core/services/academy/LegacyService'
import { requireUser } from '@/core/wrappers/requireUser'
import { LEGACY_COPY } from '@/declarations/academy/legacy/copy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

interface LegacyTrackPageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: LEGACY_COPY.title }

/**
 * One Legacy track, open to the encadrement and to the member following it
 * @param {LegacyTrackPageProps} props - Track identifier
 * @return {Promise<JSX.Element>} - Track page
 */

export default async function LegacyTrackPage({ params }: LegacyTrackPageProps) {
  const { id } = await params
  const { session, access } = await requireUser()

  const detail = await readTrack(id).catch(() => null)
  const isOwner = detail?.summary.accountId === session.id
  if (!detail || (!isOwner && !access.can(Permissions.LegacyRead))) redirect(ROUTES.legacy)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={isOwner ? LEGACY_COPY.ownTitle : LEGACY_COPY.title} />
      <LegacyTrackView
        detail={detail}
        canGrade={access.can(Permissions.LegacyManage)}
        canDecide={access.isAdmin && access.can(Permissions.LegacyManage)}
        isOwner={isOwner}
      />
    </div>
  )
}
