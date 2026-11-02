'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Editor } from '@tiptap/core'
import type { Awareness } from 'y-protocols/awareness'

import { Avatar } from '@/components/elements/display/Avatar'
import { peerCaretsOf } from '@/core/lib/pages/peerCarets'
import type { PeerCaret } from '@/core/lib/pages/peerCarets'
import { tintColor } from '@/core/lib/realtime/tint'
import { PEER_CARET_STYLES } from '@/declarations/ui/variants'

export interface PeerCaretsProps {
  editor: Editor
  awareness: Awareness
  frame: HTMLElement
}

/**
 * Other members' carets gliding over the editor, their portrait on top
 * @param {PeerCaretsProps} props - Editor, carets, frame
 * @return {JSX.Element}
 */

export const PeerCarets = ({ editor, awareness, frame }: PeerCaretsProps) => {
  const [carets, setCarets] = useState<PeerCaret[]>([])

  // One measure per frame, whatever moved
  useEffect(() => {
    let pending = 0
    const measure = () => {
      if (pending) return
      pending = window.requestAnimationFrame(() => {
        pending = 0
        setCarets(peerCaretsOf(editor, awareness, frame))
      })
    }
    measure()
    awareness.on('change', measure)
    editor.on('transaction', measure)
    window.addEventListener('resize', measure)

    return () => {
      window.cancelAnimationFrame(pending)
      awareness.off('change', measure)
      editor.off('transaction', measure)
      window.removeEventListener('resize', measure)
    }
  }, [editor, awareness, frame])

  return (
    <div aria-hidden="true" className={PEER_CARET_STYLES.layer}>
      {carets.map((caret) => (
        <div
          key={caret.id}
          className={PEER_CARET_STYLES.caret}
          style={
            {
              transform: `translate3d(${caret.x}px, ${caret.y}px, 0)`,
              '--caret-tint': tintColor(caret.tint),
            } as CSSProperties
          }
        >
          <span className={PEER_CARET_STYLES.line} style={{ height: caret.height }} />
          <Avatar
            name={caret.name}
            src={caret.image}
            size="xs"
            title=""
            className={PEER_CARET_STYLES.face}
          />
        </div>
      ))}
    </div>
  )
}
