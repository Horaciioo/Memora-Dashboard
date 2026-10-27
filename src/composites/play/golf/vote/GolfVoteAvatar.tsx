import type { CSSProperties } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { GOLF_VOTE } from '@/declarations/ui/variants'

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
 * @return {JSX.Element}
 */

export const GolfVoteAvatar = ({ voter, hops }: { voter: GolfVoter; hops: number }) => (
  <span className="golf-vote-slide" style={{ '--hops': hops } as CSSProperties}>
    <span
      className="golf-vote-arc"
      style={{ '--lift': Math.min(Math.abs(hops), MAX_LIFT) } as CSSProperties}
    >
      <span className="golf-vote-float block">
        <Avatar
          name={voter.name}
          src={voter.avatarUrl}
          size="md"
          className={GOLF_VOTE.avatarRing}
        />
      </span>
    </span>
  </span>
)
