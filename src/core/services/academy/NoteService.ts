import 'server-only'

import { decryptField, encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { readText } from '@/core/lib/forms/values'
import type { JuniorNoteView } from '@/types/academy'
import type { FormValues } from '@/types/forms'
import { AcademyStages, NoteKinds } from '@/utils/constants/hierarchy'
import type { AcademyStageName, NoteKindName } from '@/utils/constants/hierarchy'
import { juniorInScope, noteInScope } from '@/core/services/academy/lookups'

/**
 * Shape one FSI note
 * @param {object} row - Note row
 * @return {JuniorNoteView} - Note view
 */

const toJuniorNote = (row: {
  id: string
  stage: AcademyStageName
  kind: NoteKindName
  body: string
  createdAt: Date
  author: { displayName: string } | null
}): JuniorNoteView => ({
  id: row.id,
  stage: row.stage,
  kind: row.kind,
  body: decryptField(row.body) ?? '',
  authorName: row.author?.displayName ?? null,
  createdAt: row.createdAt.toISOString(),
  values: { stage: row.stage, kind: row.kind, body: row.body },
})

/**
 * Read the notes kept on a junior's FSI
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<JuniorNoteView[]>} - Notes
 */

export const listJuniorNotes = async (
  juniorId: string,
  scope: AcademyScope
): Promise<JuniorNoteView[]> => {
  await juniorInScope(juniorId, scope)

  const rows = await prisma.juniorNote.findMany({
    where: { juniorId },
    include: { author: true },
    orderBy: { createdAt: 'desc' },
  })

  return rows.map(toJuniorNote)
}

/**
 * Turn parsed values into a note payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toJuniorNoteData = (values: FormValues) => ({
  stage: (readText(values, 'stage') ?? AcademyStages.Preparation) as AcademyStageName,
  kind: (readText(values, 'kind') ?? NoteKinds.Positive) as NoteKindName,
  body: encryptField(readText(values, 'body')) ?? '',
})

/**
 * Write a trace on a junior's FSI
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} authorId - Who wrote it
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorNoteView[]>} - Notes
 */

export const createJuniorNote = async (
  juniorId: string,
  scope: AcademyScope,
  authorId: string,
  values: FormValues
): Promise<JuniorNoteView[]> => {
  await juniorInScope(juniorId, scope)
  await prisma.juniorNote.create({ data: { juniorId, authorId, ...toJuniorNoteData(values) } })

  return listJuniorNotes(juniorId, scope)
}

/**
 * Edit a trace kept on a junior's FSI
 * @param {string} id - Note identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorNoteView[]>} - Notes
 */

export const updateJuniorNote = async (
  id: string,
  scope: AcademyScope,
  values: FormValues
): Promise<JuniorNoteView[]> => {
  const existing = await noteInScope(id, scope)
  await prisma.juniorNote.update({ where: { id }, data: toJuniorNoteData(values) })

  return listJuniorNotes(existing.juniorId, scope)
}

/**
 * Drop a trace kept on a junior's FSI
 * @param {string} id - Note identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<JuniorNoteView[]>} - Notes
 */

export const removeJuniorNote = async (
  id: string,
  scope: AcademyScope
): Promise<JuniorNoteView[]> => {
  const row = await noteInScope(id, scope)
  await prisma.juniorNote.delete({ where: { id } })

  return listJuniorNotes(row.juniorId, scope)
}
