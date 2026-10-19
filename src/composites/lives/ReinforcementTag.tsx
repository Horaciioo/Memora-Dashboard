import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'

/**
 * White on blue tag of someone called in as reinforcement
 * @return {JSX.Element}
 */

export const ReinforcementTag = () => (
  <span className={LIVE_REPORT.reinforcementTag}>{LIVE_REPORT_COPY.reinforcement}</span>
)
