'use client'

import { Button } from '@/components/elements/actions/Button'
import { Status } from '@/components/elements/display/Status'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/inline/AddRow'
import { Section } from '@/components/structures/page/Section'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { useDragAndDrop } from '@/core/hooks/interaction/gestures/useDragAndDrop'
import { useEditGestures } from '@/core/hooks/interaction/gestures/useEditGestures'
import { objectivesUnlocked } from '@/core/lib/academy/objectives'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { OBJECTIVE_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

// Single drop container
const CONTAINER = 'objectives'

/**
 * Personal objectives, dragged into order once the practice has begun
 * @return {JSX.Element}
 */

export const ObjectivesTab = () => {
  const { file, can, setTab, objectiveForm, setPendingObjective } = useJuniorState()
  const gestures = useEditGestures()

  const unlocked = objectivesUnlocked(file.junior.status, file.junior.stage)

  const { over, itemProps, containerProps } = useDragAndDrop((item, _container, index) => {
    const current = file.objectives.map((objective) => objective.id)
    const from = current.indexOf(item.id)
    if (from === -1) return

    const without = current.filter((id) => id !== item.id)
    const target = Math.min(index > from ? index - 1 : index, without.length)
    without.splice(Math.max(0, target), 0, item.id)

    void file.reorderObjectives(without)
  })

  return (
    <div {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiObjectiveAdd }}>
      <Section title={ACADEMY_COPY.tabObjectives} bare>
        {!unlocked ? (
          <EmptyState
            figure="start"
            title={ACADEMY_COPY.objectiveLockedTitle}
            description={ACADEMY_COPY.objectiveLockedDescription}
            action={
              <Button variant="primary" icon="history" onClick={() => setTab('reviews')}>
                {ACADEMY_COPY.objectiveSeeReviews}
              </Button>
            }
          />
        ) : file.objectives.length === 0 ? (
          <EmptyState
            figure="start"
            title={ACADEMY_COPY.objectiveEmptyTitle}
            description={ACADEMY_COPY.objectiveEmptyDescription}
            action={
              <Button
                variant="primary"
                icon="add"
                disabled={!can.writeObjectives}
                onClick={() => objectiveForm(null)}
              >
                {ACADEMY_COPY.objectiveAdd}
              </Button>
            }
          />
        ) : (
          <div
            className={cn(
              LIST_STYLES.stack,
              over === CONTAINER && 'is-drop-target rounded-[var(--radius-lg)]'
            )}
            {...(can.writeObjectives ? containerProps(CONTAINER) : {})}
          >
            {file.objectives.map((objective, index) => {
              const status = OBJECTIVE_STATUS_REGISTRY.get(objective.status)

              return (
                <div
                  key={objective.id}
                  data-drop-index={index}
                  className={cn(LIST_STYLES.item, can.writeObjectives && LIST_STYLES.itemClickable)}
                  {...(can.writeObjectives ? itemProps({ id: objective.id, from: CONTAINER }) : {})}
                  {...gestures({
                    canEdit: can.writeObjectives,
                    label: objective.title,
                    onEdit: () => objectiveForm(objective),
                    onRemove: () => setPendingObjective(objective),
                  })}
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-medium">{objective.title}</span>
                    {objective.description && (
                      <span className="text-xs text-[var(--color-ink-subtle)]">
                        {objective.description}
                      </span>
                    )}
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {[objective.dueAt ? formatDay(objective.dueAt) : null, objective.authorName]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <Status label={status.label} accent={status.accent} />
                </div>
              )
            })}
            <AddRow
              label={ACADEMY_COPY.objectiveAdd}
              disabled={!can.writeObjectives}
              onClick={() => objectiveForm(null)}
            />
          </div>
        )}
      </Section>
    </div>
  )
}
