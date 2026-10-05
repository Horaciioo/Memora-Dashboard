import type { Metadata } from 'next'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Status } from '@/components/elements/display/Status'
import { PageHeader } from '@/components/structures/PageHeader'
import { ModerationBoard } from '@/composites/moderation/ModerationBoard'
import { liveconFields, listLevels, readCurrentState } from '@/core/services/livecon/LiveconService'
import { listMeasures, panelsFor, readPanel } from '@/core/services/sanctions/SanctionService'
import { youtuberOptions } from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { levelOfCreator } from '@/declarations/livecon/levels'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: SANCTION_COPY.title }

/**
 * Livecon and sanction panel of the creator the member works for
 * @return {Promise<JSX.Element>} - Moderation page
 */

export default async function SanctionsPage() {
  const { session, access, scope } = await requirePermission(Permissions.SanctionRead)
  const perimeter = await scope()

  const [levels, state, creators, panels] = await Promise.all([
    listLevels(),
    readCurrentState(perimeter),
    youtuberOptions(perimeter),
    panelsFor(session),
  ])

  // Only the creator in perimeter is ever shown
  const creatorId = perimeter.activeYoutuberId ?? creators[0]?.value ?? null

  const empty = (title: string, description: string) => (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SANCTION_COPY.title} />
      <EmptyState
        figure="moderation"
        title={title}
        description={description}
        action={<Status label={title} tone="neutral" />}
      />
    </div>
  )

  if (levels.length === 0) {
    return empty(SANCTION_COPY.levelsEmptyTitle, SANCTION_COPY.levelsEmptyDescription)
  }
  if (!creatorId) {
    return empty(SANCTION_COPY.creatorsEmptyTitle, SANCTION_COPY.creatorsEmptyDescription)
  }
  if (panels.length === 0) {
    return empty(SANCTION_COPY.noFunctionTitle, SANCTION_COPY.noFunctionDescription)
  }

  // The panel opens on the level in force
  const inForce = levelOfCreator(state, creatorId)?.level.id ?? levels[0]?.id ?? null

  const [panel, measures, switchFields] = await Promise.all([
    readPanel(perimeter, creatorId, panels[0]!, inForce),
    listMeasures(),
    liveconFields(perimeter),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SANCTION_COPY.title} />
      <ModerationBoard
        creatorId={creatorId}
        levels={levels}
        initialState={state}
        panels={panels}
        initialPanel={panel}
        measures={measures}
        liveconFields={switchFields}
        canUpdateLivecon={access.can(Permissions.LiveconUpdate)}
        canManageSanctions={access.can(Permissions.SanctionManage)}
      />
    </div>
  )
}
