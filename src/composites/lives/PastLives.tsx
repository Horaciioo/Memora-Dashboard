import Link from '@/components/elements/navigation/AppLink'

import { Avatar } from '@/components/elements/display/Avatar'
import { Section } from '@/components/structures/page/Section'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { ROUTES } from '@/declarations/navigation'
import { BUTTON_STYLES, LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface PastLivesProps {
  lives: LiveView[]
  canReport: boolean
  canCreatorReport: boolean
}

/**
 * Finished lives
 * @param {LiveView[]} lives - Past lives
 * @param {boolean} canReport - Viewer reads the Bilan
 * @param {boolean} canCreatorReport - Viewer reads the creator Bilan
 * @return {JSX.Element}
 */

export const PastLives = ({ lives, canReport, canCreatorReport }: PastLivesProps) => (
  <Section title={LIVE_REPORT_COPY.pastTitle} padded>
    {lives.length === 0 ? (
      <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.pastEmpty}</p>
    ) : (
      <ul className={LIVE_REPORT.past}>
        {lives.map((live) => (
          <li key={live.id} className={LIVE_REPORT.pastRow}>
            <div className={LIVE_REPORT.pastWho}>
              <Avatar name={live.youtuber.name} src={live.youtuber.avatar} size="md" />
              <div>
                <p className={LIVE_REPORT.pastName}>{live.youtuber.name}</p>
                <p className={LIVE_REPORT.pastMeta}>
                  {`${formatDay(live.startedAt ?? live.plannedStartAt)} · ${live.title}`}
                </p>
              </div>
            </div>
            <div className={LIVE_REPORT.pastLinks}>
              {canReport && (
                <Link
                  href={ROUTES.liveReport(live.id)}
                  className={cn(BUTTON_STYLES.base, BUTTON_STYLES.secondary)}
                >
                  {LIVE_REPORT_COPY.open}
                </Link>
              )}
              {canCreatorReport && (
                <Link
                  href={ROUTES.liveCreatorReport(live.id)}
                  className={cn(BUTTON_STYLES.base, BUTTON_STYLES.ghost)}
                >
                  {LIVE_REPORT_COPY.openCreator.replace('{name}', live.youtuber.name)}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    )}
  </Section>
)
