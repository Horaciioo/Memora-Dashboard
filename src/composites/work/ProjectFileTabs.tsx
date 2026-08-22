'use client'

import { useState } from 'react'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { Tabs } from '@/components/elements/navigation/Tabs'
import { useCommunications } from '@/core/hooks/data/useCommunications'
import { ACTION_COPY, FIELD_COPY } from '@/declarations/ui/copy'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { toTone } from '@/declarations/ui/theme'
import { PROJECT_COPY } from '@/declarations/work/copy'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { FieldDefinition } from '@/types/forms'
import type { CommunicationEntry, ProjectDetail } from '@/types/work'
import { formatDay, formatDayTime, isOverdue } from '@/utils/format/dates'

export interface ProjectFileTabsProps {
  detail: ProjectDetail
  communicationFields: FieldDefinition[]
  canReadCommunications: boolean
  canWriteCommunications: boolean
}

/**
 * Tabs of one project file, the communication tab holding the markdown editor and its
 * live Discord preview
 * @param {ProjectDetail} detail - File resolved server-side
 * @param {FieldDefinition[]} communicationFields - Declarations of the announcement form
 * @param {boolean} canReadCommunications - Member may read announcements
 * @param {boolean} canWriteCommunications - Member may write announcements
 * @return {JSX.Element}
 */

