import { cn } from '@/utils/classnames'
import { SKELETON_BASE, SKELETON_SHAPES, type SkeletonShape } from '@/declarations/ui/variants'

export interface SkeletonProps {
  shape: SkeletonShape
  className?: string
}

/**
 * Placeholder sized like the real content it stands in for, shimmering while active
 * @param {SkeletonShape} shape - Name of the shape to render
 * @param {string} [className] - Extra classes merged onto the placeholder
 * @return {JSX.Element}
 */

export const Skeleton = ({ shape, className }: SkeletonProps) => (
  <div aria-hidden="true" className={cn(SKELETON_BASE, SKELETON_SHAPES[shape], className)} />
)

export interface SkeletonListProps {
  shape: SkeletonShape
  rows?: number
  className?: string
}

/**
 * Stacks several skeletons of the same shape with vertical spacing
 * @param {SkeletonShape} shape - Shape repeated for every row
 * @param {number} [rows] - Number of placeholders to render, defaults to 3
 * @param {string} [className] - Extra classes merged onto the stack
 * @return {JSX.Element}
 */

export const SkeletonList = ({ shape, rows = 3, className }: SkeletonListProps) => (
  <div className={cn('flex flex-col gap-3', className)}>
    {Array.from({ length: rows }, (_, index) => (
      <Skeleton key={index} shape={shape} />
    ))}
  </div>
)
