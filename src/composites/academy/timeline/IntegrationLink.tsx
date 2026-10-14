import { PARKOUR_STEP } from '@/declarations/ui/variants'

/**
 * Integration link of the promotion
 * @param {Object} props - Component props
 * @param {string} props.path - Path of the link
 * @return {JSX.Element}
 */

export const IntegrationLink = ({ path }: { path: string }) => (
  <div className={PARKOUR_STEP.link}>
    <span className="min-w-0 flex-1">{path}</span>
  </div>
)
