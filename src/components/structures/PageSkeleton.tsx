import { Skeleton, SkeletonList } from '@/components/elements/feedback/Skeleton'
import type { SkeletonShape } from '@/declarations/ui/variants'

export interface PageSkeletonBlock {
  shape: SkeletonShape
  rows?: number
}

export interface PageSkeletonProps {
  blocks: PageSkeletonBlock[]
}

/**
 * Route-level skeleton, echoes a page's title and content blocks while it loads
 * @param {PageSkeletonBlock[]} blocks - Ordered shapes standing
 * @return {JSX.Element}
 */

export const PageSkeleton = ({ blocks }: PageSkeletonProps) => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-2">
      <Skeleton shape="line" className="h-6 w-48" />
      <Skeleton shape="line" className="w-80" />
    </div>
    {blocks.map((block, index) => (
      <SkeletonList key={index} shape={block.shape} rows={block.rows} />
    ))}
  </div>
)
