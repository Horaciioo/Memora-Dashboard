import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { SanctionsBoard } from '@/composites/moderation/SanctionsBoard'
import {
  liveconFields,
  listLevels,
  readCurrentState,
  readHistory,
} from '@/core/services/livecon/LiveconService'
import {
  listMeasures,
  offenseFields,
  readPanel,
} from '@/core/services/sanctions/SanctionService'
import { youtuberOptions } from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import type { SanctionPanelView } from '@/types/sanctions'

export const metadata: Metadata = { title: SANCTION_COPY.title }

/**
 * Moderation board — the livecon in force and the sanction panel it opens
 * @return {Promise<JSX.Element>} - Sanctions page
 */

export default async function SanctionsPage() {
  const { access, scope } = await requirePermission(Permissions.SanctionRead)
  const perimeter = await scope()

  const [levels, state, history, creators, measures, switchFields] = await Promise.all([
    listLevels(),
    readCurrentState(perimeter),
    readHistory(perimeter),
    youtuberOptions(perimeter),
    listMeasures(),
    liveconFields(perimeter),
  ])

  // The panel opens on the level in force, the tightest one when several apply
  const creatorId = creators[0]?.value ?? ''
  const inForce =
    state.find((entry) => entry.youtuber?.id === creatorId) ??
    state.find((entry) => entry.youtuber === null)
  const activeLevelId = inForce?.level.id ?? levels[levels.length - 1]?.id ?? null

  const panel: SanctionPanelView = creatorId
    ? await readPanel(perimeter, creatorId, activeLevelId)
    : { youtuberId: '', activeLevelId, offenses: [] }

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SANCTION_COPY.title} lead={SANCTION_COPY.lead} />
      <SanctionsBoard
        levels={levels}
        initialState={state}
        history={history}
        creators={creators}
        measures={measures}
        initialPanel={panel}
        liveconFields={switchFields}
        offenseFields={offenseFields()}
        canUpdateLivecon={access.can(Permissions.LiveconUpdate)}
        canManageSanctions={access.can(Permissions.SanctionManage)}
      />
    </div>
  )
}
