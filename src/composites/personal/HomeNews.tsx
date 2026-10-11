'use client'

import Link from 'next/link'

import { useFreshRelease } from '@/core/hooks/data/useFreshRelease'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { changelogPath } from '@/declarations/changelog/helpers'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_FLOW } from '@/declarations/ui/variants'

/**
 * Latest unread note, one gold line
 * @return {JSX.Element | null}
 */

export const HomeNews = () => {
  const { release, isFresh } = useFreshRelease()

  // Gone once read
  if (!release || !isFresh) return null

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
