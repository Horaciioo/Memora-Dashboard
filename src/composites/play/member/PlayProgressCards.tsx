import type { ReactNode } from 'react'

import { PlayRecord } from '@/composites/play/member/PlayRecord'
import { fillPlayMessage, PLAY_GAMES } from '@/declarations/play'
import { PLAY_ADMIN_TARGETS, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import { PLAY_MEMBER } from '@/declarations/ui/variants'
import type { PlayProfileView, PlayTotalsView } from '@/types/play'
import { cn } from '@/utils/classnames'

export interface PlayProgressCardsProps {
  state: PlayProfileView
  // Read-only without it
  onSelect?: (target: string) => void
}

/**
 * Card, a button when it opens gestures
 * @param {Object} props - Card
 * @return {JSX.Element}
 */

const Card = ({
  className,
  onSelect,
  children,
}: {
  className: string
  onSelect?: () => void
  children: ReactNode
}) =>
  onSelect ? (
    <button
      type="button"
      className={cn(className, PLAY_MEMBER.clickable)}
      title={PLAY_MEMBER_COPY.editHint}
      onClick={onSelect}
    >
      {children}
    </button>
  ) : (
    <div className={className}>{children}</div>
  )

/**
 * Level bar and its caption
 * @param {Object} props - Totals
 * @param {PlayTotalsView} props.totals - Totals
 * @return {JSX.Element}
 */

const LevelBar = ({ totals }: { totals: PlayTotalsView }) => {
  const { level, into, needed } = totals.level
  const share = needed ? Math.min(100, (into / needed) * 100) : 100

  return (
    <div className="flex flex-col gap-1">
      <div className={PLAY_MEMBER.track}>
        <div className={PLAY_MEMBER.fill} style={{ width: `${share}%` }} />
      </div>
      <span className={PLAY_MEMBER.caption}>
        {needed
          ? fillPlayMessage(PLAY_MEMBER_COPY.toNext, { into, needed, next: level + 1 })
          : PLAY_MEMBER_COPY.maxed}
      </span>
    </div>
  )
}

/**
 * Win rate and streak line
 * @param {Object} props - Totals
 * @param {PlayTotalsView} props.totals - Totals
 * @return {JSX.Element | null}
 */

const Facts = ({ totals }: { totals: PlayTotalsView }) =>
  totals.played > 0 ? (
    <span className={PLAY_MEMBER.facts}>
      <span>
        {fillPlayMessage(PLAY_MEMBER_COPY.winRate, {
          rate: Math.round((totals.winRate ?? 0) * 100),
        })}
      </span>
      {Boolean(totals.streak) && (
        <span>{fillPlayMessage(PLAY_MEMBER_COPY.streak, { streak: totals.streak ?? 0 })}</span>
      )}
    </span>
  ) : null

/**
 * Global then per game progression, each card opening its gestures
 * @param {PlayProgressCardsProps} props - State and handler
 * @return {JSX.Element}
 */

export const PlayProgressCards = ({ state, onSelect }: PlayProgressCardsProps) => {
  const { global } = state
  const games = state.games.filter((entry) => PLAY_GAMES.has(entry.game))

  return (
    <div className={PLAY_MEMBER.cards}>
      <Card
        className={PLAY_MEMBER.hero}
        onSelect={onSelect && (() => onSelect(PLAY_ADMIN_TARGETS.global))}
      >
        <span className={PLAY_MEMBER.head}>
          <span className={PLAY_MEMBER.label}>{PLAY_MEMBER_COPY.global}</span>
          <span className={PLAY_MEMBER.xp}>
            {fillPlayMessage(PLAY_MEMBER_COPY.xp, { xp: global.xp })}
          </span>
        </span>
        <span className={PLAY_MEMBER.heroLevel}>
          {fillPlayMessage(PLAY_MEMBER_COPY.level, { level: global.level.level })}
        </span>
        <LevelBar totals={global} />
        <span className={PLAY_MEMBER.head}>
          <PlayRecord {...global} />
          {global.bonusXp !== 0 && (
            <span className={PLAY_MEMBER.caption}>
              {fillPlayMessage(PLAY_MEMBER_COPY.bonus, { xp: global.bonusXp })}
            </span>
          )}
        </span>
      </Card>

      <div className={PLAY_MEMBER.grid}>
        {games.map((entry) => {
          const isSoon = !PLAY_GAMES.get(entry.game).playable && entry.played === 0

          return (
            <Card
              key={entry.game}
              className={cn(PLAY_MEMBER.card, isSoon && PLAY_MEMBER.off)}
              onSelect={onSelect && (() => onSelect(entry.game))}
            >
              <span className={PLAY_MEMBER.head}>
                <span className={PLAY_MEMBER.label}>{PLAY_GAMES.label(entry.game)}</span>
                <span className={PLAY_MEMBER.level}>
                  {fillPlayMessage(PLAY_MEMBER_COPY.level, { level: entry.level.level })}
                </span>
              </span>
              <LevelBar totals={entry} />
              <span className={PLAY_MEMBER.head}>
                {isSoon ? (
                  <span className={PLAY_MEMBER.caption}>{PLAY_MEMBER_COPY.soon}</span>
                ) : (
                  <PlayRecord {...entry} />
                )}
                <span className={PLAY_MEMBER.xp}>
                  {fillPlayMessage(PLAY_MEMBER_COPY.xp, { xp: entry.xp })}
                </span>
              </span>
              <Facts totals={entry} />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
