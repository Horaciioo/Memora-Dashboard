import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { WipNotice } from '@/components/structures/WipNotice'
import { requireUser } from '@/core/wrappers/requireUser'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: PERSONAL_COPY.title }

/**
 * Personal dashboard, declared but not wired yet
 * @return {Promise<JSX.Element>} - Dashboard page
 */

export default async function DashboardPage() {
  const { session } = await requireUser()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PERSONAL_COPY.greeting.replace('{name}', session.displayName)}
        lead={PERSONAL_COPY.lead}
      />
      <WipNotice figure="settings" description={PERSONAL_COPY.wip} />
    </div>
  )
}
