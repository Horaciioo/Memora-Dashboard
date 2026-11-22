'use client'

import type { CSSProperties } from 'react'

import { PlayEndRing } from '@/composites/play/results/end/PlayEndRing'
import { PlayXpBar } from '@/composites/play/results/xp/PlayXpBar'
import { PlayMedal } from '@/composites/play/shared/PlayMedal'
import { usePlayCountUp } from '@/core/hooks/interaction/state/play/usePlayCountUp'
import type { PlayEndSummary } from '@/core/lib/play/endStats'
import {
  fillPlayMessage,
  lobbySkinOf,
  PLAY_END_CAREER,
  PLAY_END_COPY,
  PLAY_END_LIMITS,
  PLAY_END_TIMING,
  PLAY_XP_COPY,
  PLAY_XP_PART_LABELS,
  PLAY_XP_TIMING,
} from '@/declarations/play'
import { PLAY_END_PAGE, PLAY_XP } from '@/declarations/ui/variants'
import type { PlayEndCareer, PlayRewardView } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'

export interface PlayEndMeProps {
  game: PlayGameName
  reward: PlayRewardView | null
  place: PlayEndSummary['place']
  career: PlayEndCareer | null
}

/**
 * The reader's own result: place, level ring and XP counting up, global ladder, tickets of the XP, career
 * @param {PlayEndMeProps} props - Game, XP, place and career
 * @return {JSX.Element | null}
 */

export const PlayEndMe = ({ game, reward, place, career }: PlayEndMeProps) => {
  const gained = usePlayCountUp(reward?.gained ?? 0, PLAY_END_TIMING.count, PLAY_END_TIMING.countMs)
  if (!place && !reward) return null
  const hasLeveled = (reward?.game.after.level ?? 0) > (reward?.game.before.level ?? 0)
  const label = place
    ? place.rank === 1
      ? PLAY_END_COPY.first
      : fillPlayMessage(PLAY_END_COPY.nth, { place: place.rank })
    : null
  const at = (step: number): CSSProperties => ({
    animationDelay: `${PLAY_END_TIMING.card + step * PLAY_XP_TIMING.boxStaggerMs}ms`,
  })
  const owned = career && career.played > 0 ? career : null

  return (
    <section
      className={cn(PLAY_END_PAGE.me, lobbySkinOf(game))}
      data-hud={game.toLowerCase()}
      style={at(0)}
      aria-label={PLAY_END_COPY.youFinish}
    >
      {place && label && (
        <div className={PLAY_END_PAGE.placeRow}>
          {place.rank <= PLAY_END_LIMITS.podium ? (
            <PlayMedal place={place.rank as 1 | 2 | 3} size="lg" />
          ) : (
            <span className={PLAY_END_PAGE.rankBadge}>{place.rank}</span>
          )}
          <div className={PLAY_END_PAGE.placeText}>
            <span className={PLAY_END_PAGE.kicker}>{PLAY_END_COPY.youFinish}</span>
            <span className={PLAY_END_PAGE.place}>
              {label}
              <small className={PLAY_END_PAGE.placeOf}>
                {fillPlayMessage(PLAY_END_COPY.ofTotal, { total: place.total })}
              </small>
            </span>
          </div>
        </div>
      )}

      {reward && (
        <>
          <div className={PLAY_END_PAGE.xpRow}>
            <PlayEndRing ladder={reward.game} caption={PLAY_XP_COPY.game} />
            <div className={PLAY_END_PAGE.xpHero}>
              <span className={PLAY_END_PAGE.kicker}>{PLAY_XP_COPY.title}</span>
              <span
                className={PLAY_END_PAGE.xpFigure}
                style={{ animationDelay: `${PLAY_END_TIMING.count + PLAY_END_TIMING.countMs}ms` }}
              >
                {fillPlayMessage(PLAY_XP_COPY.gain, { xp: gained })}
              </span>
              <span className={PLAY_END_PAGE.xpProgress}>
                {reward.game.after.needed
                  ? fillPlayMessage(PLAY_XP_COPY.progress, {
                      into: reward.game.after.into,
                      needed: reward.game.after.needed,
                    })
                  : PLAY_XP_COPY.maxed}
              </span>
              {hasLeveled && (
                <span className={PLAY_END_PAGE.levelUp} style={at(14)}>
                  {fillPlayMessage(PLAY_END_COPY.levelUp, { level: reward.game.after.level })}
                </span>
              )}
            </div>
          </div>
          <PlayXpBar
            title={PLAY_XP_COPY.global}
            ladder={reward.global}
            gained={reward.gained}
            boost={reward.questBoost}
          />
          {reward.parts.length > 0 && (
            <ul className={PLAY_END_PAGE.tickets}>
              {reward.parts.map((part, index) => (
                <li key={part.key} className={PLAY_END_PAGE.ticket} style={at(6 + index)}>
                  <span className={PLAY_XP.boxLabel}>{PLAY_XP_PART_LABELS[part.key]}</span>
                  <span className={cn(PLAY_XP.boxValue, part.xp < 0 && PLAY_XP.boxCut)}>
                    {fillPlayMessage(part.xp < 0 ? PLAY_XP_COPY.cut : PLAY_XP_COPY.gain, {
                      xp: part.xp,
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {owned && (
        <dl className={PLAY_END_PAGE.career} aria-label={PLAY_END_COPY.careerTitle}>
          {PLAY_END_CAREER.map(({ key, label: caption }, index) => (
            <div
              key={key}
              className={PLAY_END_PAGE.careerCell}
              style={{
                animationDelay: `${PLAY_END_TIMING.card + 2 * PLAY_XP_TIMING.boxStaggerMs + index * PLAY_END_TIMING.careerStep}ms`,
              }}
            >
              <dd className={PLAY_END_PAGE.careerValue}>
                {key === 'winRate'
                  ? fillPlayMessage(PLAY_END_COPY.percent, {
                      value: Math.round(owned.winRate * PLAY_END_LIMITS.percent),
                    })
                  : owned[key]}
              </dd>
              <dt className={PLAY_XP.boxLabel}>{caption}</dt>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
