import type { CSSProperties } from 'react'

import { Skeleton } from '@/components/elements/feedback/Skeleton'
import { ShowcaseReveal } from '@/composites/changelog/showcase/ShowcaseReveal'
import { ShowcaseShare } from '@/composites/changelog/showcase/ShowcaseShare'
import {
  SHOWCASE_COPY,
  SHOWCASE_SKELETONS,
  SHOWCASE_STEPS,
} from '@/declarations/changelog/showcase'
import { PAGE_SHARE_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcasePagesProps {
  step: number
}

// Blocks typed in turn
const BLOCK_DELAY_MS = 260

// Sparks around the status
const SPARKS = 12

/**
 * Private pages: the Privé tab, a new page filling, its status turning shared
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcasePages = ({ step }: ShowcasePagesProps) => {
  const PageIcon = ICONS.page
  const AddIcon = ICONS.add
  const LockIcon = ICONS.lock
  const ShareIcon = ICONS.globe
  const isPrivate = step >= SHOWCASE_STEPS.toPrivate
  const isCreated = step >= SHOWCASE_STEPS.create
  const isFilled = step >= SHOWCASE_STEPS.fill
  const isShared = step >= SHOWCASE_STEPS.boom
  const name = isFilled ? SHOWCASE_COPY.pageName : PAGES_COPY.untitled

  return (
    <>
      <div className={SHOWCASE.body}>
        <div className={SHOWCASE.tree} aria-hidden="true">
          <div className={SHOWCASE.tabs}>
            <span className={cn(SHOWCASE.tab, !isPrivate && SHOWCASE.tabOn)}>
              {PAGES_COPY.railShared}
            </span>
            <span className={cn(SHOWCASE.tab, isPrivate && SHOWCASE.tabOn)}>
              {PAGES_COPY.railGroup}
            </span>
          </div>
          {Array.from({ length: SHOWCASE_SKELETONS.tree }, (_, index) => (
            <Skeleton key={index} shape="row" className={SHOWCASE.treeBone} />
          ))}
          {isCreated && (
            <span className={cn(SHOWCASE.treeRow, SHOWCASE.treeRowOn)}>
              <PageIcon className={SHOWCASE.glyph} />
              {name}
            </span>
          )}
          <span className={cn(SHOWCASE.treeRow, SHOWCASE.treeNew)}>
            <AddIcon className={SHOWCASE.glyph} />
            {PAGES_COPY.railNew}
          </span>
        </div>

        <div className={SHOWCASE.page}>
          {isCreated ? (
            <>
              <div className={SHOWCASE.pageHead}>
                <h2 className={SHOWCASE.pageName}>{name}</h2>
                <span className={cn(SHOWCASE.status, isShared && SHOWCASE.statusShared)}>
                  {isShared ? (
                    <ShareIcon className={SHOWCASE.statusGlyph} />
                  ) : (
                    <LockIcon className={SHOWCASE.statusGlyph} />
                  )}
                  {isShared ? PAGE_SHARE_COPY.shared : PAGE_SHARE_COPY.closed}
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
              </div>
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
            </>
          ) : (
            <Skeleton shape="card" className={SHOWCASE.pageBone} />
          )}
        </div>
      </div>

      <ShowcaseShare step={step} />
    </>
  )
}
