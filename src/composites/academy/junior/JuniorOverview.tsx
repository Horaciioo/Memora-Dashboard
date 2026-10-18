'use client'

import Link from '@/components/elements/navigation/AppLink'

import { CreatorLabel } from '@/components/elements/display/RecordLabel'
import { RecordId } from '@/components/elements/display/RecordId'
import { Status } from '@/components/elements/display/Status'
import { CommentThread } from '@/components/structures/data/CommentThread'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { FileOverview } from '@/components/structures/page/FileOverview'
import { ObjectivesCard } from '@/composites/academy/junior/ObjectivesCard'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ACADEMY_COPY, ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import { FSI_TABS } from '@/declarations/academy/guides'
import { PARKOUR_PHASES } from '@/declarations/academy/parkour'
import { ACADEMY_JUNIOR_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { ROUTES } from '@/declarations/navigation'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import { FILE_BOX } from '@/declarations/ui/variants'
import type { FieldValue } from '@/types/forms'
import { formatDay } from '@/utils/format/dates'

/**
 * Overview of a junior's file: what is known of them with their objectives beside it, then the
 * remarks left on them
 * @return {JSX.Element}
 */

export const JuniorOverview = () => {
  const { file, fields, can, sessionId, sessionTitle, comments, setTab, recruitmentPath } =
    useJuniorState()
  const { junior } = file
  const onCommit = (name: string, value: FieldValue) =>
    file.save({ ...junior.values, [name]: value })
  const fieldFor = (name: string) => fields.junior.find((field) => field.name === name)!
  const status = ACADEMY_JUNIOR_STATUS_REGISTRY.get(junior.status)

  const entries: EditableEntry[] = [
    { label: ACADEMY_FIELD_COPY.junior, display: <RecordId id={junior.id} /> },
    {
      label: SESSION_FILE_COPY.status,
      field: fieldFor('status'),
      display: <Status label={status.label} accent={status.accent} icon="statusDot" />,
    },
    {
      label: ACADEMY_COPY.phase,
      display: (
        <button
          type="button"
          onClick={() => setTab(FSI_TABS.timeline)}
          className="cursor-pointer font-semibold hover:underline"
        >
          {PARKOUR_PHASES[junior.phase].label}
        </button>
      ),
    },
    {
      label: ACADEMY_FIELD_COPY.trainer,
      field: fieldFor('trainerId'),
      display: junior.trainer ? (
        <CreatorLabel name={junior.trainer.name} image={junior.trainer.src} />
      ) : null,
    },
    {
      label: ACADEMY_FIELD_COPY.dispositif,
      field: fieldFor('dispositifId'),
      display: junior.dispositif?.name ?? null,
    },
    { label: ACADEMY_FIELD_COPY.startsAt, display: formatDay(junior.startedAt) },
    {
      label: ACADEMY_COPY.validatedOn,
      display: junior.validatedAt ? formatDay(junior.validatedAt) : null,
    },
    {
      label: ACADEMY_COPY.recruitment,
      display: recruitmentPath ? (
        <Link href={recruitmentPath} className="font-semibold underline">
          {ACADEMY_COPY.recruitmentFile}
        </Link>
      ) : null,
    },
    {
      label: SESSION_FILE_COPY.promotion,
      display: (
        <Link href={ROUTES.session(sessionId)} className="font-semibold underline">
          {sessionTitle}
        </Link>
      ),
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
