import type { Metadata } from 'next'

import { PlayPageTitle } from '@/composites/play/hub/PlayPageTitle'
import { PlaySignal } from '@/composites/play/hub/notices/PlaySignal'
import { PlayQuestHero } from '@/composites/play/quests/PlayQuestHero'
import { PlayQuestMain } from '@/composites/play/quests/PlayQuestMain'
import { PlayQuestSide } from '@/composites/play/quests/PlayQuestSide'
import { readQuestBoard } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PLAY_QUEST_COPY } from '@/declarations/play/quests'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PLAY_PAGE, PLAY_QUESTS } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: PLAY_QUEST_COPY.pageTitle }

/**
 * Daily quests: streak and bonus first, then the main quest and four side ones
 * @return {Promise<JSX.Element>} - Quests page
 */

export default async function PlayQuestsPage() {
  const { session } = await requirePermission(Permissions.PlayAccess)
  const board = await readQuestBoard(session.id)

  return (
    <div className={PLAY_PAGE.frame}>
      <PlaySignal topic={PLAY_TOPICS.lobbies} />
      <PlayPageTitle page="quests">{PLAY_QUEST_COPY.pageTitle}</PlayPageTitle>
      <div className={PLAY_QUESTS.page}>
        <PlayQuestHero board={board} />
        <section className={PLAY_QUESTS.section}>
          <h2 className="sr-only">{PLAY_QUEST_COPY.main}</h2>
          <PlayQuestMain quest={board.main} />
        </section>
        <section className={PLAY_QUESTS.section}>
          <h2 className={PLAY_QUESTS.sectionTitle}>{PLAY_QUEST_COPY.side}</h2>
          <ul className={PLAY_QUESTS.sides}>
            {board.sides.map((quest, index) => (
              <PlayQuestSide key={quest.slot} quest={quest} index={index + 1} />
            ))}
          </ul>
        </section>
        <p className={PLAY_QUESTS.reset}>{PLAY_QUEST_COPY.resetNote}</p>
      </div>
    </div>
  )
}
