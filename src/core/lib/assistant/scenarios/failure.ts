import { ApiClientError } from '@/core/lib/api/client'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import type { ScenarioMove } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

/**
 * Words of a failed save
 * @param {unknown} error - Thrown error
 * @return {ScenarioMove} - Move saying it
 */

export const failure = (error: unknown): ScenarioMove => ({
  say: [
    error instanceof ApiClientError
      ? fillTemplate(SCENARIO_COPY.failed, { error: error.issues[0]?.message ?? error.message })
      : SCENARIO_COPY.offline,
  ],
})

/**
 * Line of a failure met in a chat
 * @param {unknown} error - Thrown error
 * @return {string} - Readable line
 */

export const failureOf = (error: unknown): string => failure(error).say[0] as string
