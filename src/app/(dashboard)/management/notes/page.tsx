import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { NotesBoard } from '@/composites/management/NotesBoard'
import { rowsToOptions } from '@/core/lib/forms/options'
import { listManagedNotes } from '@/core/services/management'
import { activeYoutubers } from '@/core/services/reference/lookups'
import { requireManagement } from '@/core/wrappers/requireManagement'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { ManagementPages, managementPage } from '@/declarations/management/pages'
import { PAGE_STYLES } from '@/declarations/ui/variants'

const PAGE = managementPage(ManagementPages.Notes)

export const metadata: Metadata = { title: PAGE.label }

/**
 * Private remarks left on the whole team
 * @return {Promise<JSX.Element>} - Management page
 */

export default async function ManagementNotesPage() {
  const { access, scope } = await requireManagement(PAGE.permission)
  const perimeter = await scope()

  const [notes, youtubers] = await Promise.all([
    listManagedNotes(perimeter, access.isAdmin),
    activeYoutubers(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PAGE.label}
        heroDescription={MANAGEMENT_BOARD_COPY.notes.heroDescription}
      />
      <NotesBoard notes={notes} youtubers={rowsToOptions(youtubers)} />
    </div>
  )
}
