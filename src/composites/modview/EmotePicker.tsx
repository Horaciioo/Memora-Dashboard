'use client'

import { useMemo, useState } from 'react'

import { EmojiDialog } from '@/components/elements/forms/pickers/EmojiDialog'
import { Button } from '@/components/elements/actions/Button'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_CHAT } from '@/declarations/ui/variants'
import type { LiveEmotes, TwitchEmote } from '@/types/modview'
import { foldText } from '@/utils/format/strings'
import { cn } from '@/utils/classnames'
import { twitchEmoteUrl } from '@/utils/format/emotes'

export interface EmotePickerProps {
  // Null while loading or when Twitch is out of reach
  emotes: LiveEmotes | null
  // Word or glyph to put in the line
  onPick: (text: string) => void
}

/**
 * Panel of Twitch emotes and emojis above the chat box
 * @param {LiveEmotes | null} emotes - Emotes of Twitch and of the channel
 * @param {(text: string) => void} onPick - Choice handler
 * @return {JSX.Element}
 */

/**
 * Why a member cannot use an emote
 * @param {TwitchEmote} emote - Locked emote
 * @return {string} - Reason
 */

const lockReason = (emote: TwitchEmote): string =>
  emote.kind === 'bitstier'
    ? MODVIEW_COPY.emoteLockedBits
    : emote.kind === 'follower'
      ? MODVIEW_COPY.emoteLockedFollower
      : MODVIEW_COPY.emoteLockedSub

export const EmotePicker = ({ emotes, onPick }: EmotePickerProps) => {
  const [query, setQuery] = useState('')
  const [isEmojiOpen, setEmojiOpen] = useState(false)
  const needle = foldText(query)

  const sections = useMemo(
    () =>
      [
        { title: MODVIEW_COPY.emotesChannel, list: emotes?.channel ?? [] },
        { title: MODVIEW_COPY.emotesGlobal, list: emotes?.global ?? [] },
      ]
        .map((section) => ({
          ...section,
          list: section.list.filter((emote) => !needle || foldText(emote.name).includes(needle)),
        }))
        .filter((section) => section.list.length > 0),
    [emotes, needle]
  )

  const cell = (emote: TwitchEmote) => (
    <button
      key={emote.id}
      type="button"
      className={cn(MODVIEW_CHAT.emoteCell, emote.isLocked && MODVIEW_CHAT.emoteLocked)}
      disabled={emote.isLocked}
      title={emote.isLocked ? `${emote.name} - ${lockReason(emote)}` : emote.name}
      aria-label={emote.name}
      // The box keeps focus
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onPick(`${emote.name} `)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={twitchEmoteUrl(emote.id, emote.animated)}
        srcSet={`${twitchEmoteUrl(emote.id, emote.animated)} 1x, ${twitchEmoteUrl(emote.id, emote.animated, '2.0')} 2x`}
        alt={emote.name}
        loading="lazy"
        className={MODVIEW_CHAT.emoteImage}
      />
    </button>
  )

  return (
    <div className={MODVIEW_CHAT.emotePanel} role="dialog" aria-label={MODVIEW_COPY.emotes}>
      <div className={MODVIEW_CHAT.emoteHead}>
        <input
          autoFocus
          className={MODVIEW_CHAT.emoteSearch}
          placeholder={MODVIEW_COPY.emotesSearch}
          aria-label={MODVIEW_COPY.emotesSearch}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button variant="ghost" icon="emoji" onClick={() => setEmojiOpen(true)}>
          {MODVIEW_COPY.emojis}
        </Button>
      </div>

      <div className={MODVIEW_CHAT.emoteScroll}>
        {emotes && !emotes.isVerified && emotes.channel.length > 0 && (
          <p className={MODVIEW_CHAT.emoteNote}>{MODVIEW_COPY.emotesUnverified}</p>
        )}
        {emotes === null && (
          <p className={MODVIEW_CHAT.emoteNote}>{MODVIEW_COPY.emotesUnavailable}</p>
        )}
        {emotes !== null && sections.length === 0 && (
          <p className={MODVIEW_CHAT.emoteNote}>{MODVIEW_COPY.emotesNone}</p>
        )}
        {sections.map((section) => (
          <section key={section.title}>
            <h4 className={MODVIEW_CHAT.emoteTitle}>{section.title}</h4>
            <div className={MODVIEW_CHAT.emoteGrid}>{section.list.map(cell)}</div>
          </section>
        ))}
      </div>

      <EmojiDialog
        open={isEmojiOpen}
        value=""
        onSelect={(glyph) => {
          if (glyph) onPick(glyph)
          setEmojiOpen(false)
        }}
        onClose={() => setEmojiOpen(false)}
      />
    </div>
  )
}
