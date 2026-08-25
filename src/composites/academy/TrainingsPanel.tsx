'use client'

import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Progress } from '@/components/elements/feedback/Progress'
import { TrainingContentViewer } from '@/composites/academy/TrainingContentViewer'
import { useMyTrainings } from '@/core/hooks/data/useAcademy'
import { ACADEMY_PERIOD_REGISTRY } from '@/declarations/access/roles'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { TRAINING_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { toTone } from '@/declarations/ui/theme'
import { LIST_STYLES } from '@/declarations/ui/variants'
import type { MyTrainingView } from '@/types/academy'
import { TrainingStatuses } from '@/utils/constants/hierarchy'

export interface TrainingsPanelProps {
  initialTrainings: MyTrainingView[]
}

// One training row, its status badge and the actions its state allows
const TrainingRow = ({
  training,
  isSaving,
  onMove,
  onViewContent,
}: {
  training: MyTrainingView
  isSaving: boolean
  onMove: (id: string, action: 'start' | 'resume' | 'restart' | 'abandon' | 'complete') => void
  onViewContent: (id: string) => void
}) => {
  const status = TRAINING_STATUS_REGISTRY.get(training.status)

  return (
    <article className={LIST_STYLES.card}>
      <header className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{training.name}</span>
        {training.period && (
          <Badge label={ACADEMY_PERIOD_REGISTRY.label(training.period)} tone="neutral" />
        )}
        {training.mandatory && <Badge label={ACADEMY_COPY.mandatory} tone="brand" />}
        <Badge label={status.label} tone={toTone(status.accent, 'neutral')} dot />
        <span className="ml-auto text-xs text-[var(--color-ink-subtle)]">
          {`${ACADEMY_SETTINGS.trainingMinMinutes}-${ACADEMY_SETTINGS.trainingMaxMinutes} ${ACADEMY_COPY.trainingDurationUnit}`}
        </span>
        <Button variant="ghost" icon="sheet" onClick={() => onViewContent(training.id)}>
          {ACADEMY_COPY.viewContent}
        </Button>
      </header>
      {training.summary && (
        <p className="text-sm text-[var(--color-ink-subtle)]">{training.summary}</p>
      )}
      {training.attempts > 0 && (
        <span className="text-xs text-[var(--color-ink-subtle)]">
          {`${training.attempts} ${training.attempts === 1 ? ACADEMY_COPY.trainingAttemptsOne : ACADEMY_COPY.trainingAttempts}`}
        </span>
      )}
      <div className="flex flex-wrap gap-2">
        {training.status === TrainingStatuses.NotStarted && (
          <Button
            variant="primary"
            icon="forward"
            disabled={isSaving}
            onClick={() => onMove(training.id, 'start')}
          >
            {ACADEMY_COPY.trainingStart}
          </Button>
        )}
        {training.status === TrainingStatuses.InProgress && (
          <>
            <Button
              variant="danger"
              icon="close"
              disabled={isSaving}
              onClick={() => onMove(training.id, 'abandon')}
            >
              {ACADEMY_COPY.trainingAbandon}
            </Button>
            <Button
              variant="primary"
              icon="confirm"
              disabled={isSaving}
              onClick={() => onMove(training.id, 'complete')}
            >
              {ACADEMY_COPY.trainingComplete}
            </Button>
          </>
        )}
        {training.status === TrainingStatuses.Abandoned && (
          <>
            <Button
              variant="secondary"
              icon="forward"
              disabled={isSaving}
              onClick={() => onMove(training.id, 'resume')}
            >
              {ACADEMY_COPY.trainingResume}
            </Button>
            <Button
              variant="ghost"
              icon="history"
              disabled={isSaving}
              onClick={() => onMove(training.id, 'restart')}
            >
              {ACADEMY_COPY.trainingRestart}
            </Button>
          </>
        )}
        {training.status === TrainingStatuses.Done && (
          <Button
            variant="ghost"
            icon="history"
            disabled={isSaving}
            onClick={() => onMove(training.id, 'restart')}
          >
            {ACADEMY_COPY.trainingRestart}
          </Button>
        )}
      </div>
    </article>
  )
}

/**
 * A junior's own training progression — list, actions, and the content placeholder
 * @param {MyTrainingView[]} initialTrainings - Trainings resolved server-side
 * @return {JSX.Element}
 */

export const TrainingsPanel = ({ initialTrainings }: TrainingsPanelProps) => {
  const { trainings, isSaving, move } = useMyTrainings(initialTrainings)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const completedCount = trainings.filter(
    (training) => training.status === TrainingStatuses.Done
  ).length

  if (trainings.length === 0) {
    return (
      <EmptyState
        figure="academy"
        title={ACADEMY_COPY.myTrainingsEmptyTitle}
        description={ACADEMY_COPY.myTrainingsEmptyDescription}
        action={<Badge label={ACADEMY_COPY.myTrainingsEmptyTitle} tone="neutral" />}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Progress value={completedCount} max={trainings.length} label={ACADEMY_COPY.progression} />

      <div className={LIST_STYLES.stack}>
        {trainings.map((training) => (
          <TrainingRow
            key={training.id}
            training={training}
            isSaving={isSaving}
            onMove={move}
            onViewContent={setViewingId}
          />
        ))}
      </div>

      <TrainingContentViewer trainingId={viewingId} onClose={() => setViewingId(null)} />
    </div>
  )
}
