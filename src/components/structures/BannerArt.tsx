/* eslint-disable @next/next/no-img-element */
'use client'

import { usePathname } from 'next/navigation'

import { bannerFor } from '@/declarations/ui/banners'
import { PAGE_BANNER } from '@/declarations/ui/variants'

/**
 * Photograph of a page banner, the one of the area the route belongs to. It fills the banner and
 * is cropped, never stretched
 * @return {JSX.Element}
 */

export const BannerArt = () => {
  const scene = bannerFor(usePathname())

  return (
    <div className={PAGE_BANNER.art} aria-hidden="true">
      <img
        src={scene.image}
        alt=""
        width={2400}
        height={420}
        className={PAGE_BANNER.image}
        style={{ objectPosition: scene.position ?? 'center' }}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  )
}
