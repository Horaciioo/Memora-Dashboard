import { DiscordInline } from '@/composites/replicas/discord/DiscordInline'
import { DISCORD_REPLICA_COPY } from '@/declarations/replicas/copy'
import { ICONS } from '@/declarations/ui/icons'
import { DISCORD_REPLICA } from '@/declarations/ui/variants'
import type { DiscordAuthor, DiscordReplicaMessage as Message } from '@/types/replicas'
import { cn } from '@/utils/classnames'

export interface DiscordReplicaMessageProps {
  message: Message
  quoted: Message | undefined
  roles: Record<string, { name: string; colour: string }>
}

/**
 * Round portrait, a glyph or the initial
 * @param {Object} props - Avatar props
 * @param {DiscordAuthor} props.author - Who
 * @param {string} props.className - Frame class
 * @return {JSX.Element}
 */

export const DiscordAvatar = ({
  author,
  className,
}: {
  author: DiscordAuthor
  className: string
}) => {
  const Glyph = author.glyph ? ICONS[author.glyph] : null

  return (
    <span
      className={className}
      style={author.colour && !Glyph ? { backgroundColor: author.colour } : undefined}
      aria-hidden="true"
    >
      {Glyph ? (
        <Glyph className={DISCORD_REPLICA.avatarGlyph} />
      ) : (
        author.name.slice(0, 1).toUpperCase()
      )}
    </span>
  )
}

/**
 * One message of the Discord replica
 * @param {Message} message - Message
 * @param {Message | undefined} quoted - Message it answers
 * @param {Record<string, { name: string, colour: string }>} roles - Known roles
 * @return {JSX.Element}
 */

export const DiscordReplicaMessage = ({ message, quoted, roles }: DiscordReplicaMessageProps) => {
  const { author } = message

  return (
    <li>
      {quoted && (
        <div className={DISCORD_REPLICA.reply}>
          <span className={DISCORD_REPLICA.replyArm} aria-hidden="true" />
          <span className={DISCORD_REPLICA.replyAvatar} aria-hidden="true" />
          <span
            className={DISCORD_REPLICA.replyName}
            style={quoted.author.colour ? { color: quoted.author.colour } : undefined}
          >
            {`@${quoted.author.name}`}
          </span>
          <span className={DISCORD_REPLICA.replyText}>
            {quoted.content ?? quoted.embeds?.[0]?.title ?? ''}
          </span>
        </div>
      )}
      <article className={DISCORD_REPLICA.message}>
        <DiscordAvatar author={author} className={DISCORD_REPLICA.avatar} />
        <div className={DISCORD_REPLICA.body}>
          <header className={DISCORD_REPLICA.head}>
            <span
              className={DISCORD_REPLICA.author}
              style={author.colour ? { color: author.colour } : undefined}
            >
              {author.name}
            </span>
            {author.isApp && (
              <span className={DISCORD_REPLICA.appBadge}>{DISCORD_REPLICA_COPY.appBadge}</span>
            )}
            <time className={DISCORD_REPLICA.time}>
              {DISCORD_REPLICA_COPY.today.replace('{time}', message.time)}
            </time>
          </header>

          {message.content && (
            <p className={DISCORD_REPLICA.content}>
              <DiscordInline source={message.content} roles={roles} />
            </p>
          )}

          {message.embeds?.map((embed, index) => {
            const Thumb = embed.thumbnail ? ICONS[embed.thumbnail] : null

            return (
              <div
                key={index}
                className={DISCORD_REPLICA.embed}
                style={{ borderLeftColor: embed.accent ?? 'var(--discord-quote)' }}
              >
                {embed.banner && <div className={DISCORD_REPLICA.embedBanner} />}
                {(embed.title || embed.description) && (
                  <div className={DISCORD_REPLICA.embedText}>
                    {embed.title && <p className={DISCORD_REPLICA.embedTitle}>{embed.title}</p>}
                    {embed.description && (
                      <p className={DISCORD_REPLICA.embedDescription}>
                        <DiscordInline source={embed.description} roles={roles} />
                      </p>
                    )}
                  </div>
                )}
                {Thumb && <Thumb className={DISCORD_REPLICA.embedThumb} />}
                {embed.footer && <p className={DISCORD_REPLICA.embedFooter}>{embed.footer}</p>}
              </div>
            )
          })}

          {message.buttons && (
            <div className={DISCORD_REPLICA.buttons}>
              {message.buttons.map((button) => {
                const Glyph = button.glyph ? ICONS[button.glyph] : null

                return (
                  <span
                    key={button.label}
                    className={cn(
                      DISCORD_REPLICA.button,
                      DISCORD_REPLICA.buttonStyle[button.style]
                    )}
                  >
                    {Glyph && <Glyph className={DISCORD_REPLICA.buttonIcon} aria-hidden="true" />}
                    {button.label}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </article>
    </li>
  )
}
