import 'server-only'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { EMOJI_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { MEETING_FIELD_COPY } from '@/declarations/work/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MeetingTopicEntry } from '@/types/work'
import type { Prisma } from '@prisma/client'

/**
 * Map a topic row to its display shape
 * @param {Prisma.MeetingTopicGetPayload<object>} row - Topic row
 * @return {MeetingTopicEntry} - Point covered
 */

export const toTopic = (row: Prisma.MeetingTopicGetPayload<object>): MeetingTopicEntry => ({
  id: row.id,
  emoji: row.emoji,
  title: row.title,
  body: row.body,
  position: row.position,
  values: { emoji: row.emoji, title: row.title, body: row.body },
})

/**
 * Build the topic form declarations
 * @return {FieldDefinition[]} - Field declarations
 */

export const topicFields = (): FieldDefinition[] => [
  {
    name: 'emoji',
    kind: 'emoji',
    label: MEETING_FIELD_COPY.topicEmoji,
    maxLength: EMOJI_SETTINGS.maxLength,
  },
  {
    name: 'title',
    kind: 'text',
    label: MEETING_FIELD_COPY.topicTitle,
    required: true,
    glyph: 'emoji',
    maxLength: FORM_SETTINGS.titleMaxLength,
  },
  {
    name: 'body',
    kind: 'markdown',
    label: MEETING_FIELD_COPY.topicBody,
    maxLength: FORM_SETTINGS.markdownMaxLength,
  },
]

/**
 * Read the topics of one meeting
 * @param {string} meetingId - Meeting identifier
 * @return {Promise<MeetingTopicEntry[]>} - Points covered
 */

export const listTopics = async (meetingId: string): Promise<MeetingTopicEntry[]> => {
  const rows = await prisma.meetingTopic.findMany({
    where: { meetingId },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })

  return rows.map(toTopic)
}

/**
 * Open a topic on a meeting
 * @param {string} meetingId - Meeting identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MeetingTopicEntry>} - Created topic
 */

export const addTopic = async (
  meetingId: string,
  values: FormValues
): Promise<MeetingTopicEntry> => {
  // Topics keep their own order inside the meeting
  const last = await prisma.meetingTopic.aggregate({
    where: { meetingId },
    _max: { position: true },
  })

  const row = await prisma.meetingTopic.create({
    data: {
      meetingId,
      emoji: readText(values, 'emoji') ?? '',
      title: readText(values, 'title') ?? '',
      body: readText(values, 'body'),
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
    },
  })

  return toTopic(row)
}

/**
 * Edit a topic
 * @param {string} id - Topic identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MeetingTopicEntry>} - Updated topic
 */

export const updateTopic = async (id: string, values: FormValues): Promise<MeetingTopicEntry> => {
  const row = await prisma.meetingTopic.update({
    where: { id },
    data: {
      emoji: readText(values, 'emoji') ?? '',
      title: readText(values, 'title') ?? '',
      body: readText(values, 'body'),
    },
  })

  return toTopic(row)
}

/**
 * Drop a topic
 * @param {string} id - Topic identifier
 * @return {Promise<void>} - Removed
 */

export const removeTopic = async (id: string): Promise<void> => {
  await prisma.meetingTopic.delete({ where: { id } })
}

/**
 * Read the meeting a topic belongs to
 * @param {string} id - Topic identifier
 * @return {Promise<string>} - Meeting identifier
 */

export const topicMeetingId = async (id: string): Promise<string> => {
  const row = await prisma.meetingTopic.findUnique({ where: { id }, select: { meetingId: true } })
  if (!row) throw notFound()

  return row.meetingId
}

/**
 * Read one meeting topic
 * @param {string} id - Topic identifier
 * @return {Promise<MeetingTopicEntry>} - Point covered
 */

export const readTopic = async (id: string): Promise<MeetingTopicEntry> => {
  const row = await prisma.meetingTopic.findUnique({ where: { id } })
  if (!row) throw notFound()

  return toTopic(row)
}
