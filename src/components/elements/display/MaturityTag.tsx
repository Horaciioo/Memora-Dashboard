import Link from 'next/link'

import { MATURITY_COPY } from '@/declarations/maturity/copy'
import { MATURITY_REGISTRY } from '@/declarations/maturity/registries'
import type { MaturityName } from '@/declarations/maturity/registries'
import { stepsProgress } from '@/declarations/maturity/steps'
import type { FeatureSteps } from '@/declarations/maturity/steps'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { MATURITY_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface MaturityTagProps {
  maturity: MaturityName
  // Renders a plain badge instead of a link when the tag already sits inside a link or button
  interactive?: boolean
  // Dev share source
  steps?: FeatureSteps
  className?: string
}

/**
 * Lifecycle tag: mono label, a small star on development
 * @param {MaturityName} maturity - Lifecycle stage of the feature
 * @param {boolean} [interactive] - Links to the explainer page
 * @param {FeatureSteps} [steps] - Checked steps
 * @param {string} [className] - Extra classes merged onto the tag
 * @return {JSX.Element}
 */

export const MaturityTag = ({
  maturity,
  interactive = true,
  steps,
  className,
}: MaturityTagProps) => {
  const level = MATURITY_REGISTRY.get(maturity)
  const progress = maturity === 'dev' ? stepsProgress(steps) : null
  const classes = cn(MATURITY_STYLES.tag, className)
  const body = (
    <>
      {maturity === 'dev' && <ICONS.star className={MATURITY_STYLES.star} aria-hidden="true" />}
      {level.label}
      {progress !== null && (
        <span className={MATURITY_STYLES.progress}>{MATURITY_COPY.progress(progress)}</span>
      )}
    </>
  )

  if (!interactive) {
    return (
      <span className={classes} title={level.summary}>
        {body}
      </span>
    )
  }

  return (
    <Link
      href={ROUTES.maturity}
      title={MATURITY_COPY.tagHint}
      className={cn(classes, MATURITY_STYLES.link)}
    >
      {body}
    </Link>
  )
}
