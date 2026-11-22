import type { CSSProperties } from 'react'

import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { QuestRing } from '@/composites/play/quests/PlayQuestArt'
import { PlayQuestClaim } from '@/composites/play/quests/PlayQuestClaim'
import { QUEST_KIND_ICONS, questWords } from '@/composites/play/quests/questKinds'
import type { QuestState } from '@/core/services/play'
import { fillPlayMessage } from '@/declarations/play/copy'
import { PLAY_QUEST_COPY } from '@/declarations/play/quests'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_QUESTS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Side quest: a ring around its game, the sentence, its hint and reward
 * @param {Object} props - Quest
 * @param {QuestState} props.quest - State of the quest
 * @param {number} props.index - Place in the list, from 1
 * @return {JSX.Element}
 */

export const PlayQuestSide = ({ quest, index }: { quest: QuestState; index: number }) => {
  const Icon = ICONS[QUEST_KIND_ICONS[quest.kind]]
  const { text, hint } = questWords(quest)
  const isDone = quest.done >= quest.target

  return (
    <li
      className={cn(PLAY_QUESTS.tile, isDone && PLAY_QUESTS.tileDone)}
      style={{ '--rise': index } as CSSProperties}
    >
      <span className={PLAY_QUESTS.tileNumber}>{index}</span>
      <QuestRing ratio={quest.done / quest.target} className={PLAY_QUESTS.tileRing}>
        {quest.game ? (
          <PlayGameLogo game={quest.game} className={PLAY_QUESTS.tileLogo} />
        ) : (
          <Icon className={PLAY_QUESTS.tileGlyph} aria-hidden="true" />
        )}
      </QuestRing>
      <div className={PLAY_QUESTS.tileText}>
        <span className={PLAY_QUESTS.tileName}>{text}</span>
        {hint && <span className={PLAY_QUESTS.tileHint}>{hint}</span>}
        <div className={PLAY_QUESTS.tileFoot}>
          <span className={PLAY_QUESTS.reward}>
            {fillPlayMessage(PLAY_QUEST_COPY.reward, { xp: quest.reward })}
          </span>
          {quest.isClaimed ? (
            <span className={PLAY_QUESTS.claimed}>{PLAY_QUEST_COPY.claimed}</span>
          ) : isDone ? (
            <PlayQuestClaim slot={quest.slot} />
          ) : (
            <span className={PLAY_QUESTS.count}>
              {fillPlayMessage(PLAY_QUEST_COPY.progress, {
                done: quest.done,
                target: quest.target,
              })}
            </span>
          )}
        </div>
      </div>
    </li>
  )
}
