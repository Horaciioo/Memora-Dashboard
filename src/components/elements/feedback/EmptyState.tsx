import type { FC, ReactNode } from 'react'
import {
  EmptyBoxIllustration,
  NoResultsIllustration,
  type EmptyStateIllustrationProps,
} from '@/components/elements/feedback/EmptyStateIllustration'
import { EMPTY_STATE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export type EmptyStateVariant = 'start' | 'filter'

export interface EmptyStateProps {
  // 'start' invites in, 'filter' invites to widen the search
  variant?: EmptyStateVariant
  // Overrides the variant's default illustration
  icon?: FC<EmptyStateIllustrationProps>
  // Falls back to generic copy on 'filter', required on 'start'
  title?: string
  description?: string
  // Always rendered below the description — an EmptyState is never a dead end
  action: ReactNode
  className?: string
}

const DEFAULT_ILLUSTRATIONS: Record<EmptyStateVariant, FC<EmptyStateIllustrationProps>> = {
  start: EmptyBoxIllustration,
  filter: NoResultsIllustration,
}

const FALLBACK_COPY = {
  title: 'No matches',
  description: 'Try widening or clearing the current filter.',
}

/**
 * Dashed placeholder shown in place of an empty table or list, its action is the only
 * way in — a cloned project wires it to "add" for 'start' and "clear filter" for 'filter'
 * @param {EmptyStateProps} props - Variant, illustration, copy and the required action
 * @return {JSX.Element}
 */

export const EmptyState = ({
  variant = 'start',
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  const Illustration = icon ?? DEFAULT_ILLUSTRATIONS[variant]
  const resolvedTitle = title ?? (variant === 'filter' ? FALLBACK_COPY.title : '')
  const resolvedDescription =
    description ?? (variant === 'filter' ? FALLBACK_COPY.description : undefined)

  return (
    <div className={cn(EMPTY_STATE_STYLES.frame, className)}>
      <Illustration className={EMPTY_STATE_STYLES[variant].illustration} />
      <p className="font-medium">{resolvedTitle}</p>
      {resolvedDescription && (
        <p className="max-w-sm text-sm text-[var(--color-ink-subtle)]">{resolvedDescription}</p>
      )}
      <div className="pt-1">{action}</div>
    </div>
  )
}
