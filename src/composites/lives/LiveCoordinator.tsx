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

  return person ? (
    <div className={LIVE_BOARD.coordinator}>
      <span className={LIVE_BOARD.coordinatorPortrait}>
        <Avatar name={person.name} src={person.avatar} size="md" />
        <span className={LIVE_BOARD.coordinatorBadge}>
          <Icon className={LIVE_BOARD.coordinatorGlyph} />
        </span>
      </span>
      <div className={LIVE_BOARD.fact}>
        <span className={LIVE_BOARD.factLabel}>{LIVE_COPY.coordinator}</span>
        <p className={LIVE_BOARD.coordinatorName}>{person.name}</p>
      </div>
    </div>
  ) : (
    <div className={LIVE_BOARD.fact}>
      <span className={LIVE_BOARD.factLabel}>{LIVE_COPY.coordinator}</span>
      <p className={LIVE_BOARD.coordinatorEmpty}>{LIVE_COPY.noCoordinator}</p>
    </div>
  )
}
