import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { FunctionsBoard } from '@/composites/management/FunctionsBoard'
import { rowsToOptions } from '@/core/lib/forms/options'
import { listManagedFunctions } from '@/core/services/management'
import { activeYoutubers } from '@/core/services/reference/lookups'
import { requireManagement } from '@/core/wrappers/requireManagement'
import { MANAGEMENT_BOARD_COPY } from '@/declarations/management/copy'
import { ManagementPages, managementPage } from '@/declarations/management/pages'
import { PAGE_STYLES } from '@/declarations/ui/variants'

const PAGE = managementPage(ManagementPages.Functions)

export const metadata: Metadata = { title: PAGE.label }

/**
 * Functions held by the whole team
 * @return {Promise<JSX.Element>} - Management page
 */

export default async function ManagementFunctionsPage() {
  const { access, scope } = await requireManagement(PAGE.permission)
  const perimeter = await scope()

  const [data, youtubers] = await Promise.all([
    listManagedFunctions(perimeter, access.isAdmin),
    activeYoutubers(),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PAGE.label}
        heroDescription={MANAGEMENT_BOARD_COPY.functions.heroDescription}
      />
      <FunctionsBoard data={data} youtubers={rowsToOptions(youtubers)} />
    </div>
  )
}
