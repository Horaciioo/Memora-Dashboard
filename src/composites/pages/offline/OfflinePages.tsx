'use client'

import { useEffect, useState } from 'react'

import { PageDocumentView } from '@/composites/pages/offline/PageDocumentView'
import { PageList } from '@/composites/pages/home/PageList'
import { listOfflinePages } from '@/core/lib/pages/offline/store'
import type { OfflineEntry } from '@/core/lib/pages/offline/store'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_OFFLINE_COPY, PAGE_SYNC_COPY, PAGES_COPY } from '@/declarations/pages/copy'
import { PAGE_OFFLINE_STYLES } from '@/declarations/ui/variants'
import { formatDayTime } from '@/utils/format/dates'

/**
 * Pages kept on this device, readable without network
 * @return {JSX.Element | null}
 */

export const OfflinePages = () => {
  const [entries, setEntries] = useState<OfflineEntry[] | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  // The address asked for opens directly
  useEffect(() => {
    void listOfflinePages().then((found) => {
      setEntries(found)
      const asked = found.find((entry) => window.location.pathname === ROUTES.page(entry.page.id))
      if (asked) setOpenId(asked.page.id)
    })
  }, [])

  if (!entries) return null
  const open = entries.find((entry) => entry.page.id === openId)

  if (open) {
    return (
      <article className={PAGE_OFFLINE_STYLES.column}>
        <button type="button" className={PAGE_OFFLINE_STYLES.back} onClick={() => setOpenId(null)}>
          {PAGE_OFFLINE_COPY.back}
        </button>
        <h1 className={PAGE_OFFLINE_STYLES.title}>{`${open.page.icon ?? ''} ${open.page.title || PAGES_COPY.untitled}`.trim()}</h1>
        <p className={PAGE_OFFLINE_STYLES.lead}>{PAGE_SYNC_COPY.offlineCopy.replace('{date}', formatDayTime(open.savedAt))}</p>
        {open.isPending && <p className={PAGE_OFFLINE_STYLES.draft}>{PAGE_OFFLINE_COPY.pendingDraft}</p>}
        <PageDocumentView content={open.page.content} />
      </article>
    )
  }

  return (
    <section className={PAGE_OFFLINE_STYLES.column}>
      <h2 className={PAGE_OFFLINE_STYLES.title}>{PAGE_OFFLINE_COPY.title}</h2>
      <p className={PAGE_OFFLINE_STYLES.lead}>{entries.length > 0 ? PAGE_OFFLINE_COPY.lead : PAGE_OFFLINE_COPY.empty}</p>
      <div
        onClickCapture={(event) => {
          // Links stay on this page while offline
          const link = (event.target as HTMLElement).closest('a')
          const entry = entries.find((item) => link?.getAttribute('href') === ROUTES.page(item.page.id))
          if (!entry) return
          event.preventDefault()
          setOpenId(entry.page.id)
        }}
      >
        <PageList pages={entries.map((entry) => ({ ...entry.page, updatedAt: entry.savedAt }))} />
      </div>
    </section>
  )
}
