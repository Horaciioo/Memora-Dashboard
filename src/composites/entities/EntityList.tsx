import { SkeletonList } from '@/components/elements/feedback/Skeleton'
import { EmptyState, type EmptyStateProps } from '@/components/elements/feedback/EmptyState'
import type { Entity } from '@/types/entity'
import { ENTITY_STATUSES } from '@/utils/constants'

export interface EntityListProps {
  entities: Entity[]
  isLoading?: boolean
  // Shown in place of the list once entities is empty and isLoading is false
  emptyState?: EmptyStateProps
}

/**
 * Card list of entities
 * @param {Entity[]} entities - Entities to display
 * @param {boolean} [isLoading] - Shows row skeletons
 * @param {EmptyStateProps} [emptyState] - Swaps the list for this once entities is empty
 * @return {JSX.Element}
 */

export const EntityList = ({ entities, isLoading, emptyState }: EntityListProps) => (
  <div className="flex flex-col gap-3">
    {isLoading && <SkeletonList rows={6} shape="row" />}
    {!isLoading && entities.length === 0 && emptyState && <EmptyState {...emptyState} />}
    {!isLoading &&
      entities.map((entity) => (
        <div
          key={entity.id}
          className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3"
        >
          <span className="font-medium">{entity.name}</span>
          <span className="text-sm text-[var(--color-ink-subtle)]">
            {ENTITY_STATUSES.label(entity.status)}
          </span>
        </div>
      ))}
  </div>
)
