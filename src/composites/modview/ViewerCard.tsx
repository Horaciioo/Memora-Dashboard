'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { TIMEOUT_PRESETS } from '@/declarations/modview/registries'
import { MODVIEW_USER } from '@/declarations/ui/variants'
import type { ChatMessage, Chatter } from '@/types/modview'
import { formatDuration } from '@/utils/format/modview'

export interface ViewerCardProps {
  chatter: Chatter
  messages: ChatMessage[]
  gate: GateCheck
  onAct: ActRunner
  onClose: () => void
}

/**
 * One viewer, their lines on this live and every gesture on them
 * @param {Chatter} chatter - Viewer
 * @param {ChatMessage[]} messages - Their lines on this live
 * @param {GateCheck} gate - Permission check
 * @param {ActRunner} onAct - Gesture runner
 * @param {() => void} onClose - Close the card
 * @return {JSX.Element}
 */

export const ViewerCard = ({ chatter, messages, gate, onAct, onClose }: ViewerCardProps) => {
  const [reason, setReason] = useState('')
  const chatterId = chatter.id
  const lastLine = [...messages].reverse().find((message) => !message.deletedBy)
  const moderate = gate({ kind: 'ban', chatterId, reason: null })
  const motive = reason.trim() || null

  return (
    <aside className={MODVIEW_USER.panel} aria-label={MODVIEW_USER_COPY.title}>
      <header className={MODVIEW_USER.head}>
        <h3
          className={MODVIEW_USER.name}
          style={chatter.colour ? { color: chatter.colour } : undefined}
        >
          {chatter.name}
        </h3>
        <Button
          variant="ghost"
          icon="close"
          aria-label={MODVIEW_USER_COPY.close}
          onClick={onClose}
        />
      </header>

      <div className={MODVIEW_USER.body}>
        <section className={MODVIEW_USER.section}>
          <h4 className={MODVIEW_USER.label}>{MODVIEW_USER_COPY.messages}</h4>
          <ul className={MODVIEW_USER.messages}>
            {messages.map((message) => (
              <li key={message.id} className={MODVIEW_USER.message}>
                <FlaggedText text={message.text} flagged={message.flagged} />
              </li>
            ))}
          </ul>
        </section>

        <section className={MODVIEW_USER.section}>
          <h4 className={MODVIEW_USER.label}>{MODVIEW_USER_COPY.reason}</h4>
          <input
            className={MODVIEW_USER.reason}
            placeholder={MODVIEW_USER_COPY.reasonPlaceholder}
            aria-label={MODVIEW_USER_COPY.reason}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </section>

        <section className={MODVIEW_USER.section}>
          <h4 className={MODVIEW_USER.label}>{MODVIEW_USER_COPY.timeout}</h4>
          <div className={MODVIEW_USER.presets}>
            {TIMEOUT_PRESETS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                className={MODVIEW_USER.preset}
                disabled={!moderate.allowed}
                title={moderate.reason ?? undefined}
                onClick={() => onAct({ kind: 'timeout', chatterId, seconds, reason: motive })}
              >
                {formatDuration(seconds)}
              </button>
            ))}
          </div>
        </section>

        <div className={MODVIEW_USER.actions}>
          <Button
            variant="secondary"
            disabled={!moderate.allowed || !lastLine}
            title={moderate.reason ?? undefined}
            onClick={() => lastLine && onAct({ kind: 'delete', messageId: lastLine.id, chatterId })}
          >
            {MODVIEW_USER_COPY.delete}
          </Button>
          <Button
            variant="secondary"
            disabled={!moderate.allowed || !motive}
            title={moderate.reason ?? undefined}
            onClick={() => motive && onAct({ kind: 'warn', chatterId, reason: motive })}
          >
            {MODVIEW_USER_COPY.warn}
          </Button>
          <Button
            variant="danger"
            disabled={!moderate.allowed}
            title={moderate.reason ?? undefined}
            onClick={() => onAct({ kind: 'ban', chatterId, reason: motive })}
          >
            {MODVIEW_USER_COPY.ban}
          </Button>
          <Button
            variant="secondary"
            disabled={!moderate.allowed}
            title={moderate.reason ?? undefined}
            onClick={() => onAct({ kind: 'unban', chatterId })}
          >
            {MODVIEW_USER_COPY.unban}
          </Button>
        </div>
        {!moderate.allowed && <p className={MODVIEW_USER.lock}>{moderate.reason}</p>}
      </div>
    </aside>
  )
}
