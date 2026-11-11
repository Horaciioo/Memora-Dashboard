'use client'

import { useState } from 'react'

import { Input } from '@/components/elements/forms/inputs/Input'
import { useActionRunner } from '@/composites/modview/actions/useActionRunner'
import { ReasonDialog } from '@/composites/modview/ReasonDialog'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { actionIntent } from '@/core/lib/modview/actions'
import { parseDuration } from '@/core/lib/modview/commands'
import { MODVIEW_BASE_MEASURES } from '@/declarations/modview/actions'
import { MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { TIMEOUT_PRESETS } from '@/declarations/modview/registries'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { MODVIEW_USER } from '@/declarations/ui/variants'
import type { ChatMessage, Chatter } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatDuration } from '@/utils/format/modview'

// Sanction waiting for its reason, a null length means a free one
type Pending = { kind: 'timeout'; seconds: number | null }

export interface ViewerSanctionsProps {
  chatter: Chatter
  lastLine: ChatMessage | undefined
  gate: GateCheck
  onAct: ActRunner
  isWatched: boolean
  onWatch: () => void
}

/**
 * Sanctions at hand, grouped by kind
 * @param {ViewerSanctionsProps} props - Viewer, gate and runner
 * @return {JSX.Element}
 */

export const ViewerSanctions = ({
  chatter,
  lastLine,
  gate,
  onAct,
  isWatched,
  onWatch,
}: ViewerSanctionsProps) => {
  const [pending, setPending] = useState<Pending | null>(null)
  const [custom, setCustom] = useState('')
  const chatterId = chatter.id
  const { preferences } = useModPreferences()
  const { run, dialog } = useActionRunner(onAct, preferences.confirmHarsh)
  const target = { chatterId, ...(lastLine ? { messageId: lastLine.id } : {}) }
  const moderate = gate({ kind: 'ban', chatterId, reason: null })
  const customSeconds = parseDuration(custom)
  const seconds = pending ? (pending.seconds ?? customSeconds) : null

  const lead = MODVIEW_USER_COPY.timeoutLead
    .replace('{duration}', seconds ? formatDuration(seconds) : '…')
    .replace('{name}', chatter.name)

  const confirm = (reason: string) => {
    if (seconds) onAct({ kind: 'timeout', chatterId, seconds, reason: reason || null })
  }

  const open = (next: Pending) => {
    setCustom('')
    setPending(next)
  }

  // One base measure as a tile
  const measure = (id: string, tone: string = MODVIEW_USER.measureNeutral) => {
    const item = MODVIEW_BASE_MEASURES.find((entry) => entry.id === id)
    if (!item) return null
    const intent = actionIntent(item, target)
    const check = intent ? gate(intent) : null
    const label = MODVIEW_USER_COPY[item.kind as 'warn' | 'ban' | 'unban']

    return (
      <button
        type="button"
        className={cn(MODVIEW_USER.measure, tone)}
        disabled={!check?.allowed}
        title={check?.reason ?? label}
        onClick={() => run(item, target, chatter.name)}
      >
        {label}
      </button>
    )
  }

  return (
    <section className={MODVIEW_USER.section}>
      <div className={MODVIEW_USER.group}>
        <p className={MODVIEW_USER.groupHead}>{MODVIEW_USER_COPY.timeoutGroup}</p>
        <div className={MODVIEW_USER.presets}>
          {TIMEOUT_PRESETS.map((length) => (
            <button
              key={length}
              type="button"
              className={MODVIEW_USER.preset}
              disabled={!moderate.allowed}
              title={moderate.reason ?? MODVIEW_USER_COPY.timeout}
              onClick={() => open({ kind: 'timeout', seconds: length })}
            >
              {formatDuration(length)}
            </button>
          ))}
          <button
            type="button"
            className={`${MODVIEW_USER.preset} ${MODVIEW_USER.presetWide}`}
            disabled={!moderate.allowed}
            title={moderate.reason ?? MODVIEW_USER_COPY.timeout}
            onClick={() => open({ kind: 'timeout', seconds: null })}
          >
            {MODVIEW_USER_COPY.customChip}
          </button>
        </div>
      </div>

      <div className={MODVIEW_USER.group}>
        <p className={MODVIEW_USER.groupHead}>{MODVIEW_USER_COPY.otherGroup}</p>
        <div className={MODVIEW_USER.actions}>
          {measure('base-warn', MODVIEW_USER.measureWarn)}
          <button
            type="button"
            className={cn(
              MODVIEW_USER.measure,
              MODVIEW_USER.actionWide,
              isWatched ? MODVIEW_USER.measureOn : MODVIEW_USER.measureNeutral
            )}
            aria-pressed={isWatched}
            onClick={onWatch}
          >
            {isWatched ? MODVIEW_WATCH_COPY.stop : MODVIEW_WATCH_COPY.start}
          </button>
          {measure('base-ban')}
          {measure('base-unban')}
        </div>
      </div>
      {!moderate.allowed && <p className={MODVIEW_USER.lock}>{moderate.reason}</p>}

      {dialog}
      {pending && (
        <ReasonDialog
          description={lead}
          placeholder={MODVIEW_USER_COPY.optionalPlaceholder}
          confirmLabel={MODVIEW_USER_COPY.timeout}
          canConfirm={seconds !== null}
          onConfirm={confirm}
          onClose={() => setPending(null)}
        >
          {pending.seconds === null && (
            <Input
              autoFocus
              placeholder={MODVIEW_USER_COPY.customDuration}
              aria-label={MODVIEW_USER_COPY.customDuration}
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
            />
          )}
        </ReasonDialog>
      )}
    </section>
  )
}
