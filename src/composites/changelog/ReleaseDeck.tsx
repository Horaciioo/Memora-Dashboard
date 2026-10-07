import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { CHANGELOG_BOARD } from '@/declarations/ui/blocks'
import { dayMonthLabel } from '@/utils/format/days'

export interface ReleaseDeckProps {
  release: ChangelogRelease
}

/**
 * Version and day, carried in the title notch under its divider
 * @param {ReleaseDeckProps} props - Note
 * @return {JSX.Element}
 */

export const ReleaseDeck = ({ release }: ReleaseDeckProps) => (
  <div className={CHANGELOG_BOARD.meta}>
    <span className={CHANGELOG_BOARD.version}>{CHANGELOG_COPY.versionLabel(release.version)}</span>
    <time className={CHANGELOG_BOARD.date} dateTime={release.date}>
      {dayMonthLabel(new Date(release.date), true)}
    </time>
  </div>
)
