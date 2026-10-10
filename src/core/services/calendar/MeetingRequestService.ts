import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { readDate, readRequiredText } from '@/core/lib/forms/values'
import { notify } from '@/core/services/system/NotificationService'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { formatDay } from '@/utils/format/dates'
import type { FormValues } from '@/types/forms'

/**
 * Responsables anchored on the creators of a member
 * @param {string[]} youtuberIds - Creators of the member
 * @return {Promise<string[]>} - Responsable identifiers
 */

const responsablesOf = async (youtuberIds: string[]): Promise<string[]> => {
  const anchors = await prisma.youtuberLead.findMany({
    where: { youtuberId: { in: youtuberIds } },
    select: { accountId: true },
  })

  return [...new Set(anchors.map((anchor) => anchor.accountId))]
}

/**
 * Tell the responsables of a member that a meeting is wanted
 * @param {Object} member - Signed-in member
 * @param {string} member.id - Account identifier
 * @param {string[]} member.youtuberIds - Creators of the member
 * @param {FormValues} values - Parsed body
 * @return {Promise<void>} - Sent
 */

export const requestMeeting = async (
  member: { id: string; youtuberIds: string[] },
  values: FormValues
): Promise<void> => {
  const recipients = await responsablesOf(member.youtuberIds)

  // Nobody to ask is told on the form, not swallowed
  if (recipients.length === 0) {
    throw invalidInput([{ field: 'subject', message: CALENDAR_COPY.requestNoLead }])
  }

  const day = readDate(values, 'day')
  const subject = readRequiredText(values, 'subject')

  await notify({
    kind: 'MeetingRequested',
    recipients,
    actorId: member.id,
    target: 'calendar',
    subject: day ? `${subject}, ${formatDay(day)}` : subject,
  })
}
