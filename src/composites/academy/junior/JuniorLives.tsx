'use client'

import { DotMark } from '@/components/elements/display/Dotted'
import { Status } from '@/components/elements/display/Status'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PRESENCE_OUTCOME_REGISTRY } from '@/declarations/academy/registries'
import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { ICONS } from '@/declarations/ui/icons'
import { ACCOMPANIED_LIVES, LIST_STYLES } from '@/declarations/ui/variants'
import { PresenceOutcomes } from '@/utils/constants/workflow'
import { formatDay, formatHourMark } from '@/utils/format/time/dates'

/**
 * Lives the junior was called on since their PIM began, with who came and who did not
 * @return {JSX.Element}
 */

export const JuniorLives = () => {
  const { lives } = useJuniorState()
  const count = (status: string) => lives.filter((live) => live.outcome === status).length

  return (
    <div className={ACCOMPANIED_LIVES.root}>
      <span className={ACCOMPANIED_LIVES.label}>
        {ACADEMY_COPY.livesTitle}
        {lives.length > 0 && (
          <>
            <DotMark />
            {ACADEMY_COPY.livesTally(
              count(PresenceOutcomes.Present),
              count(PresenceOutcomes.Absent),
              count(PresenceOutcomes.Silent),
              count(PresenceOutcomes.Excused)
            )}
          </>
        )}
      </span>
      {lives.length === 0 ? (
        <p className={ACCOMPANIED_LIVES.empty}>{ACADEMY_COPY.livesEmpty}</p>
      ) : (
        <ul className={LIST_STYLES.stack}>
          {lives.map((live) => {
            const Glyph = ICONS[LIVE_PLATFORM_REGISTRY.get(live.platform).icon]
            const outcome = PRESENCE_OUTCOME_REGISTRY.get(live.outcome)

            return (
              <li key={live.liveId} className={LIST_STYLES.item}>
                <Glyph className={ACCOMPANIED_LIVES.glyph} aria-hidden="true" />
                <span className={ACCOMPANIED_LIVES.body}>
                  <span className={ACCOMPANIED_LIVES.creator}>{live.creator}</span>
                  <span className={ACCOMPANIED_LIVES.title}>{live.title}</span>
                </span>
                <span className={ACCOMPANIED_LIVES.date}>
                  {formatDay(live.startsAt)}
                  {live.availableFrom && live.availableTo && (
                    <>
                      <DotMark />
                      {ACADEMY_COPY.livesHours(
                        formatHourMark(live.availableFrom),
                        formatHourMark(live.availableTo)
                      )}
                    </>
                  )}
                </span>
                <Status label={outcome.label} tone={outcome.tone} icon={outcome.icon} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
