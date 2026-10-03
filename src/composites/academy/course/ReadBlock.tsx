'use client'

import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { Markdown } from '@/components/elements/display/Markdown'
import { ChatFeed } from '@/composites/academy/course/ChatFeed'
import { DemoBlock } from '@/composites/academy/course/DemoBlock'
import { FocusBlock } from '@/composites/academy/course/FocusBlock'
import { LadderBlock } from '@/composites/academy/course/LadderBlock'
import { LiveconBlock } from '@/composites/academy/course/LiveconBlock'
import { TourBlock } from '@/composites/academy/course/TourBlock'
import {
  CompareBlock,
  DiagramBlock,
  KeyPointsBlock,
} from '@/composites/academy/course/FigureBlocks'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ReadBlock as ReadBlockData } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { COURSE_READ, DISCORD_MESSAGE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Look of each callout, its glyph and the colours of its box
const CALLOUTS: Record<
  Extract<ReadBlockData, { kind: 'callout' }>['tone'],
  { icon: IconName; box: string; text: string; label: string }
> = {
  tip: {
    icon: 'spark',
    box: 'border-[var(--color-info)] bg-[var(--color-info-soft)]',
    text: 'text-[var(--color-info)]',
    label: COURSE_COPY.tip,
  },
  warning: {
    icon: 'warning',
    box: 'border-[var(--color-caution)] bg-[var(--color-caution-soft)]',
    text: 'text-[var(--color-caution)]',
    label: COURSE_COPY.warning,
  },
  rule: {
    icon: 'shield',
    box: 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)]',
    text: 'text-[var(--color-brand-800)]',
    label: COURSE_COPY.rule,
  },
}

export interface ReadBlockProps {
  block: ReadBlockData
}

/**
 * A block of a chapter that is only read: text, callout, steps, and the chat or Discord
 * illustrations
 * @param {ReadBlockProps} props - Block
 * @return {JSX.Element}
 */

export const ReadBlock = ({ block }: ReadBlockProps) => {
  switch (block.kind) {
    case 'text':
      return (
        <div className={COURSE_READ.text}>
          <Markdown source={block.body} />
        </div>
      )

    case 'callout': {
      const look = CALLOUTS[block.tone]
      const Icon = ICONS[look.icon]

      return (
        <aside className={cn(COURSE_READ.callout, look.box)}>
          <Icon className={cn(COURSE_READ.calloutIcon, look.text)} aria-hidden="true" />
          <div className={COURSE_READ.calloutBody}>
            <p className={cn(COURSE_READ.calloutTitle, look.text)}>{block.title}</p>
            <Markdown source={block.body} />
          </div>
        </aside>
      )
    }

    case 'steps':
      return (
        <section className={COURSE_READ.steps}>
          <h3 className={COURSE_READ.stepsTitle}>{block.title}</h3>
          {block.steps.map((step, index) => (
            <div key={step.title} className={COURSE_READ.step}>
              {index < block.steps.length - 1 && (
                <span className={COURSE_READ.stepRail} aria-hidden="true" />
              )}
              <span className={COURSE_READ.stepNode}>{index + 1}</span>
              <div className={COURSE_READ.stepBody}>
                <p className={COURSE_READ.stepTitle}>{step.title}</p>
                <Markdown source={step.body} />
              </div>
            </div>
          ))}
        </section>
      )

    case 'chat':
      return (
        <div className={COURSE_READ.figure}>
          <ChatFeed
            surface={block.surface}
            lines={block.lines}
            caption={block.caption}
            replayable
          />
        </div>
      )

    case 'keypoints':
      return <KeyPointsBlock block={block} />

    case 'diagram':
      return <DiagramBlock block={block} />

    case 'compare':
      return <CompareBlock block={block} />

    case 'demo':
      return <DemoBlock block={block} />

    case 'tour':
      return <TourBlock block={block} />

    case 'focus':
      return <FocusBlock block={block} />

    case 'hierarchy':
      return <LadderBlock block={block} />

    case 'livecon':
      return <LiveconBlock block={block} />

    case 'discord':
      return (
        <figure className={COURSE_READ.figure}>
          <figcaption className={COURSE_READ.caption}>{block.caption}</figcaption>
          <div className={DISCORD_MESSAGE.frame}>
            <DiscordMessage source={block.message} mentions={[]} author={block.author} />
          </div>
        </figure>
      )
  }
}
