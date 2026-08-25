import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { LiveconPanel } from '@/composites/livecon/LiveconPanel'
import {
  liveconFields,
  listLevels,
  readCurrentState,
  readHistory,
} from '@/core/services/livecon/LiveconService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVECON_COPY } from '@/declarations/livecon/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVECON_COPY.title }

/**
 * Livecon board
 * @return {Promise<JSX.Element>} - Livecon page
 */

export default async function LiveconPage() {
  const { access, scope } = await requirePermission(Permissions.LiveconRead)
  const perimeter = await scope()

  const [levels, state, history, fields] = await Promise.all([
    listLevels(),
    readCurrentState(perimeter),
    readHistory(perimeter),
    liveconFields(perimeter),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={LIVECON_COPY.title} lead={LIVECON_COPY.lead} />
      <LiveconPanel
        levels={levels}
        initialState={state}
        history={history}
        fields={fields}
        canUpdate={access.can(Permissions.LiveconUpdate)}
      />
    </div>
  )
}
