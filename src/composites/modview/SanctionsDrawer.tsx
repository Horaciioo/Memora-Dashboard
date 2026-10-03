'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY, MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { SANCTION_GRAVITY_REGISTRY } from '@/declarations/sanctions/registries'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint, accentVars } from '@/declarations/ui/theme'
import { MODVIEW_SANCTIONS } from '@/declarations/ui/variants'
import type { ChatMessage, Chatter, ModViewIntent } from '@/types/modview'
import type { SanctionMeasureView, SanctionOffenseCard, SanctionPanelView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'
import { SanctionKinds } from '@/utils/constants/moderation'

export interface SanctionsDrawerProps {
  panel: SanctionPanelView | null
  levelName: string | null
  isOpen: boolean
  onToggle: () => void
  target: Chatter | null
  targetLines: ChatMessage[]
  gate: GateCheck
  onAct: ActRunner
}

/**
 * Turn one measure into the gesture it stands for
 * @param {SanctionMeasureView} measure - Panel measure
 * @param {Chatter} target - Viewer
 * @param {ChatMessage | undefined} lastLine - Their last visible line
 * @param {string} reason - Offence name kept as reason
 * @return {ModViewIntent | null} - Gesture, none for a note only
 */

const intentOf = (
  measure: SanctionMeasureView,
  target: Chatter,
  lastLine: ChatMessage | undefined,
  reason: string
): ModViewIntent | null => {
  switch (measure.kind) {
    case SanctionKinds.Delete:
      return lastLine ? { kind: 'delete', messageId: lastLine.id, chatterId: target.id } : null
    case SanctionKinds.Warn:
      return { kind: 'warn', chatterId: target.id, reason }
    case SanctionKinds.Timeout:
      return measure.permanent
        ? { kind: 'ban', chatterId: target.id, reason }
        : {
            kind: 'timeout',
            chatterId: target.id,
            seconds: (measure.durationMinutes ?? 0) * 60,
            reason,
          }
    case SanctionKinds.Ban:
      return { kind: 'ban', chatterId: target.id, reason }
    default:
      return null
  }
}

/**
 * Sanctions panel at hand, folded against the right edge
 * @param {SanctionsDrawerProps} props - Drawer props
 * @return {JSX.Element}
 */

export const SanctionsDrawer = ({
  panel,
  levelName,
  isOpen,
  onToggle,
  target,
  targetLines,
  gate,
  onAct,
}: SanctionsDrawerProps) => {
  const [openedId, setOpenedId] = useState<string | null>(null)
  const ToggleIcon = ICONS.sanctionsPanel
  const lastLine = [...targetLines].reverse().find((line) => !line.deletedBy)

  // Offences grouped by gravity, heaviest first
  const groups = SANCTION_GRAVITY_REGISTRY.keys
    .slice()
    .sort((a, b) => SANCTION_GRAVITY_REGISTRY.get(b).rank - SANCTION_GRAVITY_REGISTRY.get(a).rank)
    .map((gravity) => ({
      gravity,
      offenses: (panel?.offenses ?? []).filter((offense) => offense.gravity === gravity),
    }))
    .filter((group) => group.offenses.length > 0)

  const apply = (offense: SanctionOffenseCard) => {
    if (!target || !offense.firstRung) return

    // Every measure of the rung, in panel order
    for (const measure of offense.firstRung.measures) {
      const intent = intentOf(measure, target, lastLine, offense.name)
      if (intent && gate(intent).allowed) onAct(intent)
    }
  }

  return (
    <aside
      className={cn(
        MODVIEW_SANCTIONS.root,
        isOpen ? MODVIEW_SANCTIONS.open : MODVIEW_SANCTIONS.closed
      )}
      aria-label={MODVIEW_COPY.sanctions}
    >
      <button
        type="button"
        className={MODVIEW_SANCTIONS.toggle}
        aria-expanded={isOpen}
        title={isOpen ? MODVIEW_COPY.sanctionsClose : MODVIEW_COPY.sanctionsOpen}
        onClick={onToggle}
      >
        <ToggleIcon className={MODVIEW_SANCTIONS.toggleIcon} aria-hidden="true" />
        {isOpen && MODVIEW_COPY.sanctions}
      </button>

      {isOpen && (
        <div className={MODVIEW_SANCTIONS.body}>
          {levelName && <p className={MODVIEW_SANCTIONS.level}>{levelName}</p>}
          {!target && groups.length > 0 && (
            <p className={MODVIEW_SANCTIONS.hint}>{MODVIEW_USER_COPY.pickTarget}</p>
          )}
          {groups.length === 0 && (
            <p className={MODVIEW_SANCTIONS.empty}>{MODVIEW_COPY.sanctionsEmpty}</p>
          )}

          {groups.map(({ gravity, offenses }) => (
            <section
              key={gravity}
              className={MODVIEW_SANCTIONS.group}
              style={accentVars(SANCTION_GRAVITY_REGISTRY.get(gravity).accent)}
            >
              <h4 className={MODVIEW_SANCTIONS.groupTitle}>
                {SANCTION_GRAVITY_REGISTRY.label(gravity)}
              </h4>
              {offenses.map((offense) => {
                const isOpened = openedId === offense.id

                return (
                  <div key={offense.id}>
                    <button
                      type="button"
                      aria-expanded={isOpened}
                      className={cn(
                        MODVIEW_SANCTIONS.offense,
                        isOpened && MODVIEW_SANCTIONS.offenseOpen
                      )}
                      onClick={() => setOpenedId(isOpened ? null : offense.id)}
                    >
                      <span className={MODVIEW_SANCTIONS.offenseRule} aria-hidden="true" />
                      <span className={MODVIEW_SANCTIONS.offenseName}>{offense.name}</span>
                      {offense.firstRung && (
                        <span className={MODVIEW_SANCTIONS.measures}>
                          {offense.firstRung.measures.map((measure) => {
                            const paint = accentPaint(measure.accent)

                            return (
                              <span
                                key={measure.id}
                                className={cn(MODVIEW_SANCTIONS.measure, paint.soft)}
                                style={paint.style}
                              >
                                {measure.name}
                              </span>
                            )
                          })}
                        </span>
                      )}
                    </button>
                    {isOpened && (
                      <div className={MODVIEW_SANCTIONS.detail}>
                        {offense.firstRung?.condition && (
                          <p className={MODVIEW_SANCTIONS.condition}>
                            {offense.firstRung.condition}
                          </p>
                        )}
                        <Button
                          variant="primary"
                          className={MODVIEW_SANCTIONS.apply}
                          disabled={!target || !offense.firstRung}
                          onClick={() => apply(offense)}
                        >
                          {target
                            ? MODVIEW_USER_COPY.apply.replace('{name}', target.name)
                            : MODVIEW_USER_COPY.pickTarget}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          ))}
        </div>
      )}
    </aside>
  )
}
