import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { AnnouncementsList } from '@/composites/work/AnnouncementsList'
import { listAnnouncements } from '@/core/services/work/AnnouncementService'
import { workViewer } from '@/core/services/work/visibility'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { ANNOUNCEMENT_COPY } from '@/declarations/work/announcements'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: ANNOUNCEMENT_COPY.title }

/**
 * Announcements written across Memora
 * @return {Promise<JSX.Element>} - Announcements page
 */

export default async function AnnouncementsPage() {
  const { session, access, scope } = await requirePermission(Permissions.CommunicationRead)
  const rows = await listAnnouncements(workViewer(session, access), access, await scope())

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ANNOUNCEMENT_COPY.title} />
      <AnnouncementsList rows={rows} />
    </div>
  )
}
