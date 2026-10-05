'use client'

import { useEffect } from 'react'

import { ChangelogArchive } from '@/composites/changelog/ChangelogArchive'
import { ReleaseHero } from '@/composites/changelog/ReleaseHero'
import { useFreshRelease } from '@/core/hooks/data/useFreshRelease'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import {
  changelogFor,
  groupByPage,
  releaseCategories,
  resolveRelease,
} from '@/declarations/changelog/helpers'
import type { ChangelogCategory } from '@/declarations/changelog/helpers'
import { CHANGELOG_TAGS } from '@/declarations/changelog/releases'
import { CHANGELOG_BOARD } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

/**
 * One note category: its heading and figure on a rule of its colour, then page after page, each
 * name in the margin with its lines beside it
 * @param {ChangelogCategory} props - Category lines
 * @return {JSX.Element}
 */

const CategoryBlock = ({ tag, items, comments }: ChangelogCategory) => {
  const meta = CHANGELOG_TAGS[tag]

  return (
    <section id={`categorie-${tag}`} className={CHANGELOG_BOARD.category}>
      <header className={CHANGELOG_BOARD.categoryHead}>
        <h2 className={cn(CHANGELOG_BOARD.categoryTitle, TONES[meta.tone].text)}>{meta.heading}</h2>
        <span
          className={cn(CHANGELOG_BOARD.categoryRule, TONES[meta.tone].solid)}
          aria-hidden="true"
        />
      </header>

      <div className={CHANGELOG_BOARD.groups}>
        {groupByPage(items, comments).map((group) => {
          const PageIcon = ICONS[group.page.icon]

          return (
            <article key={group.key} className={CHANGELOG_BOARD.group}>
              <h3 className={CHANGELOG_BOARD.groupTitle}>
                <PageIcon className={CHANGELOG_BOARD.groupIcon} aria-hidden="true" />
                {group.page.label}
              </h3>
              <div className={CHANGELOG_BOARD.groupBody}>
                {group.comment && (
                  <p className={CHANGELOG_BOARD.comment}>
                    <span className={CHANGELOG_BOARD.commentLabel}>
                      {CHANGELOG_COPY.commentLabel}
                    </span>
                    {group.comment}
                  </p>
                )}
                <ul className={CHANGELOG_BOARD.lines}>
                  {group.items.map((item) => (
                    <li key={item.text} className={CHANGELOG_BOARD.line}>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export interface ChangelogBoardProps {
  version?: string
}

/**
 * Current release note
 * @param {string} [version] - Asked version
 * @return {JSX.Element}
 */

export const ChangelogBoard = ({ version }: ChangelogBoardProps) => {
  const { can } = useAuthContext()
  const releases = changelogFor(can)
  const release = resolveRelease(releases, version)
  const { release: latest, isFresh, markSeen } = useFreshRelease()
  const isLatestOpen = latest !== null && latest.version === release?.version

  // Reading clears the notice
  useEffect(() => {
    if (isFresh && isLatestOpen) markSeen()
  }, [isFresh, isLatestOpen, markSeen])

  if (!release) {
    return (
      <div className={CHANGELOG_BOARD.empty}>
        <p className={CHANGELOG_BOARD.emptyTitle}>{CHANGELOG_COPY.emptyTitle}</p>
        <p className={CHANGELOG_BOARD.emptyLead}>{CHANGELOG_COPY.emptyLead}</p>
      </div>
    )
  }

  const categories = releaseCategories(release)

  return (
    <>
      <ReleaseHero release={release} />

      <div className={CHANGELOG_BOARD.blocks}>
        {categories.map((category) => (
          <CategoryBlock key={category.tag} {...category} />
        ))}
      </div>

      <section className={CHANGELOG_BOARD.archiveHead}>
        <h2 className={CHANGELOG_BOARD.archiveTitle}>{CHANGELOG_COPY.archiveTitle}</h2>
        <ChangelogArchive releases={releases} currentVersion={release.version} />
      </section>
    </>
  )
}
