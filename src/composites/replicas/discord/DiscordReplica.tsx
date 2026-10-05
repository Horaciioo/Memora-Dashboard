'use client'

import {
  DiscordAvatar,
  DiscordReplicaMessage,
} from '@/composites/replicas/discord/DiscordReplicaMessage'
import { useTypewriter } from '@/core/hooks/interaction/useTypewriter'
import { DISCORD_REPLICA_COPY } from '@/declarations/replicas/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { DISCORD_REPLICA } from '@/declarations/ui/variants'
import type { DiscordChannel, DiscordReplicaState } from '@/types/replicas'
import { cn } from '@/utils/classnames'

export interface DiscordReplicaProps {
  state: DiscordReplicaState
  className?: string
}

// Glyph before each kind of channel
const CHANNEL_GLYPHS: Record<DiscordChannel['kind'], IconName> = {
  text: 'discordHash',
  announce: 'discordAnnounce',
  rules: 'discordRules',
}

// Tools of the channel header
const HEADER_TOOLS: IconName[] = ['discordThread', 'discordBell', 'discordPin', 'discordMembers']

// Tools at the end of the composer
const COMPOSER_TOOLS: IconName[] = ['discordGift', 'discordGif', 'discordSticker', 'discordEmoji']

/**
 * Typing line above the composer
 * @param {string[]} names - Who types
 * @return {string} - Sentence
 */

const typingLine = (names: string[]): string =>
  names.length === 1
    ? DISCORD_REPLICA_COPY.typingOne.replace('{name}', names[0] ?? '')
    : DISCORD_REPLICA_COPY.typingMany.replace('{names}', names.join(', '))

/**
 * Discord client replica: channels, the open channel, its members
 * @param {DiscordReplicaState} state - What to draw
 * @param {string} [className] - Extra frame class
 * @return {JSX.Element}
 */

export const DiscordReplica = ({ state, className }: DiscordReplicaProps) => {
  const draft = useTypewriter(state.draft)
  const byId = new Map(state.messages.map((message) => [message.id, message]))
  const Chevron = ICONS.discordChevron
  const Hash = ICONS.discordHash
  const Search = ICONS.discordSearch
  const Plus = ICONS.discordPlus

  return (
    <div className={cn(DISCORD_REPLICA.root, className)} aria-hidden="true">
      <aside className={DISCORD_REPLICA.sidebar}>
        <div className={DISCORD_REPLICA.server}>
          <span>{state.server}</span>
          <Chevron className={DISCORD_REPLICA.serverIcon} />
        </div>
        <div className={DISCORD_REPLICA.channelList}>
          {state.categories.map((category) => (
            <div key={category.name} className="contents">
              <p className={DISCORD_REPLICA.category}>
                <Chevron className={DISCORD_REPLICA.categoryIcon} />
                {category.name}
              </p>
              {category.channels.map((channel) => {
                const Glyph = ICONS[CHANNEL_GLYPHS[channel.kind]]
                const isOpen = channel.name === state.channel

                return (
                  <div
                    key={channel.name}
                    className={cn(
                      DISCORD_REPLICA.channel,
                      DISCORD_REPLICA.channelIn,
                      isOpen && DISCORD_REPLICA.channelActive,
                      channel.lit && DISCORD_REPLICA.channelLit
                    )}
                  >
                    <Glyph className={DISCORD_REPLICA.channelIcon} />
                    <span className={DISCORD_REPLICA.channelName}>{channel.name}</span>
                  </div>
                )
              })}
              {Array.from({ length: category.skeletons ?? 0 }, (_, index) => (
                <span
                  key={index}
                  className={DISCORD_REPLICA.channelSkeleton}
                  style={{ width: `${55 + ((index * 17) % 35)}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      </aside>

      <section className={DISCORD_REPLICA.main}>
        <header className={DISCORD_REPLICA.header}>
          <Hash className={DISCORD_REPLICA.headerHash} />
          <span className={DISCORD_REPLICA.headerName}>{state.channel ?? ''}</span>
          <div className={DISCORD_REPLICA.headerTools}>
            {HEADER_TOOLS.map((name) => {
              const Tool = ICONS[name]

              return <Tool key={name} className={DISCORD_REPLICA.headerTool} />
            })}
            <span className={DISCORD_REPLICA.headerSearch}>
              {DISCORD_REPLICA_COPY.search}
              <Search className={DISCORD_REPLICA.headerSearchIcon} />
            </span>
          </div>
        </header>

        {/* Keyed on the channel so a new ticket scrolls in */}
        <ol
          key={state.channel ?? ''}
          className={cn(DISCORD_REPLICA.scroller, DISCORD_REPLICA.scrollerIn)}
        >
          {state.messages.map((message) => (
            <DiscordReplicaMessage
              key={message.id}
              message={message}
              quoted={message.replyTo ? byId.get(message.replyTo) : undefined}
              roles={state.roles}
            />
          ))}
        </ol>

        <div className={DISCORD_REPLICA.typing}>
          {state.typing.length > 0 && (
            <>
              <span className={DISCORD_REPLICA.typingDots}>
                <span className={DISCORD_REPLICA.typingDot} />
                <span className={DISCORD_REPLICA.typingDot} />
                <span className={DISCORD_REPLICA.typingDot} />
              </span>
              <span>{typingLine(state.typing.map((author) => author.name))}</span>
            </>
          )}
        </div>
        <div className={DISCORD_REPLICA.composer}>
          <div className={DISCORD_REPLICA.composerBox}>
            <Plus className={DISCORD_REPLICA.composerIcon} />
            {state.draft ? (
              <span className={DISCORD_REPLICA.composerText}>
                {draft}
                <span className={DISCORD_REPLICA.composerCaret} />
              </span>
            ) : (
              <span className={DISCORD_REPLICA.composerPlaceholder}>
                {DISCORD_REPLICA_COPY.composer.replace('{channel}', state.channel ?? '')}
              </span>
            )}
            <span className={DISCORD_REPLICA.composerTools}>
              {COMPOSER_TOOLS.map((name) => {
                const Tool = ICONS[name]

                return <Tool key={name} className={DISCORD_REPLICA.composerIcon} />
              })}
            </span>
          </div>
        </div>
      </section>

      <aside className={DISCORD_REPLICA.members}>
        {state.memberGroups.map((group) => (
          <div key={group.role} className="contents">
            <p className={DISCORD_REPLICA.memberRole}>{group.role}</p>
            {group.members.map((member) => (
              <div key={member.id} className={DISCORD_REPLICA.member}>
                <span className="relative">
                  <DiscordAvatar author={member} className={DISCORD_REPLICA.memberAvatar} />
                  <span className={DISCORD_REPLICA.memberStatus} />
                </span>
                <span
                  className={DISCORD_REPLICA.memberName}
                  style={member.colour ? { color: member.colour } : undefined}
                >
                  {member.name}
                </span>
              </div>
            ))}
            {Array.from({ length: group.skeletons ?? 0 }, (_, index) => (
              <div key={index} className={DISCORD_REPLICA.memberSkeleton}>
                <span className={DISCORD_REPLICA.memberSkeletonAvatar} />
                <span
                  className={DISCORD_REPLICA.memberSkeletonName}
                  style={{ maxWidth: `${50 + ((index * 23) % 40)}%` }}
                />
              </div>
            ))}
          </div>
        ))}
      </aside>
    </div>
  )
}
