'use client'

import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PlayMessageView } from '@/types/play'

/**
 * Message being typed and its sending
 * @param {string} sessionId - Game
 * @param {(line: PlayMessageView) => void} add - Local add of the sent line
 * @return {Object} - Draft, setter and Enter handler
 */

export const usePlayChatDraft = (sessionId: string, add: (line: PlayMessageView) => void) => {
  const { run } = useMutation()
  const isSending = useRef(false)
  const [draft, setDraft] = useState('')

  const send = async () => {
    const body = draft.trim()
    // One line in flight, a second Enter waits
    if (!body || isSending.current) return
    isSending.current = true
    setDraft('')
    const sent = await run(() =>
      apiPost<PlayMessageView>(API_ROUTES.playMessages(sessionId), { body })
    )
    isSending.current = false
    if (sent === null) return setDraft(body)
    add(sent)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter closing an accent or a suggestion is not a send
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    void send()
  }

  return { draft, setDraft, onKeyDown }
}
