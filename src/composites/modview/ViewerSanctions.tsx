'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { ReasonDialog } from '@/composites/modview/ReasonDialog'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { parseDuration } from '@/core/lib/modview/commands'
import { MODVIEW_COPY, MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { TIMEOUT_PRESETS } from '@/declarations/modview/registries'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { MODVIEW_USER } from '@/declarations/ui/variants'
import type { ChatMessage, Chatter } from '@/types/modview'
import { formatDuration } from '@/utils/format/modview'

// Sanction waiting for its reason, a null length means a free one
type Pending = { kind: 'timeout'; seconds: number | null } | { kind: 'warn' } | { kind: 'ban' }

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
  const moderate = gate({ kind: 'ban', chatterId, reason: null })
  const customSeconds = parseDuration(custom)
  const seconds = pending?.kind === 'timeout' ? (pending.seconds ?? customSeconds) : null

  // Dialog wording per kind
  const lead =
    pending?.kind === 'timeout'
      ? MODVIEW_USER_COPY.timeoutLead
          .replace('{duration}', seconds ? formatDuration(seconds) : '…')
          .replace('{name}', chatter.name)
      : pending?.kind === 'ban'
        ? MODVIEW_USER_COPY.banLead.replace('{name}', chatter.name)
        : MODVIEW_USER_COPY.warnLead.replace('{name}', chatter.name)

  const confirm = (reason: string) => {
    if (!pending) return
    if (pending.kind === 'warn') return onAct({ kind: 'warn', chatterId, reason })
    if (pending.kind === 'ban') return onAct({ kind: 'ban', chatterId, reason: reason || null })
    if (seconds) onAct({ kind: 'timeout', chatterId, seconds, reason: reason || null })
  }

  const open = (next: Pending) => {
    setCustom('')
    setPending(next)
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
          <Button
            variant="secondary"
            icon="modWarn"
            disabled={!moderate.allowed}
            title={moderate.reason ?? undefined}
            onClick={() => open({ kind: 'warn' })}
          >
            {MODVIEW_USER_COPY.warn}
          </Button>
          <Button
            variant="secondary"
            icon="modDelete"
            disabled={!moderate.allowed || !lastLine}
            title={moderate.reason ?? undefined}
            onClick={() => lastLine && onAct({ kind: 'delete', messageId: lastLine.id, chatterId })}
          >
            {MODVIEW_USER_COPY.delete}
          </Button>
          <Button
            variant="danger"
            icon="modBan"
            disabled={!moderate.allowed}
            title={moderate.reason ?? undefined}
            onClick={() => open({ kind: 'ban' })}
          >
            {MODVIEW_USER_COPY.ban}
          </Button>
          <Button
            variant="secondary"
            icon="modUnban"
            disabled={!moderate.allowed}
            title={moderate.reason ?? undefined}
            onClick={() => onAct({ kind: 'unban', chatterId })}
          >
            {MODVIEW_USER_COPY.unban}
          </Button>
          <Button
            className={MODVIEW_USER.actionWide}
            variant={isWatched ? 'primary' : 'secondary'}
            icon="visible"
            aria-pressed={isWatched}
            onClick={onWatch}
          >
            {isWatched ? MODVIEW_WATCH_COPY.stop : MODVIEW_WATCH_COPY.start}
          </Button>
        </div>
      </div>
      {!moderate.allowed && <p className={MODVIEW_USER.lock}>{moderate.reason}</p>}

      {pending && (
        <ReasonDialog
          description={lead}
          placeholder={
            pending.kind === 'warn'
              ? MODVIEW_COPY.warnPlaceholder
              : MODVIEW_USER_COPY.optionalPlaceholder
          }
          confirmLabel={
            pending.kind === 'warn'
              ? MODVIEW_COPY.warnConfirm
              : pending.kind === 'ban'
                ? MODVIEW_USER_COPY.ban
                : MODVIEW_USER_COPY.timeout
          }
          isRequired={pending.kind === 'warn'}
          canConfirm={pending.kind !== 'timeout' || seconds !== null}
          onConfirm={confirm}
          onClose={() => setPending(null)}
        >
          {pending.kind === 'timeout' && pending.seconds === null && (
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
