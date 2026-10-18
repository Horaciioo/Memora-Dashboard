import { DiscordMessage } from '@/components/elements/display/DiscordMessage'
import { mentionChoices } from '@/components/elements/forms/DiscordComposer'
import { DISCORD_MESSAGE } from '@/declarations/ui/variants'
import type { SessionUser } from '@/types/auth'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'

/**
 * Live Discord preview drawn beside an announcement form, signed by the picked author
 * @param {string} label - Pane title
 * @param {FieldDefinition[]} fields - Declarations of the announcement form
 * @param {SessionUser | null} session - Member writing, signs when no author is picked
 * @return {{ label: string, render: (values: FormValues) => JSX.Element }} - Aside of the form drawer
 */

export const announcementAside = (
  label: string,
  fields: FieldDefinition[],
  session: SessionUser | null
) => {
  const mentions = mentionChoices(
    fields.find((field) => field.kind === 'announcement')?.options ?? []
  )
  const authors = fields.find((field) => field.name === 'authorId')?.options ?? []

  return {
    label,
    render: (values: FormValues) => {
      const author = authors.find((option) => option.value === values.authorId)

      return (
        <div className={cn(DISCORD_MESSAGE.frame, DISCORD_MESSAGE.pane, 'overflow-y-auto')}>
          <DiscordMessage
            source={typeof values.body === 'string' ? values.body : ''}
            mentions={mentions}
            author={author?.label ?? session?.displayName ?? ''}
            avatarUrl={author ? author.image : session?.avatarUrl}
          />
        </div>
      )
    },
  }
}
