/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from 'react'

import { bannerFor } from '@/declarations/ui/banners'
import { PAGE_BANNER, PAGE_STYLES } from '@/declarations/ui/variants'

export interface ShowcaseBannerProps {
  route: string
  title: string
  hero?: string
  // Trail on the left of the bar
  crumbs: string[]
  // Page options on the right of the bar
  options?: ReactNode
}

/**
 * Photo banner of a page: bar on top, title laid over its foot
 * @param {string} route - Page the photograph belongs to
 * @param {string} title - Title
 * @param {string} [hero] - Line under the title
 * @param {string[]} crumbs - Trail
 * @param {ReactNode} [options] - Right of the bar
 * @return {JSX.Element}
 */

export const ShowcaseBanner = ({ route, title, hero, crumbs, options }: ShowcaseBannerProps) => {
  const scene = bannerFor(route)

  return (
    <div className={PAGE_STYLES.banner}>
      <div className={PAGE_BANNER.art}>
        <img src={scene.image} alt="" className={PAGE_BANNER.image} />
      </div>
      <div className={`${PAGE_STYLES.bannerBar} !flex`}>
        <span className="text-sm font-semibold">{crumbs.join(' / ')}</span>
        {options}
      </div>
      <div className={PAGE_STYLES.bannerFoot}>
        <div className={PAGE_STYLES.bannerTitleRow}>
          <p className={PAGE_STYLES.bannerTitle}>
            <span className={PAGE_STYLES.bannerTitleText}>{title}</span>
          </p>
        </div>
        <p className={PAGE_STYLES.bannerHero}>{hero ?? scene.hero}</p>
      </div>
    </div>
  )
}
