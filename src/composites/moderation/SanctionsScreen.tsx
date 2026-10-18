import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Status } from '@/components/elements/display/Status'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { ModerationBoard } from '@/composites/moderation/ModerationBoard'
import { liveconFields, listLevels, readCurrentState } from '@/core/services/livecon/LiveconService'
import { listMeasures, panelsFor, readPanel } from '@/core/services/sanctions/SanctionService'
import { youtuberOptions } from '@/core/services/work/shared'
import { requirePermission } from '@/core/wrappers/requireUser'
import { levelOfCreator } from '@/declarations/livecon/levels'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { SanctionPanels } from '@/utils/constants/moderation'
import { Permissions } from '@/utils/constants/permissions'

export interface SanctionsScreenProps {
  discord?: boolean
}

/**
 * Livecon and sanction panel of the creator the member works for, on Twitch or on Discord
 * @param {boolean} [discord] - Discord panel in place of the live platforms
 * @return {Promise<JSX.Element>} - Moderation screen
 */

export const SanctionsScreen = async ({ discord = false }: SanctionsScreenProps) => {
  const { session, access, scope } = await requirePermission(Permissions.SanctionRead)
  const perimeter = await scope()

  const [levels, state, creators, held] = await Promise.all([
    listLevels(),
    readCurrentState(perimeter),
    youtuberOptions(perimeter),
    panelsFor(session),
  ])

  // Each platform keeps its own page
  const surfaces = held.filter((name) => (name === SanctionPanels.Discord) === discord)
  const panels =
    surfaces.length > 0 ? surfaces : [discord ? SanctionPanels.Discord : SanctionPanels.Twitch]

  // Only the creator in perimeter is ever shown
  const creatorId = perimeter.activeYoutuberId ?? creators[0]?.value ?? null

  const heading = discord ? SANCTION_COPY.discordTitle : SANCTION_COPY.title

  const empty = (title: string, description: string) => (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={heading} />
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
  // The panel opens on the level in force
  const inForce = levelOfCreator(state, creatorId)?.level.id ?? levels[0]?.id ?? null

  const [panel, measures, switchFields] = await Promise.all([
    readPanel(perimeter, creatorId, panels[0]!, inForce),
    listMeasures(),
    liveconFields(perimeter),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={heading} />
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
