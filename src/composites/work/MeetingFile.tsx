'use client'

import { useState } from 'react'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { CreatorLabel, ProjectLabel } from '@/components/elements/display/RecordLabel'
import { Button } from '@/components/elements/actions/Button'
import { EmojiPicker } from '@/components/elements/forms/EmojiPicker'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EditableDetailGrid, type EditableEntry } from '@/components/structures/EditableDetailGrid'
import { EditableHeading } from '@/components/structures/EditableHeading'
import { FileTabs } from '@/components/structures/FileTabs'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { InlineMarkdown } from '@/components/structures/InlineMarkdown'
import { InlineText } from '@/components/structures/InlineText'
import { Section } from '@/components/structures/Section'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMeetingTopics } from '@/core/hooks/data/useMeetingTopics'
import { useRecordFile } from '@/core/hooks/data/useRecordFile'
import { useMenu, type MenuItem } from '@/managers/front-end'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { LIST_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { MEETING_COPY, MEETING_FIELD_COPY } from '@/declarations/work/copy'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { FieldDefinition } from '@/types/forms'
import type { MeetingDetail, MeetingTopicEntry } from '@/types/work'
import { WorkflowScopes } from '@/utils/constants/workflow'
import { formatDayTime } from '@/utils/format/dates'

export interface MeetingFileProps {
  detail: MeetingDetail
  meetingFields: FieldDefinition[]
  topicFields: FieldDefinition[]
  activity: ActivityEntry[]
  canUpdate: boolean
  canReadContent: boolean
  canReadLogs: boolean
}

/**
 * One written axis of a meeting's content
 * @typedef {Object} ContentAxis
 * @property {string} name - Field carrying the axis
 * @property {string} title - Axis heading
 * @property {string} empty - Line shown while the axis stays blank
 */

interface ContentAxis {
  name: string
  title: string
  empty: string
}

// The three written axes
const OPENING_AXIS: ContentAxis = {
  name: 'introduction',
  title: MEETING_COPY.introductionTitle,
  empty: MEETING_COPY.introductionEmpty,
}

const CLOSING_AXES: ContentAxis[] = [
  { name: 'outro', title: MEETING_COPY.outroTitle, empty: MEETING_COPY.outroEmpty },
  { name: 'minutes', title: MEETING_COPY.minutesTitle, empty: MEETING_COPY.minutesEmpty },
]

/**
 * Tabs of one meeting file — an overview edited in place
 * @param {MeetingDetail} detail - File resolved server-side
 * @param {FieldDefinition[]} meetingFields - Declarations of the meeting form
 * @param {FieldDefinition[]} topicFields - Declarations of the topic form
 * @param {ActivityEntry[]} activity - Journal entries
 * @param {boolean} canUpdate - Member may edit the meeting
 * @param {boolean} canReadContent - Member may read the content tab
 * @param {boolean} canReadLogs - Member may read the journal
 * @return {JSX.Element}
 */

export const MeetingFile = ({
  detail,
  meetingFields,
  topicFields,
  activity,
  canUpdate,
  canReadContent,
  canReadLogs,
}: MeetingFileProps) => {
  const { summary } = detail
  const file = useRecordFile({
    path: API_ROUTES.meeting(summary.id),
    scope: WorkflowScopes.Meeting,
    initialValues: summary.values,
  })
  const topics = useMeetingTopics(summary.id, detail.topics)
  const { contextMenu } = useMenu()
  const [writingTopic, setWritingTopic] = useState(false)
  const [pendingDeletion, setPendingDeletion] = useState<MeetingTopicEntry | null>(null)

  const fieldByName = new Map(meetingFields.map((field) => [field.name, field]))
  const fieldFor = (name: string): FieldDefinition => fieldByName.get(name)!
  const topicFieldFor = (name: string): FieldDefinition | undefined =>
    topicFields.find((field) => field.name === name)

  // Option backing one select value
  const optionOf = (name: string) => {
    const value = file.values[name]

    return typeof value === 'string' && value
      ? (fieldFor(name).options?.find((option) => option.value === value) ?? null)
      : null
  }

  const textOf = (name: string): string | null => {
    const value = file.values[name]

    return typeof value === 'string' && value.length > 0 ? value : null
  }

  const scheduledValue = textOf('scheduledAt') ?? summary.scheduledAt
  const durationValue =
    typeof file.values.durationMin === 'number' ? file.values.durationMin : summary.durationMin
  const titleValue = textOf('title') ?? summary.title
  const emojiValue = textOf('emoji') ?? summary.emoji
  const stateOption = optionOf('stateId')
  const projectOption = optionOf('projectId')
  const youtuberOption = optionOf('youtuberId')

  const infoEntries: EditableEntry[] = [
    {
      label: MEETING_FIELD_COPY.scheduledAt,
      field: fieldFor('scheduledAt'),
      display: scheduledValue ? formatDayTime(scheduledValue) : null,
    },
    {
      label: MEETING_FIELD_COPY.durationMin,
      field: fieldFor('durationMin'),
      display: durationValue ? `${durationValue} ${MEETING_COPY.minuteUnit}` : null,
    },
    {
      label: MEETING_FIELD_COPY.state,
      field: fieldFor('stateId'),
      display: stateOption ? (
        <Status label={stateOption.label} accent={stateOption.accent} />
      ) : null,
    },
    {
      label: MEETING_FIELD_COPY.project,
      field: fieldFor('projectId'),
      display: projectOption ? (
        <ProjectLabel title={projectOption.label} emoji={projectOption.emoji} />
      ) : null,
    },
    {
      label: MEETING_FIELD_COPY.youtuber,
      field: fieldFor('youtuberId'),
      display: youtuberOption ? (
        <CreatorLabel name={youtuberOption.label} image={youtuberOption.image} />
      ) : null,
    },
  ]

  const attendeeEntries: EditableEntry[] = [
    {
      label: MEETING_FIELD_COPY.leads,
      field: fieldFor('leadIds'),
      display: summary.leads.length > 0 ? <AvatarStack people={summary.leads} /> : null,
    },
    {
      label: MEETING_FIELD_COPY.assistants,
      field: fieldFor('assistantIds'),
      display: summary.assistants.length > 0 ? <AvatarStack people={summary.assistants} /> : null,
    },
    {
      label: MEETING_FIELD_COPY.participants,
      field: fieldFor('participantIds'),
      display:
        summary.participants.length > 0 ? <AvatarStack people={summary.participants} /> : null,
    },
  ]

  // Neutral box
  const boxClass =
    'rounded-[var(--radius-lg)] border border-[var(--color-border)] card-surface p-4 sm:p-5'

  const overviewTab = () => (
    <div className="flex flex-col gap-8">
      <section className={SECTION_STYLES.wrapper}>
        <h2 className={SECTION_STYLES.title}>{MEETING_COPY.informations}</h2>
        <div className={boxClass}>
          <EditableDetailGrid
            entries={infoEntries}
            values={file.values}
            issues={file.issues}
            disabled={!canUpdate}
            onCommit={file.saveField}
          />
        </div>
      </section>
      <section className={SECTION_STYLES.wrapper}>
        <h2 className={SECTION_STYLES.title}>{MEETING_COPY.attendeesTitle}</h2>
        <div className={boxClass}>
          <EditableDetailGrid
            entries={attendeeEntries}
            values={file.values}
            issues={file.issues}
            disabled={!canUpdate}
            onCommit={file.saveField}
          />
        </div>
      </section>
    </div>
  )

  /**
   * Draw one written axis
   * @param {ContentAxis} axis - Axis declaration
   * @return {JSX.Element}
   */

  const renderAxis = (axis: ContentAxis) => (
    <Section key={axis.name} title={axis.title} padded>
      <InlineMarkdown
        id={`axis-${axis.name}`}
        value={textOf(axis.name) ?? ''}
        placeholder={axis.empty}
        disabled={!canUpdate}
        maxLength={fieldFor(axis.name).maxLength}
        onCommit={(next) => file.saveField(axis.name, next.trim() === '' ? null : next)}
      />
    </Section>
  )

  const openWriteTopic = () => {
    topics.clearIssues()
    setWritingTopic(true)
  }

  // One field saved
  const saveTopicField = (topic: MeetingTopicEntry, name: string, value: string | null) =>
    topics.update(topic.id, { ...topic.values, [name]: value })

  const topicMenu = (topic: MeetingTopicEntry): MenuItem[] => [
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      disabled: !canUpdate,
      onSelect: () => setPendingDeletion(topic),
    },
  ]

  const topicsSection = () => (
    <Section title={MEETING_COPY.topicsTitle} bare>
      {topics.entries.length === 0 ? (
        <EmptyState
          figure="notes"
          title={MEETING_COPY.topicsEmptyTitle}
          description={MEETING_COPY.topicsEmptyDescription}
          action={
            <Button variant="primary" icon="add" disabled={!canUpdate} onClick={openWriteTopic}>
              {MEETING_COPY.topicAdd}
            </Button>
          }
        />
      ) : (
        <div className={LIST_STYLES.stack}>
          {topics.entries.map((topic) => (
            <article
              key={topic.id}
              onContextMenu={contextMenu(topicMenu(topic), topic.title)}
              className={LIST_STYLES.card}
            >
              <header className="flex flex-wrap items-center gap-2">
                <EmojiPicker
                  id={`topic-emoji-${topic.id}`}
                  label={MEETING_FIELD_COPY.topicEmoji}
                  value={topic.emoji ?? ''}
                  disabled={!canUpdate}
                  onChange={(next) => void saveTopicField(topic, 'emoji', next)}
                />
                <InlineText
                  id={`topic-title-${topic.id}`}
                  value={topic.title}
                  className="min-w-0 flex-1 text-base font-bold"
                  disabled={!canUpdate}
                  maxLength={topicFieldFor('title')?.maxLength}
                  onCommit={(next) => saveTopicField(topic, 'title', next)}
                />
              </header>
              <InlineMarkdown
                id={`topic-body-${topic.id}`}
                value={topic.body ?? ''}
                placeholder={MEETING_COPY.topicBodyEmpty}
                disabled={!canUpdate}
                maxLength={topicFieldFor('body')?.maxLength}
                onCommit={(next) => saveTopicField(topic, 'body', next.trim() === '' ? null : next)}
              />
            </article>
          ))}
          <AddRow label={MEETING_COPY.topicAdd} disabled={!canUpdate} onClick={openWriteTopic} />
        </div>
      )}
    </Section>
  )

  const contentTab = () => (
    <div className="flex flex-col gap-8">
      {renderAxis(OPENING_AXIS)}
      {topicsSection()}
      {CLOSING_AXES.map(renderAxis)}
    </div>
  )

  const logsTab = () => (
    <Section title={MEETING_COPY.tabLogs} maturity="beta" bare>
      <div className="flex flex-col gap-4">
        {activity.length === 0 ? (
          <EmptyState
            figure="notes"
            title={MEETING_COPY.logsEmptyTitle}
            description={MEETING_COPY.logsEmptyDescription}
            action={<Status label={MEETING_COPY.tabLogs} tone="neutral" />}
          />
        ) : (
          <div className={cn(SECTION_STYLES.panel, SECTION_STYLES.panelPadded)}>
            <ActivityTimeline entries={activity} />
          </div>
        )}
      </div>
    </Section>
  )

  return (
    <div className="flex flex-col gap-8">
      <EditableHeading
        value={titleValue}
        glyph={emojiValue}
        disabled={!canUpdate}
        onCommit={(next) => file.saveField('title', next)}
        onGlyphCommit={(next) => file.saveField('emoji', next)}
      />

      <FileTabs
        label={MEETING_COPY.title}
        tabs={[
          {
            value: 'overview',
            label: MEETING_COPY.tabOverview,
            icon: 'sheet',
            render: overviewTab,
          },
          {
            value: 'content',
            label: MEETING_COPY.tabContent,
            icon: 'note',
            maturity: 'alpha',
            visible: canReadContent,
            render: contentTab,
          },
          {
            value: 'logs',
            label: MEETING_COPY.tabLogs,
            icon: 'history',
            maturity: 'beta',
            visible: canReadLogs,
            render: logsTab,
          },
        ]}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.topic}
        open={writingTopic}
        title={MEETING_COPY.topicAdd}
        fields={topicFields}
        issues={topics.issues}
        isSaving={topics.isSaving}
        onSubmit={topics.create}
        onClose={() => setWritingTopic(false)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={MEETING_COPY.topicDeleteTitle}
        description={MEETING_COPY.topicDeleteDescription}
        pending={topics.isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await topics.remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </div>
  )
}
