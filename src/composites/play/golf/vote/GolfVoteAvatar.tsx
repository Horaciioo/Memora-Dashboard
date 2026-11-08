import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { GOLF_VOTE } from '@/declarations/ui/variants'
import type { VoteLook } from '@/declarations/ui/variants/games/golf'

// Hops above which a jump stops climbing higher
const MAX_LIFT = 4

export interface GolfVoter {
  id: string
  name: string
  avatarUrl: string | null
  // Card voted for
  key: string
}

/**
 * Avatar of a voter, arcing from its old card to the new one
 * @param {Object} props - Voter and distance
 * @param {GolfVoter} props.voter - Who voted
 * @param {number} props.hops - Cards crossed, signed
 * @param {VoteLook} [props.look] - Screen classes
 * @return {JSX.Element}
 */

export const GolfVoteAvatar = ({
  voter,
  hops,
  look = GOLF_VOTE,
}: {
  voter: GolfVoter
  hops: number
  look?: VoteLook
}) => (
  <span className="golf-vote-slide" style={{ '--hops': hops } as CSSProperties}>
    <span
      className="golf-vote-arc"
      style={{ '--lift': Math.min(Math.abs(hops), MAX_LIFT) } as CSSProperties}
    >
      <span className="golf-vote-float block">
        <Avatar name={voter.name} src={voter.avatarUrl} size="md" className={look.avatarRing} />
      </span>
    </span>
  </span>
)
