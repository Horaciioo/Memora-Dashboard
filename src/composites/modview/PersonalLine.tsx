'use client'

import { DotMark } from '@/components/elements/display/Dotted'
import { Button } from '@/components/elements/actions/Button'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import type { PersonalLine as PersonalLineData } from '@/core/lib/modview/personal'
import { BADWORD_TONE, MODVIEW_PERSONAL_COPY } from '@/declarations/modview/personal'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { MODVIEW_FEED, MODVIEW_SUGGEST } from '@/declarations/ui/variants'
import type { Chatter } from '@/types/modview'
import { formatSince } from '@/utils/format/time/dates'

export interface PersonalLineProps {
  line: PersonalLineData
  onPick: (chatter: Chatter) => void
  onWatch: (chatter: Chatter) => void
  onDismiss: (id: string) => void
}

/**
 * A line holding the moderator's own badwords, in their colours
 * @param {PersonalLineProps} props - Line and gestures
 * @return {JSX.Element}
 */

export const PersonalLine = ({ line, onPick, onWatch, onDismiss }: PersonalLineProps) => {
  const { message, hits } = line
  const tones = Object.fromEntries(
    hits.map((hit) => [hit.term.toLowerCase(), hit.colour ?? BADWORD_TONE])
  )

  return (
    <li className={MODVIEW_FEED.item}>
      <div className={MODVIEW_FEED.main}>
        <span className={MODVIEW_FEED.category} style={{ color: hits[0]?.colour ?? BADWORD_TONE }}>
          {MODVIEW_PERSONAL_COPY.queueCategory}
        </span>
        <p>
          <button
            type="button"
            className={MODVIEW_FEED.whoLink}
            onClick={() => onPick(message.author)}
          >
            {message.author.name}
          </button>
          <DotMark />
          {formatSince(message.sentAt)}
        </p>
        <p className={MODVIEW_FEED.quote}>
          <FlaggedText text={message.text} flagged={hits.map((hit) => hit.term)} tones={tones} />
        </p>
        <div className={MODVIEW_SUGGEST.actions}>
          <Button
            variant="ghost"
            icon="visible"
            className={MODVIEW_SUGGEST.watch}
            aria-label={MODVIEW_WATCH_COPY.start}
            title={MODVIEW_WATCH_COPY.start}
            onClick={() => onWatch(message.author)}
          />
          <Button
            variant="ghost"
            icon="close"
            className={MODVIEW_SUGGEST.refuse}
            aria-label={MODVIEW_PERSONAL_COPY.queueDismiss}
            title={MODVIEW_PERSONAL_COPY.queueDismiss}
            onClick={() => onDismiss(message.id)}
          />
        </div>
      </div>
    </li>
  )
}
