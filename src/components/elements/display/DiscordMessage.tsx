'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { WORK_DISCORD_COPY } from '@/declarations/work/copy'
import { DISCORD_MESSAGE } from '@/declarations/ui/variants'
import type { MentionEntry } from '@/utils/format/discord'
import { parseMessage } from '@/utils/format/discord'
import type { DiscordBlock, DiscordInline } from '@/utils/format/discord'
import { cn } from '@/utils/classnames'

export interface DiscordMessageProps {
  source: string
  mentions: MentionEntry[]
  author: string
  avatarUrl?: string | null
  time?: string
}

/**
 * Spoiler hidden until clicked, the way Discord shows it
 * @param {Object} props - Hidden runs
 * @return {JSX.Element}
 */

const Spoiler = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={WORK_DISCORD_COPY.spoiler}
      className={open ? DISCORD_MESSAGE.spoilerOpen : DISCORD_MESSAGE.spoiler}
      onClick={() => setOpen(true)}
      onKeyDown={(event) => event.key === 'Enter' && setOpen(true)}
    >
      {children}
    </span>
  )
}

/**
 * Discord message rendered exactly as the client draws it: markdown, pill mentions, spoilers
 * @param {string} source - Message markdown, mention tokens included
 * @param {MentionEntry[]} mentions - Known mentions, token to name
 * @param {string} author - Name above the message
 * @param {string | null} [avatarUrl] - Portrait beside it
 * @param {string} [time] - Stamp beside the name
 * @return {JSX.Element}
 */

export const DiscordMessage = ({
  source,
  mentions,
  author,
  avatarUrl,
  time,
}: DiscordMessageProps) => {
  const names = new Map(mentions.map((entry) => [entry.token, entry.display]))

  // Name a token, an unknown one reading as Discord shows it
  const nameOf = (run: Extract<DiscordInline, { type: 'mention' }>): string => {
    if (run.kind === 'broadcast') return run.token
    const known = names.get(run.token.replace('<@!', '<@'))
    if (known) return known
    if (run.kind === 'channel') return `#${WORK_DISCORD_COPY.unknownChannel}`

    return `@${run.kind === 'role' ? WORK_DISCORD_COPY.unknownRole : WORK_DISCORD_COPY.unknownUser}`
  }

  const inline = (runs: DiscordInline[]): ReactNode =>
    runs.map((run, index) => {
      switch (run.type) {
        case 'text':
          return run.text
        case 'code':
          return (
            <code key={index} className={DISCORD_MESSAGE.code}>
              {run.text}
            </code>
          )
        case 'link':
          return (
            <a
              key={index}
              href={run.href}
              target="_blank"
              rel="noreferrer noopener"
              className={DISCORD_MESSAGE.link}
            >
              {run.text}
            </a>
          )
        case 'mention':
          return (
            <span key={index} className={DISCORD_MESSAGE.mention}>
              {nameOf(run)}
            </span>
          )
        case 'bold':
          return <strong key={index}>{inline(run.children)}</strong>
        case 'italic':
          return <em key={index}>{inline(run.children)}</em>
        case 'underline':
          return <u key={index}>{inline(run.children)}</u>
        case 'strike':
          return <s key={index}>{inline(run.children)}</s>
        case 'spoiler':
          return <Spoiler key={index}>{inline(run.children)}</Spoiler>
      }
    })

  const block = (entry: DiscordBlock, index: number): ReactNode => {
    switch (entry.type) {
      case 'blank':
        return <span key={index} className={DISCORD_MESSAGE.blank} />
      case 'line':
        return <span key={index}>{inline(entry.children)}</span>
      case 'heading':
        return (
          <span key={index} className={DISCORD_MESSAGE[`h${entry.level}`]}>
            {inline(entry.children)}
          </span>
        )
      case 'subtext':
        return (
          <span key={index} className={DISCORD_MESSAGE.subtext}>
            {inline(entry.children)}
          </span>
        )
      case 'quote':
        return (
          <div key={index} className={DISCORD_MESSAGE.quote}>
            <div className="flex min-w-0 flex-col">{entry.blocks.map(block)}</div>
          </div>
        )
      case 'list': {
        const Tag = entry.ordered ? 'ol' : 'ul'

        return (
          <Tag
            key={index}
            className={entry.ordered ? DISCORD_MESSAGE.ordered : DISCORD_MESSAGE.list}
          >
            {entry.items.map((item, at) => (
              <li key={at}>{inline(item)}</li>
            ))}
          </Tag>
        )
      }
      case 'codeBlock':
        return (
          <pre key={index} className={DISCORD_MESSAGE.codeBlock}>
            {entry.text}
          </pre>
        )
    }
  }

  return (
    <div className={DISCORD_MESSAGE.message}>
      <Avatar name={author} src={avatarUrl} size="md" className={cn(DISCORD_MESSAGE.avatar)} />
      <div className={DISCORD_MESSAGE.body}>
        <span className={DISCORD_MESSAGE.head}>
          <span className={DISCORD_MESSAGE.author}>{author}</span>
          <span className={DISCORD_MESSAGE.time}>{time ?? WORK_DISCORD_COPY.today}</span>
        </span>
        <div className={DISCORD_MESSAGE.content}>{parseMessage(source).map(block)}</div>
      </div>
    </div>
  )
}
