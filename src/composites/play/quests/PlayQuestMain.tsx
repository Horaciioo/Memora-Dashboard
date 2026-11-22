import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { QuestRing } from '@/composites/play/quests/PlayQuestArt'
import { PlayQuestClaim } from '@/composites/play/quests/PlayQuestClaim'
import { QUEST_KIND_ICONS, questWords } from '@/composites/play/quests/questKinds'
import type { QuestState } from '@/core/services/play'
import { fillPlayMessage } from '@/declarations/play/copy'
import { PLAY_GAMES } from '@/declarations/play/games'
import { PLAY_QUEST_COPY } from '@/declarations/play/quests'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_QUESTS } from '@/declarations/ui/variants'

// Poster ground: the colours of its game, or the Play pair when none
const ground = (quest: QuestState): string => {
  if (!quest.game) return 'linear-gradient(135deg, var(--play-key), var(--play-key-deep))'
  const { tone } = PLAY_GAMES.get(quest.game)

  return `linear-gradient(135deg, var(${tone}-glow) -40%, var(${tone}) 45%, var(${tone}-deep))`
}

/**
 * Main quest of the day as a poster in the colours of its game
 * @param {Object} props - Quest
 * @param {QuestState} props.quest - State of the quest
 * @return {JSX.Element}
 */

export const PlayQuestMain = ({ quest }: { quest: QuestState }) => {
  const Icon = ICONS[QUEST_KIND_ICONS[quest.kind]]
  const { text, hint } = questWords(quest)
  const isDone = quest.done >= quest.target

  return (
    <div className={PLAY_QUESTS.poster} style={{ background: ground(quest) }}>
      <span aria-hidden="true" className={PLAY_QUESTS.posterShade} />
      {quest.game ? (
        <PlayGameLogo game={quest.game} className={PLAY_QUESTS.posterArt} />
      ) : (
        <Icon className={PLAY_QUESTS.posterArt} aria-hidden="true" />
      )}
      <QuestRing ratio={quest.done / quest.target} isOnDark className={PLAY_QUESTS.posterRing}>
        <span className={PLAY_QUESTS.posterCount}>
          {fillPlayMessage(PLAY_QUEST_COPY.progress, { done: quest.done, target: quest.target })}
        </span>
      </QuestRing>
      <div className={PLAY_QUESTS.posterText}>
        <span className={PLAY_QUESTS.posterKicker}>{PLAY_QUEST_COPY.main}</span>
        <h3 className={PLAY_QUESTS.posterName}>{text}</h3>
        {hint && <p className={PLAY_QUESTS.posterHint}>{hint}</p>}
      </div>
      <div className={PLAY_QUESTS.posterFoot}>
        <span className={PLAY_QUESTS.posterReward}>
          {fillPlayMessage(PLAY_QUEST_COPY.reward, { xp: quest.reward })}
        </span>
        {quest.isClaimed ? (
          <span className={PLAY_QUESTS.claimedOnPoster}>{PLAY_QUEST_COPY.claimed}</span>
        ) : (
          isDone && <PlayQuestClaim slot={quest.slot} isOnPoster />
        )}
      </div>
    </div>
  )
}
