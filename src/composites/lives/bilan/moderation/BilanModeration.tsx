'use client'

import { useMemo, useState } from 'react'

import { ModerationOverview } from '@/composites/lives/bilan/moderation/ModerationOverview'
import { ModeratorDetail } from '@/composites/lives/bilan/moderation/ModeratorDetail'
import { EVERYONE, ModeratorPicker } from '@/composites/lives/bilan/moderation/ModeratorPicker'
import type { ModeratorOption } from '@/composites/lives/bilan/moderation/ModeratorPicker'
import { modStats } from '@/core/lib/lives/modStats'
import type { ModStat } from '@/core/lib/lives/modStats'
import type { LiveReport } from '@/core/lib/lives/report'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveLogLine, LiveModTime, LiveNote } from '@/types/lives'
import { formatClock } from '@/utils/format/modview'

export interface BilanModerationProps {
  team: LiveModTime[]
  notes: LiveNote[]
  report: LiveReport
  log: LiveLogLine[]
  start: string
  end: string
  bucketMinutes: number
}

/**
 * Moderation side of the bilan: the whole team, or one moderator picked on top
 * @param {BilanModerationProps} props - Team, report and log
 * @return {JSX.Element}
 */

export const BilanModeration = ({
  team,
  notes,
  report,
  log,
  start,
  end,
  bucketMinutes,
}: BilanModerationProps) => {
  const [picked, setPicked] = useState(EVERYONE)

  // Whoever has time on the live or an action in its log
  const options = useMemo<ModeratorOption[]>(() => {
    const seen = new Set(team.map((member) => member.accountId))

    return [
      ...team.map((member) => ({
        key: member.accountId,
        name: member.name,
        avatar: member.avatar,
      })),
      ...report.moderators
        .filter((row) => !seen.has(row.key))
        .map((row) => ({ key: row.key, name: row.name, avatar: null })),
    ]
  }, [team, report.moderators])

  const stats = useMemo(() => {
    const frame = { start: new Date(start), end: new Date(end), bucketMinutes }
    const span = Math.max(1, (Date.parse(end) - Date.parse(start)) / 1000)

    return new Map<string, ModStat>(
      options.map((option) => {
        const time = team.find((member) => member.accountId === option.key)

        return [
          option.key,
          modStats(
            log.filter((line) => line.actorKey === option.key),
            { ...frame, seconds: time && !time.isAbsent ? time.seconds : span }
          ),
        ]
      })
    )
  }, [options, team, log, start, end, bucketMinutes])

  const member = options.find((option) => option.key === picked)
  const stat = stats.get(picked)

  return (
    <div className={LIVE_REPORT.wrapper}>
      <ModeratorPicker options={options} value={picked} onChange={setPicked} />

      {member && stat ? (
        <ModeratorDetail
          member={{
            ...member,
            time: team.find((row) => row.accountId === member.key) ?? null,
          }}
          stat={stat}
          lines={log.filter((line) => line.actorKey === member.key)}
          presence={report.moderators.find((row) => row.key === member.key) ?? null}
          axis={[formatClock(start), formatClock(end)]}
        />
      ) : (
        <ModerationOverview
          team={team}
          report={report}
          log={log}
          stats={stats}
          options={options}
          notes={notes}
          start={start}
          end={end}
          onPick={setPicked}
        />
      )}
    </div>
  )
}
