import Link from 'next/link'

import { Button } from '@/components/elements/actions/Button'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { changelogPath } from '@/declarations/changelog/helpers'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_FLOW } from '@/declarations/ui/variants'

// Lines shown on the home
const NEWS_LINES = 3

export interface HomeNewsProps {
  release: ChangelogRelease | undefined
}

/**
 * Latest note teaser
 * @param {ChangelogRelease | undefined} release - Newest readable note
 * @return {JSX.Element | null}
 */

export const HomeNews = ({ release }: HomeNewsProps) => {
  if (!release) return null

  const StarIcon = ICONS.news
  const CheckIcon = ICONS.confirm

  return (
    <section className="flex flex-col gap-4">
      <h2 className={HOME_FLOW.label}>{PERSONAL_COPY.newsTitle}</h2>
      <article className={HOME_FLOW.news}>
        <span className={HOME_FLOW.newsStar}>
          <StarIcon className={HOME_FLOW.newsStarIcon} aria-hidden="true" />
        </span>
        <div className={HOME_FLOW.newsBody}>
          <span className={HOME_FLOW.newsKicker}>
            {CHANGELOG_COPY.versionLabel(release.version)}
          </span>
          <h3 className={HOME_FLOW.newsTitle}>{release.title}</h3>
          <p className={HOME_FLOW.newsIntro}>{release.intro}</p>
          <ul className={HOME_FLOW.newsLines}>
            {release.items.slice(0, NEWS_LINES).map((item) => (
              <li key={item.text} className={HOME_FLOW.newsLine}>
                <CheckIcon className={HOME_FLOW.newsLineIcon} aria-hidden="true" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        <div className={HOME_FLOW.newsActions}>
          <Link href={changelogPath(release.version)}>
            <Button variant="primary">{PERSONAL_COPY.newsOpen}</Button>
          </Link>
          <Link href={ROUTES.changelog} className={HOME_FLOW.more}>
            {PERSONAL_COPY.newsAll}
          </Link>
        </div>
      </article>
    </section>
  )
}
