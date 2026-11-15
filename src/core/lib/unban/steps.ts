import { UNBAN_STEP } from '@/utils/constants/unban'
import type { FieldDefinition } from '@/types/forms'

/**
 * Whether a question is quick to answer
 * @param {FieldDefinition} field - Question as a field
 * @return {boolean} - Short answer
 */

const isShort = (field: FieldDefinition): boolean =>
  field.kind === 'text' ||
  field.kind === 'date' ||
  (field.kind === 'select' && field.presentation === 'menu')

/**
 * Questions cut into steps, quick ones together and long ones alone
 * @param {FieldDefinition[]} fields - Questions in order
 * @return {FieldDefinition[][]} - One list per step
 */

export const groupQuestions = (fields: FieldDefinition[]): FieldDefinition[][] =>
  fields.reduce<FieldDefinition[][]>((steps, field) => {
    const last = steps[steps.length - 1]
    const joins = isShort(field) && last && last.length < UNBAN_STEP.maxShort && last.every(isShort)

    if (joins) last.push(field)
    else steps.push([field])

    return steps
  }, [])
