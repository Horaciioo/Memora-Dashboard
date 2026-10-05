/* eslint-disable @next/next/no-img-element */
'use client'

import { usePathname } from 'next/navigation'

import { bannerFor } from '@/declarations/ui/banners'
import { PAGE_BANNER } from '@/declarations/ui/variants'

/**
 * Photograph of a page banner
 * @return {JSX.Element}
 */

export const BannerArt = () => {
  const scene = bannerFor(usePathname())
  const position = scene.position ?? 'center'

  return (
    <div className={PAGE_BANNER.art} aria-hidden="true">
      <img
        src={scene.image}
        alt=""
        width={2400}
        height={420}
        className={PAGE_BANNER.image}
        style={{ objectPosition: position }}
        fetchPriority="high"
        decoding="async"
      />
      <div className={PAGE_BANNER.extension}>
        <img
          src={scene.image}
          alt=""
          width={2400}
          height={420}
          className={PAGE_BANNER.image}
          style={{ objectPosition: position }}
          decoding="async"
        />
      </div>
    </div>
  )
}
