import { Button } from '@/components/elements/actions/Button'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_PANEL_REGISTRY } from '@/declarations/sanctions/registries'
import { accentPaint } from '@/declarations/ui/theme'
import { OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { SanctionOffenseDetail, SanctionRungView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'
import { fillCommand, writeDuration } from '@/utils/format/sanctions'

/**
 * Commands of one step on the surface of its panel
 * @param {Object} props - Step
 * @return {JSX.Element | null}
 */

const RungCommands = ({
  rung,
  offense,
}: {
  rung: SanctionRungView
  offense: SanctionOffenseDetail
}) => {
  const copy = useCopy(SANCTION_COPY.copied)
  const surface = SANCTION_PANEL_REGISTRY.get(offense.panel)

  const lines = rung.measures.flatMap((measure) => {
    const base = surface.commands[measure.kind]
    if (!base) return []
    const tool = measure.durationMinutes && base.timed ? base.timed : base

    const command = tool.command
      ? fillCommand(tool.command, {
          user: surface.userPlaceholder,
          duration: measure.durationMinutes
            ? writeDuration(measure.durationMinutes, surface.durationFormat)
            : '',
          reason: offense.name,
        })
      : null

    return [{ key: measure.id, command, how: tool.how }]
  })

  if (lines.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line) =>
        line.command ? (
          <div key={line.key} className="flex flex-col gap-0.5">
            <span className={OFFENSE_SHEET.command}>
              <code className={OFFENSE_SHEET.commandText}>{line.command}</code>
              <Button
                variant="icon"
                icon="copy"
                aria-label={SANCTION_COPY.copy}
                onClick={() => void copy(line.command!)}
              />
            </span>
            <span className={OFFENSE_SHEET.how}>{line.how}</span>
          </div>
        ) : (
          <span key={line.key} className={OFFENSE_SHEET.how}>
            {line.how}
          </span>
        )
      )}
    </div>
  )
}

/**
 * The ladder of one level as a staircase
 * @param {Object} props - Steps and their offence
 * @return {JSX.Element}
 */

export const LadderView = ({
  rungs,
  offense,
}: {
  rungs: SanctionRungView[]
  offense: SanctionOffenseDetail
}) => {
  if (rungs.length === 0) return <p className={OFFENSE_SHEET.how}>{SANCTION_COPY.noLadder}</p>

  return (
    <ol className={OFFENSE_SHEET.ladder}>
      {rungs.map((rung, index) => (
        <li key={rung.id} className={OFFENSE_SHEET.rung}>
          {index < rungs.length - 1 && (
            <span className={OFFENSE_SHEET.rungRail} aria-hidden="true" />
          )}
          <span className={OFFENSE_SHEET.rungDot} aria-hidden="true">
            {index + 1}
          </span>
          <div className={OFFENSE_SHEET.rungBody}>
            <span className={OFFENSE_SHEET.rungCondition}>{rung.condition}</span>
            <span className={OFFENSE_SHEET.measures}>
              {rung.measures.map((measure) => (
                <span
                  key={measure.id}
                  className={cn(OFFENSE_SHEET.measure, accentPaint(measure.accent).soft)}
                  style={accentPaint(measure.accent).style}
                >
                  {measure.name}
                </span>
              ))}
            </span>
            <RungCommands rung={rung} offense={offense} />
          </div>
        </li>
      ))}
    </ol>
  )
}
