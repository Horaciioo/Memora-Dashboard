'use client'

import { useTilt } from '@/core/hooks/interaction/useTilt'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { CHANGELOG_BOARD } from '@/declarations/ui/blocks'
import { dayMonthLabel } from '@/utils/format/days'

export interface ReleaseHeroProps {
  release: ChangelogRelease
}

/**
 * Opening of a note: its version pressed out of the page and leaning toward the pointer, the
 * day, the word of the team
 * @param {ReleaseHeroProps} props - Note
 * @return {JSX.Element}
 */

export const ReleaseHero = ({ release }: ReleaseHeroProps) => {
  const tilt = useTilt()

  return (
    <header className={CHANGELOG_BOARD.hero}>
      <div ref={tilt} className={CHANGELOG_BOARD.stage}>
        <span className={CHANGELOG_BOARD.eyebrow}>{CHANGELOG_COPY.versionEyebrow}</span>
        <span className={CHANGELOG_BOARD.numeral}>{release.version}</span>
      </div>

      <time className={CHANGELOG_BOARD.date} dateTime={release.date}>
        {dayMonthLabel(new Date(release.date), true)}
      </time>
      <p className={CHANGELOG_BOARD.intro}>{release.intro}</p>
    </header>
  )
}
