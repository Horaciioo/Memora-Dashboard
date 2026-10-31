import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { admitSession } from '@/core/services/academy/AdmissionService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { reachableSession } from '@/core/services/recruitment/reach'
import { readSession } from '@/core/services/recruitment/SessionReader'
import { syncProgramProject } from '@/core/services/work/ProgramProjectService'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import type { RecruitmentSummary } from '@/types/recruitment'
import { RecruitmentStatuses } from '@/utils/constants/recruitment'

/**
 * Close a session, then admit its accepted
 * @param {string} id - Session identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentSummary>} - Session header
 */

export const closeSession = async (id: string, scope: AccessScope): Promise<RecruitmentSummary> => {
  await reachableSession(id, scope)

  // Status comes last so a failure can be retried
  const failed = await admitSession(id)
  if (failed.length > 0) {
    throw conflict(RECRUITMENT_COPY.closeFailed.replace('{names}', failed.join(', ')))
  }

  await prisma.recruitmentSession.update({
    where: { id },
    data: { status: RecruitmentStatuses.Closed },
  })
  await syncProgramProject(id)

  return (await readSession(id, scope)).summary
}
