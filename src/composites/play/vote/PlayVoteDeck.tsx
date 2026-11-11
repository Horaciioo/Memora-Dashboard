'use client'

import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { PlayVoteAvatar } from '@/composites/play/vote/PlayVoteAvatar'
import type { PlayVoter } from '@/composites/play/vote/PlayVoteAvatar'
import { GOLF_VOTE } from '@/declarations/ui/variants'
import type { VoteLook } from '@/declarations/ui/variants/games/golf'
import { cn } from '@/utils/classnames'

/**
 * One card to vote for
 * @typedef {Object} PlayVoteCard
 */

export interface PlayVoteCard {
  key: string
  label: string
  // Picture of the card
  face: ReactNode
}

export interface PlayVoteDeckProps {
  cards: PlayVoteCard[]
  value: string
  voters: PlayVoter[]
  // White frame on the picture, name on a green strip
  isCourse?: boolean
  // Classes of the screen, Golf's by default
  look?: VoteLook
  onPick: (key: string) => void
}

/**
 * Row of cards on a dark band, each voter's avatar hopping onto the card picked, the leading card framed
 * @param {PlayVoteDeckProps} props - Cards and picks
 * @return {JSX.Element}
 */

export const PlayVoteDeck = ({
  cards,
  value,
  voters,
  isCourse = false,
  look = GOLF_VOTE,
  onPick,
}: PlayVoteDeckProps) => {
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
    <div className={look.deck}>
      <span className={look.band} />
      <div className={look.row} role="radiogroup">
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
              className={look.card}
              data-picked={isOn}
              style={{ '--i': position } as CSSProperties}
              onClick={() => onPick(card.key)}
            >
              {here.length > 0 && (
                <span className={look.avatarBox}>
                  {here.map((voter) => (
                    <PlayVoteAvatar
                      key={voter.id}
                      voter={voter}
                      hops={hops[voter.id] ?? 0}
                      look={look}
                    />
                  ))}
                </span>
              )}
              <span className={cn(look.face, isOn && look.faceOn, isCourse && look.faceFramed)}>
                {card.face}
              </span>
              <span className={isCourse ? look.strip : look.label}>{card.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
