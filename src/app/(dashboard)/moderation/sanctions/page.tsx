import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { WipNotice } from '@/components/structures/WipNotice'
import { requireUser } from '@/core/wrappers/requireUser'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: PERSONAL_COPY.sanctions }

/**
 * Discord sanction panel, declared but not wired yet
 * @return {Promise<JSX.Element>} - Sanction page
 */

export default async function SanctionsPage() {
  await requireUser()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PERSONAL_COPY.sanctions} lead={PERSONAL_COPY.sanctionsLead} />
      <WipNotice figure="moderation" description={PERSONAL_COPY.sanctionsWip} />
    </div>
  )
}
