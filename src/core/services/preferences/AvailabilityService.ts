import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { applyAvailability } from '@/core/lib/realtime/server/presence'
import { AVAILABILITY_COPY } from '@/declarations/system/availability'
import { Availabilities } from '@/utils/constants/availability'
import type { AvailabilityName } from '@/utils/constants/availability'

// Values a member can pick
const CHOICES: string[] = Object.values(Availabilities)

/**
 * Availability named in a body
 * @param {unknown} value - Raw value
 * @return {AvailabilityName} - Availability
 */

export const readAvailabilityChoice = (value: unknown): AvailabilityName => {
  if (typeof value !== 'string' || !CHOICES.includes(value)) {
    throw invalidInput([{ field: 'availability', message: AVAILABILITY_COPY.invalid }])
  }

  return value as AvailabilityName
}

/**
 * Show a member online, offline or unreachable
 * @param {string} accountId - Member
 * @param {AvailabilityName} choice - Availability
 * @return {Promise<AvailabilityName>} - Stored value
 */

export const setAvailability = async (
  accountId: string,
  choice: AvailabilityName
): Promise<AvailabilityName> => {
  const { availability } = await prisma.account.update({
    where: { id: accountId },
    data: { availability: choice },
    select: { availability: true },
  })
  applyAvailability(accountId, availability)

  return availability
}
