'use client'

import { useState } from 'react'
import { Pagination } from '@/components/elements/navigation/Pagination'
import { PAGINATION_SETTINGS } from '@/declarations/configurations/settings'
import { ACTIVITY_COPY } from '@/declarations/activity/copy'
import {
  ACTIVITY_EVENT_REGISTRY,
  ACTIVITY_KIND,
  ACTIVITY_KIND_ICON,
} from '@/declarations/activity/registries'
import { ICONS } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import { JOURNAL_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'
import type { ActivityEntry } from '@/core/services/system/ActivityService'

export interface ActivityTimelineProps {
  entries: ActivityEntry[]
}

/**
 * Vertical journal of recorded events
 * @param {ActivityEntry[]} entries - Journal entries
 * @return {JSX.Element}
 */

export const ActivityTimeline = ({ entries }: ActivityTimelineProps) => {
  const [requestedPage, setRequestedPage] = useState(1)
  const pageSize = PAGINATION_SETTINGS.defaultPerPage
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize))
  const page = Math.min(requestedPage, totalPages)
  const shown = entries.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <ol className={JOURNAL_STYLES.list}>
        {shown.map((entry, index) => {
          const event = entry.event ? ACTIVITY_EVENT_REGISTRY.get(entry.event) : null
          const actor = entry.actorName ?? ACTIVITY_COPY.system

          // Colour of the act
          const kind = event ? ACTIVITY_KIND[event.tone] : 'info'
          const Glyph = ICONS[ACTIVITY_KIND_ICON[kind]]
          const colour = TONES[kind].text
          const verb = entry.change?.verb ?? event?.verb
          const rest = entry.change?.rest ?? event?.target

          return (
            <li key={entry.id} className={JOURNAL_STYLES.item}>
              <div className={JOURNAL_STYLES.entry}>
                <Glyph className={cn(JOURNAL_STYLES.glyph, colour)} aria-hidden="true" />
                <div className={JOURNAL_STYLES.body}>
                  <span className={JOURNAL_STYLES.head}>
                    <span className={JOURNAL_STYLES.moment}>{formatDayTime(entry.createdAt)}</span>
                  </span>
                  {verb ? (
                    <p className={JOURNAL_STYLES.sentence}>
                      {`${actor} ${ACTIVITY_COPY.did} `}
                      <strong className={cn(JOURNAL_STYLES.verb, colour)}>{verb}</strong>
                      {` ${rest}.`}
                    </p>
                  ) : (
                    <p className={JOURNAL_STYLES.sentence}>{`${actor}, ${entry.origin}.`}</p>
                  )}
                </div>
              </div>
              {index < shown.length - 1 && (
                <span className={JOURNAL_STYLES.separator} aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
      <Pagination page={page} totalPages={totalPages} onPageChange={setRequestedPage} />
    </>
  )
}
