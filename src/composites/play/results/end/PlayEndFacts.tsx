'use client'

import type { CSSProperties } from 'react'
import { useEffect } from 'react'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { usePlayCelebrationStore } from '@/core/store/play/playCelebration'
import type { PlayEndStat, PlayEndTrophy } from '@/types/play'
import {
  fillPlayMessage,
  lobbySkinOf,
  PLAY_CELEBRATION,
  PLAY_END_COPY,
  PLAY_END_LIMITS,
  PLAY_END_TIMING,
  PLAY_HEAD_COPY,
} from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_END_PAGE, PLAY_SHOWCASE } from '@/declarations/ui/variants'
import type { PlayEndAward } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayEndFactsProps {
  game: PlayGameName
  stats: PlayEndStat[]
  awards: PlayEndAward[]
  trophies: PlayEndTrophy[]
}

/**
 * Right column: titles won on the counters of the game, then the figures of the table
 * @param {PlayEndFactsProps} props - Game, figures and titles
 * @return {JSX.Element | null}
 */

export const PlayEndFacts = ({ game, stats, awards, trophies }: PlayEndFactsProps) => {
  const fire = usePlayCelebrationStore((state) => state.fire)

  // Each trophy is cheered once its card is up
  useEffect(() => {
    const timers = trophies
      .slice(0, PLAY_END_LIMITS.trophies)
      .map(({ label, goal, icon, rarity }, index) =>
        window.setTimeout(
          () => fire({ kind: 'trophy', label, goal, icon, rarity }),
          PLAY_CELEBRATION.trophyDelayMs + index * PLAY_CELEBRATION.trophyStepMs
        )
      )

    return () => timers.forEach(window.clearTimeout)
  }, [trophies, fire])

  if (stats.length === 0 && awards.length === 0 && trophies.length === 0) return null
  const skin = cn(PLAY_END_PAGE.facts, lobbySkinOf(game))
  const at = (step: number): CSSProperties => ({
    animationDelay: `${PLAY_END_TIMING.card + step * PLAY_END_TIMING.cardStep}ms`,
  })

  return (
    <div className={PLAY_END_PAGE.rail} data-hud={game.toLowerCase()}>
      {trophies.length > 0 && (
        <section className={skin} style={at(0)} aria-label={PLAY_END_COPY.trophiesTitle}>
          <h3 className={PLAY_END_PAGE.kicker}>
            {trophies.length > 1
              ? fillPlayMessage(PLAY_END_COPY.trophiesMany, { count: trophies.length })
              : PLAY_END_COPY.trophiesTitle}
          </h3>
          <ul className={PLAY_END_PAGE.awards}>
            {trophies.slice(0, PLAY_END_LIMITS.trophies).map((trophy, index) => {
              const Icon = ICONS[trophy.icon]

              return (
                <li
                  key={trophy.key}
                  className={cn(PLAY_END_PAGE.trophy, PLAY_SHOWCASE[trophy.rarity])}
                  style={{
                    animationDelay: `${PLAY_END_TIMING.card + (index + 1) * PLAY_END_TIMING.awardStep}ms`,
                  }}
                >
                  <span className={PLAY_END_PAGE.trophyIcon}>
                    <Icon className={PLAY_END_PAGE.trophyGlyph} aria-hidden="true" />
                  </span>
                  <div className={PLAY_END_PAGE.awardText}>
                    <span className={PLAY_END_PAGE.awardName}>{trophy.label}</span>
                    <span className={PLAY_END_PAGE.awardLabel}>{trophy.goal}</span>
                  </div>
                  <span className={PLAY_END_PAGE.trophyLevels}>
                    {fillPlayMessage(
                      trophy.levels > 1 ? PLAY_HEAD_COPY.levelsMany : PLAY_HEAD_COPY.levelsOne,
                      { levels: trophy.levels }
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {awards.length > 0 && (
        <section className={skin} style={at(1)} aria-label={PLAY_END_COPY.awardsTitle}>
          <h3 className={PLAY_END_PAGE.kicker}>{PLAY_END_COPY.awardsTitle}</h3>
          <ul className={PLAY_END_PAGE.awards}>
            {awards.map((award, index) => (
              <li
                key={award.key}
                className={cn(PLAY_END_PAGE.award, award.isMe && PLAY_END_PAGE.awardMine)}
                style={{
                  animationDelay: `${PLAY_END_TIMING.card + (index + 2) * PLAY_END_TIMING.awardStep}ms`,
                }}
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
                    animationDelay: `${PLAY_END_TIMING.card + 2 * PLAY_END_TIMING.cardStep + (index + 1) * PLAY_END_TIMING.tileStep}ms`,
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
