'use client'

import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
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

export interface GolfVotePlayer {
  name: string
  avatarUrl: string | null
}

export interface GolfVoteDeckProps {
  cards: GolfVoteCard[]
  value: string
  player?: GolfVotePlayer
  // Cards on their way out
  isLeaving: boolean
  // White frame on the picture, name on a green strip
  isCourse?: boolean
  onPick: (key: string) => void
  onConfirm: () => void
}

/**
 * Row of cards on a dark band, the player's avatar hopping onto the picked one
 * @param {GolfVoteDeckProps} props - Cards and picks
 * @return {JSX.Element}
 */

export const GolfVoteDeck = ({
  cards,
  value,
  player,
  isLeaving,
  isCourse = false,
  onPick,
  onConfirm,
}: GolfVoteDeckProps) => {
  const index = Math.max(
    0,
    cards.findIndex((card) => card.key === value)
  )
  // Cards between the old pick and the new one
  const [seen, setSeen] = useState(index)
  const [hops, setHops] = useState(0)
  if (seen !== index) {
    setSeen(index)
    setHops(seen - index)
  }

  return (
    <div className={GOLF_VOTE.deck}>
      <span className={GOLF_VOTE.band} />
      <div className={cn(GOLF_VOTE.row, isLeaving && 'golf-vote-leave')} role="radiogroup">
        {cards.map((card, position) => {
          const isOn = card.key === value

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
              onClick={() => (isOn ? onConfirm() : onPick(card.key))}
            >
              {isOn && player && (
                <span className={GOLF_VOTE.avatarBox}>
                  <span className="golf-vote-slide" style={{ '--hops': hops } as CSSProperties}>
                    <span className="golf-vote-arc">
                      <span className="golf-vote-float block">
                        <Avatar
                          name={player.name}
                          src={player.avatarUrl}
                          size="lg"
                          className={GOLF_VOTE.avatarRing}
                        />
                      </span>
                    </span>
                  </span>
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
