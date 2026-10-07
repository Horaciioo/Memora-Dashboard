import type { Metadata } from 'next'

import { PageHeader } from '@/components/structures/PageHeader'
import { ChangelogBoard } from '@/composites/changelog/ChangelogBoard'
import { ReleaseDeck } from '@/composites/changelog/ReleaseDeck'
import { requireUser } from '@/core/wrappers/requireUser'
import { CHANGELOG_COPY } from '@/declarations/changelog/copy'
import { changelogFor, resolveRelease } from '@/declarations/changelog/helpers'
import { CHANGELOG_BOARD } from '@/declarations/ui/blocks'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export const metadata: Metadata = { title: CHANGELOG_COPY.pageTitle }

interface ChangelogPageProps {
  searchParams: Promise<{ version?: string | string[] }>
}

/**
 * One release note at a time
 * @param {ChangelogPageProps} props - Asked version
 * @return {Promise<JSX.Element>} - News page
 */

export default async function ChangelogPage({ searchParams }: ChangelogPageProps) {
  const { access } = await requireUser()
  const { version } = await searchParams
  const asked = typeof version === 'string' ? version : undefined
  const release = resolveRelease(changelogFor(access.can), asked)

  return (
    <div className={cn(PAGE_STYLES.wrapper, CHANGELOG_BOARD.page)}>
      <PageHeader
        title={release?.title ?? CHANGELOG_COPY.emptyTitle}
        note={release && <ReleaseDeck release={release} />}
      />
      <ChangelogBoard version={release?.version} />
    </div>
  )
}
