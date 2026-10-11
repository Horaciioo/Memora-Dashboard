'use client'

import type { ReactNode, Ref } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { MemoraMark } from '@/components/elements/display/MemoraMark'
import { NotifyDemo } from '@/composites/tour/NotifyDemo'
import { TourLoader } from '@/composites/tour/TourLoader'
import type { ChatLine } from '@/core/hooks/interaction/useWelcomeChat'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ChatPanelProps {
  lines: ChatLine[]
  name: string
  avatarUrl: string | null
  // Memora is writing in this part
  isTyping: boolean
  // Out of sight, so out of reach
  isHidden: boolean
  // Follows the newest message while it is the part under way
  scrollRef?: Ref<HTMLDivElement>
  onReady: () => void
  // The question waiting for an answer
  children?: ReactNode
}

/**
 * One part of the welcome as its own conversation
 * @param {ChatPanelProps} props - Lines, member and what waits at the end
 * @return {JSX.Element}
 */

export const ChatPanel = ({
  lines,
  name,
  avatarUrl,
  isTyping,
  isHidden,
  scrollRef,
  onReady,
  children,
}: ChatPanelProps) => {
  // Messages of the same speaker stand under one name
  const groups = lines.reduce<{ from: ChatLine['from']; lines: ChatLine[] }[]>((runs, line) => {
    const last = runs.at(-1)
    if (last?.from === line.from) last.lines.push(line)
    else runs.push({ from: line.from, lines: [line] })

    return runs
  }, [])
  const isMemoraLast = groups.at(-1)?.from === 'memora'

  const typing = (
    <span className={TOUR_CHAT.typing} role="status" aria-label={TOUR_COPY.typing}>
      {[0, 1, 2].map((dot) => (
        <span key={dot} className={TOUR_CHAT.typingDot} />
      ))}
    </span>
  )

  return (
    <div className={TOUR_CHAT.panel} aria-hidden={isHidden} inert={isHidden}>
      <div ref={scrollRef} className={TOUR_CHAT.scroll} aria-live="polite">
        <div className={TOUR_CHAT.column}>
          {groups.map((group, index) => {
            const isMemora = group.from === 'memora'

            return (
              <div key={index} className={cn(TOUR_CHAT.group, index > 0 && TOUR_CHAT.groupBreak)}>
                <span className={TOUR_CHAT.avatar} aria-hidden="true">
                  {isMemora ? (
                    <MemoraMark className={TOUR_CHAT.avatarGlyph} />
                  ) : (
                    <Avatar name={name} src={avatarUrl} size="md" />
                  )}
                </span>
                <div className={TOUR_CHAT.body}>
                  <p className={cn(TOUR_CHAT.author, isMemora && TOUR_CHAT.authorMemora)}>
                    {isMemora ? TOUR_COPY.memora : name}
                  </p>
                  {group.lines.map((line, position) =>
                    line.scene ? (
                      <div key={position} className={TOUR_CHAT.scene}>
                        {line.scene === 'notify' ? (
                          <NotifyDemo />
                        ) : (
                          <TourLoader onReady={onReady} />
                        )}
                      </div>
                    ) : (
                      <p key={position} className={TOUR_CHAT.line}>
                        {line.text}
                      </p>
                    )
                  )}
                  {isTyping && isMemora && index === groups.length - 1 && typing}
                </div>
              </div>
            )
          })}

          {isTyping && !isMemoraLast && (
            <div className={cn(TOUR_CHAT.group, groups.length > 0 && TOUR_CHAT.groupBreak)}>
              <span className={TOUR_CHAT.avatar} aria-hidden="true">
                <MemoraMark className={TOUR_CHAT.avatarGlyph} />
              </span>
              <div className={TOUR_CHAT.body}>
                <p className={cn(TOUR_CHAT.author, TOUR_CHAT.authorMemora)}>{TOUR_COPY.memora}</p>
                {typing}
              </div>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  )
}
