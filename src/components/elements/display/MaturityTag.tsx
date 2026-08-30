import Link from 'next/link'

import { MATURITY_COPY } from '@/declarations/maturity/copy'
import { MATURITY_REGISTRY } from '@/declarations/maturity/registries'
import type { MaturityName } from '@/declarations/maturity/registries'
import { ROUTES } from '@/declarations/navigation'
import { TONES } from '@/declarations/ui/theme'
import { MATURITY_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface MaturityTagProps {
  maturity: MaturityName
  // Renders a plain badge instead of a link when the tag already sits inside a link or button
  interactive?: boolean
  className?: string
}

/**
 * Toned pill telling how far along a feature is, its click opening the explainer page
 * @param {MaturityName} maturity - Lifecycle stage of the feature
 * @param {boolean} [interactive] - Links to the explainer page, on by default
 * @param {string} [className] - Extra classes merged onto the pill
 * @return {JSX.Element}
 */

export const MaturityTag = ({ maturity, interactive = true, className }: MaturityTagProps) => {
  const level = MATURITY_REGISTRY.get(maturity)
  const tone = TONES[level.tone]
  const classes = cn(MATURITY_STYLES.tag, tone.soft, tone.text, className)

  if (!interactive) return <span className={classes}>{level.label}</span>

  return (
    <Link
      href={ROUTES.maturity}
      title={MATURITY_COPY.tagHint}
      className={cn(classes, MATURITY_STYLES.link)}
    >
      {level.label}
    </Link>
  )
}
