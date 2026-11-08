'use client'

import { CreatorLabel } from '@/components/elements/display/RecordLabel'
import { RecordId } from '@/components/elements/display/RecordId'
import { Status } from '@/components/elements/display/Status'
import { CommentThread } from '@/components/structures/data/CommentThread'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { FileOverview } from '@/components/structures/page/FileOverview'
import { ObjectivesCard } from '@/composites/academy/junior/ObjectivesCard'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ACADEMY_COPY, ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import { AcademyStages } from '@/utils/constants/hierarchy'
import { ACADEMY_JUNIOR_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import { FILE_BOX } from '@/declarations/ui/variants'
import type { FieldValue } from '@/types/forms'
import { formatDay } from '@/utils/format/time/dates'

/**
 * Overview of a junior's file: what is known of them with their objectives beside it, then the
 * remarks left on them
 * @return {JSX.Element}
 */

export const JuniorOverview = () => {
  const { file, fields, can, comments } = useJuniorState()
  const { junior } = file
  const onCommit = (name: string, value: FieldValue) =>
    file.save({ ...junior.values, [name]: value })
  const fieldFor = (name: string) => fields.junior.find((field) => field.name === name)!
  const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)

  const entries: EditableEntry[] = [
    { label: ACADEMY_FIELD_COPY.junior, display: <RecordId id={junior.id} /> },
    {
      label: SESSION_FILE_COPY.status,
      display: <Status label={status.label} accent={status.accent} icon="statusDot" />,
    },
    {
      label: ACADEMY_FIELD_COPY.referent,
      field: fieldFor('referentId'),
      display: junior.referent ? (
        <CreatorLabel name={junior.referent.name} image={junior.referent.src} />
      ) : null,
    },
    {
      label: ACADEMY_FIELD_COPY.dispositif,
      field: fieldFor('dispositifId'),
      display: junior.dispositif?.name ?? null,
    },
    // Optional third period target
    ...(junior.stage === AcademyStages.Bonus
      ? [
          {
            label: ACADEMY_FIELD_COPY.bonusLives,
            field: fieldFor('bonusLives'),
            display: junior.bonusLives > 0 ? junior.bonusLives : null,
          },
        ]
      : []),
    { label: ACADEMY_FIELD_COPY.startsAt, display: formatDay(junior.startedAt) },
    {
      label: ACADEMY_COPY.validatedOn,
      display: junior.validatedAt ? formatDay(junior.validatedAt) : null,
    },
  ]

  return (
    <FileOverview
      groups={[
        {
          id: 'junior',
          title: SESSION_FILE_COPY.informations,
          entries,
          side: can.readObjectives ? <ObjectivesCard /> : undefined,
        },
      ]}
      values={junior.values}
      issues={file.issues}
      disabled={!can.manage}
      onCommit={onCommit}
    >
      <div className={FILE_BOX.stack}>
        {can.readNotes && (
          <CommentThread
            comments={comments.comments}
            fields={fields.comment}
            issues={comments.issues}
            isSaving={comments.isSaving}
            canWrite={can.writeNotes}
            label={junior.displayName}
            onOpen={comments.clearIssues}
            onAdd={comments.add}
            onRemove={comments.remove}
          />
        )}
      </div>
    </FileOverview>
  )
}
