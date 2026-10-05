'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { ChatLineView } from '@/composites/academy/course/ChatFeed'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ChatLine, DemoStep, ReadBlock } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { COURSE_CHAT, COURSE_DEMO, DISCORD_MESSAGE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

type DemoData = Extract<ReadBlock, { kind: 'demo' }>

// Gestures the moderator toolbar offers
const GESTURES: { act: 'delete' | 'warn' | 'timeout' | 'ban'; icon: IconName }[] = [
  { act: 'delete', icon: 'remove' },
  { act: 'warn', icon: 'warning' },
  { act: 'timeout', icon: 'clock' },
  { act: 'ban', icon: 'blocked' },
]

/**
 * Tag a gesture leaves next to the viewer's name
 * @param {DemoStep} step - Step that played
 * @return {ReactNode} - Tag
 */

const tagOf = (step: DemoStep): ReactNode => {
  if (step.act === 'warn')
    return (
      <span className={cn(COURSE_DEMO.tag, COURSE_DEMO.tagWarn)}>{COURSE_COPY.demoTagWarn}</span>
    )
  if (step.act === 'timeout')
    return (
      <span className={cn(COURSE_DEMO.tag, COURSE_DEMO.tagTimeout)}>
        {COURSE_COPY.demoTagTimeout(step.detail ?? '')}
      </span>
    )
  if (step.act === 'ban')
    return <span className={cn(COURSE_DEMO.tag, COURSE_DEMO.tagBan)}>{COURSE_COPY.demoTagBan}</span>

  return null
}

/**
 * Guided tour of the moderator view: the chat, the toolbar and a coach who says what to do at each
 * step. A step lights the line it is about, plays the gesture on it and may drop a new line in
 * @param {Object} props - Block
 * @return {JSX.Element}
 */

export const DemoBlock = ({ block }: { block: DemoData }) => {
  // -1 is the scene before any step
  const [at, setAt] = useState(-1)
  const CoachIcon = ICONS.spark
  const isDiscord = block.surface === 'discord'
  const surface = block.surface === 'youtube' ? 'youtube' : 'twitch'

  const played = block.steps.slice(0, at + 1)
  const step = at >= 0 ? block.steps[at] : undefined
  const last = at === block.steps.length - 1

  // Lines on screen: the opening ones plus what each played step says
  const lines: { line: ChatLine; origin: number | null }[] = [
    ...block.lines.map((line, index) => ({ line, origin: index })),
    ...played.flatMap((played_, index) =>
      played_.say ? [{ line: played_.say, origin: -(index + 1) }] : []
    ),
  ]

  const markFor = (index: number) => {
    const deleted = played.some((entry) => entry.act === 'delete' && entry.target === index)
    const tags = played
      .filter((entry) => entry.target === index)
      .map((entry, order) => <span key={order}>{tagOf(entry)}</span>)

    return { deleted, focus: step?.target === index, tags }
  }

  return (
    <section className={COURSE_DEMO.wrap}>
      <header className={COURSE_DEMO.head}>
        <h3 className={COURSE_DEMO.title}>{block.title}</h3>
        {at >= 0 && (
          <span className={COURSE_DEMO.count}>
            {COURSE_COPY.demoStep(at + 1, block.steps.length)}
          </span>
        )}
      </header>

      <div className={COURSE_DEMO.stage}>
        <figure
          className={cn(
            COURSE_CHAT.panel,
            COURSE_DEMO.chat,
            block.surface === 'twitch' && COURSE_CHAT.twitch,
            block.surface === 'youtube' && COURSE_CHAT.youtube
          )}
        >
          {isDiscord ? (
            <div className={DISCORD_MESSAGE.frame}>
              {lines.map(({ line }, index) => (
                <DiscordMessage key={index} source={line.text} mentions={[]} author={line.author} />
              ))}
            </div>
          ) : (
            <div className={COURSE_CHAT.body}>
              {lines.map(({ line, origin }, index) => (
                <ChatLineView
                  key={`${index}-${line.author}`}
                  line={{ ...line, flagged: false }}
                  surface={surface}
                  arriving={origin !== null && origin < 0}
                  mark={origin !== null && origin >= 0 ? markFor(origin) : undefined}
                />
              ))}
            </div>
          )}
          {isDiscord && step?.act === 'command' && (
            <div className={cn(COURSE_CHAT.head, COURSE_DEMO.composer)}>
              <span key={at} className={COURSE_DEMO.composerText}>
                {step.detail}
              </span>
            </div>
          )}
        </figure>

        {!isDiscord && (
          <div className={cn(COURSE_DEMO.tools, surface === 'youtube' && COURSE_DEMO.toolsYoutube)}>
            <p className={COURSE_DEMO.toolsTitle}>{COURSE_COPY.demoActions}</p>
            {GESTURES.map((gesture) => {
              const Icon = ICONS[gesture.icon]
              const on = step?.act === gesture.act

              return (
                <span
                  key={gesture.act}
                  className={cn(
                    COURSE_DEMO.tool,
                    on ? COURSE_DEMO.toolOn : step && COURSE_DEMO.toolDim
                  )}
                >
                  <Icon className={COURSE_DEMO.toolIcon} aria-hidden="true" />
                  {COURSE_COPY.demoGesture[gesture.act]}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {step && (
        <div key={at} className={cn(COURSE_DEMO.coach, 'course-pop')} role="status">
          <span className={COURSE_DEMO.coachDisc}>
            <CoachIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <Markdown source={step.caption} />
          </span>
        </div>
      )}

      <div className={COURSE_DEMO.controls}>
        {at === -1 ? (
          <Button variant="primary" icon="flash" onClick={() => setAt(0)}>
            {COURSE_COPY.demoStart}
          </Button>
        ) : (
          <>
            <Button icon="back" disabled={at === 0} onClick={() => setAt(at - 1)}>
              {COURSE_COPY.demoPrev}
            </Button>
            {last ? (
              <Button icon="refresh" onClick={() => setAt(0)}>
                {COURSE_COPY.demoReplay}
              </Button>
            ) : (
              <Button variant="primary" icon="forward" onClick={() => setAt(at + 1)}>
                {COURSE_COPY.demoNext}
              </Button>
            )}
            <span className={COURSE_DEMO.dots} aria-hidden="true">
              {block.steps.map((_, index) => (
                <span
                  key={index}
                  className={cn(COURSE_DEMO.dot, index <= at && COURSE_DEMO.dotOn)}
                />
              ))}
            </span>
          </>
        )}
      </div>
    </section>
  )
}
