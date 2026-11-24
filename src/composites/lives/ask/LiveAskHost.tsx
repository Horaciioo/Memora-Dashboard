'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { MemoraBubble } from '@/composites/search/assistant/MemoraBubble'
import { useLiveAsks } from '@/core/hooks/data/lives/useLiveAsks'
import { varied } from '@/core/lib/assistant/variants'
import { useAssistantDock } from '@/core/store/assistantDock'
import type { DockFocus } from '@/core/store/assistantDock'
import { LIVE_VARIANTS } from '@/declarations/assistant/variants/live'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ROUTES } from '@/declarations/navigation'

/**
 * Memora asks in a bubble when a live needs the member, the arrow grows it over the page, then the talk goes on her page
 * @return {JSX.Element | null}
 */

export const LiveAskHost = () => {
  const router = useRouter()
  const { payload, seen, markSeen, reload } = useLiveAsks()
  const isChatOpen = useAssistantDock((state) => state.greeting !== null)
  // Memora Intelligence is where the talk goes on, no bubble over it
  const isIntelligence = usePathname() === ROUTES.intelligence
  // Sent away by the cross: gone for this visit, the answer still waits in the recap
  const [sentAway, setSentAway] = useState<string[]>([])
  const gone = (key: string) => seen.includes(key) || sentAway.includes(key)

  const ask = payload.asks.find((entry) => !gone(`ask:${entry.eventId}`))
  const news = payload.declared.find((entry) => !gone(entry.key))

  // One wording per live
  const askedId = ask?.eventId
  const asked = useMemo(
    () =>
      ask
        ? varied(
            ask.liveId ? 'live.bubbleAsk' : 'live.bubbleEvent',
            ask.liveId ? LIVE_VARIANTS.bubbleAsk : LIVE_VARIANTS.bubbleEvent,
            { title: ask.title }
          )
        : '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [askedId]
  )
  const declared = useMemo(
    () =>
      news
        ? varied('live.declared', LIVE_VARIANTS.declared, { name: news.name, title: news.title })
        : '',
    [news]
  )

  if (isChatOpen || isIntelligence || (!ask && !news)) return null

  // Talk handed to the Memora Intelligence page, which continues it
  const enter = () => {
    const focus: DockFocus = ask
      ? {
          scenario: 'live',
          entry: 'ask',
          data: {
            question: asked,
            eventId: ask.eventId,
            liveId: ask.liveId,
            title: ask.title,
            creator: ask.creator,
            startsAt: ask.startsAt,
            endsAt: ask.endsAt ?? '',
          },
        }
      : {
          scenario: 'live',
          entry: 'roster',
          data: {
            eventId: news?.eventId ?? '',
            liveId: news?.liveId ?? '',
            title: news?.title ?? '',
          },
        }

    markSeen(ask ? `ask:${ask.eventId}` : (news?.key ?? ''))
    useAssistantDock.getState().carry(focus)
    router.push(ROUTES.intelligence)
    // The answer is read again so the bubble goes away
    if (ask) window.setTimeout(reload, ASSISTANT_SETTINGS.bubbleReloadMs)
  }

  const dismiss = () => {
    const key = ask ? `ask:${ask.eventId}` : (news?.key ?? '')
    // A news is read once, a question can come back on the next visit
    if (ask) setSentAway((keys) => [...keys, key])
    else markSeen(key)
  }

  return (
    <MemoraBubble
      key={ask?.eventId ?? news?.key}
      text={ask ? asked : declared}
      onEnter={enter}
      onDismiss={dismiss}
    />
  )
}
