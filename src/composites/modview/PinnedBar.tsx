'use client'

import { useState } from 'react'

import { ChatText } from '@/composites/modview/ChatText'
import { FoldToggle } from '@/composites/modview/FoldToggle'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_CHAT, MODVIEW_POLL } from '@/declarations/ui/variants'
import type { PinnedMessage } from '@/types/modview'

export interface PinnedBarProps {
  pin: PinnedMessage
  gate: GateCheck
  onAct: ActRunner
}

/**
 * Message pinned above the chat, as Twitch shows it, with the unpin for the seats that may
 * @param {PinnedMessage} pin - Pinned message
 * @param {GateCheck} gate - Permission check
 * @param {ActRunner} onAct - Gesture runner
 * @return {JSX.Element}
 */

export const PinnedBar = ({ pin, gate, onAct }: PinnedBarProps) => {
  const [isFolded, setFolded] = useState(false)
  const PinIcon = ICONS.modPin
  const unpin = gate({ kind: 'unpin', messageId: pin.messageId })

  return (
    <aside className={MODVIEW_CHAT.pinned} aria-label={MODVIEW_COPY.pinned}>
      <p className={MODVIEW_CHAT.pinnedHead}>
        <PinIcon className={MODVIEW_CHAT.pinnedIcon} aria-hidden="true" />
        {MODVIEW_COPY.pinned}
        {pin.pinnedBy && ` ${MODVIEW_COPY.pinnedBy.replace('{name}', pin.pinnedBy)}`}
        <span className={MODVIEW_POLL.tools}>
          {unpin.allowed && (
            <button
              type="button"
              className={MODVIEW_POLL.end}
              onClick={() => onAct({ kind: 'unpin', messageId: pin.messageId })}
            >
              {MODVIEW_COPY.unpin}
            </button>
          )}
          <FoldToggle isFolded={isFolded} onToggle={() => setFolded(!isFolded)} />
        </span>
      </p>
      <p className={isFolded ? MODVIEW_CHAT.pinnedBodyFolded : MODVIEW_CHAT.pinnedBody}>
        <strong>{pin.author.name}</strong>
        {': '}
        <ChatText text={pin.text} fragments={pin.fragments} />
      </p>
    </aside>
  )
}
