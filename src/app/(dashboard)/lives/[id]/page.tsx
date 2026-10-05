import type { Metadata } from 'next'
import { LiveGate } from '@/composites/lives/LiveGate'
import { LiveModView } from '@/composites/modview/LiveModView'
import { focusableMembers } from '@/core/services/lives/FocusService'
import { readPanelMemory } from '@/core/services/lives/LiveInsightService'
import { readLive } from '@/core/services/lives/LiveService'
import { listLevels, readCurrentState } from '@/core/services/livecon/LiveconService'
import { readPanel } from '@/core/services/sanctions/SanctionService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { levelOfCreator } from '@/declarations/livecon/levels'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { MODVIEW_PAGE, PAGE_STYLES } from '@/declarations/ui/variants'
import { LivePlatforms } from '@/utils/constants/lives'
import { SanctionPanels } from '@/utils/constants/moderation'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVE_COPY.title }

/**
 * Mod View of one live
 * @param {Object} props - Route props
 * @param {Promise<{ id: string }>} props.params - Live identifier
 * @return {Promise<JSX.Element>} - Live page
 */

export default async function LivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, scope } = await requirePermission(Permissions.LiveRead)
  const perimeter = await scope()

  const live = await readLive(id, perimeter, session.id, session.permissions)

  // Panel of the creator at the level in force
  const [levels, state] = await Promise.all([listLevels(), readCurrentState(perimeter)])
  const creatorLevel = levelOfCreator(state, live.youtuber.id)?.level ?? levels[0] ?? null
  const inForce = creatorLevel?.id ?? null
  const panel = await readPanel(
    perimeter,
    live.youtuber.id,
    live.platform === LivePlatforms.Twitch ? SanctionPanels.Twitch : SanctionPanels.Youtube,
    inForce
  )

  // Rungs already applied
  const memberIds = live.members.map((member) => member.id)
  const [memory, focusable] = await Promise.all([
    readPanelMemory(live.id),
    focusableMembers(memberIds, session.role),
  ])
  const canEdit =
    live.permissions.includes(Permissions.LiveAnnounce) || live.coordinator?.id === session.id

  return (
    <div className={PAGE_STYLES.wrapper}>
      <h1 className={MODVIEW_PAGE.title}>{`${LIVE_COPY.title} · ${live.youtuber.name}`}</h1>
      <LiveGate live={live} canEdit={canEdit}>
        <LiveModView
          live={live}
          panel={panel}
          fallbackLevel={creatorLevel ? { name: creatorLevel.name, icon: creatorLevel.icon } : null}
          tools={{
            id: live.id,
            viewerId: session.id,
            members: live.members,
            focusable,
            initialMemory: memory,
          }}
        />
      </LiveGate>
    </div>
  )
}
