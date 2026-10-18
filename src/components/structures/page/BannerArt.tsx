/* eslint-disable @next/next/no-img-element */
'use client'

import { usePathname } from 'next/navigation'

import { bannerFor } from '@/declarations/ui/banners'
import { PAGE_BANNER } from '@/declarations/ui/variants'

export interface BannerArtProps {
  // Picture laid instead of the area's own
  image?: string | null
}

/**
 * Photograph of a page banner
 * @param {string | null} [image] - Picture replacing the area's own
 * @return {JSX.Element}
 */

export const BannerArt = ({ image }: BannerArtProps) => {
  const scene = bannerFor(usePathname())
  const position = scene.position ?? 'center'

  return (
    <div className={PAGE_BANNER.art} aria-hidden="true">
      <img
        src={image ?? scene.image}
        alt=""
        width={2400}
        height={420}
        className={PAGE_BANNER.image}
        style={{ objectPosition: image ? 'center' : position }}
        fetchPriority="high"
        decoding="async"
      />
    </div>
  )
}
