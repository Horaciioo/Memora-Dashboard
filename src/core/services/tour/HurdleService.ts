import 'server-only'

import { prisma } from '@/core/lib/db'
import { encryptField } from '@/core/lib/crypto'
import { readText } from '@/core/lib/forms/values'
import { responsablesOf } from '@/core/services/calendar/MeetingRequestService'
import { notify } from '@/core/services/system/NotificationService'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { TOUR_COPY } from '@/declarations/tour/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'

/**
 * Declaration of the hurdle form
 * @type {FieldDefinition[]}
 */

export const HURDLE_FIELDS: FieldDefinition[] = [
  {
    name: 'body',
    kind: 'textarea',
    label: TOUR_COPY.hurdleLabel,
    required: true,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
]

/**
 * Keep what the member shared as a note of the system on their file and tell their responsables
 * @param {Object} member - Signed-in member
 * @param {string} member.id - Account identifier
 * @param {string[]} member.youtuberIds - Creators of the member
 * @param {FormValues} values - Parsed body
 * @return {Promise<void>} - Saved
 */

export const shareHurdle = async (
  member: { id: string; youtuberIds: string[] },
  values: FormValues
): Promise<void> => {
  await prisma.accountNote.create({
    data: {
      accountId: member.id,
      body: encryptField(readText(values, 'body')) ?? '',
      system: true,
    },
  })

  const recipients = await responsablesOf(member.youtuberIds)
  if (recipients.length === 0) return

  await notify({
    kind: 'HurdleShared',
    recipients,
    actorId: member.id,
    target: 'member',
    targetId: member.id,
  })
}
