import type { CSSProperties } from 'react'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { StopGoLamp } from '@/composites/play/stopgo/art/StopGoLamp'
import type { StopGoLight } from '@/composites/play/stopgo/cards/lights'
import { STOPGO_CARD_COPY, STOPGO_HAND_COPY } from '@/declarations/play/stopgo/copy'
import { STOPGO_HAND } from '@/declarations/ui/variants/games/play/stopgo'
import type { StopGoHazard } from '@/declarations/play/stopgo/cards'

// Spoken name of the lamp
const LIGHT_COPY = {
  green: STOPGO_HAND_COPY.lightGreen,
  red: STOPGO_HAND_COPY.lightRed,
  broken: STOPGO_HAND_COPY.lightBroken,
} as const

export interface StopGoRosterEntry {
  id: string
  name: string
  avatar: string | null
  color: string
  light: StopGoLight
  hazards: StopGoHazard[]
}

export interface StopGoRosterProps {
  entries: StopGoRosterEntry[]
  viewerId: string
  turnId: string | null
}

/**
 * Right column: one row per driver, face, light and malus in play
 * @param {StopGoRosterProps} props - Drivers
 * @return {JSX.Element}
 */

export const StopGoRoster = ({ entries, viewerId, turnId }: StopGoRosterProps) => (
  <ul className={STOPGO_HAND.roster}>
    {entries.map((entry) => (
      <li
        key={entry.id}
        className={STOPGO_HAND.rosterRow}
        data-mine={entry.id === viewerId || undefined}
        data-turn={entry.id === turnId || undefined}
        style={{ '--car': `var(--stopgo-car-${entry.color})` } as CSSProperties}
      >
        <PlayAvatar accountId={entry.id} name={entry.name} src={entry.avatar} size="md" />
        <span
          className={STOPGO_HAND.light}
          data-light={entry.light}
          role="img"
          aria-label={LIGHT_COPY[entry.light]}
        >
          <StopGoLamp light={entry.light} />
        </span>
        <small
          className={STOPGO_HAND.rosterMalus}
          data-empty={entry.hazards.length === 0 || undefined}
        >
          {entry.hazards.length > 0
            ? entry.hazards.map((hazard) => STOPGO_CARD_COPY[hazard].name).join(', ')
            : STOPGO_HAND_COPY.noMalus}
        </small>
      </li>
    ))}
  </ul>
)
