import { PlayQuestKinds } from '@/declarations/play/quests'
import type { PlayQuestKind } from '@/declarations/play/quests'
import { PLAY_QUEST_RULES, PLAY_QUEST_TEXTS } from '@/declarations/play/quests'
import { fillPlayMessage } from '@/declarations/play/copy'
import { PLAY_GAMES } from '@/declarations/play/games'
import type { IconName } from '@/declarations/ui/icons'
import type { DailyQuest } from '@/core/lib/play/quests'

// Glyph of each kind, shown when no game carries the quest
export const QUEST_KIND_ICONS: Record<PlayQuestKind, IconName> = {
  [PlayQuestKinds.Played]: 'playResume',
  [PlayQuestKinds.Wins]: 'playTrophy',
  [PlayQuestKinds.Variety]: 'playTabLive',
  [PlayQuestKinds.Podium]: 'playCrown',
  [PlayQuestKinds.Crowd]: 'playPlayers',
  [PlayQuestKinds.Private]: 'playInvite',
  [PlayQuestKinds.Blitz]: 'playClock',
  [PlayQuestKinds.Xp]: 'playStar',
}

/**
 * Sentence of a quest
 * @param {DailyQuest} quest - Quest
 * @return {{ text: string, hint?: string }}
 */

export const questWords = (quest: DailyQuest): { text: string; hint?: string } => {
  const words = PLAY_QUEST_TEXTS[quest.kind]
  const template = quest.target === 1 ? words.one : words.many
  const values = {
    target: quest.target,
    game: quest.game ? PLAY_GAMES.get(quest.game).label : '',
    players: PLAY_QUEST_RULES.crowdPlayers,
    minutes: PLAY_QUEST_RULES.blitzMinutes,
  }

  return {
    text: fillPlayMessage(template, values),
    hint: words.hint && fillPlayMessage(words.hint, values),
  }
}
