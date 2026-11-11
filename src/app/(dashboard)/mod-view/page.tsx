import { redirect } from 'next/navigation'

import { ModViewPreview } from '@/composites/modview/ModViewPreview'
import { listOpenLives } from '@/core/services/lives/LiveService'
import { ROUTES } from '@/declarations/navigation'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { DEMO_PANEL } from '@/declarations/modview/demoPanel'
import { MODVIEW_PAGE } from '@/declarations/ui/variants'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LiveStatuses } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'

export const metadata = { title: MODVIEW_COPY.title }

/**
 * Dedicated Mod View
 * @return {Promise<JSX.Element>} - Mod workspace
 */

export default async function ModViewPage() {
  const { session, scope } = await requirePermission(Permissions.LiveRead)
  const perimeter = await scope()
  const lives = await listOpenLives(perimeter, session.id, session.permissions)
  const priority = lives.find((live) => live.status === LiveStatuses.Live) ??
    lives.find((live) => live.access === 'open')

  if (priority) redirect(ROUTES.live(priority.id))

  return (
    <div className={MODVIEW_PAGE.wrapper}>
      <h1 className={MODVIEW_PAGE.title}>{MODVIEW_COPY.title}</h1>
      <ModViewPreview
        panel={DEMO_PANEL}
        levelNames={{}}
        actorName={session.displayName}
        showControls={false}
        watchOnly
      />
    </div>
  )
}
