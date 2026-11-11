import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { ArrivalsBoard } from '@/composites/management/ArrivalsBoard'
import { rowsToOptions } from '@/core/lib/forms/options'
import { listManagedArrivals } from '@/core/services/management'
import { activeYoutubers } from '@/core/services/reference/lookups'
import { requireManagement } from '@/core/wrappers/requireManagement'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { ManagementPages, managementPage } from '@/declarations/management/pages'
import { PAGE_STYLES } from '@/declarations/ui/variants'

const PAGE = managementPage(ManagementPages.Arrivals)

export const metadata: Metadata = { title: PAGE.label }

/**
 * Arrivals of the whole team
 * @return {Promise<JSX.Element>} - Management page
 */

export default async function ManagementArrivalsPage() {
  const { access, scope } = await requireManagement(PAGE.permission)
  const perimeter = await scope()

  const [data, youtubers] = await Promise.all([
    listManagedArrivals(perimeter, access.isAdmin),
    activeYoutubers(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PAGE.label}
        heroDescription={MANAGEMENT_BOARD_COPY.arrivals.heroDescription}
      />
      <ArrivalsBoard arrivals={data} youtubers={rowsToOptions(youtubers)} />
    </div>
  )
}
