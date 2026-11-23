'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { MemoraBubble } from '@/composites/search/assistant/MemoraBubble'
import { useLiveAsks } from '@/core/hooks/data/lives/useLiveAsks'
import { varied } from '@/core/lib/assistant/variants'
import { useAssistantDock } from '@/core/store/assistantDock'
import type { DockFocus } from '@/core/store/assistantDock'
import { LIVE_VARIANTS } from '@/declarations/assistant/variants/live'
import { ROUTES } from '@/declarations/navigation'

/**
 * Memora asks in a bubble when a live needs the member, the arrow takes the talk to her page
 * @return {JSX.Element | null}
 */

export const LiveAskHost = () => {
  const router = useRouter()
  const { payload, seen, markSeen, reload } = useLiveAsks()
  const isChatOpen = useAssistantDock((state) => state.greeting !== null)

  const ask = payload.asks.find((entry) => !seen.includes(`ask:${entry.eventId}`))
  const news = payload.declared.find((entry) => !seen.includes(entry.key))

  // One wording per live
  const askedId = ask?.eventId
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const asked = useMemo(() => varied('live.bubbleAsk', LIVE_VARIANTS.bubbleAsk), [askedId])
  const declared = useMemo(
    () =>
      news
        ? varied('live.declared', LIVE_VARIANTS.declared, { name: news.name, title: news.title })
        : '',
    [news]
  )

  if (isChatOpen || (!ask && !news)) return null

  // Talk handed to the Memora Intelligence page, which continues it
  const enter = () => {
    const focus: DockFocus = ask
      ? {
          scenario: 'live',
          entry: 'ask',
          data: {
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
    if (ask) window.setTimeout(reload, 4000)
  }

  return <MemoraBubble text={ask ? asked : declared} onEnter={enter} />
}
