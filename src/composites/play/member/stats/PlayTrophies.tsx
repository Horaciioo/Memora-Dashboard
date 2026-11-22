'use client'

import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayTrophyCard } from '@/composites/play/member/stats/PlayTrophyCard'
import { PlayTrophyPlatinum } from '@/composites/play/member/stats/PlayTrophyPlatinum'
import { trophiesOf } from '@/core/lib/play'
import { useTrophyPinning } from '@/core/hooks/data/play/useTrophyPinning'
import {
  fillPlayMessage,
  PLAY_HEAD_COPY,
  PLAY_RARITIES,
  PLAY_TROPHY_SHELVES,
} from '@/declarations/play'
import { PLAY_SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayProfileView } from '@/types/play'

export interface PlayTrophiesProps {
  games: PlayProfileView['games']
  // Day each trophy was won
  wonAt: PlayProfileView['wonAt']
  // Percent of players who won each trophy
  rarity?: Record<string, number>
  pins: string[]
  // The reader owns this showcase and can pin
  canPin?: boolean
}

/**
 * Collection: platinum over the trophies, then one shelf per theme and per game
 * @param {PlayTrophiesProps} props - Stats, days, rarity and pins
 * @return {JSX.Element}
 */

export const PlayTrophies = ({ games, wonAt, pins, canPin = false }: PlayTrophiesProps) => {
  const pinOf = useTrophyPinning(pins, canPin)
  const trophies = trophiesOf(games)
  const won = trophies.filter((trophy) => trophy.reached).length

  return (
    <div className={PLAY_SHOWCASE.sections}>
      <PlayTrophyPlatinum won={won} total={trophies.length} />
      <div className={PLAY_SHOWCASE.boxes}>
        {PLAY_TROPHY_SHELVES.map(({ key, label, game }) => {
          const group = trophies
            .filter((trophy) => trophy.category === key)
            .sort((a, b) => PLAY_RARITIES.indexOf(a.rarity) - PLAY_RARITIES.indexOf(b.rarity))
          if (group.length === 0) return null

          const count = group.filter((trophy) => trophy.reached).length

          return (
            <section key={key} className={PLAY_SHOWCASE.section}>
              <h3 className={PLAY_SHOWCASE.sectionHead}>
                {game && <PlayGameLogo game={game} className={PLAY_SHOWCASE.sectionIcon} />}
                <span className={PLAY_SHOWCASE.sectionName}>{label}</span>
                <span className={PLAY_SHOWCASE.sectionRule} aria-hidden="true" />
                <span
                  className={cn(
                    PLAY_SHOWCASE.sectionMeta,
                    count === group.length && PLAY_SHOWCASE.sectionMetaDone
                  )}
                >
                  {fillPlayMessage(PLAY_HEAD_COPY.rarityCount, { won: count, total: group.length })}
                </span>
              </h3>
              <ul className={PLAY_SHOWCASE.grid}>
                {group.map((trophy) => (
                  <PlayTrophyCard
                    key={trophy.key}
                    trophy={trophy}
                    wonAt={wonAt[trophy.key]}
                    pin={pinOf(trophy.key, trophy.reached)}
                  />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
