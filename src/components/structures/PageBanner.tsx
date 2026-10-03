import type { ReactNode } from 'react'
import { BannerArt } from '@/components/structures/BannerArt'
import { PAGE_OPTIONS_HOST_ID } from '@/declarations/ui/banners'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface PageBannerProps {
  title: string
  // The page already carries its own h1, the notch then only names the area
  isLabel?: boolean
  children?: ReactNode
}

/**
 * Banner across the top of a page: the photograph of its area and a notch cut into the bottom
 * edge that holds the title
 * @param {string} title - Title sitting in the notch
 * @param {boolean} [isLabel] - The notch names the area, an h1 sits further down the page
 * @param {ReactNode} [children] - Extra content of the notch, after the title
 * @return {JSX.Element}
 */

export const PageBanner = ({ title, isLabel, children }: PageBannerProps) => {
  const Title = isLabel ? 'p' : 'h1'

  return (
    <div className={PAGE_STYLES.banner}>
      <BannerArt />
      <div id={PAGE_OPTIONS_HOST_ID} className={PAGE_STYLES.bannerOptions} />
      <div className={PAGE_STYLES.notch}>
        <span className={PAGE_STYLES.notchSlopeStart} aria-hidden="true" />
        <div className={PAGE_STYLES.notchBody}>
          <Title className={PAGE_STYLES.notchTitle} title={title}>
            <span className={PAGE_STYLES.notchTitleText}>{title}</span>
          </Title>
          {children}
        </div>
        <span className={PAGE_STYLES.notchSlopeEnd} aria-hidden="true" />
      </div>
    </div>
  )
}
