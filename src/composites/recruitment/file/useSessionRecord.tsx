'use client'

import { AvatarStack } from '@/components/elements/display/Avatar'
import type { EditableEntry } from '@/components/structures/inline/EditableDetailGrid'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useRecordFile } from '@/core/hooks/data/work/useRecordFile'
import type { RecordFile } from '@/core/hooks/data/work/useRecordFile'
import { API_ROUTES } from '@/core/lib/api/routes'
import { pickedOptions } from '@/core/lib/forms/options'
import { RECRUITMENT_ENTITY } from '@/declarations/recruitment/copy'

/**
 * Inline record of the open session and the entries built on it
 * @typedef {Object} SessionRecord
 * @property {RecordFile} record - Inline state of the session fields
 * @property {(name: string) => ReturnType<typeof useRecruitmentState>['fields']['session'][number]} fieldFor - Declaration of a field
 * @property {(name: string) => string} text - Text value of a field
 * @property {(label: string, name: string) => EditableEntry} teamEntry - Editable row of portraits
 */

export interface SessionRecord {
  record: RecordFile
  fieldFor: (name: string) => ReturnType<typeof useRecruitmentState>['fields']['session'][number]
  text: (name: string) => string
  teamEntry: (label: string, name: string) => EditableEntry
}

// Portraits drawn side by side
const portraits = (list: { id: string; name: string; src?: string | null }[]) =>
  list.length > 0 ? <AvatarStack wrap size="sm" people={list} max={list.length} /> : null

/**
 * Record of the session, shared by the tabs editing it
 * @return {SessionRecord} - Record and entry builders
 */

export const useSessionRecord = (): SessionRecord => {
  const { detail, fields } = useRecruitmentState()
  const record = useRecordFile({
    path: API_ROUTES.recruitment(detail.summary.id),
    entity: RECRUITMENT_ENTITY,
    initialValues: detail.summary.values,
  })

  const fieldFor = (name: string) => fields.session.find((field) => field.name === name)!
  const text = (name: string) =>
    typeof record.values[name] === 'string' ? (record.values[name] as string) : ''

  // One editable row of portraits per team field
  const teamEntry = (label: string, name: string): EditableEntry => ({
    label,
    field: fieldFor(name),
    display: portraits(
      pickedOptions(fieldFor(name), record.values[name]).map((option) => ({
        id: option.value,
        name: option.label,
        src: option.image,
      }))
    ),
  })

  return { record, fieldFor, text, teamEntry }
}
