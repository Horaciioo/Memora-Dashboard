import { OnboardingShell } from '@/layouts/OnboardingShell'
import { ONBOARDING_STYLES } from '@/declarations/ui/variants'
import type { IntegrationCreator } from '@/types/onboarding'

export interface UnbanNoticeProps {
  title: string
  text: string
  creator: IntegrationCreator | null
}

/**
 * Screen of a link that opens nothing
 * @param {string} title - Heading
 * @param {string} text - Explanation
 * @param {IntegrationCreator | null} creator - Creator whose banner stands on the left
 * @return {JSX.Element}
 */

export const UnbanNotice = ({ title, text, creator }: UnbanNoticeProps) => (
  <OnboardingShell title={title} creator={creator}>
    <p className={ONBOARDING_STYLES.lead}>{text}</p>
  </OnboardingShell>
)
