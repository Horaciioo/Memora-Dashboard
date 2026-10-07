'use client'

import type { ReactNode } from 'react'

import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { Markdown } from '@/components/elements/display/Markdown'
import { ChatFeed } from '@/composites/academy/course/ChatFeed'
import { DemoBlock } from '@/composites/academy/course/DemoBlock'
import { DiscordExampleBlock } from '@/composites/academy/course/DiscordExampleBlock'
import { FocusBlock } from '@/composites/academy/course/FocusBlock'
import { LadderBlock } from '@/composites/academy/course/LadderBlock'
import { LiveconBlock } from '@/composites/academy/course/LiveconBlock'
import { PanelStackBlock } from '@/composites/academy/course/PanelStackBlock'
import { PillarsBlock } from '@/composites/academy/course/PillarsBlock'
import { SeverityBlock } from '@/composites/academy/course/SeverityBlock'
import { OrgChart } from '@/composites/academy/course/OrgChart'
import { RolesBlock } from '@/composites/academy/course/RolesBlock'
import { RulesBlock } from '@/composites/academy/course/RulesBlock'
import { SanctionBox } from '@/composites/academy/course/SanctionBox'
import { SanctionCompare } from '@/composites/academy/course/SanctionCompare'
import { VoiceBlock } from '@/composites/academy/course/VoiceBlock'
import { TourBlock } from '@/composites/academy/course/TourBlock'
import {
  CompareBlock,
  DiagramBlock,
  KeyPointsBlock,
} from '@/composites/academy/course/FigureBlocks'
import type { ReadBlock as ReadBlockData } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import {
  COURSE_READ,
  COURSE_STRONG_TONES,
  DISCLOSURE,
  DISCORD_MESSAGE,
} from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Glyph and tint of each callout
const CALLOUTS: Record<
  Extract<ReadBlockData, { kind: 'callout' }>['tone'],
  { icon: IconName; text: string }
> = {
  tip: { icon: 'spark', text: 'text-[var(--color-info)]' },
  warning: { icon: 'warning', text: 'text-[var(--color-caution)]' },
  rule: { icon: 'shield', text: 'text-[var(--color-brand-800)]' },
}

export interface ReadBlockProps {
  block: ReadBlockData
  // What sits inside the panel of a titled text
  aside?: ReactNode
  // Smaller and darker, inside another panel
  isNested?: boolean
}

/**
 * A block of a chapter that is only read: text, callout, steps, and the chat or Discord
 * illustrations
 * @param {ReadBlockProps} props - Block, its note and whether it sits inside a panel
 * @return {JSX.Element}
 */

export const ReadBlock = ({ block, aside, isNested = false }: ReadBlockProps) => {
  switch (block.kind) {
    case 'text':
      return block.title ? (
        <section className={COURSE_READ.section}>
          <h2 className={COURSE_READ.heading}>{block.title}</h2>
          <div className={COURSE_READ.panel}>
            <Markdown
              source={block.body}
              className={cn(
                COURSE_READ.text,
                block.strongTone && COURSE_STRONG_TONES[block.strongTone]
              )}
            />
            {aside}
          </div>
        </section>
      ) : (
        <Markdown source={block.body} className={COURSE_READ.text} />
      )

    case 'callout': {
      const look = CALLOUTS[block.tone]
      const Icon = ICONS[look.icon]

      return (
        <aside className={cn(COURSE_READ.callout, isNested && COURSE_READ.calloutNested)}>
          <span className={cn(COURSE_READ.calloutChip, isNested && COURSE_READ.calloutChipNested)}>
            <Icon className={cn(COURSE_READ.calloutIcon, look.text)} aria-hidden="true" />
          </span>
          <div className={COURSE_READ.calloutBody}>
            <p className={COURSE_READ.calloutTitle}>{block.title}</p>
            <Markdown
              source={block.body}
              className={cn(COURSE_READ.calloutText, isNested && COURSE_READ.calloutTextNested)}
            />
          </div>
        </aside>
      )
    }

    case 'ask':
    case 'outline':
    case 'step':
      return null

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

    case 'voices':
      return <VoiceBlock block={block} />

    case 'tour':
      return <TourBlock block={block} />

    case 'focus':
      return <FocusBlock block={block} />

    case 'hierarchy':
      return <LadderBlock block={block} />

    case 'livecon':
      return <LiveconBlock block={block} />

    case 'sanctionBox':
      return <SanctionBox block={block} isNested={isNested} />

    case 'sanctionCompare':
      return <SanctionCompare block={block} isNested={isNested} />

    case 'orgChart':
      return <OrgChart block={block} isNested={isNested} />

    case 'panelStack':
      return <PanelStackBlock block={block} />

    case 'pillars':
      return <PillarsBlock block={block} />

    case 'severity':
      return <SeverityBlock block={block} />

    case 'roles':
      return <RolesBlock block={block} />

    case 'rules':
      return <RulesBlock block={block} />

    case 'discord':
      return (
        <figure className={COURSE_READ.figure}>
          <figcaption className={COURSE_READ.caption}>{block.caption}</figcaption>
          <div className={DISCORD_MESSAGE.frame}>
            <DiscordMessage source={block.message} mentions={[]} author={block.author} />
          </div>
        </figure>
      )

    case 'discordExample':
      return <DiscordExampleBlock block={block} />

    case 'disclosure': {
      const Chevron = ICONS.forward

      return (
        <details className={DISCLOSURE.root}>
          <summary className={DISCLOSURE.summary}>
            <Chevron className={DISCLOSURE.chevron} aria-hidden="true" />
            {block.title}
          </summary>
          <div className={DISCLOSURE.body}>
            {block.blocks.map((child) => (
              <ReadBlock key={child.key} block={child} />
            ))}
          </div>
        </details>
      )
    }
  }
}