export const ProjectFileTabs = ({
  detail,
  communicationFields,
  canReadCommunications,
  canWriteCommunications,
}: ProjectFileTabsProps) => {
  const { summary } = detail
  const communications = useCommunications(summary.id, detail.communications)
  const { contextMenu } = useMenu()
  const [tab, setTab] = useState('overview')
  const [isWriting, setWriting] = useState(false)
  const [editing, setEditing] = useState<CommunicationEntry | null>(null)
  const [pendingDeletion, setPendingDeletion] = useState<CommunicationEntry | null>(null)

  const openWrite = () => {
    communications.clearIssues()
    setWriting(true)
  }

  const entryMenu = (entry: CommunicationEntry): MenuItem[] => [
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !canWriteCommunications,
      onSelect: () => {
        communications.clearIssues()
        setEditing(entry)
      },
    },
    {
      id: 'copy',
      label: ACTION_COPY.copyLink,
      icon: 'copy',
      onSelect: () => void navigator.clipboard.writeText(entry.body),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canWriteCommunications,
      onSelect: () => setPendingDeletion(entry),
    },
  ]

  const tabs = [
    { value: 'overview', label: PROJECT_COPY.tabOverview, icon: 'sheet' as const },
    ...(canReadCommunications
      ? [
          {
            value: 'communication',
            label: PROJECT_COPY.tabCommunication,
            icon: 'discord' as const,
            count: communications.entries.length,
          },
        ]
      : []),
    {
      value: 'tasks',
      label: PROJECT_COPY.tabTasks,
      icon: 'tasks' as const,
      count: detail.tasks.length,
    },
    {
      value: 'meetings',
      label: PROJECT_COPY.tabMeetings,
      icon: 'meetings' as const,
      count: detail.meetings.length,
    },
  ]

  return (
    <div className="flex flex-col gap-8">
      <Tabs items={tabs} value={tab} onChange={setTab} label={PROJECT_COPY.title} />

      {tab === 'overview' && (
        <div className="flex flex-col gap-8">
          <Section title={PROJECT_COPY.tabOverview} padded>
            <DetailGrid
              entries={[
                {
                  label: FIELD_COPY.youtuber,
                  value: summary.youtuber ? (
                    <Badge
                      label={summary.youtuber.label}
                      tone={toTone(summary.youtuber.accent, 'info')}
                      icon="youtuber"
                    />
                  ) : null,
                },
                {
                  label: FIELD_COPY.state,
                  value: summary.state ? (
                    <Badge label={summary.state.label} tone={toTone(summary.state.accent)} dot />
                  ) : null,
                },
                {
                  label: FIELD_COPY.priority,
                  value: summary.priority ? (
                    <Badge
                      label={summary.priority.label}
                      tone={toTone(summary.priority.accent, 'warning')}
                    />
                  ) : null,
                },
                {
                  label: FIELD_COPY.platform,
                  value: summary.platform ? (
                    <Badge label={summary.platform.label} tone="neutral" />
                  ) : null,
                },
                {
                  label: FIELD_COPY.deadline,
                  value: summary.deadline ? (
                    <Badge
                      label={formatDay(summary.deadline)}
                      tone={isOverdue(summary.deadline) ? 'danger' : 'neutral'}
                      icon="deadline"
                    />
                  ) : null,
                },
                { label: FIELD_COPY.lead, value: summary.lead?.name },
              ]}
            />
            {summary.description && (
              <p className="pt-4 text-sm whitespace-pre-wrap">{summary.description}</p>
            )}
          </Section>
          <Section title={PROJECT_COPY.team} padded>
            {summary.lead || summary.assistants.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4">
                <AvatarStack
                  people={[...(summary.lead ? [summary.lead] : []), ...summary.assistants]}
                  size="sm"
                  max={8}
                />
                <span className="text-sm text-[var(--color-ink-subtle)]">
                  {[summary.lead?.name, ...summary.assistants.map((person) => person.name)]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-ink-subtle)] italic">{PROJECT_COPY.noLead}</p>
            )}
          </Section>
        </div>
      )}

      {tab === 'communication' && canReadCommunications && (
        <Section
          title={PROJECT_COPY.communicationTitle}
          description={PROJECT_COPY.communicationLead}
          bare
        >
          {communications.entries.length === 0 ? (
            <EmptyState
              figure="notes"
              title={PROJECT_COPY.communicationEmptyTitle}
              description={PROJECT_COPY.communicationEmptyDescription}
              action={
                <Button
                  variant="primary"
                  icon="add"
                  disabled={!canWriteCommunications}
                  onClick={openWrite}
                >
                  {PROJECT_COPY.communicationAdd}
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-4">
              {communications.entries.map((entry) => (
                <article
                  key={entry.id}
                  onContextMenu={contextMenu(entryMenu(entry), entry.title)}
                  className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
                >
                  <header className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold">{entry.title}</h3>
                    {entry.platform && <Badge label={entry.platform.label} tone="info" />}
                    <Badge
                      label={entry.publishedAt ? PROJECT_COPY.published : PROJECT_COPY.draft}
                      tone={entry.publishedAt ? 'success' : 'neutral'}
                      dot
                    />
                    <span className="ml-auto text-xs text-[var(--color-ink-subtle)]">
                      {[entry.authorName, entry.publishedAt ? formatDay(entry.publishedAt) : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <Button
                      variant="icon"
                      icon="edit"
                      aria-label={ACTION_COPY.edit}
                      disabled={!canWriteCommunications}
                      onClick={() => {
                        communications.clearIssues()
                        setEditing(entry)
                      }}
                    />
                  </header>
                  <Markdown source={entry.body} />
                </article>
              ))}
              <AddRow
                label={PROJECT_COPY.communicationAdd}
                disabled={!canWriteCommunications}
                onClick={openWrite}
              />
            </div>
          )}
        </Section>
      )}

      {tab === 'tasks' && (
        <Section title={PROJECT_COPY.tabTasks} bare>
          {detail.tasks.length === 0 ? (
            <EmptyState
              figure="tasks"
              title={PROJECT_COPY.tabTasks}
              description={PROJECT_COPY.emptyDescription}
              action={<Badge label={PROJECT_COPY.tabTasks} tone="neutral" />}
            />
          ) : (
            <div className={LIST_STYLES.stack}>
              {detail.tasks.map((task) => (
                <div key={task.id} className={LIST_STYLES.item}>
                  <span className="min-w-0 flex-1 truncate font-medium">{task.title}</span>
                  {task.owner && (
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {task.owner.name}
                    </span>
                  )}
                  {task.state && (
                    <Badge label={task.state.label} tone={toTone(task.state.accent)} dot />
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === 'meetings' && (
        <Section title={PROJECT_COPY.tabMeetings} bare>
          {detail.meetings.length === 0 ? (
            <EmptyState
              figure="meetings"
              title={PROJECT_COPY.tabMeetings}
              description={PROJECT_COPY.emptyDescription}
              action={<Badge label={PROJECT_COPY.tabMeetings} tone="neutral" />}
            />
          ) : (
            <div className={LIST_STYLES.stack}>
              {detail.meetings.map((meeting) => (
                <div key={meeting.id} className={LIST_STYLES.item}>
                  <span className="min-w-0 flex-1 truncate font-medium">{meeting.title}</span>
                  <span className="text-xs text-[var(--color-ink-subtle)]">
                    {formatDayTime(meeting.scheduledAt)}
                  </span>
                  <AvatarStack people={meeting.participants} />
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      <FormDialog
        open={isWriting}
        title={PROJECT_COPY.communicationAdd}
        fields={communicationFields}
        issues={communications.issues}
        isSaving={communications.isSaving}
        size="lg"
        onSubmit={communications.create}
        onClose={() => setWriting(false)}
      />

      <FormDialog
        open={editing !== null}
        title={editing ? `${ACTION_COPY.edit} · ${editing.title}` : ACTION_COPY.edit}
        fields={communicationFields}
        initialValues={editing?.values}
        issues={communications.issues}
        isSaving={communications.isSaving}
        size="lg"
        onSubmit={(values) => communications.update(editing!.id, values)}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={pendingDeletion !== null}
        title={PROJECT_COPY.communicationDeleteTitle}
        description={PROJECT_COPY.communicationDeleteDescription}
        pending={communications.isSaving}
        onCancel={() => setPendingDeletion(null)}
        onConfirm={async () => {
          await communications.remove(pendingDeletion!.id)
          setPendingDeletion(null)
        }}
      />
    </div>
  )
}
