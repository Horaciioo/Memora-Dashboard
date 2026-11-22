import { fillPlayMessage, PLAY_ACTIVITY_COPY, PLAY_GAMES, PLAY_TROPHIES } from '@/declarations/play'
import { PLAY_QUEST_BONUS_KEY } from '@/declarations/play/quests'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { PLAY_ACTIVITY } from '@/declarations/ui/variants'
import type { PlayActivityView } from '@/types/play'
import { cn } from '@/utils/classnames'
import { formatSince } from '@/utils/format/time/dates'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Sentence and glyph of one event
 * @param {PlayActivityView} entry - Event
 * @return {{ icon: IconName; text: string }} - Row content
 */

const describe = (entry: PlayActivityView): { icon: IconName; text: string } => {
  const copy = PLAY_ACTIVITY_COPY
  const xp = entry.xp

  if (entry.kind === 'LEVEL')
    return { icon: 'playStar', text: fillPlayMessage(copy.level, { level: entry.level ?? 0 }) }

  if (entry.kind === 'TROPHY')
    return {
      icon: 'playTrophy',
      text: fillPlayMessage(copy.trophy, {
        trophy: PLAY_TROPHIES.find((trophy) => trophy.key === entry.ref)?.label ?? '',
        xp,
      }),
    }

  if (entry.kind === 'QUEST') {
    const quest =
      entry.ref === PLAY_QUEST_BONUS_KEY
        ? copy.questBonus
        : entry.ref === 'main'
          ? copy.questMain
          : copy.questSide

    return { icon: 'check', text: fillPlayMessage(copy.quest, { quest, xp }) }
  }

  return {
    icon: 'playFeed',
    text: fillPlayMessage(copy.xp, {
      xp,
      game: entry.ref ? PLAY_GAMES.label(entry.ref as PlayGameName) : '',
    }),
  }
}

/**
 * One row of the bell
 * @param {Object} props - Row
 * @param {PlayActivityView} props.entry - Event
 * @return {JSX.Element}
 */

export const PlayActivityLine = ({ entry }: { entry: PlayActivityView }) => {
  const { icon, text } = describe(entry)
  const Icon = ICONS[icon]

  return (
    <li className={cn(PLAY_ACTIVITY.row, !entry.isRead && PLAY_ACTIVITY.rowNew)}>
      <span className={PLAY_ACTIVITY.glyph}>
        <Icon className={PLAY_ACTIVITY.glyphIcon} aria-hidden="true" />
      </span>
      <span className={PLAY_ACTIVITY.text}>
        <span className={PLAY_ACTIVITY.line}>{text}</span>
        <span className={PLAY_ACTIVITY.note}>{formatSince(entry.createdAt)}</span>
      </span>
    </li>
  )
}
