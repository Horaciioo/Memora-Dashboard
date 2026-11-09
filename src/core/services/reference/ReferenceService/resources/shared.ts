import 'server-only'
import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { ReferenceRow } from '@/types/reference'

/**
 * Operations backing one reference collection
 * @typedef {Object} ReferenceResource
 * @property {() => Promise<FieldDefinition[]>} fields - Form declarations
 * @property {() => Promise<ReferenceRow[]>} list - Existing rows
 * @property {(values: FormValues) => Promise<ReferenceRow>} create - Add a row
 * @property {(id: string, values: FormValues) => Promise<ReferenceRow>} update - Edit a row
 * @property {(id: string) => Promise<void>} remove - Drop a row
 * @property {(ids: string[]) => Promise<void>} reorder - Apply a new order
 */

export interface ReferenceResource {
  fields: () => Promise<FieldDefinition[]>
  list: () => Promise<ReferenceRow[]>
  create: (values: FormValues) => Promise<ReferenceRow>
  update: (id: string, values: FormValues) => Promise<ReferenceRow>
  remove: (id: string) => Promise<void>
  reorder: (ids: string[]) => Promise<void>
}

export const { shortTextMaxLength, longTextMaxLength, markdownMaxLength } = FORM_SETTINGS

// Shared shape of the name field of every collection
export const nameField: FieldDefinition = {
  name: 'name',
  kind: 'text',
  label: REFERENCE_FIELD_COPY.name,
  required: true,
  maxLength: shortTextMaxLength,
}

// Shared shape of the colour field of every collection
export const accentField: FieldDefinition = {
  name: 'accent',
  kind: 'colour',
  label: REFERENCE_FIELD_COPY.accent,
}

/**
 * Reject a duplicate name
 * @param {unknown} error - Caught value
 * @return {never} - Always throws
 */

export const rethrow = (error: unknown): never => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    if ((error as { code: unknown }).code === 'P2002') throw conflict()
  }

  throw error
}

/**
 * Read the next free position of a collection
 * @param {{ aggregate: (args: object) => Promise<{ _max: { position: number | null } }> }} model - Prisma delegate
 * @return {Promise<number>} - Next position
 */

export const nextPosition = async (model: {
  aggregate: (args: { _max: { position: true } }) => Promise<{ _max: { position: number | null } }>
}): Promise<number> => {
  const result = await model.aggregate({ _max: { position: true } })

  return (result._max.position ?? 0) + 1
}

/**
 * Apply an explicit order to a collection
 * @param {(id: string, position: number) => Promise<unknown>} write - Row updater
 * @param {string[]} ids - Identifiers in their new order
 * @return {Promise<void>} - Applied
 */

export const applyOrder = async (
  write: (id: string, position: number) => Promise<unknown>,
  ids: string[]
): Promise<void> => {
  await Promise.all(ids.map((id, index) => write(id, index)))
}

/**
 * Reject reordering on a collection ordered by another column
 * @return {Promise<void>} - Never reorders
 */

export const noReorder = async (): Promise<void> => {}

/**
 * Leave one single default outcome standing
 * @param {string} id - Outcome that keeps the flag
 * @return {Promise<void>} - Applied
 */

export const clearOtherDefaults = async (id: string): Promise<void> => {
  await prisma.recruitmentOutcome.updateMany({
    where: { id: { not: id } },
    data: { isDefault: false },
  })
}
