'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { AssistantThread } from '@/composites/search/assistant/AssistantThread'
import { MemoraIntro } from '@/composites/search/assistant/MemoraIntro'
import type { ChatPick } from '@/composites/search/assistant/MemoraIntro'
import { useAssistantChat } from '@/core/hooks/data/system/useAssistantChat'
import { useAssistantDock } from '@/core/store/assistantDock'
import type { DockAction } from '@/core/store/assistantDock'
import { ASSISTANT_COPY, ASSISTANT_INTRO_COPY } from '@/declarations/assistant/copy'
import type { AssistantHello } from '@/declarations/assistant/copy'
import { ASSISTANT_DOCK_COPY } from '@/declarations/assistant/offers'
import { ICONS } from '@/declarations/ui/icons'
import { FLOATING_ADD_STYLES } from '@/declarations/ui/variants'

export interface FloatingChatProps {
  name: string
  hello: AssistantHello
  greeting: string
  action: DockAction | null
  // Creations of other pages the member reaches
  picks: ChatPick[]
  onClose: () => void
}

/**
 * Chat opened by the Memora button, forgotten on close
 * @param {FloatingChatProps} props - Member, welcome, greeting, creations and close
 * @return {JSX.Element}
 */

export const FloatingChat = ({
  name,
  hello,
  greeting,
  action,
  picks,
  onClose,
}: FloatingChatProps) => {
  const router = useRouter()
  const handOff = useAssistantDock((state) => state.handOff)
  const focus = useAssistantDock((state) => state.focus)
  const hasFocused = useRef(false)
  const [term, setTerm] = useState('')
  const thread = useRef<HTMLDivElement>(null)
  const chat = useAssistantChat((href) => {
    onClose()
    router.push(href)
  })
  const SendGlyph = ICONS.forward

  // Newest line in sight, the intro included
  useEffect(() => {
    const box = thread.current
    if (!box) return

    const follow = new MutationObserver(() => box.scrollTo({ top: box.scrollHeight }))
    follow.observe(box, { childList: true, subtree: true, characterData: true })

    return () => follow.disconnect()
  }, [])

  const submit = () => {
    if (!term.trim()) return
    chat.send(term)
    setTerm('')
  }

  return (
    <div className={FLOATING_ADD_STYLES.chat} role="dialog" aria-label={ASSISTANT_COPY.name}>
      <div className={FLOATING_ADD_STYLES.chatHead}>
        <span className={FLOATING_ADD_STYLES.chatHeadMark}>
          <BrainMark className={FLOATING_ADD_STYLES.chatHeadGlyph} />
        </span>
        <div className={FLOATING_ADD_STYLES.chatHeadText}>
          <span className={FLOATING_ADD_STYLES.chatHeadTitle}>
            <span className={FLOATING_ADD_STYLES.chatHeadName}>{ASSISTANT_COPY.name}</span>
            <MaturityTag maturity={ASSISTANT_COPY.maturity} compact interactive={false} />
          </span>
          <span className={FLOATING_ADD_STYLES.chatHeadStatus}>{ASSISTANT_INTRO_COPY.status}</span>
        </div>
        <Button
          variant="icon"
          icon="close"
          aria-label={ASSISTANT_INTRO_COPY.close}
          onClick={onClose}
        />
      </div>
      <div ref={thread} className={FLOATING_ADD_STYLES.chatThread}>
        <div className={FLOATING_ADD_STYLES.chatThreadInner}>
          <AssistantThread
            chat={chat}
            onSuggestion={(text) => chat.start(text)}
            opening={
              <MemoraIntro
                name={name}
                hello={hello}
                greeting={greeting}
                action={action}
                picks={picks}
                showPicks={chat.turns.length === 0 && !chat.scenario.isActive && !focus}
                onDone={() => {
                  // The page knows what the member is on, Memora starts from there
                  if (!focus || hasFocused.current) return
                  hasFocused.current = true
                  chat.guide(focus.scenario, focus.entry, focus.data)
                }}
                onAction={(create) => {
                  onClose()
                  create.run()
                }}
                onPick={(offer) => {
                  // A creation with a guided talk opens it right here
                  if (offer.scenario) {
                    chat.guide(offer.scenario, 'offer')
                    return
                  }

                  handOff(offer)
                  router.push(offer.href)
                }}
              />
            }
          />
        </div>
      </div>
      <form
        className={FLOATING_ADD_STYLES.chatBar}
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <input
          autoFocus
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={
            chat.isAnswering ? ASSISTANT_COPY.answerPlaceholder : ASSISTANT_DOCK_COPY.placeholder
          }
          aria-label={ASSISTANT_COPY.launcherTitle}
          className={FLOATING_ADD_STYLES.chatInput}
        />
        <button
          type="submit"
          disabled={!term.trim()}
          aria-label={ASSISTANT_INTRO_COPY.send}
          className={FLOATING_ADD_STYLES.chatSend}
        >
          <SendGlyph className={FLOATING_ADD_STYLES.chatSendGlyph} />
        </button>
      </form>
    </div>
  )
}
