import { Avatar } from '@/components/elements/display/Avatar'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { LIVE_COORDINATOR } from '@/declarations/lives/registries'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_BOARD } from '@/declarations/ui/variants'
import type { LivePerson } from '@/types/lives'

export interface LiveCoordinatorProps {
  person: LivePerson | null
}

/**
 * Coordinator portrait and name
 * @param {LivePerson | null} person - Coordinator
 * @return {JSX.Element}
 */

export const LiveCoordinator = ({ person }: LiveCoordinatorProps) => {
  const Icon = ICONS[LIVE_COORDINATOR.icon]

  return (
    <div className={LIVE_BOARD.panel}>
      <span className={LIVE_BOARD.panelLabel}>{LIVE_COPY.coordinator}</span>
      {person ? (
        <div className={LIVE_BOARD.coordinator}>
          <span className={LIVE_BOARD.coordinatorPortrait}>
            <Avatar name={person.name} src={person.avatar} size="lg" />
            <span className={LIVE_BOARD.coordinatorBadge}>
              <Icon className={LIVE_BOARD.coordinatorGlyph} />
            </span>
          </span>
          <p className={LIVE_BOARD.coordinatorName}>{person.name}</p>
        </div>
      ) : (
        <p className={LIVE_BOARD.coordinatorEmpty}>{LIVE_COPY.noCoordinator}</p>
      )}
    </div>
  )
}
