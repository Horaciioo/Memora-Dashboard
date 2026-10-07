import type { ReactNode } from 'react'
import { RouteMaturity } from '@/components/structures/RouteMaturity'
import { BannerArt } from '@/components/structures/BannerArt'
import { PAGE_OPTIONS_HOST_ID, PAGE_TABS_HOST_ID } from '@/declarations/ui/banners'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PageBannerProps {
  title: string
  // The page already carries its own h1
  isLabel?: boolean
  children?: ReactNode
  // A line follows the title divider
  hasNote?: boolean
}

/**
 * Banner across the top of a page: the photograph of its area and a notch cut into the bottom
 * edge that holds the title
 * @param {string} title - Title sitting in the notch
 * @param {boolean} [isLabel] - The notch names the area
 * @param {ReactNode} [children] - Extra content of the notch
 * @param {boolean} [hasNote] - Brings the title closer to its divider
 * @return {JSX.Element}
 */

export const PageBanner = ({ title, isLabel, children, hasNote }: PageBannerProps) => {
  const Title = isLabel ? 'p' : 'h1'

  return (
    <div className={PAGE_STYLES.banner}>
      <BannerArt />
      <div id={PAGE_OPTIONS_HOST_ID} className={PAGE_STYLES.bannerOptions} />
      <div className={PAGE_STYLES.notch}>
        <span className={PAGE_STYLES.notchSlopeStart} aria-hidden="true" />
        <div className={PAGE_STYLES.notchBody}>
          <div
            className={cn(
              PAGE_STYLES.notchTitleRow,
              hasNote ? PAGE_STYLES.notchTitleRowNoted : PAGE_STYLES.notchTitleRowFree
            )}
          >
            <Title className={PAGE_STYLES.notchTitle} title={title}>
              <span className={PAGE_STYLES.notchTitleText}>{title}</span>
            </Title>
            <RouteMaturity />
          </div>
          <div id={PAGE_TABS_HOST_ID} className={PAGE_STYLES.notchTabs} />
          {children}
        </div>
        <span className={PAGE_STYLES.notchSlopeEnd} aria-hidden="true" />
      </div>
    </div>
  )
}
