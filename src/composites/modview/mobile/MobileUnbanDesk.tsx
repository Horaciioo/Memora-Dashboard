'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { ChatText } from '@/composites/modview/ChatText'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_UNBAN_COPY as UNBAN_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import { MODVIEW_MOBILE, MODVIEW_UNBAN } from '@/declarations/ui/variants'
import type { ChatMessage, UnbanRequest } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/modview'

export interface MobileUnbanDeskProps {
  requests: UnbanRequest[]
  liveId: string | null
  messages: ChatMessage[]
  gate: GateCheck
  onAct: ActRunner
}

type Way = 'next' | 'previous'

// Time the old request takes to leave, matches the carousel duration
const TURN_MS = 750

interface StackProps {
  className: string
  current: UnbanRequest
  leaving: { request: UnbanRequest; way: Way } | null
  way: Way
  children: (request: UnbanRequest) => ReactNode
}

// The request in view and the one leaving, turning around the same cell
const Stack = ({ className, current, leaving, way, children }: StackProps) => (
  <div className={className}>
    {leaving && (
      <div
        key={leaving.request.id}
        className={cn(
          MODVIEW_MOBILE.unbanPane,
          MODVIEW_MOBILE.unbanLeaving,
          MODVIEW_MOBILE.unbanLeave[leaving.way]
        )}
        aria-hidden="true"
      >
        {children(leaving.request)}
      </div>
    )}
    <div
      key={current.id}
      className={cn(MODVIEW_MOBILE.unbanPane, leaving && MODVIEW_MOBILE.unbanEnter[way])}
    >
      {children(current)}
    </div>
  </div>
)

/**
 * Unban requests on a phone, in one column: names, the viewer's chat, the reason, the actions
 * @param {MobileUnbanDeskProps} props - Desk props
 * @return {JSX.Element}
 */

export const MobileUnbanDesk = ({ requests, messages, gate, onAct }: MobileUnbanDeskProps) => {
  const [picked, setPicked] = useState<string | null>(null)
  const [way, setWay] = useState<Way>('next')
  const [leaving, setLeaving] = useState<{ request: UnbanRequest; way: Way } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const PreviousIcon = ICONS.previous
  const NextIcon = ICONS.next

  useEffect(() => () => clearTimeout(timer.current), [])

  // The first request stands in until one is picked, or when the picked one is handled
  const request = requests.find((entry) => entry.id === picked) ?? requests[0] ?? null
  if (!request) return <p className={MODVIEW_UNBAN.empty}>{UNBAN_COPY.empty}</p>

  const at = requests.indexOf(request)
  // Everyone reads, the gate lets the Responsables and above decide
  const decision = gate({ kind: 'unbanRequest', requestId: request.id, approve: true })

  // The old request turns away while the new one comes
  const turn = (to: UnbanRequest | undefined, direction: Way) => {
    setWay(direction)
    setLeaving({ request, way: direction })
    setPicked(to?.id ?? null)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setLeaving(null), TURN_MS)
  }

  const decide = (approve: boolean) => {
    onAct({ kind: 'unbanRequest', requestId: request.id, approve })
    turn(
      requests.find((entry) => entry.id !== request.id),
      'next'
    )
  }

  const nameOf = (entry: UnbanRequest) => (
    <p className={MODVIEW_MOBILE.unbanName} aria-live="polite">
      <Avatar name={entry.author.name} size="sm" />
      <span className={MODVIEW_MOBILE.unbanNameText}>{entry.author.name}</span>
    </p>
  )

  const caseOf = (entry: UnbanRequest) => {
    const logs = messages.filter((message) => message.author.id === entry.author.id)

    return (
      <>
        <section
          className={MODVIEW_MOBILE.unbanChat}
          aria-label={COPY.unbanChat.replace('{name}', entry.author.name)}
        >
          {logs.length === 0 ? (
            <p className={MODVIEW_UNBAN.empty}>{UNBAN_COPY.logsEmpty}</p>
          ) : (
            <ul className={MODVIEW_UNBAN.log}>
              {logs.map((message) => (
                <li key={message.id} className={MODVIEW_UNBAN.logLine}>
                  <time className={MODVIEW_UNBAN.logTime} dateTime={message.sentAt}>
                    {formatClock(message.sentAt)}
                  </time>
                  <ChatText text={message.text} fragments={message.fragments} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className={MODVIEW_MOBILE.unbanReason}>{entry.text}</p>
      </>
    )
  }

  return (
    <div className={MODVIEW_MOBILE.unban}>
      <nav className={MODVIEW_MOBILE.unbanNav} aria-label={COPY.unbanWho}>
        <button
          type="button"
          className={MODVIEW_MOBILE.unbanArrow}
          aria-label={COPY.unbanPrevious}
          disabled={at <= 0}
          onClick={() => turn(requests[at - 1], 'previous')}
        >
          <PreviousIcon className={MODVIEW_MOBILE.unbanArrowIcon} aria-hidden="true" />
        </button>
        <Stack
          className={MODVIEW_MOBILE.unbanStackName}
          current={request}
          leaving={leaving}
          way={way}
        >
          {nameOf}
        </Stack>
        <button
          type="button"
          className={MODVIEW_MOBILE.unbanArrow}
          aria-label={COPY.unbanNext}
          disabled={at >= requests.length - 1}
          onClick={() => turn(requests[at + 1], 'next')}
        >
          <NextIcon className={MODVIEW_MOBILE.unbanArrowIcon} aria-hidden="true" />
        </button>
      </nav>

      <Stack
        className={MODVIEW_MOBILE.unbanStackBody}
        current={request}
        leaving={leaving}
        way={way}
      >
        {caseOf}
      </Stack>

      <div className={MODVIEW_MOBILE.unbanActions}>
        <Button
          variant="danger"
          disabled={!decision.allowed}
          title={decision.reason ?? undefined}
          onClick={() => decide(false)}
        >
          {UNBAN_COPY.reject}
        </Button>
        <Button
          variant="success"
          disabled={!decision.allowed}
          title={decision.reason ?? undefined}
          onClick={() => decide(true)}
        >
          {UNBAN_COPY.accept}
        </Button>
      </div>
    </div>
  )
}
