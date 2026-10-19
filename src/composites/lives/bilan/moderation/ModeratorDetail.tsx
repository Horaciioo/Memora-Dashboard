import { Avatar } from '@/components/elements/display/Avatar'
import { AreaChart } from '@/components/structures/charts/AreaChart'
import { RankBars } from '@/components/structures/charts/RankBars'
import { Section } from '@/components/structures/page/Section'
import { BilanLog } from '@/composites/lives/bilan/BilanLog'
import { FigureCards } from '@/composites/lives/bilan/moderation/FigureCards'
import { ModSpan } from '@/composites/lives/ModSpan'
import { ReinforcementTag } from '@/composites/lives/ReinforcementTag'
import type { ModStat } from '@/core/lib/lives/modStats'
import type { LiveReport } from '@/core/lib/lives/report'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT_COPY, MODERATION_KINDS } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveLogLine, LiveModTime } from '@/types/lives'
import { formatClock, formatSpan } from '@/utils/format/modview'

export interface ModeratorDetailProps {
  member: { key: string; name: string; avatar: string | null; time: LiveModTime | null }
  stat: ModStat
  lines: LiveLogLine[]
  presence: LiveReport['moderators'][number] | null
  axis: [string, string]
}

// One decimal at most
const oneDecimal = (value: number): string => String(Math.round(value * 10) / 10)

/**
 * One moderator: their time, their actions of Mod., their reasons and their rhythm
 * @param {ModeratorDetailProps} props - Moderator and figures
 * @return {JSX.Element}
 */

export const ModeratorDetail = ({ member, stat, lines, presence, axis }: ModeratorDetailProps) => {
  const none = BILAN_COPY.none
  const time = member.time

  return (
    <>
      <section className={LIVE_REPORT.detailHead}>
        <Avatar name={member.name} src={member.avatar} size="xl" />
        <div className={LIVE_REPORT.detailWho}>
          <h3 className={LIVE_REPORT.detailName}>
            {member.name}
            {time?.reinforcement && <ReinforcementTag />}
          </h3>
          {time?.reinforcement?.requestedBy && (
            <span className={LIVE_REPORT.teamNote}>
              {LIVE_REPORT_COPY.requestedBy.replace('{name}', time.reinforcement.requestedBy)}
            </span>
          )}
          {time?.outside && <span className={LIVE_REPORT.teamNote}>{time.outside}</span>}
          {time && <ModSpan span={time} />}
        </div>
      </section>

      <FigureCards
        title={BILAN_COPY.detailActions}
        row={LIVE_REPORT.figureRow}
        items={[
          {
            label: BILAN_COPY.detailActions,
            value: String(stat.actions),
            icon: 'shield',
            tone: 'info',
          },
          {
            label: BILAN_COPY.detailPerHour,
            value: oneDecimal(stat.perHour),
            icon: 'liveDot',
            tone: 'danger',
          },
          {
            label: BILAN_COPY.detailTargets,
            value: String(stat.targets),
            icon: 'viewer',
            tone: 'mauve',
          },
          {
            label: BILAN_COPY.detailFailed,
            value: String(stat.failed),
            icon: 'warning',
            tone: 'caution',
          },
          {
            label: BILAN_COPY.detailGap,
            value:
              stat.gapSeconds === null
                ? none
                : BILAN_COPY.gapValue.replace('{seconds}', String(Math.round(stat.gapSeconds))),
            icon: 'clock',
            tone: 'brand',
          },
          {
            label: BILAN_COPY.detailFirst,
            value: stat.firstAt ? formatClock(stat.firstAt) : none,
            icon: 'clock',
            tone: 'success',
          },
          {
            label: BILAN_COPY.detailLast,
            value: stat.lastAt ? formatClock(stat.lastAt) : none,
            icon: 'clock',
            tone: 'danger',
          },
          {
            label: BILAN_COPY.detailActive,
            value: presence ? formatSpan(presence.activeSeconds) : none,
            icon: 'clock',
            tone: 'info',
          },
        ]}
      />

      {stat.actions === 0 ? (
        <p className={LIVE_REPORT.empty}>{BILAN_COPY.detailNoAction}</p>
      ) : (
        <>
          <Section title={BILAN_COPY.detailRhythm} padded>
            <AreaChart
              title={BILAN_COPY.detailRhythm}
              unit={BILAN_COPY.gestures}
              colour="var(--color-brand-600)"
              axis={axis}
              points={stat.rhythm.map((slice) => ({
                label: formatClock(slice.at),
                value: slice.count,
              }))}
            />
          </Section>

          <div className={LIVE_REPORT.detailColumns}>
            <Section title={BILAN_COPY.detailKinds} padded>
              <RankBars
                empty={LIVE_REPORT_COPY.logEmpty}
                rows={stat.kinds.map((row) => ({
                  label: MODERATION_KINDS[row.kind].label,
                  value: row.count,
                }))}
              />
            </Section>
            <Section title={BILAN_COPY.detailReasons} padded>
              <RankBars
                empty={LIVE_REPORT_COPY.logEmpty}
                rows={stat.reasons.map((row) => ({ label: row.label, value: row.count }))}
              />
            </Section>
          </div>
        </>
      )}

      <BilanLog log={lines} moderators={presence ? [presence] : []} />
    </>
  )
}
