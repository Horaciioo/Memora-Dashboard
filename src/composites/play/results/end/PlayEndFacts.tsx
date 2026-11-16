import type { CSSProperties } from 'react'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import type { PlayEndStat } from '@/types/play'
import { lobbySkinOf, PLAY_END_COPY, PLAY_END_TIMING } from '@/declarations/play'
import { PLAY_END_PAGE } from '@/declarations/ui/variants'
import type { PlayEndAward } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayEndFactsProps {
  game: PlayGameName
  stats: PlayEndStat[]
  awards: PlayEndAward[]
}

/**
 * Right column: titles won on the counters of the game, then the figures of the table
 * @param {PlayEndFactsProps} props - Game, figures and titles
 * @return {JSX.Element | null}
 */

export const PlayEndFacts = ({ game, stats, awards }: PlayEndFactsProps) => {
  if (stats.length === 0 && awards.length === 0) return null
  const skin = cn(PLAY_END_PAGE.facts, lobbySkinOf(game))
  const at = (step: number): CSSProperties => ({
    animationDelay: `${PLAY_END_TIMING.card + step * PLAY_END_TIMING.cardStep}ms`,
  })

  return (
    <div className={PLAY_END_PAGE.rail} data-hud={game.toLowerCase()}>
      {awards.length > 0 && (
        <section className={skin} style={at(1)} aria-label={PLAY_END_COPY.awardsTitle}>
          <h3 className={PLAY_END_PAGE.kicker}>{PLAY_END_COPY.awardsTitle}</h3>
          <ul className={PLAY_END_PAGE.awards}>
            {awards.map((award, index) => (
              <li
                key={award.key}
                className={cn(PLAY_END_PAGE.award, award.isMe && PLAY_END_PAGE.awardMine)}
                style={{ animationDelay: `${PLAY_END_TIMING.card + (index + 2) * 380}ms` }}
              >
                <PlayAvatar
                  accountId={award.accountId}
                  name={award.name}
                  src={award.avatarUrl}
                  size="md"
                />
                <div className={PLAY_END_PAGE.awardText}>
                  <span className={PLAY_END_PAGE.awardLabel}>{award.label}</span>
                  <span className={PLAY_END_PAGE.awardName}>
                    {award.isMe ? PLAY_END_COPY.itsYou : award.name}
                  </span>
                </div>
                <span className={PLAY_END_PAGE.awardValue}>{award.value}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {stats.length > 0 && (
        <section className={skin} style={at(2)} aria-label={PLAY_END_COPY.tableTitle}>
          <h3 className={PLAY_END_PAGE.kicker}>{PLAY_END_COPY.tableTitle}</h3>
          <dl className={PLAY_END_PAGE.tiles}>
            {stats.map(({ key, label, value }, index) => (
              <div
                key={key}
                className={PLAY_END_PAGE.tile}
                style={
                  {
                    animationDelay: `${PLAY_END_TIMING.card + 2 * PLAY_END_TIMING.cardStep + (index + 1) * 140}ms`,
                  } as CSSProperties
                }
              >
                <dd className={PLAY_END_PAGE.tileValue}>{value}</dd>
                <dt className={PLAY_END_PAGE.tileLabel}>{label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}
