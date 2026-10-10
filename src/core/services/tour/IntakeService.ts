import 'server-only'

import { prisma } from '@/core/lib/db'
import { readDate, readFlag, readList } from '@/core/lib/forms/values'
import { profileFields } from '@/core/services/preferences/ProfileService'
import type { FieldDefinition, FormValues } from '@/types/forms'

// Answers the admission collects
const INTAKE_FIELD_NAMES = ['birthday', 'languages', 'celebrateBirthday']

/**
 * Declarations of the admission answers, the profile ones
 * @return {FieldDefinition[]} - Field declarations
 */

export const intakeFields = (): FieldDefinition[] =>
  profileFields().filter((field) => INTAKE_FIELD_NAMES.includes(field.name))

/**
 * Write the answers the member gave, and only those
 * @param {string} accountId - Account identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<void>} - Saved
 */

export const saveIntake = async (accountId: string, values: FormValues): Promise<void> => {
  await prisma.account.update({
    where: { id: accountId },
    data: {
      ...('birthday' in values && { birthday: readDate(values, 'birthday') }),
      ...('languages' in values && { languages: readList(values, 'languages') }),
      ...('celebrateBirthday' in values && {
        celebrateBirthday: readFlag(values, 'celebrateBirthday'),
      }),
    },
  })
}
