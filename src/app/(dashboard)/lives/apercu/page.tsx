import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ModViewPreview } from '@/composites/modview/ModViewPreview'
import { listLevels, readCurrentState } from '@/core/services/livecon/LiveconService'
import { readPanel } from '@/core/services/sanctions/SanctionService'
import { youtuberOptions } from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { levelOfCreator } from '@/declarations/livecon/levels'
import { MODVIEW_PREVIEW_COPY } from '@/declarations/modview/preview'
import { MODVIEW_PAGE, PAGE_STYLES } from '@/declarations/ui/variants'
import { SanctionPanels } from '@/utils/constants/moderation'
import { Permissions } from '@/utils/constants/permissions'
import type { SanctionPanelView } from '@/types/sanctions'

export const metadata: Metadata = { title: MODVIEW_PREVIEW_COPY.title }

/**
 * Mod View played on a scripted evening, for the administration to validate
 * @return {Promise<JSX.Element>} - Preview page
 */

export default async function ModViewPreviewPage() {
  const { session, access, scope } = await requirePermission(Permissions.LiveRead)
  if (!access.isAdmin) notFound()

  const perimeter = await scope()
  const [creators, levels, state] = await Promise.all([
    youtuberOptions(perimeter),
    listLevels(),
    readCurrentState(perimeter),
  ])

  // First creator holding a Twitch panel, so the drawer reads true
  const first = perimeter.activeYoutuberId
    ? [perimeter.activeYoutuberId]
    : creators.map((creator) => creator.value)
  let panel: SanctionPanelView | null = null
  for (const creatorId of first) {
    const inForce = levelOfCreator(state, creatorId)?.level.id ?? levels[0]?.id ?? null
    const candidate = await readPanel(perimeter, creatorId, SanctionPanels.Twitch, inForce)
    if (candidate.offenses.length > 0) {
      panel = candidate
      break
    }
  }

  return (
    <div className={PAGE_STYLES.wrapper}>
      <h1 className={MODVIEW_PAGE.title}>{MODVIEW_PREVIEW_COPY.title}</h1>
      <ModViewPreview
        panel={panel}
        levelNames={Object.fromEntries(levels.map((level) => [String(level.level), level.name]))}
        actorName={session.displayName}
      />
    </div>
  )
}
