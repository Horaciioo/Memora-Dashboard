import 'server-only'

import { propose } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { ABSENCE_SCENARIO_COPY } from '@/declarations/assistant/scenarios/absence'
import type { AssistantAbsenceMode } from '@/types/assistant'

// Words answering each way in
const OPENINGS: Record<AssistantAbsenceMode, string> = {
  create: ABSENCE_SCENARIO_COPY.openCreate,
  edit: ABSENCE_SCENARIO_COPY.openEdit,
  delete: ABSENCE_SCENARIO_COPY.openDelete,
  list: ABSENCE_SCENARIO_COPY.openList,
}

/**
 * Open the absence talk, Memora leads it from there
 * @param {ResolverContext} context - Resolver context
 * @return {Promise<AssistantProposal>} - Proposal opening the talk
 */

export const resolveAbsence: Resolver = async ({ parsed }) => {
  const entry = parsed.absenceMode ?? 'create'

  return propose('absence', {
    reply: OPENINGS[entry],
    action: { kind: 'scenario', scenario: 'absence', entry },
  })
}
