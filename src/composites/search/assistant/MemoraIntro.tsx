'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { MentionText } from '@/components/elements/display/MentionText'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { useMemoraIntro } from '@/core/hooks/interaction/scenes/useMemoraIntro'
import type { DockAction } from '@/core/store/assistantDock'
import { ASSISTANT_COPY, ASSISTANT_INTRO_COPY } from '@/declarations/assistant/copy'
import type { AssistantHello } from '@/declarations/assistant/copy'
import type { AssistantOffer } from '@/declarations/assistant/offers'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { ASSISTANT_STYLES, FLOATING_ADD_STYLES } from '@/declarations/ui/variants'

/**
 * Creation of another page, with its page icon
 * @typedef {Object} ChatPick
 * @property {AssistantOffer} offer - Question and page
 * @property {IconName} icon - Page icon
 */

export interface ChatPick {
  offer: AssistantOffer
  icon: IconName
}

export interface MemoraIntroProps {
  name: string
  hello: AssistantHello
  greeting: string
  action: DockAction | null
  picks: ChatPick[]
  // Questions leave once the talk starts
  showPicks: boolean
  onAction: (action: DockAction) => void
  onPick: (offer: AssistantOffer) => void
  // Every line is written
  onDone?: () => void
}

/**
 * Memora types her welcome, then drops her questions
 * @param {MemoraIntroProps} props - Member, welcome, greeting, page creation and other questions
 * @return {JSX.Element}
 */

export const MemoraIntro = ({
  name,
  hello,
  greeting,
  action,
  picks,
  showPicks,
  onAction,
  onPick,
  onDone,
}: MemoraIntroProps) => {
  const script = useMemo(
    () => [
      {
        text: hello.text.replace('{name}', name),
        draft: hello.draft?.replace('{name}', name),
      },
      { text: greeting },
    ],
    [name, hello, greeting]
  )
  const intro = useMemoraIntro(script)
  const { isDone } = intro
  const latestDone = useRef(onDone)

  useEffect(() => {
    latestDone.current = onDone
  })

  useEffect(() => {
    if (isDone) latestDone.current?.()
  }, [isDone])
  // Question of the icon pointed
  const [pointed, setPointed] = useState<string | null>(null)

  return (
    <div className={ASSISTANT_STYLES.memora}>
      <span className={ASSISTANT_STYLES.avatar}>
        <BrainMark motion="idle" className={ASSISTANT_STYLES.avatarMark} />
      </span>
      <div className={ASSISTANT_STYLES.body}>
        <span className={ASSISTANT_STYLES.author}>{ASSISTANT_COPY.name}</span>
        {intro.lines.map((line, index) => (
          <p key={index} className={ASSISTANT_STYLES.line}>
            <MentionText text={line} />
            {!intro.isDone && index === intro.lines.length - 1 && (
              <span className={FLOATING_ADD_STYLES.chatCaret} aria-hidden="true" />
            )}
          </p>
        ))}
        {intro.isTyping && (
          <span
            className={FLOATING_ADD_STYLES.chatTyping}
            role="status"
            aria-label={ASSISTANT_INTRO_COPY.typing}
          >
            {[0, 1, 2].map((dot) => (
              <span key={dot} className={FLOATING_ADD_STYLES.chatTypingDot} />
            ))}
          </span>
        )}
        {intro.isDone && showPicks && (
          <div className={FLOATING_ADD_STYLES.chatPicks}>
            {action && (
              <button
                type="button"
                onClick={() => onAction(action)}
                className={FLOATING_ADD_STYLES.chatAction}
              >
                {action.label}
              </button>
            )}
            <div className={FLOATING_ADD_STYLES.chatIcons} onPointerLeave={() => setPointed(null)}>
              {picks.map(({ offer, icon }, index) => {
                const Glyph = ICONS[icon]
                const delay = (index + (action ? 1 : 0)) * ASSISTANT_SETTINGS.pickStaggerMs

                return (
                  <button
                    key={offer.ask}
                    type="button"
                    aria-label={offer.ask}
                    onClick={() => onPick(offer)}
                    onPointerEnter={() => setPointed(offer.ask)}
                    onFocus={() => setPointed(offer.ask)}
                    onBlur={() => setPointed(null)}
                    className={FLOATING_ADD_STYLES.chatPick}
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    <Glyph className={FLOATING_ADD_STYLES.chatPickGlyph} />
                  </button>
                )
              })}
            </div>
            {/* Height kept, nothing moves */}
            <p className={FLOATING_ADD_STYLES.chatPickHint} aria-hidden="true">
              {pointed}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
