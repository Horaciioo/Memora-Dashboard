import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { WhitelistPanel } from '@/composites/reference/WhitelistPanel'
import { readWhitelist } from '@/core/services/intelligence/WhitelistService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { WHITELIST_COPY } from '@/declarations/intelligence/whitelist'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: WHITELIST_COPY.title }

/**
 * Whitelist of Memora Intelligence
 * @return {Promise<JSX.Element>} - Whitelist page
 */

export default async function WhitelistPage() {
  const { access } = await requirePermission(Permissions.ReferenceRead)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={WHITELIST_COPY.title} />
      <div className="mx-auto w-full max-w-3xl">
        <WhitelistPanel initial={await readWhitelist()} canManage={access.isAdmin} />
      </div>
    </div>
  )
}
