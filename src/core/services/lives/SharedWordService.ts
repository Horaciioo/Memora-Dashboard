import 'server-only'

import { conflict, invalidInput, notFound } from '@/core/lib/errors'
import { prisma } from '@/core/lib/db'
import { plain } from '@/core/lib/modview/detection'
import { readRequiredText } from '@/core/lib/forms/values'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { channelOf } from '@/core/services/lives/ViewerCommentService'
import { MODVIEW_PERSONAL, MODVIEW_PERSONAL_COPY } from '@/declarations/modview/personal'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { SharedWord } from '@/types/lives'

/**
 * Declarations of the shared word form
 * @type {FieldDefinition[]}
 */

export const SHARED_WORD_FIELDS: FieldDefinition[] = [
  {
    name: 'term',
    kind: 'text',
    label: MODVIEW_PERSONAL_COPY.sharedPlaceholder,
    required: true,
    maxLength: MODVIEW_PERSONAL.maxWordLength,
  },
]

// Word row as the team reads it
const toWord = (row: {
  id: string
  term: string
  author: { displayName: string } | null
}): SharedWord => ({ id: row.id, term: row.term, authorName: row.author?.displayName ?? null })

const WITH_AUTHOR = { author: { select: { displayName: true } } } as const

/**
 * Words the team shares on the channel of a live
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Reader perimeter
 * @return {Promise<SharedWord[]>} - Oldest first
 */

export const listSharedWords = async (
  liveId: string,
  scope: AccessScope
): Promise<SharedWord[]> => {
  const { youtuberId } = await channelOf(liveId, scope)
  const rows = await prisma.modSharedWord.findMany({
    where: { youtuberId },
    include: WITH_AUTHOR,
    orderBy: { createdAt: 'asc' },
    take: MODVIEW_PERSONAL.maxSharedWords,
  })

  return rows.map(toWord)
}

/**
 * Share a word with the team
 * @param {Object} input - Word
 * @param {string} input.liveId - Live
 * @param {string} input.authorId - Member adding it
 * @param {FormValues} input.values - Parsed term
 * @param {AccessScope} input.scope - Writer perimeter
 * @return {Promise<SharedWord>} - Created word
 */

export const addSharedWord = async (input: {
  liveId: string
  authorId: string
  values: FormValues
  scope: AccessScope
}): Promise<SharedWord> => {
  const { youtuberId } = await channelOf(input.liveId, input.scope)
  const term = readRequiredText(input.values, 'term')
    .trim()
    .slice(0, MODVIEW_PERSONAL.maxWordLength)
  const termKey = plain(term)
  if (!termKey) throw invalidInput([{ field: 'term', message: FORM_COPY.required }])

  const known = await prisma.modSharedWord.count({ where: { youtuberId } })
  if (known >= MODVIEW_PERSONAL.maxSharedWords) throw conflict(MODVIEW_PERSONAL_COPY.listFull)

  const twin = await prisma.modSharedWord.findUnique({
    where: { youtuberId_termKey: { youtuberId, termKey } },
    include: WITH_AUTHOR,
  })
  if (twin) return toWord(twin)

  const row = await prisma.modSharedWord.create({
    data: { youtuberId, term, termKey, authorId: input.authorId },
    include: WITH_AUTHOR,
  })

  return toWord(row)
}

/**
 * Take a word back from the team
 * @param {string} liveId - Live
 * @param {string} wordId - Word
 * @param {AccessScope} scope - Writer perimeter
 * @return {Promise<{ id: string }>} - Removed word
 */

export const removeSharedWord = async (
  liveId: string,
  wordId: string,
  scope: AccessScope
): Promise<{ id: string }> => {
  const { youtuberId } = await channelOf(liveId, scope)
  const { count } = await prisma.modSharedWord.deleteMany({ where: { id: wordId, youtuberId } })
  if (count === 0) throw notFound()

  return { id: wordId }
}
