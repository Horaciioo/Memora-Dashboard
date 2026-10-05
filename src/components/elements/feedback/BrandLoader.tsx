import Image from 'next/image'

import { APP_ASSETS } from '@/declarations/app'
import { FEEDBACK_COPY } from '@/declarations/ui/copy/feedback'
import { BRAND_LOADER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export type BrandLoaderVariant = 'tile' | 'block' | 'inline' | 'ink'

export interface BrandLoaderProps {
  variant?: BrandLoaderVariant
  // Line under the mark
  caption?: string
  className?: string
}

// Natural size of the animation
const MARK_WIDTH = 619
const MARK_HEIGHT = 370

/**
 * Animated Memora mark shown while something loads. The tile sits beside a title
 * @param {BrandLoaderVariant} [variant] - Where it is drawn
 * @param {string} [caption] - Line under the mark
 * @param {string} [className] - Extra classes merged onto the wrapper
 * @return {JSX.Element}
 */

export const BrandLoader = ({ variant = 'tile', caption, className }: BrandLoaderProps) => {
  const mark = (markClass: string) => (
    <Image
      src={APP_ASSETS.loader}
      alt=""
      width={MARK_WIDTH}
      height={MARK_HEIGHT}
      unoptimized
      priority
      className={markClass}
    />
  )

  if (variant === 'inline') {
    return (
      <span role="status" className={cn('inline-flex', className)}>
        {mark(BRAND_LOADER.inline)}
        <span className="sr-only">{FEEDBACK_COPY.loading}</span>
      </span>
    )
  }

  if (variant === 'ink') {
    return (
      <span role="status" className={cn('inline-flex', className)}>
        {mark(BRAND_LOADER.ink)}
        <span className="sr-only">{FEEDBACK_COPY.loading}</span>
      </span>
    )
  }

  if (variant === 'block') {
    return (
      <div role="status" className={cn(BRAND_LOADER.block, className)}>
        <span className={BRAND_LOADER.blockTile}>{mark(BRAND_LOADER.blockMark)}</span>
        <span className={BRAND_LOADER.caption}>{caption ?? FEEDBACK_COPY.loading}</span>
      </div>
    )
  }

  return (
    <span role="status" className={cn(BRAND_LOADER.tile, className)}>
      {mark(BRAND_LOADER.tileMark)}
      <span className="sr-only">{FEEDBACK_COPY.loading}</span>
    </span>
  )
}
