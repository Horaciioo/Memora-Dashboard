import Link from 'next/link'

import { MATURITY_COPY } from '@/declarations/maturity/copy'
import { MATURITY_REGISTRY } from '@/declarations/maturity/registries'
import type { MaturityName } from '@/declarations/maturity/registries'
import { ROUTES } from '@/declarations/navigation'
import { MATURITY_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface MaturityTagProps {
  maturity: MaturityName
  // Renders a plain badge instead of a link when the tag already sits inside a link or button
  interactive?: boolean
  // Smaller, for the rail
  compact?: boolean
  className?: string
}

/**
 * Lifecycle tag: a solid box of the stage's colour, its word in white and a star on the right
 * @param {MaturityName} maturity - Lifecycle stage of the feature
 * @param {boolean} [interactive] - Links to the explainer page
 * @param {boolean} [compact] - Rail size
 * @param {string} [className] - Extra classes merged onto the tag
 * @return {JSX.Element}
 */

export const MaturityTag = ({
  maturity,
  interactive = true,
  compact = false,
  className,
}: MaturityTagProps) => {
  const level = MATURITY_REGISTRY.get(maturity)
  const classes = cn(
    MATURITY_STYLES.tag,
    compact && MATURITY_STYLES.compact,
    MATURITY_STYLES.fills[maturity],
    className
  )
  const body = (
    <>
      <span className={MATURITY_STYLES.sheen} aria-hidden="true" />
      <svg viewBox="0 0 10 10" className={MATURITY_STYLES.star} aria-hidden="true">
        <path d="M5 0 6 4 10 5 6 6 5 10 4 6 0 5 4 4z" fill="currentColor" />
      </svg>
      {level.label}
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
