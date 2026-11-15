import { PageHeader } from '@/components/structures/page/PageHeader'
import { UnbanBoard } from '@/composites/unban/UnbanBoard'
import { youtuberOptions } from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import { Permissions } from '@/utils/constants/permissions'

export interface UnbanScreenProps {
  // Request opened by the address
  requestId?: string
}

/**
 * Déban. page of the moderators: requests and form
 * @param {string} [requestId] - Request opened first
 * @return {Promise<JSX.Element>} - Screen
 */

export const UnbanScreen = async ({ requestId }: UnbanScreenProps) => {
  const { access, scope } = await requirePermission(Permissions.UnbanRead)

  const creators = await youtuberOptions(await scope())

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={UNBAN_COPY.title} />
      <UnbanBoard
        creators={creators}
        initialRequestId={requestId ?? null}
        canManage={access.can(Permissions.UnbanManage)}
      />
    </div>
  )
}
