'use client'

import { Dotted } from '@/components/elements/display/Dotted'
import { useState } from 'react'

import { Pagination } from '@/components/elements/navigation/Pagination'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { GestureFields, GestureItem } from '@/composites/lives/EditableGesture'
import { useLiveEdit } from '@/composites/lives/LiveEditContext'
import { Section } from '@/components/structures/page/Section'
import type { LiveReport } from '@/core/lib/lives/report'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_REPORT_COPY, MODERATION_KINDS } from '@/declarations/lives/moderation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveLogLine } from '@/types/lives'
import { formatClock, formatDuration } from '@/utils/format/modview'

export interface BilanLogProps {
  log: LiveLogLine[]
  moderators: LiveReport['moderators']
}

// Value of the "everyone" filter
const EVERYONE = ''

/**
 * Full log of the live, filtered by moderator
 * @param {LiveLogLine[]} log - Lines
 * @param {LiveReport['moderators']} moderators - Moderators
 * @return {JSX.Element}
 */

export const BilanLog = ({ log, moderators }: BilanLogProps) => {
  const { liveId, canEdit } = useLiveEdit()
  const [actor, setActor] = useState(EVERYONE)
  const [page, setPage] = useState(1)
  const filtered = actor === EVERYONE ? log : log.filter((line) => line.actorKey === actor)
  const pages = Math.max(1, Math.ceil(filtered.length / LIVE_SETTINGS.logPageSize))
  const shown = filtered.slice(
    (Math.min(page, pages) - 1) * LIVE_SETTINGS.logPageSize,
    Math.min(page, pages) * LIVE_SETTINGS.logPageSize
  )

  return (
    <Section
      title={LIVE_REPORT_COPY.logTitle}
      description={LIVE_REPORT_COPY.logLead}
      maturity="beta"
      action={
        moderators.length > 1 ? (
          <SelectMenu
            label={LIVE_REPORT_COPY.logFilter}
            value={actor}
            onChange={(next) => {
              setActor(next)
              setPage(1)
            }}
            options={[
              { value: EVERYONE, label: LIVE_REPORT_COPY.logEveryone },
              ...moderators.map((row) => ({ value: row.key, label: row.name })),
            ]}
          />
        ) : undefined
      }
      padded
    >
      {shown.length === 0 ? (
        <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.logEmpty}</p>
      ) : (
        <ol className={LIVE_REPORT.log}>
          {shown.map((line) => {
            const meta = MODERATION_KINDS[line.kind]
            const Icon = ICONS[meta.icon]
            const details = [
              line.targetLogin,
              line.durationSeconds ? formatDuration(line.durationSeconds) : null,
              line.reason,
              line.excerpt,
            ].filter(Boolean)

            return (
              <GestureItem key={line.id} liveId={liveId} line={line} canEdit={canEdit}>
                <time className={LIVE_REPORT.lineTime}>{formatClock(line.occurredAt)}</time>
                <span className={line.isMember ? LIVE_REPORT.lineActor : LIVE_REPORT.rowNameMuted}>
                  {line.actorName}
                </span>
                <span className={LIVE_REPORT.lineBody}>
                  <span className={LIVE_REPORT.lineWhat}>
                    <Icon className={LIVE_REPORT.lineIcon} aria-hidden="true" />
                    {meta.label}
                    {line.status === 'FAILED' && (
                      <span className={LIVE_REPORT.lineFailed}>{LIVE_REPORT_COPY.refused}</span>
                    )}
                    {line.status === 'PENDING' && (
                      <span className={LIVE_REPORT.lineDetail}>{LIVE_REPORT_COPY.pending}</span>
                    )}
                  </span>
                  {canEdit ? (
                    <GestureFields liveId={liveId} line={line} />
                  ) : (
                    details.length > 0 && (
                      <span className={LIVE_REPORT.lineDetail}>
                        <Dotted items={details} />
                      </span>
                    )
                  )}
                </span>
              </GestureItem>
            )
          })}
        </ol>
      )}
      <Pagination page={Math.min(page, pages)} totalPages={pages} onPageChange={setPage} />
    </Section>
  )
}
