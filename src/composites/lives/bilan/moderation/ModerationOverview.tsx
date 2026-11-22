import { AttendanceCompare } from '@/composites/lives/bilan/moderation/AttendanceCompare'
import { NotesBoxes } from '@/composites/lives/bilan/moderation/NotesBoxes'
import { SanctionRanking } from '@/composites/lives/bilan/moderation/SanctionRanking'
import type { ModeratorOption } from '@/composites/lives/bilan/moderation/ModeratorPicker'
import { FigureGrid } from '@/composites/lives/bilan/FigureGrid'
import { BilanLog } from '@/composites/lives/bilan/BilanLog'
import { BilanModerators } from '@/composites/lives/bilan/BilanModerators'
import { BilanTeam } from '@/composites/lives/bilan/BilanTeam'
import type { ModStat } from '@/core/lib/lives/modStats'
import { teamFigures } from '@/core/lib/lives/modStats'
import type { LiveReport } from '@/core/lib/lives/report'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveLogLine, LiveModTime, LiveNote } from '@/types/lives'
import { formatSpan } from '@/utils/format/modview'

export interface ModerationOverviewProps {
  team: LiveModTime[]
  report: LiveReport
  log: LiveLogLine[]
  stats: Map<string, ModStat>
  options: ModeratorOption[]
  notes: LiveNote[]
  start: string
  end: string
  onPick: (key: string) => void
}

/**
 * The whole team: figures, who did what over the live, bars and the full log
 * @param {ModerationOverviewProps} props - Team and log
 * @return {JSX.Element}
 */

export const ModerationOverview = ({
  team,
  report,
  log,
  stats,
  options,
  notes,
  start,
  end,
  onPick,
}: ModerationOverviewProps) => {
  const figures = teamFigures(team, stats)
  const { top } = figures

  return (
    <>
      <FigureGrid
        title={BILAN_COPY.teamFiguresTitle}
        columns={LIVE_REPORT.figureRow}
        items={[
          {
            label: BILAN_COPY.figModerators,
            value: String(figures.moderators),
          },
          {
            label: BILAN_COPY.figTeamTime,
            value: formatSpan(figures.totalSeconds),
          },
          {
            label: BILAN_COPY.figAverageTime,
            value: formatSpan(figures.averageSeconds),
          },
          {
            label: BILAN_COPY.figAverageActions,
            value: String(figures.averageActions),
          },
          {
            label: BILAN_COPY.figTop,
            value: top ? top.name : BILAN_COPY.none,
            onClick: top ? () => onPick(top.accountId) : undefined,
          },
          {
            label: BILAN_COPY.figExtra,
            value: formatSpan(figures.extraSeconds),
          },
          {
            label: BILAN_COPY.figAbsent,
            value: String(figures.absent),
          },
          {
            label: BILAN_COPY.figReinforcements,
            value: String(figures.reinforcements),
          },
        ]}
      />
      <BilanModerators
        team={team}
        start={start}
        end={end}
        onPick={onPick}
        title={BILAN_COPY.whoModeratedTitle}
      />
      <SanctionRanking options={options} stats={stats} />
      <AttendanceCompare team={team} />
      <NotesBoxes notes={notes} options={options} />
      <BilanTeam report={report} />
      <BilanLog log={log} moderators={report.moderators} />
    </>
  )
}
