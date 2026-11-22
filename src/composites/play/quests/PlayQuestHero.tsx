import { PlayQuestClaim } from '@/composites/play/quests/PlayQuestClaim'
import type { QuestBoard } from '@/core/services/play'
import { fillPlayMessage } from '@/declarations/play/copy'
import { PLAY_QUEST_BONUS_KEY, PLAY_QUEST_COPY, PLAY_QUEST_RULES } from '@/declarations/play/quests'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_QUESTS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Initial of a weekday
const weekday = (day: string): string =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'narrow', timeZone: 'UTC' })

/**
 * Streak with its week track and the chest of the day, first thing on the page
 * @param {Object} props - Board
 * @param {QuestBoard} props.board - Quests of the day
 * @return {JSX.Element}
 */

export const PlayQuestHero = ({ board }: { board: QuestBoard }) => {
  const Tick = ICONS.playTick
  const { streak, bonus } = board
  const isReady = bonus.done >= bonus.total && !bonus.isClaimed
  const note = !streak
    ? PLAY_QUEST_COPY.streakNone
    : board.isTodayPlayed
      ? PLAY_QUEST_COPY.streakSafe
      : PLAY_QUEST_COPY.streakKeep

  return (
    <section className={PLAY_QUESTS.hero} aria-label={PLAY_QUEST_COPY.streakTitle}>
      <div className={PLAY_QUESTS.streak}>
        <div className={PLAY_QUESTS.streakTop}>
          <div className={PLAY_QUESTS.streakHead}>
            <span className={PLAY_QUESTS.streakValue}>{streak}</span>
            <div>
              <p className={PLAY_QUESTS.streakLabel}>
                {streak > 1 ? PLAY_QUEST_COPY.streakDays : PLAY_QUEST_COPY.streakDay}
              </p>
              <p className={PLAY_QUESTS.streakBonus}>
                {streak
                  ? fillPlayMessage(PLAY_QUEST_COPY.streakBonus, { percent: board.percent })
                  : fillPlayMessage(PLAY_QUEST_COPY.streakBonusNone, {
                      step: PLAY_QUEST_RULES.streakStep,
                      cap: PLAY_QUEST_RULES.streakCap,
                    })}
              </p>
            </div>
          </div>
        </div>
        <div className={PLAY_QUESTS.track}>
          <span aria-hidden="true" className={PLAY_QUESTS.trackLine} />
          {board.track.map((entry, index) => (
            <div key={entry.day} className={PLAY_QUESTS.dayCell}>
              <span
                className={cn(
                  PLAY_QUESTS.dayDot,
                  entry.isPlayed ? PLAY_QUESTS.dayDotOn : PLAY_QUESTS.dayDotOff,
                  index === board.track.length - 1 && !entry.isPlayed && PLAY_QUESTS.dayDotToday
                )}
              >
                {entry.isPlayed && <Tick className={PLAY_QUESTS.dayGlyph} aria-hidden="true" />}
              </span>
              {weekday(entry.day)}
            </div>
          ))}
        </div>
        <p className={PLAY_QUESTS.note}>{note}</p>
      </div>
      <div className={PLAY_QUESTS.chest}>
        <h2 className={PLAY_QUESTS.chestTitle}>{PLAY_QUEST_COPY.bonusTitle}</h2>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={bonus.total}
          aria-valuenow={bonus.done}
          aria-label={fillPlayMessage(PLAY_QUEST_COPY.bonusText, { total: bonus.total })}
          className={PLAY_QUESTS.chestPips}
        >
          {Array.from({ length: bonus.total }, (_, index) => (
            <span
              key={index}
              className={cn(PLAY_QUESTS.pip, index < bonus.done && PLAY_QUESTS.pipOn)}
            />
          ))}
        </div>
        <p className={PLAY_QUESTS.chestNote}>
          {fillPlayMessage(PLAY_QUEST_COPY.bonusText, { total: bonus.total })}
        </p>
        <span className={PLAY_QUESTS.chestReward}>
          {fillPlayMessage(PLAY_QUEST_COPY.reward, { xp: bonus.xp })}
        </span>
        {bonus.isClaimed ? (
          <span className={PLAY_QUESTS.claimed}>{PLAY_QUEST_COPY.claimed}</span>
        ) : (
          isReady && <PlayQuestClaim slot={PLAY_QUEST_BONUS_KEY} />
        )}
      </div>
    </section>
  )
}
