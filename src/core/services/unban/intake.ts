import 'server-only'

import { isFeatureOn, readVerdict } from '@/core/services/features/FeatureService'
import { FeatureModes } from '@/declarations/features'
import { UNBAN_INTAKE_FEATURE } from '@/utils/constants/unban'

/**
 * Whether links may be made, an Admin still can while only the whole Déban. is held back
 * @param {boolean} isAdmin - Caller holds the system
 * @return {Promise<boolean>} - Open to this caller
 */

export const isLinkMakingOpen = async (isAdmin: boolean): Promise<boolean> => {
  if (await isFeatureOn(UNBAN_INTAKE_FEATURE)) return true
  if (!isAdmin) return false

  // The child's own switch closes it to everyone
  const verdict = await readVerdict(UNBAN_INTAKE_FEATURE)

  return verdict.mode === FeatureModes.Admins && verdict.source !== UNBAN_INTAKE_FEATURE
}
