import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { levelShare } from '@/core/lib/play'
import { fillPlayMessage, PLAY_GAMES } from '@/declarations/play'
import { PLAY_ADMIN_TARGETS, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import type { PlayProfileView, PlayTotalsView } from '@/types/play'
import { cn } from '@/utils/classnames'

export interface PlayAdminProgressProps {
  state: PlayProfileView
  onSelect: (target: string) => void
}

// Wins, draws, losses in their colours
const PARTS = [
  { key: 'wins', tone: PLAY_ADMIN.win, unit: PLAY_MEMBER_COPY.wins },
  { key: 'draws', tone: PLAY_ADMIN.draw, unit: PLAY_MEMBER_COPY.draws },
  { key: 'losses', tone: PLAY_ADMIN.loss, unit: PLAY_MEMBER_COPY.losses },
] as const

/**
 * One line of progression: name, level, bar, record, XP, opening its gestures
 * @param {Object} props - Line
 * @return {JSX.Element}
 */

const Row = ({
  name,
  game,
  totals,
  note,
  isOff,
  onSelect,
}: {
  name: string
  game?: PlayProgressGame
  totals: PlayTotalsView
  note?: string
  isOff?: boolean
  onSelect: () => void
}) => {
  const { level } = totals.level
  const share = levelShare(totals.level)

  return (
    <button
      type="button"
      title={PLAY_MEMBER_COPY.editHint}
      onClick={onSelect}
      className={cn(PLAY_ADMIN.progressRow, isOff && PLAY_ADMIN.progressOff)}
    >
      <span className={PLAY_ADMIN.progressHead}>
        {game && <PlayGameLogo game={game} className={PLAY_ADMIN.progressLogo} />}
        <span className={PLAY_ADMIN.progressName}>{name}</span>
        <span className={PLAY_ADMIN.progressLevel}>
          {fillPlayMessage(PLAY_MEMBER_COPY.level, { level })}
        </span>
      </span>
      <span className={PLAY_ADMIN.progressTrack}>
        <span
          className={PLAY_ADMIN.progressFill}
          style={{ width: `${share}%`, display: 'block' }}
        />
      </span>
      <span className={PLAY_ADMIN.progressFoot}>
        {isOff ? (
          <span>{PLAY_MEMBER_COPY.soon}</span>
        ) : (
          <span className={PLAY_ADMIN.record}>
            {PARTS.map((part) => (
              <span key={part.key}>
                <span className={part.tone}>{totals[part.key]}</span> {part.unit}
              </span>
            ))}
          </span>
        )}
        <span>{note ?? fillPlayMessage(PLAY_MEMBER_COPY.xp, { xp: totals.xp })}</span>
      </span>
    </button>
  )
}

type PlayProgressGame = PlayProfileView['games'][number]['game']

/**
 * Global then per game progression, each line opening its gestures
 * @param {PlayAdminProgressProps} props - State and handler
 * @return {JSX.Element}
 */

export const PlayAdminProgress = ({ state, onSelect }: PlayAdminProgressProps) => {
  const { global } = state
  const games = state.games.filter((entry) => PLAY_GAMES.has(entry.game))

  return (
    <div className={PLAY_ADMIN.progress}>
      <Row
        name={PLAY_MEMBER_COPY.global}
        totals={global}
        note={
          global.bonusXp !== 0
            ? fillPlayMessage(PLAY_MEMBER_COPY.bonus, { xp: global.bonusXp })
            : undefined
        }
        onSelect={() => onSelect(PLAY_ADMIN_TARGETS.global)}
      />
      {games.map((entry) => (
        <Row
          key={entry.game}
          game={entry.game}
          name={PLAY_GAMES.label(entry.game)}
          totals={entry}
          isOff={!PLAY_GAMES.get(entry.game).playable && entry.played === 0}
          onSelect={() => onSelect(entry.game)}
        />
      ))}
    </div>
  )
}
