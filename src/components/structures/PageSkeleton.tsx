import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { Skeleton, SkeletonList } from '@/components/elements/feedback/Skeleton'
import { PAGE_SKELETON } from '@/declarations/ui/variants'
import type { SkeletonShape } from '@/declarations/ui/variants'

export interface PageSkeletonBlock {
  shape: SkeletonShape
  rows?: number
}

// Page families a route can echo
export type PageSkeletonLayout =
  'list' | 'groups' | 'board' | 'cards' | 'file' | 'dashboard' | 'sheets' | 'hero'

export interface PageSkeletonProps {
  layout?: PageSkeletonLayout
  // Hand-picked stack, when no layout fits
  blocks?: PageSkeletonBlock[]
}

// Stand-in for a titled box of the real page
const Box = ({ rows = 3, shape = 'row' }: { rows?: number; shape?: SkeletonShape }) => (
  <div className={PAGE_SKELETON.box}>
    <Skeleton shape="line" className="h-5 w-40" />
    <SkeletonList shape={shape} rows={rows} />
  </div>
)

// Stand-in for a titled group of tiles
const Group = ({ tiles = 6, wide }: { tiles?: number; wide?: boolean }) => (
  <div className={PAGE_SKELETON.group}>
    <div className={PAGE_SKELETON.groupHead}>
      <Skeleton shape="line" className="h-8 w-8 rounded-full" />
      <Skeleton shape="line" className="h-5 w-40" />
    </div>
    <div className={wide ? PAGE_SKELETON.gridWide : PAGE_SKELETON.grid}>
      {Array.from({ length: tiles }, (_, index) => (
        <Skeleton key={index} shape="row" className="h-16" />
      ))}
    </div>
  </div>
)

/**
 * Body of one layout
 * @param {PageSkeletonLayout} layout - Page family
 * @return {JSX.Element}
 */

const LayoutBody = ({ layout }: { layout: PageSkeletonLayout }) => {
  switch (layout) {
    case 'groups':
      return (
        <>
          <Skeleton shape="row" />
          <Group />
          <Group tiles={3} />
        </>
      )
    case 'board':
      return (
        <div className={PAGE_SKELETON.columns}>
          {[4, 3, 2].map((cards, index) => (
            <div key={index} className={PAGE_SKELETON.column}>
              <Skeleton shape="line" className="h-5 w-28" />
              <SkeletonList shape="tile" rows={cards} />
            </div>
          ))}
        </div>
      )
    case 'cards':
      return (
        <div className={PAGE_SKELETON.grid}>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} shape="card" />
          ))}
        </div>
      )
    case 'file':
      return (
        <div className={PAGE_SKELETON.file}>
          <div className={PAGE_SKELETON.box}>
            <Skeleton shape="tile" />
            <Skeleton shape="line" className="mx-auto h-6 w-40" />
            <SkeletonList shape="line" rows={3} />
          </div>
          <div className={PAGE_SKELETON.page}>
            <div className={PAGE_SKELETON.tabs}>
              {['w-24', 'w-20', 'w-24', 'w-28'].map((width, index) => (
                <Skeleton key={index} shape="row" className={`h-9 ${width}`} />
              ))}
            </div>
            <Box shape="row" rows={2} />
            <Box shape="tile" rows={2} />
          </div>
        </div>
      )
    case 'dashboard':
      return (
        <div className={PAGE_SKELETON.split}>
          <div className={PAGE_SKELETON.page}>
            <Box rows={2} />
            <Box rows={4} />
          </div>
          <div className={PAGE_SKELETON.page}>
            <Box rows={3} />
            <Box rows={2} />
          </div>
        </div>
      )
    case 'sheets':
      return (
        <>
          <Box shape="row" rows={3} />
          <Box shape="row" rows={3} />
        </>
      )
    case 'hero':
      return (
        <>
          <div className={PAGE_SKELETON.hero}>
            <Skeleton shape="line" className="h-14 w-14 rounded-full" />
            <Skeleton shape="line" className="h-10 w-72" />
          </div>
          <Group tiles={4} wide />
          <Group tiles={4} wide />
        </>
      )
    default:
      return (
        <div className={PAGE_SKELETON.box}>
          <SkeletonList shape="row" rows={7} />
        </div>
      )
  }
}

/**
 * Route-level skeleton: a title with the brand loader beside it, then the shape of the page
 * it stands in for, so nothing jumps once the data lands
 * @param {PageSkeletonLayout} [layout] - Page family to echo, defaults to a list
 * @param {PageSkeletonBlock[]} [blocks] - Hand-picked stack replacing the layout
 * @return {JSX.Element}
 */

export const PageSkeleton = ({ layout = 'list', blocks }: PageSkeletonProps) => (
  <div className={PAGE_SKELETON.page}>
    <div className={PAGE_SKELETON.head}>
      <div className={PAGE_SKELETON.title}>
        <Skeleton shape="line" className="h-6 w-48" />
        <Skeleton shape="line" className="w-80 max-w-full" />
      </div>
      <BrandLoader />
    </div>
    {blocks ? (
      blocks.map((block, index) => (
        <SkeletonList key={index} shape={block.shape} rows={block.rows} />
      ))
    ) : (
      <LayoutBody layout={layout} />
    )}
  </div>
)
