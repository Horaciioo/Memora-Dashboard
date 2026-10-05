import Link from 'next/link'

import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { changelogPath } from '@/declarations/changelog/helpers'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_FLOW } from '@/declarations/ui/variants'

export interface HomeNewsProps {
  release: ChangelogRelease | undefined
}

/**
 * Latest note, one gold line
 * @param {ChangelogRelease | undefined} release - Newest readable note
 * @return {JSX.Element | null}
 */

export const HomeNews = ({ release }: HomeNewsProps) => {
  if (!release) return null

  const StarIcon = ICONS.news

  return (
    <Link href={changelogPath(release.version)} className={HOME_FLOW.news}>
      <span className={HOME_FLOW.newsSheen} aria-hidden="true" />
      <StarIcon className={HOME_FLOW.newsStar} aria-hidden="true" />
      <span className={HOME_FLOW.newsBody}>
        <span className={HOME_FLOW.newsKicker}>{CHANGELOG_COPY.versionLabel(release.version)}</span>
        <span className={HOME_FLOW.newsTitle}>{release.title}</span>
      </span>
      <span className={HOME_FLOW.newsCta}>{PERSONAL_COPY.newsOpen}</span>
    </Link>
  )
}
