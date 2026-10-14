import { ACADEMY_STAGE_REGISTRY } from '@/declarations/academy/registries'
import { AcademyJuniorStatuses, AcademyStages } from '@/utils/constants/hierarchy'
import type { AcademyJuniorStatusName, AcademyStageName } from '@/utils/constants/hierarchy'

/**
 * Whether the personal objectives are open to a junior: from the practice on, or once graduated
 * @param {AcademyJuniorStatusName} status - Junior status
 * @param {AcademyStageName} stage - Stage the junior stands in
 * @return {boolean} - Objectives unlocked
 */

export const objectivesUnlocked = (
  status: AcademyJuniorStatusName,
  stage: AcademyStageName
): boolean => {
  const stages = ACADEMY_STAGE_REGISTRY.keys

  return (
    status === AcademyJuniorStatuses.Validated ||
    stages.indexOf(stage) >= stages.indexOf(AcademyStages.Practice)
  )
}
