'use client'

import { WorkComments } from '@/composites/work/WorkComments'
import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { OptionMark } from '@/components/elements/forms/selects/OptionMark'
import { Button } from '@/components/elements/actions/Button'
import { EditableDetailGrid } from '@/components/structures/inline/EditableDetailGrid'
import { InlineAnnouncement } from '@/components/structures/inline/InlineAnnouncement'
import { InlineText } from '@/components/structures/inline/InlineText'
import { useRecordFile } from '@/core/hooks/data/work/useRecordFile'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { COMMUNICATION_HEAD, DISCORD_MESSAGE, LIST_STYLES } from '@/declarations/ui/variants'
import { ANNOUNCEMENT_ENTITY } from '@/declarations/work/announcements'
import { PROJECT_FIELD_COPY, WORK_DISCORD_COPY } from '@/declarations/work/copy'
import { useMenu } from '@/managers/front-end'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import type { CommunicationEntry } from '@/types/work'
import { formatDay } from '@/utils/format/dates'

export interface CommunicationCardProps {
  entry: CommunicationEntry
  fields: FieldDefinition[]
  canWrite: boolean
  onDelete: () => void
}

/**
 * Announcement of a project, every property edited in place
 * @param {CommunicationEntry} entry - Announcement resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the announcement form
 * @param {boolean} canWrite - Member may edit and drop it
 * @param {() => void} onDelete - Asks to drop the announcement
 * @return {JSX.Element}
 */

export const CommunicationCard = ({
  entry,
  fields,
  canWrite,
  onDelete,
}: CommunicationCardProps) => {
  const file = useRecordFile({
    path: API_ROUTES.communication(entry.id),
    entity: ANNOUNCEMENT_ENTITY,
    initialValues: entry.values,
  })
  const copy = useCopy(WORK_DISCORD_COPY.copied)
  const { contextMenu } = useMenu()

  const fieldFor = (name: string): FieldDefinition => fields.find((field) => field.name === name)!

  // Option backing one select value
  const optionOf = (name: string): FieldOption | null => {
    const value = file.values[name]

    return typeof value === 'string' && value
      ? (fieldFor(name).options?.find((option) => option.value === value) ?? null)
      : null
  }

  const title = typeof file.values.title === 'string' ? file.values.title : entry.title
  const body = typeof file.values.body === 'string' ? file.values.body : entry.body
  const published = typeof file.values.publishedAt === 'string' ? file.values.publishedAt : null
  const author = optionOf('authorId')
  const platform = optionOf('platformId')
  const status = optionOf('status')

  const entries = [
    {
      label: PROJECT_FIELD_COPY.communicationAuthor,
      field: fieldFor('authorId'),
      display: author ? (
        <span className="flex items-center gap-2">
          <Avatar name={author.label} src={author.image} size="xs" />
          {author.label}
        </span>
      ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.communicationStatus,
      field: fieldFor('status'),
      display: status ? (
        <Status label={status.label} accent={status.accent} icon="statusDot" />
      ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.communicationPlatform,
      field: fieldFor('platformId'),
      display: platform ? (
        <span className="inline-flex items-center gap-2">
          <OptionMark mark="network" option={platform} />
          <Status label={platform.label} tone="neutral" />
        </span>
      ) : null,
    },
    {
      label: PROJECT_FIELD_COPY.publishedAt,
      field: fieldFor('publishedAt'),
      display: published ? formatDay(published) : null,
    },
  ]

  return (
    <article
      className={LIST_STYLES.card}
      onContextMenu={contextMenu(
        [
          {
            id: 'copy',
            label: ACTION_COPY.copyLink,
            icon: 'copy',
            onSelect: () => void copy(body),
          },
          {
            id: 'delete',
            label: ACTION_COPY.delete,
            icon: 'remove',
            danger: true,
            separatorBefore: true,
            disabled: !canWrite,
            onSelect: onDelete,
          },
        ],
        title
      )}
    >
      <header className={COMMUNICATION_HEAD.wrapper}>
        <InlineText
          id={`communication-title-${entry.id}`}
          value={title}
          disabled={!canWrite}
          maxLength={fieldFor('title').maxLength}
          className={COMMUNICATION_HEAD.title}
          onCommit={(next) => file.saveField('title', next)}
        />
      </header>
      <div className="mt-3">
        <EditableDetailGrid
          entries={entries}
          values={file.values}
          issues={file.issues}
          disabled={!canWrite}
          onCommit={file.saveField}
        />
      </div>
      <h4 className={COMMUNICATION_HEAD.section}>{PROJECT_FIELD_COPY.communicationBody}</h4>
      <div className={DISCORD_MESSAGE.frame}>
        <Button
          variant="icon"
          icon="copy"
          aria-label={WORK_DISCORD_COPY.copy}
          title={WORK_DISCORD_COPY.copy}
          className={DISCORD_MESSAGE.copyCorner}
          onClick={() => void copy(body)}
        />
        <InlineAnnouncement
          id={`communication-body-${entry.id}`}
          value={body}
          mentions={fieldFor('body').options ?? []}
          author={author?.label ?? WORK_DISCORD_COPY.author}
          avatarUrl={author?.image}
          time={published ? formatDay(published) : undefined}
          disabled={!canWrite}
          maxLength={fieldFor('body').maxLength}
          onCommit={(next) => file.saveField('body', next)}
        />
      </div>
      <WorkComments kind="communication" id={entry.id} label={title} />
      {canWrite && (
        <div className="flex justify-end">
          <Button variant="danger" onClick={onDelete}>
            {ACTION_COPY.delete}
          </Button>
        </div>
      )}
    </article>
  )
}
