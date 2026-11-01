import Link from '@/components/elements/navigation/AppLink'

import { Dotted } from '@/components/elements/display/Dotted'
import { Avatar } from '@/components/elements/display/Avatar'
import { LiveRemovalDialog, RemovableLive } from '@/composites/lives/RemovableLive'
import { InlineText } from '@/components/structures/inline/InlineText'
import { useLiveData } from '@/core/hooks/data/lives/useLiveData'
import { useLiveRemoval } from '@/core/hooks/data/lives/useLiveRemoval'
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
  canDelete: boolean
}

/**
 * Finished lives
 * @param {LiveView[]} lives - Past lives
 * @param {boolean} canReport - Viewer reads the Bilan
 * @param {boolean} canCreatorReport - Viewer reads the creator Bilan
 * @param {boolean} canDelete - Viewer erases a live
 * @return {JSX.Element}
 */

export const PastLives = ({ lives, canReport, canCreatorReport, canDelete }: PastLivesProps) => {
  const removal = useLiveRemoval()
  const data = useLiveData()

  return (
    <Section title={LIVE_REPORT_COPY.pastTitle} padded>
      {lives.length === 0 ? (
        <p className={LIVE_REPORT.empty}>{LIVE_REPORT_COPY.pastEmpty}</p>
      ) : (
        <ul className={LIVE_REPORT.past}>
          {lives.map((live) => (
            <RemovableLive
              key={live.id}
              liveId={live.id}
              removal={removal}
              enabled={canDelete}
              className={LIVE_REPORT.pastRow}
            >
              <div className={LIVE_REPORT.pastWho}>
                <Avatar name={live.youtuber.name} src={live.youtuber.avatar} size="md" />
                <div>
                  <p className={LIVE_REPORT.pastName}>{live.youtuber.name}</p>
                  <p className={LIVE_REPORT.pastMeta}>
                    <Dotted
                      items={[
                        formatDay(live.startedAt ?? live.plannedStartAt),
                        canDelete ? (
                          <InlineText
                            key="title"
                            id={`title-${live.id}`}
                            value={live.title}
                            placeholder={LIVE_REPORT_COPY.titlePlaceholder}
                            onCommit={(title) => data.rename(live.id, title)}
                          />
                        ) : (
                          live.title
                        ),
                      ]}
                    />
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
            </RemovableLive>
          ))}
        </ul>
      )}
      <LiveRemovalDialog removal={removal} />
    </Section>
  )
}
