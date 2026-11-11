import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { AbsencesBoard } from '@/composites/management/AbsencesBoard'
import { rowsToOptions } from '@/core/lib/forms/options'
import { REVIEW_FIELDS } from '@/core/services/absences/AbsenceService'
import { listManagedAbsences } from '@/core/services/management'
import { activeYoutubers } from '@/core/services/reference/lookups'
import { requireManagement } from '@/core/wrappers/requireManagement'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { ManagementPages, managementPage } from '@/declarations/management/pages'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

const PAGE = managementPage(ManagementPages.Absences)

export const metadata: Metadata = { title: PAGE.label }

/**
 * Absences of the whole team
 * @return {Promise<JSX.Element>} - Management page
 */

export default async function ManagementAbsencesPage() {
  const { access, scope } = await requireManagement(PAGE.permission)
  const perimeter = await scope()

  const [absences, youtubers] = await Promise.all([
    listManagedAbsences(perimeter, access.isAdmin),
    activeYoutubers(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PAGE.label}
        heroDescription={MANAGEMENT_BOARD_COPY.absences.heroDescription}
      />
      <AbsencesBoard
        initial={absences}
        fields={REVIEW_FIELDS}
        youtubers={rowsToOptions(youtubers)}
        canReview={access.can(Permissions.AbsenceReview)}
      />
    </div>
  )
}
