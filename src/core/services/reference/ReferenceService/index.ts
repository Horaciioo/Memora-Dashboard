import 'server-only'
import { discordIdentifiers } from '@/core/services/reference/discordIdentifiers'
import { notFound } from '@/core/lib/errors'
import { readDate, readList } from '@/core/lib/forms/values'
import type { ReferenceKey } from '@/declarations/reference/sections'
import type { FormValues } from '@/types/forms'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'
import { youtubers } from '@/core/services/reference/ReferenceService/resources/youtubers'
import { divisions } from '@/core/services/reference/ReferenceService/resources/divisions'
import { platforms } from '@/core/services/reference/ReferenceService/resources/platforms'
import { socialNetworks } from '@/core/services/reference/ReferenceService/resources/socialNetworks'
import { workflowStates } from '@/core/services/reference/ReferenceService/resources/workflowStates'
import { priorities } from '@/core/services/reference/ReferenceService/resources/priorities'
import { eventTemplates } from '@/core/services/reference/ReferenceService/resources/eventTemplates'
import { trainings } from '@/core/services/reference/ReferenceService/resources/trainings'
import { liveconLevels } from '@/core/services/reference/ReferenceService/resources/liveconLevels'
import { dispositifs } from '@/core/services/reference/ReferenceService/resources/dispositifs'
import { skillCategories } from '@/core/services/reference/ReferenceService/resources/skillCategories'
import { skills } from '@/core/services/reference/ReferenceService/resources/skills'
import { sanctionMeasures } from '@/core/services/reference/ReferenceService/resources/sanctionMeasures'
import { recruitmentStepTemplates } from '@/core/services/reference/ReferenceService/resources/recruitmentStepTemplates'
import { recruitmentOutcomes } from '@/core/services/reference/ReferenceService/resources/recruitmentOutcomes'

export type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

/**
 * Reference collections by key
 * @type {Record<ReferenceKey, ReferenceResource>}
 */

const RESOURCES: Record<ReferenceKey, ReferenceResource> = {
  creators: youtubers,
  divisions,
  platforms,
  socials: socialNetworks,
  states: workflowStates,
  priorities,
  events: eventTemplates,
  trainings,
  livecon: liveconLevels,
  schemes: dispositifs,
  'skill-categories': skillCategories,
  skills,
  sanctions: sanctionMeasures,
  'recruitment-steps': recruitmentStepTemplates,
  'recruitment-outcomes': recruitmentOutcomes,
  'discord-identifiers': discordIdentifiers,
}

/**
 * Read the operations of a reference collection
 * @param {ReferenceKey} key - Collection key
 * @return {ReferenceResource} - Collection operations
 */

export const referenceResource = (key: ReferenceKey): ReferenceResource => {
  const resource = RESOURCES[key]
  if (!resource) throw notFound()

  return resource
}

/**
 * Read the identifiers submitted for a reorder
 * @param {FormValues} values - Parsed body
 * @return {string[]} - Identifiers in their new order
 */

export const readOrder = (values: FormValues): string[] => readList(values, 'ids')

/**
 * Read a date value of a reference form
 * @param {FormValues} values - Parsed body
 * @param {string} name - Field name
 * @return {Date | null} - Date or null
 */

export const readReferenceDate = (values: FormValues, name: string): Date | null =>
  readDate(values, name)
