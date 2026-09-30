'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/elements/actions/Button'
import { Dialog } from '@/components/structures/Dialog'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { changelogPath, groupByMonth } from '@/declarations/changelog/helpers'
import type { ChangelogMonth } from '@/declarations/changelog/helpers'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { CHANGELOG_BOARD } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { dayMonthLabel, monthLabel } from '@/utils/format/days'

// Mid-month avoids timezone drift
const monthOf = (key: string): string => monthLabel(new Date(`${key}-15T12:00:00Z`))

export interface ChangelogArchiveProps {
  releases: ChangelogRelease[]
  currentVersion: string
}

/**
 * Older notes by month
 * @param {ChangelogRelease[]} releases - Readable notes
 * @param {string} currentVersion - Note on screen
 * @return {JSX.Element}
 */

export const ChangelogArchive = ({ releases, currentVersion }: ChangelogArchiveProps) => {
  const [open, setOpen] = useState<ChangelogMonth | null>(null)
  const ChevronIcon = ICONS.next

  return (
    <div className={CHANGELOG_BOARD.archive}>
      {groupByMonth(releases).map((month) => (
        <Button key={month.key} onClick={() => setOpen(month)}>
          {CHANGELOG_COPY.archiveButton(monthOf(month.key))}
        </Button>
      ))}

      <Dialog
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open ? CHANGELOG_COPY.archiveDialog(monthOf(open.key)) : ''}
        size="sm"
      >
        <ul className={CHANGELOG_BOARD.monthList}>
          {open?.releases.map((release) => {
            const body = (
              <span className={CHANGELOG_BOARD.releaseBody}>
                <span className={CHANGELOG_BOARD.releaseTitle}>{release.title}</span>
                <span className={CHANGELOG_BOARD.releaseMeta}>
                  {`${CHANGELOG_COPY.versionLabel(release.version)} · ${dayMonthLabel(new Date(release.date))}`}
                </span>
              </span>
            )

            return (
              <li key={release.version}>
                {release.version === currentVersion ? (
                  <div className={CHANGELOG_BOARD.releaseRow}>
                    {body}
                    <span className={CHANGELOG_BOARD.releaseCurrent}>
                      {CHANGELOG_COPY.archiveCurrent}
                    </span>
                  </div>
                ) : (
                  <Link
                    href={changelogPath(release.version)}
                    onClick={() => setOpen(null)}
                    className={CHANGELOG_BOARD.releaseRowLink}
                  >
                    {body}
                    <ChevronIcon className={CHANGELOG_BOARD.releaseChevron} aria-hidden="true" />
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </Dialog>
    </div>
  )
}
