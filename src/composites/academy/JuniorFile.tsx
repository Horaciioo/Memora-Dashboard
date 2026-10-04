'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { StatusText } from '@/components/elements/display/StatusText'
import { Markdown } from '@/components/elements/display/Markdown'
import { Button } from '@/components/elements/actions/Button'
import { Progress } from '@/components/elements/feedback/Progress'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FileTabs } from '@/components/structures/FileTabs'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { Section } from '@/components/structures/Section'
import { StepTimeline, type TimelineStep } from '@/components/structures/StepTimeline'
import { JuniorRail } from '@/composites/academy/JuniorRail'
import { MEMBER_FILE } from '@/declarations/ui/blocks'
import { ParkourPanel } from '@/composites/academy/ParkourPanel'
import { PimTimelineBoard } from '@/composites/academy/PimTimelineBoard'
import { FSI_TABS, GUIDE_BEACONS } from '@/declarations/academy/guides'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { useEditGestures } from '@/core/hooks/interaction/useEditGestures'
import { useJuniorFile } from '@/core/hooks/data/useJuniorFile'
import { advicesFor, decisionsFor } from '@/core/lib/academy/parkour'
import { COURSE_COPY, ACADEMY_COPY, ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import {
  PARKOUR_COPY,
  PARKOUR_DECISION_CONFIRM,
  PARKOUR_DECISIONS,
} from '@/declarations/academy/parkour'
import {
  ACADEMY_STAGE_REGISTRY,
  NOTE_KIND_REGISTRY,
  OBJECTIVE_STATUS_REGISTRY,
  REVIEW_ADVICE_REGISTRY,
  REVIEW_STATUS_REGISTRY,
} from '@/declarations/academy/registries'
import { ACADEMY_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'

import { LIST_STYLES, SECTION_STYLES, SESSION_CARD } from '@/declarations/ui/variants'
import type {
  AcademyReviewView,
  PimTimeline,
  JuniorNoteView,
  JuniorObjectiveView,
  JuniorSkillView,
  JuniorView,
  ParkourView,
} from '@/types/academy'
import type { FieldDefinition } from '@/types/forms'
import {
  AcademyJuniorStatuses,
  AcademyStages,
  ReviewAdvices,
  ReviewStatuses,
} from '@/utils/constants/hierarchy'
import type { ReviewAdviceName } from '@/utils/constants/hierarchy'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

// Single drop container, objectives only reorder within their own list
const CONTAINER = 'objectives'

// Third period decision, its deadline then a note
const THIRD_PERIOD_FIELDS: FieldDefinition[] = [
  {
    name: 'deadlineAt',
    kind: 'date',
    label: PARKOUR_COPY.deadline,
    hint: PARKOUR_COPY.deadlineHint,
    required: true,
  },
  {
    name: 'decisionNote',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.decisionNote,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
]

export interface JuniorFileProps {
  initialJunior: JuniorView
  initialSkills: JuniorSkillView[]
  initialNotes: JuniorNoteView[]
  initialObjectives: JuniorObjectiveView[]
  initialReviews: AcademyReviewView[]
  initialTimeline: PimTimeline
  parkour: ParkourView | null
  initialTab?: string
  sessionFunctionName: string
  juniorFields: FieldDefinition[]
  noteFields: FieldDefinition[]
  objectiveFields: FieldDefinition[]
  reviewFields: FieldDefinition[]
  canManage: boolean
  canWriteSkills: boolean
  canReadNotes: boolean
  canWriteNotes: boolean
  canReadObjectives: boolean
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
 * @param {PimTimeline} initialTimeline - Vertical timeline resolved server-side
 * @param {ParkourView | null} parkour - AcademicParkour standing, none for the junior
 * @param {string} [initialTab] - Tab a walkthrough opens on
 * @param {string} sessionFunctionName - Function the session is scoped to
 * @param {FieldDefinition[]} juniorFields - Declarations of the junior form
 * @param {FieldDefinition[]} noteFields - Declarations of the note form
 * @param {FieldDefinition[]} objectiveFields - Declarations of the objective form
 * @param {FieldDefinition[]} reviewFields - Declarations of the check-in form
 * @param {boolean} canManage - Member may drive the follow-up
 * @param {boolean} canWriteSkills - Member may move a competency
 * @param {boolean} canReadNotes - Member may read the notes
 * @param {boolean} canWriteNotes - Member may write a note
 * @param {boolean} canReadObjectives - Member may read the objectives, never the junior
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
  initialTimeline,
  parkour,
  initialTab,
  sessionFunctionName,
  juniorFields,
  noteFields,
  objectiveFields,
  reviewFields,
  canManage,
  canWriteSkills,
  canReadNotes,
  canWriteNotes,
  canReadObjectives,
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
  const gestures = useEditGestures()
  const [tab, setTab] = useState(initialTab ?? FSI_TABS.timeline)
  const [dialog, setDialog] = useState<'junior' | 'note' | 'objective' | 'review' | null>(null)
  const [editingNote, setEditingNote] = useState<JuniorNoteView | null>(null)
  const [editingObjective, setEditingObjective] = useState<JuniorObjectiveView | null>(null)
  const [editingReview, setEditingReview] = useState<AcademyReviewView | null>(null)
  const [pendingNote, setPendingNote] = useState<JuniorNoteView | null>(null)
  const [pendingObjective, setPendingObjective] = useState<JuniorObjectiveView | null>(null)
  const [pendingReview, setPendingReview] = useState<AcademyReviewView | null>(null)
  const router = useRouter()
  const [decidingReview, setDecidingReview] = useState<{
    review: AcademyReviewView
    decision: ReviewAdviceName | null
  } | null>(null)

  // Third period asks for its deadline in a drawer, every other outcome a confirmation
  const opensThirdPeriod =
    decidingReview?.decision === ReviewAdvices.Bonus &&
    decidingReview.review.stage === AcademyStages.ReviewFinal

  const decide = async (values?: { deadlineAt?: string; decisionNote?: string }) => {
    if (!decidingReview) return false

    const done = await file.decideReview(decidingReview.review.id, {
      decision: decidingReview.decision ?? undefined,
      bounce: decidingReview.decision === null,
      ...values,
    })
    if (done) {
      setDecidingReview(null)
      router.refresh()
    }

    return done
  }

  const { junior } = file
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

  // Walkthrough anchor
  const beacon = (name: string) => ({ [BEACON_ATTRIBUTE]: name })

  const timelineTab = () => (
    <Section title={ACADEMY_COPY.timelineTab} raised>
      <div className="flex flex-col gap-6">
        {parkour && <ParkourPanel parkour={parkour} canManage={canManage} />}
        <PimTimelineBoard initialTimeline={initialTimeline} canAdvance={canManage} />
      </div>
    </Section>
  )

  const informationsTab = () => (
    <Section title={ACADEMY_COPY.tabInformations} raised>
      <div className="flex flex-col gap-4">
        <span className="flex justify-end" {...beacon(GUIDE_BEACONS.fsiEdit)}>
          <Button
            variant="primary"
            icon="edit"
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
              value: String(junior.liveCount),
            },
            { label: ACADEMY_FIELD_COPY.startsAt, value: formatDay(junior.startedAt) },
            {
              label: ACADEMY_COPY.validate,
              value: junior.validatedAt ? formatDay(junior.validatedAt) : undefined,
            },
            { label: ACADEMY_FIELD_COPY.juniorSummary, value: junior.summary },
          ]}
        />
      </div>
    </Section>
  )

  const trainingsTab = () => (
    <div {...beacon(GUIDE_BEACONS.fsiTrainings)}>
      <Section title={ACADEMY_COPY.progression} description={ACADEMY_COPY.progressionLead} bare>
        {junior.trainings.length === 0 ? (
          <EmptyState
            figure="academy"
            title={ACADEMY_COPY.noTrainingsTitle}
            description={ACADEMY_COPY.noTrainingsDescription}
            action={
              <Link href={ROUTES.trainings}>
                <Button variant="primary" icon="academy">
                  {ACADEMY_COPY.openCatalogue}
                </Button>
              </Link>
            }
          />
        ) : (
          <div
            className={cn(
              SECTION_STYLES.panel,
              SECTION_STYLES.panelPadded,
              'flex flex-col gap-0.5'
            )}
          >
            {junior.trainings.map((training) => (
              <Checkbox
                key={training.id}
                checked={training.completedAt !== null}
                // An interactive course closes by its own exercises
                disabled={!canManage || file.isSaving || training.exercises !== null}
                onChange={(checked) => void file.setTraining(training.id, checked)}
                label={training.name}
                hint={
                  [
                    training.exercises
                      ? COURSE_COPY.progress(training.exercises.passed, training.exercises.total) +
                        ` ${COURSE_COPY.exercisesUnit}`
                      : null,
                    training.completedAt ? formatDay(training.completedAt) : null,
                    training.completedAt ? training.validatorName : null,
                    !training.completedAt && training.mandatory ? ACADEMY_COPY.mandatory : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || undefined
                }
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  )

  const skillsTab = () => (
    <div {...beacon(GUIDE_BEACONS.fsiSkills)}>
      <Section title={ACADEMY_COPY.tabCompetences} description={ACADEMY_COPY.skillsLead} bare>
        {file.skills.length === 0 ? (
          <EmptyState
            figure="academy"
            title={ACADEMY_COPY.noTrainingsTitle}
            description={ACADEMY_COPY.noTrainingsDescription}
            action={
              <Link href={ROUTES.academy}>
                <Button variant="primary" icon="academy">
                  {ACADEMY_COPY.openSessions}
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
              <article key={group.name} className={SESSION_CARD.group}>
                <header className="flex items-center gap-2">
                  <StatusText label={group.name} accent={group.accent} />
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
    </div>
  )

  const notesTab = () => (
    <div {...beacon(GUIDE_BEACONS.fsiNoteAdd)}>
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
                <article
                  key={note.id}
                  className={cn(
                    MEMBER_FILE.note,
                    canWriteNotes &&
                      'cursor-pointer transition-shadow hover:shadow-[var(--shadow-md)]'
                  )}
                  {...gestures({
                    canEdit: canWriteNotes,
                    label: kind.label,
                    onEdit: () => openNote(note),
                    onRemove: () => setPendingNote(note),
                  })}
                >
                  <header className="flex flex-wrap items-center gap-2">
                    <StatusText label={kind.label} accent={kind.accent} />
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {[
                        ACADEMY_STAGE_REGISTRY.label(note.stage),
                        note.authorName,
                        formatDay(note.createdAt),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
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
    </div>
  )

  const objectivesTab = () => (
    <div {...beacon(GUIDE_BEACONS.fsiObjectiveAdd)}>
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
            {file.objectives.map((objective, index) => {
              const objectiveStatus = OBJECTIVE_STATUS_REGISTRY.get(objective.status)

              return (
                <div
                  key={objective.id}
                  data-drop-index={index}
                  className={cn(LIST_STYLES.item, canWriteObjectives && LIST_STYLES.itemClickable)}
                  {...(canWriteObjectives ? itemProps({ id: objective.id, from: CONTAINER }) : {})}
                  {...gestures({
                    canEdit: canWriteObjectives,
                    label: objective.title,
                    onEdit: () => openObjective(objective),
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
                  <StatusText label={objectiveStatus.label} accent={objectiveStatus.accent} />
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
    </div>
  )

  const reviewsTab = () => (
    <div {...beacon(GUIDE_BEACONS.fsiReviewAdd)}>
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
              const advises = advicesFor(review.stage).includes(review.advice)
              const decisions = decisionsFor(review.stage)
              const labels = PARKOUR_DECISIONS[review.stage] ?? {}
              const isDraft = review.status === ReviewStatuses.Draft
              const isSubmitted = review.status === ReviewStatuses.Submitted

              return (
                <article
                  key={review.id}
                  className={cn(
                    MEMBER_FILE.note,
                    isDraft &&
                      canWriteReviews &&
                      'cursor-pointer transition-shadow hover:shadow-[var(--shadow-md)]'
                  )}
                  {...gestures({
                    canEdit: isDraft && canWriteReviews,
                    label: formatDay(review.heldAt),
                    onEdit: () => openReview(review),
                    onRemove: () => setPendingReview(review),
                  })}
                >
                  <header className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">{formatDay(review.heldAt)}</span>
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {[ACADEMY_STAGE_REGISTRY.label(review.stage), review.authorName]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <StatusText label={reviewStatus.label} accent={reviewStatus.accent} />
                    {advises && (
                      <StatusText
                        label={REVIEW_ADVICE_REGISTRY.label(review.advice)}
                        accent={REVIEW_ADVICE_REGISTRY.get(review.advice).accent}
                      />
                    )}
                    {review.decision && labels[review.decision] && (
                      <StatusText
                        label={labels[review.decision] ?? ''}
                        accent={review.decision === ReviewAdvices.Stop ? 'danger' : 'success'}
                      />
                    )}
                    <span className="ml-auto flex items-center gap-1">
                      {isDraft && canWriteReviews && (
                        <>
                          <Button
                            variant="primary"
                            icon="forward"
                            onClick={() => void file.submitReview(review.id)}
                          >
                            {review.stage === AcademyStages.ReviewOne
                              ? PARKOUR_COPY.submitFirst
                              : PARKOUR_COPY.submit}
                          </Button>
                        </>
                      )}
                      {isSubmitted && canValidateReviews && (
                        <>
                          <Button
                            variant="ghost"
                            icon="back"
                            onClick={() => setDecidingReview({ review, decision: null })}
                          >
                            {PARKOUR_COPY.bounce}
                          </Button>
                          {decisions.map((decision) => (
                            <Button
                              key={decision}
                              variant={
                                decision === ReviewAdvices.Stop
                                  ? 'danger'
                                  : decision === ReviewAdvices.Pass
                                    ? 'primary'
                                    : 'secondary'
                              }
                              icon={decision === ReviewAdvices.Stop ? 'close' : 'confirm'}
                              onClick={() => setDecidingReview({ review, decision })}
                            >
                              {labels[decision]}
                            </Button>
                          ))}
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
    </div>
  )

  return (
    <div className="flex flex-col gap-8" {...beacon(GUIDE_BEACONS.fsiTabs)}>
      <div className={MEMBER_FILE.layout}>
        <JuniorRail
          junior={junior}
          functionName={sessionFunctionName}
          skillAverage={skillAverage}
          isReady={isReady}
          canEdit={canManage}
          onEdit={() => {
            file.clearIssues()
            setDialog('junior')
          }}
        />
        <div className={MEMBER_FILE.main}>
          <FileTabs
            label={ACADEMY_COPY.fileTitle}
            value={tab}
            onChange={setTab}
            tabs={[
              {
                value: FSI_TABS.timeline,
                label: ACADEMY_COPY.timelineTab,
                icon: 'clock',
                render: timelineTab,
              },
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
              {
                value: 'skills',
                label: ACADEMY_COPY.tabCompetences,
                icon: 'skill',
                render: skillsTab,
              },
              { value: 'notes', label: ACADEMY_COPY.tabNotes, icon: 'note', render: notesTab },
              ...(canReadObjectives
                ? [
                    {
                      value: 'objectives',
                      label: ACADEMY_COPY.tabObjectives,
                      icon: 'objective' as const,
                      render: objectivesTab,
                    },
                  ]
                : []),
              {
                value: 'reviews',
                label: ACADEMY_COPY.tabReviews,
                icon: 'confirm',
                render: reviewsTab,
              },
            ]}
          />
        </div>
      </div>

      <FormDrawer
        subject={FORM_SUBJECTS.junior}
        open={dialog === 'junior'}
        title={junior.displayName}
        fields={juniorFields}
        initialValues={junior.values}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={file.save}
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.note}
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

      <FormDrawer
        subject={FORM_SUBJECTS.objective}
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

      <FormDrawer
        subject={FORM_SUBJECTS.review}
        open={dialog === 'review'}
        title={editingReview ? ACTION_COPY.edit : ACADEMY_COPY.reviewAdd}
        description={ACADEMY_COPY.reviewsLead}
        fields={reviewFields}
        initialValues={editingReview?.values}
        issues={file.issues}
        isSaving={file.isSaving}
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
        open={decidingReview !== null && !opensThirdPeriod}
        title={
          decidingReview?.decision
            ? (PARKOUR_DECISIONS[decidingReview.review.stage]?.[decidingReview.decision] ?? '')
            : PARKOUR_COPY.bounce
        }
        description={
          decidingReview?.decision
            ? PARKOUR_DECISION_CONFIRM[decidingReview.decision]
            : ACADEMY_COPY.reviewRejectDescription
        }
        tone={decidingReview?.decision === ReviewAdvices.Stop ? 'danger' : 'success'}
        pending={file.isSaving}
        onCancel={() => setDecidingReview(null)}
        onConfirm={async () => {
          await decide()
        }}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.review}
        open={opensThirdPeriod}
        title={PARKOUR_DECISIONS[AcademyStages.ReviewFinal]?.[ReviewAdvices.Bonus] ?? ''}
        description={PARKOUR_DECISION_CONFIRM[ReviewAdvices.Bonus]}
        fields={THIRD_PERIOD_FIELDS}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={(values) =>
          decide({
            deadlineAt: typeof values.deadlineAt === 'string' ? values.deadlineAt : undefined,
            decisionNote: typeof values.decisionNote === 'string' ? values.decisionNote : undefined,
          })
        }
        onClose={() => setDecidingReview(null)}
      />
    </div>
  )
}
