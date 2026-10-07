'use client'

import { useEffect } from 'react'

import { ChangelogArchive } from '@/composites/changelog/ChangelogArchive'
import { ChangelogCategory } from '@/composites/changelog/ChangelogCategory'
import { ReleaseDescription } from '@/composites/changelog/ReleaseDescription'
import { useFreshRelease } from '@/core/hooks/data/useFreshRelease'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { changelogFor, releaseCategories, resolveRelease } from '@/declarations/changelog/helpers'
import { CHANGELOG_BOARD } from '@/declarations/ui/blocks'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

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
      <ReleaseDescription release={release} />

      <div className={CHANGELOG_BOARD.blocks}>
        {categories.map((category) => (
          <ChangelogCategory key={category.tag} {...category} />
        ))}
      </div>

      {releases.length > 1 && (
        <section className={CHANGELOG_BOARD.archiveHead}>
          <h2 className={CHANGELOG_BOARD.archiveTitle}>{CHANGELOG_COPY.archiveTitle}</h2>
          <ChangelogArchive releases={releases} currentVersion={release.version} />
        </section>
      )}
    </>
  )
}
