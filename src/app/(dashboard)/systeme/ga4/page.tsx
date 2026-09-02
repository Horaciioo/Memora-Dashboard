import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { WipNotice } from '@/components/structures/WipNotice'
import { requirePermission } from '@/core/wrappers/requireUser'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: SYSTEM_COPY.analyticsTitle }

/**
 * Audience of the dashboard, waiting on the Analytics property
 * @return {Promise<JSX.Element>} - Analytics page
 */

export default async function AnalyticsPage() {
  await requirePermission(Permissions.AccessManage)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.analyticsTitle} lead={SYSTEM_COPY.analyticsLead} />
      <WipNotice figure="settings" description={SYSTEM_COPY.analyticsWip} />
    </div>
  )
}
