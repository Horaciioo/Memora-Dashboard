'use client'

import { Button } from '@/components/elements/actions/Button'
import { Status } from '@/components/elements/display/Status'
import { ScrollCard } from '@/components/structures/ScrollCard'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { objectivesUnlocked } from '@/core/lib/academy/objectives'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { FSI_TABS } from '@/declarations/academy/guides'
import { OBJECTIVE_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { OBJECTIVES_CARD } from '@/declarations/ui/variants'

/**
 * Personal objectives of the junior, small beside their information box
 * @return {JSX.Element}
 */

export const ObjectivesCard = () => {
  const { file, setTab } = useJuniorState()
  const { objectives, junior } = file
  const unlocked = objectivesUnlocked(junior.status, junior.stage)

  return (
    <ScrollCard title={ACADEMY_COPY.tabObjectives}>
      {!unlocked || objectives.length === 0 ? (
        <p className={OBJECTIVES_CARD.empty}>
          {unlocked ? ACADEMY_COPY.objectiveEmptyTitle : ACADEMY_COPY.objectiveLockedDescription}
        </p>
      ) : (
        <ul className={OBJECTIVES_CARD.list}>
          {objectives.map((objective) => {
            const status = OBJECTIVE_STATUS_REGISTRY.get(objective.status)

            return (
              <li key={objective.id} className={OBJECTIVES_CARD.item}>
                <span className={OBJECTIVES_CARD.title}>{objective.title}</span>
                <Status label={status.label} accent={status.accent} />
              </li>
            )
          })}
        </ul>
      )}
      {unlocked && (
        <Button
          variant="ghost"
          icon="forward"
          className={OBJECTIVES_CARD.manage}
          onClick={() => setTab(FSI_TABS.objectives)}
        >
          {ACADEMY_COPY.objectivesManage}
        </Button>
      )}
    </ScrollCard>
  )
}
