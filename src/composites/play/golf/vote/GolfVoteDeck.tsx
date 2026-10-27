'use client'

import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { GolfVoteAvatar } from '@/composites/play/golf/vote/GolfVoteAvatar'
import type { GolfVoter } from '@/composites/play/golf/vote/GolfVoteAvatar'
import { GOLF_VOTE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * One card to vote for
 * @typedef {Object} GolfVoteCard
 */

export interface GolfVoteCard {
  key: string
  label: string
  // Picture of the card
  face: ReactNode
}

export interface GolfVoteDeckProps {
  cards: GolfVoteCard[]
  value: string
  voters: GolfVoter[]
  // White frame on the picture, name on a green strip
  isCourse?: boolean
  onPick: (key: string) => void
}

/**
 * Row of cards on a dark band, each voter's avatar hopping onto the card picked, the leading card framed
 * @param {GolfVoteDeckProps} props - Cards and picks
 * @return {JSX.Element}
 */

export const GolfVoteDeck = ({
  cards,
  value,
  voters,
  isCourse = false,
  onPick,
}: GolfVoteDeckProps) => {
  const positions = Object.fromEntries(
    voters.map((voter) => [voter.id, cards.findIndex((card) => card.key === voter.key)])
  )
  // Cards crossed by each voter since the last pick
  const [seen, setSeen] = useState(positions)
  const [hops, setHops] = useState<Record<string, number>>({})
  const moved = voters.filter((voter) => seen[voter.id] !== positions[voter.id])
  if (moved.length) {
    setSeen(positions)
    setHops((known) => ({
      ...known,
      ...Object.fromEntries(
        moved.map((voter) => [
          voter.id,
          (seen[voter.id] ?? positions[voter.id]) - positions[voter.id],
        ])
      ),
    }))
  }

  return (
    <div className={GOLF_VOTE.deck}>
      <span className={GOLF_VOTE.band} />
      <div className={GOLF_VOTE.row} role="radiogroup">
        {cards.map((card, position) => {
          const isOn = card.key === value
          const here = voters.filter((voter) => voter.key === card.key)

          return (
            <button
              key={card.key}
              type="button"
              role="radio"
              aria-checked={isOn}
              aria-label={card.label}
              className={GOLF_VOTE.card}
              data-picked={isOn}
              style={{ '--i': position } as CSSProperties}
              onClick={() => onPick(card.key)}
            >
              {here.length > 0 && (
                <span className={GOLF_VOTE.avatarBox}>
                  {here.map((voter) => (
                    <GolfVoteAvatar key={voter.id} voter={voter} hops={hops[voter.id] ?? 0} />
                  ))}
                </span>
              )}
              <span
                className={cn(
                  GOLF_VOTE.face,
                  isOn && GOLF_VOTE.faceOn,
                  isCourse && GOLF_VOTE.faceFramed
                )}
              >
                {card.face}
              </span>
              <span className={isCourse ? GOLF_VOTE.strip : GOLF_VOTE.label}>{card.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
