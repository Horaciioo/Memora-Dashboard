import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { RECRUITMENT_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/recruitment'
import { RECRUITMENT_PERIOD_TIMES } from '@/declarations/recruitment/registries'
import { ROUTES } from '@/declarations/navigation'
import { IDEMPOTENCY_HEADER } from '@/declarations/system/security/idempotency'
import type { ScenarioStep } from '@/types/scenario'
import type { RecruitmentSummary } from '@/types/recruitment'
import { RecruitmentStatuses } from '@/utils/constants/recruitment'

/**
 * Launch, or start the questions over
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Lancer or changer
 * @return {Promise<ScenarioMove>} - Next move
 */

export const recapAnswer: ScenarioStep = async (context, answer) =>
  answer?.value === 'go'
    ? { say: [], next: 'launch', thinking: true }
    : { say: [], next: 'askCreator' }

/**
 * Open the recruitment, as a draft
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

export const launch: ScenarioStep = async (context) => {
  const { youtuberId, functionId, start, end, key } = context.data
  const [opens, closes] = RECRUITMENT_PERIOD_TIMES

  try {
    const created = await apiPost<RecruitmentSummary>(
      API_ROUTES.recruitments,
      {
        youtuberId,
        functionId,
        status: RecruitmentStatuses.Draft,
        period: [`${start}T${opens}`, `${end}T${closes}`],
      },
      { [IDEMPOTENCY_HEADER]: key }
    )
    context.refresh()

    return {
      say: [
        { text: COPY.done, link: { label: created.name, href: ROUTES.recruitment(created.id) } },
        COPY.draft,
      ],
    }
  } catch (error) {
    return failure(error)
  }
}
