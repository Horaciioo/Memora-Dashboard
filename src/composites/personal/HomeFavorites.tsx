'use client'

import { useMemo } from 'react'

import { Glyph } from '@/components/elements/display/glyphs/Glyph'
import Link from '@/components/elements/navigation/AppLink'
import { Section } from '@/components/structures/page/Section'
import { usePageTree } from '@/core/hooks/data/pages'
import { useVisitedPaths } from '@/core/hooks/interaction/state/useVisitedPaths'
import { pageLine, pathLine } from '@/core/lib/favorites/lines'
import type { FavoriteLine } from '@/core/lib/favorites/lines'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { HOME_FAVORITES } from '@/declarations/ui/favorites'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_BOARD, HOME_FAVORITES_STYLES, HOME_PLAN } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

interface FavoriteColumnProps {
  label: string
  empty: string
  lines: FavoriteLine[]
}

/**
 * One category: lines three by three, or the empty sentence
 * @param {string} label - Category name
 * @param {string} empty - Sentence shown without a line
 * @param {FavoriteLine[]} lines - Lines of the category
 * @return {JSX.Element}
 */

const FavoriteColumn = ({ label, empty, lines }: FavoriteColumnProps) => (
  <div className={HOME_BOARD.col}>
    <Section title={label} bare>
      {lines.length === 0 ? (
        <p className={HOME_PLAN.empty}>{empty}</p>
      ) : (
        <div
          className={HOME_FAVORITES_STYLES.lines}
          style={{ gridTemplateRows: `repeat(${HOME_FAVORITES.rows}, auto)` }}
        >
          {lines.map((line) => {
            const Icon = ICONS[line.icon]

            return (
              <Link key={line.href} href={line.href} className={HOME_FAVORITES_STYLES.row}>
                {line.emoji ? (
                  <Glyph value={line.emoji} size="row" />
                ) : (
                  <Icon className={HOME_FAVORITES_STYLES.glyph} aria-hidden="true" />
                )}
                <span className={HOME_FAVORITES_STYLES.title}>{line.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </Section>
  </div>
)

/**
 * Pages to come back to: last visited, private, starred, side by side
 * @return {JSX.Element}
 */

export const HomeFavorites = () => {
  const { pages } = usePageTree()
  const { session } = useAuthContext()
  const { visited } = useVisitedPaths()

  const columns = useMemo(() => {
    const byId = new Map(pages.map((page) => [page.id, page]))
    const shown = (lines: (FavoriteLine | null)[]) =>
      lines.filter((line) => line !== null).slice(0, HOME_FAVORITES.shown)

    return [
      {
        label: PERSONAL_COPY.favoritesRecent,
        empty: PERSONAL_COPY.favoritesRecentEmpty,
        lines: shown(visited.map((path) => pathLine(path, byId))),
      },
      {
        label: PERSONAL_COPY.favoritesPrivate,
        empty: PERSONAL_COPY.favoritesPrivateEmpty,
        lines: shown(pages.filter((page) => page.isOwn).map(pageLine)),
      },
      {
        label: PERSONAL_COPY.favoritesStarred,
        empty: PERSONAL_COPY.favoritesStarredEmpty,
        lines: shown(
          (session?.favorites ?? []).map((star) => pathLine(star.path, byId, star.label))
        ),
      },
    ]
  }, [pages, session, visited])

  return (
    <div className={HOME_BOARD.card}>
      {columns.map((column) => (
        <FavoriteColumn key={column.label} {...column} />
      ))}
    </div>
  )
}
