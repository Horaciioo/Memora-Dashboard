'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { useChatReplay } from '@/core/hooks/interaction/useChatReplay'
import { CHAT_ROLE_BADGES, nameColour } from '@/declarations/academy/chat'
import type { ChatLine } from '@/declarations/academy/curriculum/types'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CHAT, COURSE_DEMO } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ChatFeedProps {
  surface: 'twitch' | 'youtube'
  lines: ChatLine[]
  caption?: string
  // Offers to play the chat back like a clip
  replayable?: boolean
  // Plays on arrival, as a scene opening
  autoplay?: boolean
  // Called once every line is on screen
  onPlayed?: () => void
}

/**
 * What a demonstration does to a line
 * @typedef {Object} ChatLineMark
 * @property {boolean} [focus] - The line the step is about
 * @property {boolean} [deleted] - Removed by a moderator
 * @property {ReactNode} [tags] - Tags a moderator left on the author
 */

export interface ChatLineMark {
  focus?: boolean
  deleted?: boolean
  tags?: ReactNode
}

/**
 * One chat line, drawn as the platform draws it
 * @param {Object} props - Line, surface, whether it is arriving and any mark
 * @return {JSX.Element}
 */

export const ChatLineView = ({
  line,
  surface,
  arriving,
  mark,
}: {
  line: ChatLine
  surface: 'twitch' | 'youtube'
  arriving: boolean
  mark?: ChatLineMark
}) => {
  const badge = CHAT_ROLE_BADGES[line.role ?? 'viewer']
  const colour = nameColour(line.author)
  const flagged = line.flagged
    ? surface === 'twitch'
      ? COURSE_CHAT.flagged
      : COURSE_CHAT.flaggedYoutube
    : undefined
  const marked = cn(mark?.focus && COURSE_DEMO.lineFocus, mark?.deleted && COURSE_DEMO.lineDeleted)

  if (surface === 'youtube') {
    return (
      <div
        className={cn(
          COURSE_CHAT.line,
          COURSE_CHAT.row,
          flagged,
          marked,
          arriving && COURSE_CHAT.lineIn
        )}
      >
        <span className={COURSE_CHAT.avatar} style={{ background: colour }} aria-hidden="true">
          {line.author.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className={cn(COURSE_CHAT.author, COURSE_CHAT.authorYoutube)}>
            {badge && (
              <span className={COURSE_CHAT.badge} style={{ background: badge.colour }}>
                {badge.label}
              </span>
            )}
            {line.author}
          </span>{' '}
          {line.text}
          {mark?.tags}
        </span>
      </div>
    )
  }

  return (
    <div className={cn(COURSE_CHAT.line, flagged, marked, arriving && COURSE_CHAT.lineIn)}>
      {badge && (
        <span className={COURSE_CHAT.badge} style={{ background: badge.colour }}>
          {badge.label}
        </span>
      )}
      <span className={COURSE_CHAT.author} style={{ color: colour }}>
        {line.author}
      </span>
      <span className={COURSE_CHAT.colon}>: </span>
      {line.text}
      {mark?.tags}
    </div>
  )
}

/**
 * Twitch or YouTube chat as an illustration, whole at rest and playing back line by line on
 * demand, the line a lesson is about lit up
 * @param {ChatFeedProps} props - Surface, lines, caption and playback
 * @return {JSX.Element}
 */

export const ChatFeed = ({
  surface,
  lines,
  caption,
  replayable,
  autoplay,
  onPlayed,
}: ChatFeedProps) => {
  const { shown, playing, replay } = useChatReplay(lines.length, autoplay)
  const ReplayIcon = ICONS.refresh

  // The scene is over once nothing is left to arrive
  useEffect(() => {
    if (!playing) onPlayed?.()
  }, [playing, onPlayed])

  const isTwitch = surface === 'twitch'

  return (
    <figure className={cn(COURSE_CHAT.panel, isTwitch ? COURSE_CHAT.twitch : COURSE_CHAT.youtube)}>
      <figcaption
        className={cn(
          COURSE_CHAT.head,
          isTwitch ? COURSE_CHAT.headTwitch : COURSE_CHAT.headYoutube
        )}
      >
        <span className={COURSE_CHAT.live}>
          <span className={COURSE_CHAT.liveMark} aria-hidden="true" />
          {caption ?? COURSE_COPY.chatLive}
        </span>
        {replayable && (
          <button type="button" className={COURSE_CHAT.replay} onClick={replay}>
            <ReplayIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {COURSE_COPY.replay}
          </button>
        )}
      </figcaption>
      <div className={COURSE_CHAT.body} aria-live="polite">
        {lines.slice(0, shown).map((line, index) => (
          <ChatLineView
            key={`${index}-${line.author}`}
            line={line}
            surface={surface}
            arriving={playing || shown < lines.length}
          />
        ))}
        {shown === 0 && !playing && <p className={COURSE_CHAT.empty}>{COURSE_COPY.chatEmpty}</p>}
        {playing && (
          <span className={COURSE_CHAT.typing} aria-hidden="true">
            <span className={COURSE_CHAT.typingDot} />
            <span className={COURSE_CHAT.typingDot} />
            <span className={COURSE_CHAT.typingDot} />
          </span>
        )}
      </div>
    </figure>
  )
}
