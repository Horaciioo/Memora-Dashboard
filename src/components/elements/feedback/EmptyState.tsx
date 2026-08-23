import type { ReactNode } from 'react'
import { ILLUSTRATIONS, type IllustrationName } from '@/declarations/ui/illustrations'
import { EMPTY_STATE_STYLES } from '@/declarations/ui/variants'
import { EMPTY_COPY } from '@/declarations/ui/copy/empty'
import { cn } from '@/utils/classnames'

export type EmptyStateVariant = 'start' | 'filter'

export interface EmptyStateProps {
  // 'start' invites in, 'filter' invites to widen the search
  variant?: EmptyStateVariant
  // Overrides the variant's default figure
  figure?: IllustrationName
  // Falls back to generic copy on 'filter', required on 'start'
  title?: string
  description?: string
  // Always rendered below the description — an EmptyState is never a dead end
  action: ReactNode
  // Shrinks padding and illustration, for a box sitting among other content rather than alone
  compact?: boolean
  className?: string
}

/**
 * Dashed placeholder shown in place of an empty table, list or board, its action being the
 * only way in — 'start' wires to a creation gesture, 'filter' to clearing the filter
 * @param {EmptyStateVariant} [variant] - Kind of emptiness, defaults to start
 * @param {IllustrationName} [figure] - Drawn figure overriding the variant default
 * @param {string} [title] - Headline, required on the start variant
 * @param {string} [description] - Supporting line
 * @param {ReactNode} action - Mandatory way out
 * @param {boolean} [compact] - Smaller frame and illustration
 * @param {string} [className] - Extra classes merged onto the frame
 * @return {JSX.Element}
 */

export const EmptyState = ({
  variant = 'start',
  figure,
  title,
  description,
  action,
  compact,
  className,
}: EmptyStateProps) => {
  const Illustration = ILLUSTRATIONS[figure ?? variant]
  const resolvedTitle = title ?? (variant === 'filter' ? EMPTY_COPY.filterTitle : '')
  const resolvedDescription =
    description ?? (variant === 'filter' ? EMPTY_COPY.filterDescription : undefined)

  return (
    <div
      className={cn(
        compact ? EMPTY_STATE_STYLES.frameCompact : EMPTY_STATE_STYLES.frame,
        className
      )}
    >
      <Illustration
        className={
          compact
            ? EMPTY_STATE_STYLES.compact.illustration
            : EMPTY_STATE_STYLES[variant].illustration
        }
      />
      <p className="text-base font-bold">{resolvedTitle}</p>
      {resolvedDescription && (
        <p className="max-w-sm text-sm text-[var(--color-ink-subtle)]">{resolvedDescription}</p>
      )}
      <div className="pt-1">{action}</div>
    </div>
  )
}
