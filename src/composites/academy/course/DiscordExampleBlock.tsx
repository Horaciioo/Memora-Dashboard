import { DiscordInline } from '@/composites/replicas/discord/DiscordInline'
import { DiscordAvatar } from '@/composites/replicas/discord/DiscordReplicaMessage'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { DISCORD_REPLICA_COPY } from '@/declarations/replicas/copy'
import { ICONS } from '@/declarations/ui/icons'
import { DISCORD_EXAMPLE, DISCORD_REPLICA } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface DiscordExampleBlockProps {
  block: Extract<ReadBlock, { kind: 'discordExample' }>
}

// Look of each verdict
const VERDICTS = {
  good: { frame: DISCORD_EXAMPLE.frameGood, label: COURSE_COPY.exampleGood, icon: 'success' },
  bad: { frame: DISCORD_EXAMPLE.frameBad, label: COURSE_COPY.exampleBad, icon: 'failure' },
  neutral: { frame: DISCORD_EXAMPLE.frameNeutral, label: null, icon: null },
} as const

/**
 * Example sentences drawn as Discord messages
 * @param {DiscordExampleBlockProps} props - Block
 * @return {JSX.Element}
 */

export const DiscordExampleBlock = ({ block }: DiscordExampleBlockProps) => {
  const verdict = VERDICTS[block.verdict]
  const Icon = verdict.icon ? ICONS[verdict.icon] : null
  const caption = block.caption ?? verdict.label

  return (
    <figure className={DISCORD_EXAMPLE.figure}>
      {caption && (
        <figcaption className={DISCORD_EXAMPLE.caption}>
          {Icon && <Icon className={DISCORD_EXAMPLE.captionIcon} aria-hidden="true" />}
          {caption}
        </figcaption>
      )}
      <ol className={cn(DISCORD_EXAMPLE.frame, verdict.frame)}>
        {block.lines.map((line, index) => (
          <li key={index} className={DISCORD_REPLICA.message}>
            <DiscordAvatar author={line.author} className={DISCORD_REPLICA.avatar} />
            <div className={DISCORD_REPLICA.body}>
              <p className={DISCORD_REPLICA.head}>
                <span
                  className={DISCORD_REPLICA.author}
                  style={line.author.colour ? { color: line.author.colour } : undefined}
                >
                  {line.author.name}
                </span>
                <span className={DISCORD_REPLICA.time}>
                  {DISCORD_REPLICA_COPY.today.replace('{time}', DISCORD_REPLICA_COPY.exampleTime)}
                </span>
              </p>
              <p className={DISCORD_REPLICA.content}>
                <DiscordInline source={line.text} roles={{}} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  )
}
