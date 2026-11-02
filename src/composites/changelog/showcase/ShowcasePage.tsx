import type { CSSProperties } from 'react'

import { ShowcaseBanner } from '@/composites/changelog/showcase/ShowcaseBanner'
import { ShowcaseReveal } from '@/composites/changelog/showcase/ShowcaseReveal'
import { ShowcaseShare } from '@/composites/changelog/showcase/ShowcaseShare'
import { SHOWCASE_COPY, SHOWCASE_STEPS } from '@/declarations/changelog/showcase'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_SHARE_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PAGE_VIEW_STYLES, SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcasePageProps {
  step: number
}

// Blocks typed in turn
const BLOCK_DELAY_MS = 260

// Sparks around the share button
const SPARKS = 12

/**
 * A new private page: share and link in the banner bar, title and blocks filling
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcasePage = ({ step }: ShowcasePageProps) => {
  const isFilled = step >= SHOWCASE_STEPS.fill
  const isShared = step >= SHOWCASE_STEPS.pick
  const isOpen = step >= SHOWCASE_STEPS.share && step < SHOWCASE_STEPS.finale
  const ShareGlyph = ICONS[isShared ? 'unlock' : 'lock']
  const LinkIcon = ICONS.link
  const name = isFilled ? SHOWCASE_COPY.pageName : PAGES_COPY.untitled

  return (
    <>
      <ShowcaseBanner
        route={ROUTES.pages}
        title={PAGES_COPY.title}
        hero={PAGES_COPY.heroDescription}
        crumbs={[PAGES_COPY.title, name]}
        options={
          <div className={PAGE_VIEW_STYLES.topBar}>
            <div className={PAGE_VIEW_STYLES.shareHost}>
              <span
                data-showcase="share-button"
                className={cn(
                  PAGE_VIEW_STYLES.shareButton,
                  isOpen && PAGE_VIEW_STYLES.shareButtonOpen
                )}
              >
                <ShareGlyph className={PAGE_VIEW_STYLES.barGlyph} aria-hidden="true" />
                <span>{PAGE_SHARE_COPY.button}</span>
                {isShared && (
                  <span className={SHOWCASE.burst} aria-hidden="true">
                    {Array.from({ length: SPARKS }, (_, index) => (
                      <span
                        key={index}
                        className={cn(SHOWCASE.spark, SHOWCASE.sparkTones[index % 3])}
                        style={{ '--angle': `${(360 / SPARKS) * index}deg` } as CSSProperties}
                      />
                    ))}
                  </span>
                )}
              </span>
              {isOpen && <ShowcaseShare step={step} />}
            </div>
            <span className={PAGE_VIEW_STYLES.barIcon}>
              <LinkIcon className={PAGE_VIEW_STYLES.barGlyph} aria-hidden="true" />
            </span>
          </div>
        }
      />
      <div className={SHOWCASE.content}>
        <div className={SHOWCASE.page}>
          <h2 className={SHOWCASE.pageName}>{name}</h2>
          <ShowcaseReveal isOn={isFilled} delayMs={BLOCK_DELAY_MS}>
            <p className={SHOWCASE.blockHead}>{SHOWCASE_COPY.heading}</p>
          </ShowcaseReveal>
          {SHOWCASE_COPY.bullets.map((bullet, index) => (
            <ShowcaseReveal
              key={bullet}
              isOn={isFilled}
              delayMs={BLOCK_DELAY_MS * (index + 2)}
              className={SHOWCASE.bullet}
            >
              <span className={SHOWCASE.bulletDot} />
              {bullet}
            </ShowcaseReveal>
          ))}
        </div>
      </div>
    </>
  )
}
