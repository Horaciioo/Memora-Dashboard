import 'server-only'

import { CONFIG_CATEGORIES, categoryOf } from '@/core/lib/configuration/files'
import { NEXUS_ARG_CONTEXT } from '@/core/lib/nexus/context'
import type { VariableCheckers } from '@/core/lib/nexus/registry'
import { FEATURE_MAP } from '@/declarations/features'
import { CONFIG_SUBJECTS } from '@/types/infrastructure'

/**
 * Checks of the variable path segments
 * @type {VariableCheckers}
 */

export const NEXUS_VARIABLES: VariableCheckers = {
  entity: NEXUS_ARG_CONTEXT.hasEntity,
  category: (value) => value === 'summary' || Boolean(categoryOf(value)),
  service: (value) => CONFIG_SUBJECTS.some((subject) => subject === value),
  name: (value) => FEATURE_MAP.has(value),
}

/**
 * Values the screen completes for the new variables
 * @type {Record<string, string[]>}
 */

export const NEXUS_MODULE_VALUES: Record<string, string[]> = {
  category: ['summary', ...CONFIG_CATEGORIES.map((category) => category.id)],
  service: [...CONFIG_SUBJECTS],
  name: [...FEATURE_MAP.keys()],
}
