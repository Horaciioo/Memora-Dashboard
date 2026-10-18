import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { AnnouncementsList } from '@/composites/work/AnnouncementsList'
import { mentionOptions } from '@/core/services/work/DiscordDirectory'
import { announcementFields, listAnnouncements } from '@/core/services/work/AnnouncementService'
import { platformOptions, projectOptions } from '@/core/services/work/shared'
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
  const perimeter = await scope()
  const viewer = workViewer(session, access)

  const [rows, mentions, projects, platforms] = await Promise.all([
    listAnnouncements(viewer, access, perimeter),
    mentionOptions([]),
    projectOptions(perimeter, viewer),
    platformOptions(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={ANNOUNCEMENT_COPY.title}
        heroDescription={ANNOUNCEMENT_COPY.heroDescription}
      />
      <AnnouncementsList
        initialRows={rows}
        fields={await announcementFields(mentions, projects)}
        platforms={platforms}
        projects={projects}
        canWrite={access.can(Permissions.CommunicationWrite)}
      />
    </div>
  )
}
