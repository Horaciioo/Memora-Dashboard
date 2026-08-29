'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { Markdown } from '@/components/elements/display/Markdown'
import { Button } from '@/components/elements/actions/Button'
import { Progress } from '@/components/elements/feedback/Progress'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FileTabs } from '@/components/structures/FileTabs'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { StepTimeline, type TimelineStep } from '@/components/structures/StepTimeline'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { useJuniorFile } from '@/core/hooks/data/useJuniorFile'
import { ACADEMY_COPY, ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import {
  ACADEMY_JUNIOR_STATUS_REGISTRY,
  ACADEMY_STAGE_REGISTRY,
  NOTE_KIND_REGISTRY,
  OBJECTIVE_STATUS_REGISTRY,
  REVIEW_ADVICE_REGISTRY,
  REVIEW_STATUS_REGISTRY,
} from '@/declarations/academy/registries'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'

import { LIST_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import type {
  AcademyReviewView,
  JuniorNoteView,
  JuniorObjectiveView,
  JuniorSkillView,
  JuniorView,
} from '@/types/academy'
import type { FieldDefinition } from '@/types/forms'
import { AcademyJuniorStatuses, AcademyStages, ReviewStatuses } from '@/utils/constants/hierarchy'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

// Reference collection holding the training modules
const TRAINING_SECTION = 'formations'

// Single drop container, objectives only reorder within their own list
const CONTAINER = 'objectives'

export interface JuniorFileProps {
  initialJunior: JuniorView
  initialSkills: JuniorSkillView[]
  initialNotes: JuniorNoteView[]
  initialObjectives: JuniorObjectiveView[]
  initialReviews: AcademyReviewView[]
  sessionFunctionName: string
  juniorFields: FieldDefinition[]
  noteFields: FieldDefinition[]
  objectiveFields: FieldDefinition[]
  reviewFields: FieldDefinition[]
  canManage: boolean
  canWriteSkills: boolean
  canReadNotes: boolean
  canWriteNotes: boolean
  canWriteObjectives: boolean
  canReadReviews: boolean
  canWriteReviews: boolean
  canValidateReviews: boolean
}

/**
 * Individual follow-up file — informations, competencies, notes, objectives and bilans
 * @param {JuniorView} initialJunior - Junior resolved server-side
 * @param {JuniorSkillView[]} initialSkills - Competencies resolved server-side
 * @param {JuniorNoteView[]} initialNotes - Notes resolved server-side
 * @param {JuniorObjectiveView[]} initialObjectives - Objectives resolved server-side
 * @param {AcademyReviewView[]} initialReviews - Check-ins resolved server-side
 * @param {string} sessionFunctionName - Function the session is scoped to
 * @param {FieldDefinition[]} juniorFields - Declarations of the junior form
 * @param {FieldDefinition[]} noteFields - Declarations of the note form
 * @param {FieldDefinition[]} objectiveFields - Declarations of the objective form
 * @param {FieldDefinition[]} reviewFields - Declarations of the check-in form
 * @param {boolean} canManage - Member may drive the follow-up
 * @param {boolean} canWriteSkills - Member may move a competency
 * @param {boolean} canReadNotes - Member may read the notes
 * @param {boolean} canWriteNotes - Member may write a note
 * @param {boolean} canWriteObjectives - Member may set objectives
 * @param {boolean} canReadReviews - Member may read the check-ins
 * @param {boolean} canWriteReviews - Member may write a check-in
 * @param {boolean} canValidateReviews - Member may decide a check-in
 * @return {JSX.Element}
 */

export const JuniorFile = ({
  initialJunior,
  initialSkills,
  initialNotes,
  initialObjectives,
  initialReviews,
  sessionFunctionName,
  juniorFields,
  noteFields,
  objectiveFields,
  reviewFields,
  canManage,
  canWriteSkills,
  canReadNotes,
  canWriteNotes,
  canWriteObjectives,
  canReadReviews,
  canWriteReviews,
  canValidateReviews,
}: JuniorFileProps) => {
  const file = useJuniorFile(
    initialJunior,
    initialSkills,
    initialNotes,
    initialObjectives,
    initialReviews
  )
  const [tab, setTab] = useState('informations')
  const [dialog, setDialog] = useState<'junior' | 'note' | 'objective' | 'review' | null>(null)
  const [editingNote, setEditingNote] = useState<JuniorNoteView | null>(null)
  const [editingObjective, setEditingObjective] = useState<JuniorObjectiveView | null>(null)
  const [editingReview, setEditingReview] = useState<AcademyReviewView | null>(null)
  const [pendingNote, setPendingNote] = useState<JuniorNoteView | null>(null)
  const [pendingObjective, setPendingObjective] = useState<JuniorObjectiveView | null>(null)
  const [pendingReview, setPendingReview] = useState<AcademyReviewView | null>(null)
  const [decidingReview, setDecidingReview] = useState<{
    review: AcademyReviewView
    accept: boolean
  } | null>(null)

  const { junior } = file
  const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)
  const isReady = junior.mandatoryPending === 0

  const stageKeys = ACADEMY_STAGE_REGISTRY.keys
  const stageIndex = stageKeys.indexOf(junior.stage)
  const graduated = junior.status === AcademyJuniorStatuses.Validated
  const objectivesUnlocked = graduated || stageIndex >= stageKeys.indexOf(AcademyStages.Practice)

  const stageSteps: TimelineStep[] = stageKeys.map((key, index) => ({
    id: key,
    label: ACADEMY_STAGE_REGISTRY.label(key),
    state: graduated || index < stageIndex ? 'done' : index === stageIndex ? 'current' : 'idle',
  }))

  const skillAverage =
    file.skills.length === 0
      ? 0
      : Math.round(
          file.skills.reduce((total, skill) => total + skill.percent, 0) / file.skills.length
        )

  const openNote = (note: JuniorNoteView | null) => {
    file.clearIssues()
    setEditingNote(note)
    setDialog('note')
  }

  const openObjective = (objective: JuniorObjectiveView | null) => {
    file.clearIssues()
    setEditingObjective(objective)
    setDialog('objective')
  }

  const openReview = (review: AcademyReviewView | null) => {
    file.clearIssues()
    setEditingReview(review)
    setDialog('review')
  }

  const { over, itemProps, containerProps } = useDragAndDrop((item, _container, index) => {
    const current = file.objectives.map((objective) => objective.id)
    const from = current.indexOf(item.id)
    if (from === -1) return

    const without = current.filter((id) => id !== item.id)
    const target = Math.min(index > from ? index - 1 : index, without.length)
    without.splice(Math.max(0, target), 0, item.id)

    void file.reorderObjectives(without)
  })

  const informationsTab = () => (
    <Section title={ACADEMY_COPY.tabInformations} padded>
      <div className="flex flex-col gap-4">
        <span className="flex flex-wrap items-center gap-2">
          <Badge label={junior.dispositif.name} accent={junior.dispositif.accent} tone={'info'} />
          <Badge label={sessionFunctionName} tone="neutral" />
          <Badge label={status.label} accent={status.accent} tone={'neutral'} dot />
          <Badge
            label={isReady ? ACADEMY_COPY.ready : ACADEMY_COPY.blocked}
            tone={isReady ? 'success' : 'warning'}
          />
          <Button
            variant="primary"
            icon="edit"
            className="ml-auto"
            disabled={!canManage}
            onClick={() => {
              file.clearIssues()
              setDialog('junior')
            }}
          >
            {ACTION_COPY.edit}
          </Button>
        </span>
        <StepTimeline steps={stageSteps} label={ACADEMY_COPY.tabInformations} />
        <DetailGrid
          entries={[
            { label: ACADEMY_FIELD_COPY.trainer, value: junior.trainer?.name },
            {
              label: ACADEMY_FIELD_COPY.liveCount,
              value: `${junior.liveCount} / ${ACADEMY_SETTINGS.maxLives + junior.bonusLives}`,
            },
            { label: ACADEMY_FIELD_COPY.startsAt, value: formatDay(junior.startedAt) },
            {
              label: ACADEMY_COPY.validate,
              value: junior.validatedAt ? formatDay(junior.validatedAt) : undefined,
            },
            { label: ACADEMY_FIELD_COPY.juniorSummary, value: junior.summary },
          ]}
        />
        <Progress
          value={junior.completedCount}
          max={Math.max(junior.trainings.length, 1)}
          label={ACADEMY_COPY.progression}
        />
        <Progress value={skillAverage} label={ACADEMY_COPY.tabCompetences} />
      </div>
    </Section>
  )

  const trainingsTab = () => (
    <Section title={ACADEMY_COPY.progression} description={ACADEMY_COPY.progressionLead} bare>
      {junior.trainings.length === 0 ? (
        <EmptyState
          figure="academy"
          title={ACADEMY_COPY.noTrainingsTitle}
          description={ACADEMY_COPY.noTrainingsDescription}
          action={
            <Link href={ROUTES.settingsSection(TRAINING_SECTION)}>
              <Button variant="primary" icon="settings">
                {ACADEMY_COPY.configure}
              </Button>
            </Link>
          }
        />
      ) : (
        <div
          className={cn(SECTION_STYLES.panel, SECTION_STYLES.panelPadded, 'flex flex-col gap-0.5')}
        >
          {junior.trainings.map((training) => (
            <Checkbox
              key={training.id}
              checked={training.completedAt !== null}
              disabled={!canManage || file.isSaving}
              onChange={(checked) => void file.setTraining(training.id, checked)}
              label={training.name}
              hint={
                training.completedAt
                  ? [formatDay(training.completedAt), training.validatorName]
                      .filter(Boolean)
                      .join(' · ')
                  : training.mandatory
                    ? ACADEMY_COPY.mandatory
                    : undefined
              }
            />
          ))}
        </div>
      )}
    </Section>
  )

  const skillsTab = () => (
    <Section title={ACADEMY_COPY.tabCompetences} description={ACADEMY_COPY.skillsLead} bare>
      {file.skills.length === 0 ? (
        <EmptyState
          figure="academy"
          title={ACADEMY_COPY.noTrainingsTitle}
          description={ACADEMY_COPY.noTrainingsDescription}
          action={
            <Link href={ROUTES.settingsSection('competences')}>
              <Button variant="primary" icon="settings">
                {ACADEMY_COPY.configure}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {Object.values(
            file.skills.reduce<
              Record<string, { name: string; accent: string | null; items: typeof file.skills }>
            >((groups, skill) => {
              const group = groups[skill.categoryId] ?? {
                name: skill.categoryName,
                accent: skill.categoryAccent,
                items: [],
              }
              group.items.push(skill)
              groups[skill.categoryId] = group

              return groups
            }, {})
          ).map((group) => (
            <article key={group.name} className={LIST_STYLES.card}>
              <header className="flex items-center gap-2">
                <Badge label={group.name} accent={group.accent} tone={'neutral'} />
              </header>
              <div className="flex flex-col gap-4">
                {group.items.map((skill) => (
                  <div key={skill.skillId} className="flex flex-col gap-1.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{skill.name}</span>
                      <span className="ml-auto flex items-center gap-1">
                        <Button
                          variant="icon"
                          icon="remove"
                          aria-label={`${ACTION_COPY.edit} -`}
                          disabled={!canWriteSkills || file.isSaving || skill.percent <= 0}
                          onClick={() =>
                            void file.setSkill(
                              skill.skillId,
                              skill.percent - ACADEMY_SETTINGS.skillStep
                            )
                          }
                        />
                        <span className="w-10 text-center text-xs tabular-nums">{`${skill.percent}%`}</span>
                        <Button
                          variant="icon"
                          icon="add"
                          aria-label={`${ACTION_COPY.edit} +`}
                          disabled={
                            !canWriteSkills ||
                            file.isSaving ||
                            skill.percent >= ACADEMY_SETTINGS.skillMaxPercent
                          }
                          onClick={() =>
                            void file.setSkill(
                              skill.skillId,
                              skill.percent + ACADEMY_SETTINGS.skillStep
                            )
                          }
                        />
                      </span>
                    </span>
                    {skill.description && (
                      <span className="text-xs text-[var(--color-ink-subtle)]">
                        {skill.description}
                      </span>
                    )}
                    <Progress value={skill.percent} compact />
                    {skill.updatedAt && (
                      <span className="text-xs text-[var(--color-ink-subtle)]">
                        {[formatDay(skill.updatedAt), skill.validatorName]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  )

  const notesTab = () => (
    <Section title={ACADEMY_COPY.tabNotes} bare>
      {!canReadNotes ? (
        <EmptyState
          figure="notes"
          title={ACADEMY_COPY.confidential}
          description={ACADEMY_COPY.noteLocked}
          action={
            <Button icon="blocked" disabled>
              {ACADEMY_COPY.confidential}
            </Button>
          }
        />
      ) : file.notes.length === 0 ? (
        <EmptyState
          figure="notes"
          title={ACADEMY_COPY.noteEmptyTitle}
          description={ACADEMY_COPY.noteEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canWriteNotes}
              onClick={() => openNote(null)}
            >
              {ACADEMY_COPY.noteAdd}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {file.notes.map((note) => {
            const kind = NOTE_KIND_REGISTRY.get(note.kind)

            return (
              <article key={note.id} className={LIST_STYLES.card}>
                <header className="flex flex-wrap items-center gap-2">
                  <Badge label={kind.label} accent={kind.accent} tone={'neutral'} />
                  <Badge label={ACADEMY_STAGE_REGISTRY.label(note.stage)} tone="neutral" dot />
                  {note.authorName && (
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {note.authorName}
                    </span>
                  )}
                  <span className="text-xs text-[var(--color-ink-subtle)]">
                    {formatDay(note.createdAt)}
                  </span>
                  <Button
                    variant="icon"
                    icon="edit"
                    aria-label={ACTION_COPY.edit}
                    className="ml-auto"
                    disabled={!canWriteNotes}
                    onClick={() => openNote(note)}
                  />
                  <Button
                    variant="icon"
                    icon="remove"
                    aria-label={ACTION_COPY.delete}
                    disabled={!canWriteNotes}
                    onClick={() => setPendingNote(note)}
                  />
                </header>
                <p className="text-sm whitespace-pre-wrap">{note.body}</p>
              </article>
            )
          })}
          <AddRow
            label={ACADEMY_COPY.noteAdd}
            disabled={!canWriteNotes}
            onClick={() => openNote(null)}
          />
        </div>
      )}
    </Section>
  )

  const objectivesTab = () => (
    <Section title={ACADEMY_COPY.tabObjectives} bare>
      {!objectivesUnlocked ? (
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
              disabled={!canWriteObjectives}
              onClick={() => openObjective(null)}
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
          {...(canWriteObjectives ? containerProps(CONTAINER) : {})}
        >
          <span className="text-xs text-[var(--color-ink-subtle)]">
            {`${file.objectives.length} / ${ACADEMY_SETTINGS.minObjectives} ${ACADEMY_FIELD_COPY.objectiveStatus.toLowerCase()}`}
          </span>
          {file.objectives.map((objective, index) => {
            const objectiveStatus = OBJECTIVE_STATUS_REGISTRY.get(objective.status)

            return (
              <div
                key={objective.id}
                data-drop-index={index}
                className={LIST_STYLES.item}
                {...(canWriteObjectives ? itemProps({ id: objective.id, from: CONTAINER }) : {})}
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
                <Badge
                  label={objectiveStatus.label}
                  accent={objectiveStatus.accent}
                  tone={'neutral'}
                  dot
                />
                <Button
                  variant="icon"
                  icon="edit"
                  aria-label={ACTION_COPY.edit}
                  disabled={!canWriteObjectives}
                  onClick={() => openObjective(objective)}
                />
                <Button
                  variant="icon"
                  icon="remove"
                  aria-label={ACTION_COPY.delete}
                  disabled={!canWriteObjectives}
                  onClick={() => setPendingObjective(objective)}
                />
              </div>
            )
          })}
          <AddRow
            label={ACADEMY_COPY.objectiveAdd}
            disabled={!canWriteObjectives}
            onClick={() => openObjective(null)}
          />
        </div>
      )}
    </Section>
  )

  const reviewsTab = () => (
    <Section title={ACADEMY_COPY.tabReviews} description={ACADEMY_COPY.reviewsLead} bare>
      {!canReadReviews ? (
        <EmptyState
          figure="notes"
          title={ACADEMY_COPY.confidential}
          description={ACADEMY_COPY.reviewLocked}
          action={
            <Button icon="blocked" disabled>
              {ACADEMY_COPY.confidential}
            </Button>
          }
        />
      ) : file.reviews.length === 0 ? (
        <EmptyState
          figure="notes"
          title={ACADEMY_COPY.reviewEmptyTitle}
          description={ACADEMY_COPY.reviewEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canWriteReviews}
              onClick={() => openReview(null)}
            >
              {ACADEMY_COPY.reviewAdd}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {file.reviews.map((review) => {
            const reviewStatus = REVIEW_STATUS_REGISTRY.get(review.status)
            const advice = REVIEW_ADVICE_REGISTRY.get(review.advice)
            const isDraft = review.status === ReviewStatuses.Draft
            const isSubmitted = review.status === ReviewStatuses.Submitted

            return (
              <article key={review.id} className={LIST_STYLES.card}>
                <header className="flex flex-wrap items-center gap-2">
                  <Badge label={ACADEMY_STAGE_REGISTRY.label(review.stage)} tone="neutral" dot />
                  <span className="font-bold">{formatDay(review.heldAt)}</span>
                  {review.authorName && (
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {review.authorName}
                    </span>
                  )}
                  <Badge
                    label={reviewStatus.label}
                    accent={reviewStatus.accent}
                    tone={'neutral'}
                    dot
                  />
                  <Badge label={advice.label} accent={advice.accent} tone={'neutral'} />
                  <span className="ml-auto flex items-center gap-1">
                    {isDraft && canWriteReviews && (
                      <>
                        <Button
                          variant="icon"
                          icon="edit"
                          aria-label={ACTION_COPY.edit}
                          onClick={() => openReview(review)}
                        />
                        <Button
                          variant="icon"
                          icon="remove"
                          aria-label={ACTION_COPY.delete}
                          onClick={() => setPendingReview(review)}
                        />
                        <Button
                          variant="primary"
                          icon="forward"
                          onClick={() => void file.submitReview(review.id)}
                        >
                          {ACADEMY_COPY.reviewSubmit}
                        </Button>
                      </>
                    )}
                    {isSubmitted && canValidateReviews && (
                      <>
                        <Button
                          variant="danger"
                          icon="close"
                          onClick={() => setDecidingReview({ review, accept: false })}
                        >
                          {ACADEMY_COPY.reviewReject}
                        </Button>
                        <Button
                          variant="primary"
                          icon="confirm"
                          onClick={() => setDecidingReview({ review, accept: true })}
                        >
                          {ACADEMY_COPY.reviewValidate}
                        </Button>
                      </>
                    )}
                  </span>
                </header>
                <DetailGrid
                  entries={[
                    {
                      label: ACADEMY_FIELD_COPY.durationMinutes,
                      value: review.durationMinutes ? String(review.durationMinutes) : undefined,
                    },
                    { label: ACADEMY_FIELD_COPY.feeling, value: review.feeling },
                    { label: ACADEMY_FIELD_COPY.decisionNote, value: review.decisionNote },
                  ]}
                />
                {review.summary && <Markdown source={review.summary} />}
              </article>
            )
          })}
          <AddRow
            label={ACADEMY_COPY.reviewAdd}
            disabled={!canWriteReviews}
            onClick={() => openReview(null)}
          />
        </div>
      )}
    </Section>
  )

  return (
    <div className="flex flex-col gap-8">
      <FileTabs
        label={ACADEMY_COPY.fileTitle}
        value={tab}
        onChange={setTab}
        tabs={[
          {
            value: 'informations',
            label: ACADEMY_COPY.tabInformations,
            icon: 'sheet',
            render: informationsTab,
          },
          {
            value: 'trainings',
            label: ACADEMY_COPY.progression,
            icon: 'academy',
            render: trainingsTab,
          },
          { value: 'skills', label: ACADEMY_COPY.tabCompetences, icon: 'skill', render: skillsTab },
          { value: 'notes', label: ACADEMY_COPY.tabNotes, icon: 'note', render: notesTab },
          {
            value: 'objectives',
            label: ACADEMY_COPY.tabObjectives,
            icon: 'objective',
            render: objectivesTab,
          },
          { value: 'reviews', label: ACADEMY_COPY.tabReviews, icon: 'confirm', render: reviewsTab },
        ]}
      />

      <FormDialog
        open={dialog === 'junior'}
        title={junior.displayName}
        fields={juniorFields}
        initialValues={junior.values}
        issues={file.issues}
        isSaving={file.isSaving}
        size="lg"
        onSubmit={file.save}
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={dialog === 'note'}
        title={editingNote ? ACTION_COPY.edit : ACADEMY_COPY.noteAdd}
        fields={noteFields}
        initialValues={editingNote?.values}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={(values) =>
          editingNote ? file.editNote(editingNote.id, values) : file.addNote(values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={dialog === 'objective'}
        title={editingObjective ? ACTION_COPY.edit : ACADEMY_COPY.objectiveAdd}
        fields={objectiveFields}
        initialValues={editingObjective?.values}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={(values) =>
          editingObjective
            ? file.editObjective(editingObjective.id, values)
            : file.addObjective(values)
        }
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={dialog === 'review'}
        title={editingReview ? ACTION_COPY.edit : ACADEMY_COPY.reviewAdd}
        description={ACADEMY_COPY.reviewsLead}
        fields={reviewFields}
        initialValues={editingReview?.values}
        issues={file.issues}
        isSaving={file.isSaving}
        size="lg"
        onSubmit={(values) =>
          editingReview ? file.editReview(editingReview.id, values) : file.addReview(values)
        }
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={pendingNote !== null}
        title={ACADEMY_COPY.noteDeleteTitle}
        description={ACADEMY_COPY.noteDeleteDescription}
        pending={file.isSaving}
        onCancel={() => setPendingNote(null)}
        onConfirm={async () => {
          await file.dropNote(pendingNote!.id)
          setPendingNote(null)
        }}
      />

      <ConfirmDialog
        open={pendingObjective !== null}
        title={ACADEMY_COPY.objectiveDeleteTitle}
        description={ACADEMY_COPY.objectiveDeleteDescription}
        pending={file.isSaving}
        onCancel={() => setPendingObjective(null)}
        onConfirm={async () => {
          await file.dropObjective(pendingObjective!.id)
          setPendingObjective(null)
        }}
      />

      <ConfirmDialog
        open={pendingReview !== null}
        title={ACADEMY_COPY.reviewDeleteTitle}
        description={ACADEMY_COPY.reviewDeleteDescription}
        pending={file.isSaving}
        onCancel={() => setPendingReview(null)}
        onConfirm={async () => {
          await file.dropReview(pendingReview!.id)
          setPendingReview(null)
        }}
      />

      <ConfirmDialog
        open={decidingReview !== null}
        title={
          decidingReview?.accept ? ACADEMY_COPY.reviewValidateTitle : ACADEMY_COPY.reviewRejectTitle
        }
        description={
          decidingReview?.accept
            ? ACADEMY_COPY.reviewValidateDescription
            : ACADEMY_COPY.reviewRejectDescription
        }
        tone={decidingReview?.accept ? 'success' : 'danger'}
        pending={file.isSaving}
        onCancel={() => setDecidingReview(null)}
        onConfirm={async () => {
          await file.decideReview(
            decidingReview!.review.id,
            decidingReview!.accept ? 'VALIDATED' : 'REJECTED'
          )
          setDecidingReview(null)
        }}
      />
    </div>
  )
}
