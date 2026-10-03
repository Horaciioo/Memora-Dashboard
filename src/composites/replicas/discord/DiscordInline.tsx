import { Fragment } from 'react'

import { DISCORD_REPLICA } from '@/declarations/ui/variants'

export interface DiscordInlineProps {
  source: string
  roles: Record<string, { name: string; colour: string }>
}

// Bold runs and role mentions
const TOKEN = /(\*\*[^*]+\*\*|<@&[\w-]+>)/g

/**
 * Discord inline markdown: bold and role mentions
 * @param {string} source - Message text
 * @param {Record<string, { name: string, colour: string }>} roles - Known roles
 * @return {JSX.Element}
 */

export const DiscordInline = ({ source, roles }: DiscordInlineProps) => (
  <>
    {source.split(TOKEN).map((part, index) => {
      // Bold run
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className={DISCORD_REPLICA.strong}>
            {part.slice(2, -2)}
          </strong>
        )
      }

      // Role mention, tinted by the role
      const role = part.startsWith('<@&') ? roles[part.slice(3, -1)] : undefined
      if (role) {
        return (
          <span
            key={index}
            className={DISCORD_REPLICA.mention}
            style={{
              color: role.colour,
              backgroundColor: `color-mix(in oklab, ${role.colour} 18%, transparent)`,
            }}
          >
            {`@${role.name}`}
          </span>
        )
      }

      return <Fragment key={index}>{part}</Fragment>
    })}
  </>
)
