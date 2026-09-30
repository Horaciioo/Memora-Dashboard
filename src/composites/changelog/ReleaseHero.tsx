'use client'

import { CountUp } from '@/components/elements/display/CountUp'
import { useTilt } from '@/core/hooks/interaction/useTilt'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import type { ChangelogCategory } from '@/declarations/changelog/helpers'
import { CHANGELOG_TAGS } from '@/declarations/changelog/releases'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { CHANGELOG_BOARD } from '@/declarations/ui/blocks'
import { TONES } from '@/declarations/ui/theme'
import { cn } from '@/utils/classnames'
import { dayMonthLabel } from '@/utils/format/days'

export interface ReleaseHeroProps {
  release: ChangelogRelease
  categories: ChangelogCategory[]
}

/**
 * Opening of a note: its version pressed out of the page and leaning toward the pointer, the
 * day, the word of the team, then a figure per category leading to it
 * @param {ReleaseHeroProps} props - Note and its categories
 * @return {JSX.Element}
 */

export const ReleaseHero = ({ release, categories }: ReleaseHeroProps) => {
  const tilt = useTilt()

  return (
    <header className={CHANGELOG_BOARD.hero}>
      <span className={CHANGELOG_BOARD.glow} aria-hidden="true" />

      <div ref={tilt} className={CHANGELOG_BOARD.stage}>
        <span className={CHANGELOG_BOARD.eyebrow}>{CHANGELOG_COPY.versionEyebrow}</span>
        <span className={CHANGELOG_BOARD.numeral}>{release.version}</span>
      </div>

      <time className={CHANGELOG_BOARD.date} dateTime={release.date}>
        {dayMonthLabel(new Date(release.date), true)}
      </time>
      <p className={CHANGELOG_BOARD.intro}>{release.intro}</p>

      <nav className={CHANGELOG_BOARD.counts} aria-label={CHANGELOG_COPY.countsLabel}>
        {categories.map((category) => {
          const meta = CHANGELOG_TAGS[category.tag]

          return (
            <a
              key={category.tag}
              href={`#categorie-${category.tag}`}
              className={CHANGELOG_BOARD.count}
            >
              <span className={cn(CHANGELOG_BOARD.countFigure, TONES[meta.tone].text)}>
                <CountUp value={category.items.length} />
              </span>
              <span className={CHANGELOG_BOARD.countLabel}>{meta.heading}</span>
            </a>
          )
        })}
      </nav>
    </header>
  )
}
