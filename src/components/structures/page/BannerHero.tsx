'use client'

import { usePathname } from 'next/navigation'

import { bannerFor } from '@/declarations/ui/banners'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface BannerHeroProps {
  text?: string
}

/**
 * Faint line under the banner title
 * @param {string} [text] - Own line, the area's when absent
 * @return {JSX.Element}
 */

export const BannerHero = ({ text }: BannerHeroProps) => {
  const scene = bannerFor(usePathname())

  return <p className={PAGE_STYLES.bannerHero}>{text ?? scene.hero}</p>
}
