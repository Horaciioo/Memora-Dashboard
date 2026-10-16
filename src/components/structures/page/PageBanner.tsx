import type { ReactNode } from 'react'
import { RouteMaturity } from '@/components/structures/page/RouteMaturity'
import { BannerHero } from '@/components/structures/page/BannerHero'
import { BannerArt } from '@/components/structures/page/BannerArt'
import { PAGE_OPTIONS_HOST_ID, PAGE_TABS_HOST_ID } from '@/declarations/ui/banners'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface PageBannerProps {
  title: string
  // The page already carries its own h1
  isLabel?: boolean
  // Two to six words under the title, the area's own when absent
  heroDescription?: string
  // Picture replacing the area's own
  image?: string | null
  // Small line under the title
  children?: ReactNode
}

/**
 * Banner across the top of a page: the photograph of its area, the title laid over its foot
 * and the tab strip right under it
 * @param {string} title - Title over the photograph
 * @param {boolean} [isLabel] - The title names the area
 * @param {string} [heroDescription] - Faint line under the title
 * @param {string | null} [image] - Picture replacing the area's own
 * @param {ReactNode} [children] - Line under the title
 * @return {JSX.Element}
 */

export const PageBanner = ({
  title,
  isLabel,
  heroDescription,
  image,
  children,
}: PageBannerProps) => {
  const Title = isLabel ? 'p' : 'h1'

  return (
    <>
      <div className={PAGE_STYLES.banner}>
        <BannerArt image={image} />
        <div id={PAGE_OPTIONS_HOST_ID} className={PAGE_STYLES.bannerOptions} />
        <div className={PAGE_STYLES.bannerFoot}>
          <div className={PAGE_STYLES.bannerTitleRow}>
            <Title className={PAGE_STYLES.bannerTitle} title={title}>
              <span className={PAGE_STYLES.bannerTitleText}>{title}</span>
            </Title>
            <RouteMaturity />
          </div>
          <BannerHero text={heroDescription} />
          {children}
        </div>
      </div>
      <div id={PAGE_TABS_HOST_ID} className={PAGE_STYLES.tabsHost} />
    </>
  )
}
