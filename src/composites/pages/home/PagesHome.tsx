'use client'

import { useState } from 'react'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import Link from '@/components/elements/navigation/AppLink'
import { Section } from '@/components/structures/page/Section'
import { PageList } from '@/composites/pages/home/PageList'
import { PageTemplates } from '@/composites/pages/home/PageTemplates'
import { canOwnPages } from '@/core/lib/pages'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { usePageActions, usePageSearch, usePageTree } from '@/core/hooks/data/pages'
import { ROUTES } from '@/declarations/navigation'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { BUTTON_STYLES, PAGES_HOME_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Private space index: search, templates, pages
 * @return {JSX.Element}
 */

export const PagesHome = () => {
  const [term, setTerm] = useState('')
  const { pages, isLoading } = usePageTree()
  const { hits } = usePageSearch(term)
  const { create } = usePageActions()
  const { session } = useAuthContext()
  // Guests only open what is shared with them
  const canOwn = canOwnPages(session)

  const known = new Set(pages.map((page) => page.id))
  const own = pages.filter((page) => page.isOwn && !(page.parentId && known.has(page.parentId)))
  const shared = pages.filter((page) => !page.isOwn && !(page.parentId && known.has(page.parentId)))
  const recent = (list: typeof pages) =>
    list.toSorted((left, right) => right.updatedAt.localeCompare(left.updatedAt))

  return (
    <div className={PAGES_HOME_STYLES.column}>
      <div className={PAGES_HOME_STYLES.intro}>
        <p className={PAGES_HOME_STYLES.lead}>{PAGES_COPY.welcomeLead}</p>
        <input
          type="search"
          value={term}
          aria-label={PAGES_COPY.searchPlaceholder}
          placeholder={PAGES_COPY.searchPlaceholder}
          className={PAGES_HOME_STYLES.search}
          onChange={(event) => setTerm(event.target.value)}
        />
      </div>

      {term.trim() ? (
        <Section title={PAGES_COPY.searchPlaceholder} bare>
          {hits.length > 0 ? (
            <PageList
              pages={hits.map((hit) => ({
                ...hit,
                hint: [...hit.trail, hit.excerpt].filter(Boolean).join(' › '),
              }))}
            />
          ) : (
            <p
              className={PAGES_HOME_STYLES.empty}
            >{`${PAGES_COPY.searchEmpty} ${PAGES_COPY.searchEmptyHint}`}</p>
          )}
        </Section>
      ) : (
        <>
          {canOwn && (
            <Section title={PAGES_COPY.templatesTitle} bare>
              <PageTemplates />
            </Section>
          )}

          {canOwn && (
            <Section title={PAGES_COPY.recentTitle} bare>
              {own.length > 0 ? (
                <PageList pages={recent(own)} />
              ) : (
                !isLoading && (
                  <EmptyState
                    title={PAGES_COPY.emptyTitle}
                    description={PAGES_COPY.emptyLead}
                    action={
                      <button
                        type="button"
                        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
                        onClick={() => void create()}
                      >
                        {PAGES_COPY.startBlank}
                      </button>
                    }
                  />
                )
              )}
            </Section>
          )}

          {shared.length > 0 && (
            <Section title={PAGES_COPY.sharedTitle} bare>
              <PageList pages={recent(shared)} />
            </Section>
          )}

          <Link href={ROUTES.pagesTrash} className={PAGES_HOME_STYLES.trashLink}>
            {PAGES_COPY.trashOpen}
          </Link>
        </>
      )}
    </div>
  )
}
