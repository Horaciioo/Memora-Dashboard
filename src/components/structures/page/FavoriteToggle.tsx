'use client'

import { usePathname } from 'next/navigation'
import { FavoriteStar } from '@/components/elements/display/FavoriteStar'
import { useFavoritePage } from '@/core/hooks/data/system/useFavoritePage'
import { FAVORITE_COPY } from '@/declarations/ui/favorites'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { useBreadcrumbOverrides } from '@/managers/front-end'
import { cn } from '@/utils/classnames'

export interface FavoriteToggleProps {
  // Name of the page when the trail holds none
  title: string
}

/**
 * Star of the page in the banner bar
 * @param {string} title - Page name stand-in
 * @return {JSX.Element}
 */

export const FavoriteToggle = ({ title }: FavoriteToggleProps) => {
  const pathname = usePathname()
  const label = useBreadcrumbOverrides()[pathname] ?? title
  const { isFavorite, isFull, toggle } = useFavoritePage(pathname, label)
  const hint = isFavorite ? FAVORITE_COPY.remove : isFull ? FAVORITE_COPY.full : FAVORITE_COPY.add

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={hint}
      title={hint}
      disabled={isFull}
      onClick={toggle}
      className={PAGE_STYLES.barButton}
    >
      <FavoriteStar
        isOutline={!isFavorite}
        className={cn(PAGE_STYLES.barStar, isFull && PAGE_STYLES.barStarDim)}
      />
    </button>
  )
}
