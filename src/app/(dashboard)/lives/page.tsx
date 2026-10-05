import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { LivesBoard } from '@/composites/lives/LivesBoard'
import Link from 'next/link'

import { Section } from '@/components/structures/Section'
import { listOpenLives, listPastLives, liveFields } from '@/core/services/lives/LiveService'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ROUTES } from '@/declarations/navigation'
import { requirePermission } from '@/core/wrappers/requireUser'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { BUTTON_STYLES, LIVE_REPORT, PAGE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LIVE_COPY.title }

/**
 * Lives announced or running in the member's perimeter
 * @return {Promise<JSX.Element>} - Live en cours page
 */

export default async function LivesPage() {
  const { session, access, scope } = await requirePermission(Permissions.LiveRead)
  const perimeter = await scope()
  const canAnnounce = access.can(Permissions.LiveAnnounce)
  const canReadLogs = access.can(Permissions.LiveLogRead)

  const [lives, fields, past] = await Promise.all([
    listOpenLives(perimeter, session.id, session.permissions),
    canAnnounce ? liveFields(perimeter) : Promise.resolve([]),
    // Past lives and their reports
    canReadLogs
      ? listPastLives(perimeter, session.id, session.permissions, LIVE_SETTINGS.pastLives)
      : Promise.resolve([]),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={LIVE_COPY.title} />
      <LivesBoard
        initialLives={lives}
        fields={fields}
        canAnnounce={canAnnounce}
        viewerId={session.id}
      />
      {canReadLogs && (
        <div className={LIVE_REPORT.pastWrap}>
          <Section title={LIVE_REPORT_COPY.pastTitle} padded>
            {past.length === 0 ? (
              <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.pastEmpty}</p>
            ) : (
              <ul className={LIVE_REPORT.past}>
                {past.map((live) => (
                  <li key={live.id} className={LIVE_REPORT.pastRow}>
                    <div>
                      <p className={LIVE_REPORT.pastName}>{live.youtuber.name}</p>
                      <p className={LIVE_REPORT.pastMeta}>
                        {`${formatDay(live.startedAt ?? live.plannedStartAt)} · ${live.title}`}
                      </p>
                    </div>
                    <div className={LIVE_REPORT.pastLinks}>
                      <Link
                        href={ROUTES.liveReport(live.id)}
                        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary)}
                      >
                        {LIVE_REPORT_COPY.open}
                      </Link>
                      {access.can(Permissions.LiveCreatorReport) && (
                        <Link
                          href={ROUTES.liveCreatorReport(live.id)}
                          className={cn(BUTTON_STYLES.base, BUTTON_STYLES.ghost)}
                        >
                          {LIVE_REPORT_COPY.openCreator}
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </div>
  )
}
