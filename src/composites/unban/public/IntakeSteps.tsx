import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { InlineMarkdown, Markdown } from '@/components/elements/display/Markdown'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { UNBAN_COPY, UNBAN_PUBLIC_COPY } from '@/declarations/unban/copy'
import { ONBOARDING_STYLES, UNBAN_PUBLIC_STYLES, UNBAN_SHELL_STYLES } from '@/declarations/ui/variants'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import type { UnbanIdentityView } from '@/types/unban'

export interface IntakeIntroProps {
  intro?: string
  identity: UnbanIdentityView | null
}

/**
 * First step, the words of the team and the account the request is filed with
 * @param {string} [intro] - Text of the form
 * @param {UnbanIdentityView | null} identity - Account proven by Discord
 * @return {JSX.Element}
 */

export const IntakeIntro = ({ intro, identity }: IntakeIntroProps) => (
  <div className={UNBAN_PUBLIC_STYLES.stack}>
    {intro && <Markdown source={intro} className={UNBAN_SHELL_STYLES.intro} />}
    {identity && (
      <div className={ONBOARDING_STYLES.identity}>
        <Avatar name={identity.name} src={identity.avatarUrl} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className={UNBAN_PUBLIC_STYLES.label}>{UNBAN_PUBLIC_COPY.signedAs}</span>
          <span className={ONBOARDING_STYLES.identityName}>{identity.name}</span>
          <span className={ONBOARDING_STYLES.identityHandle}>{identity.discordId}</span>
        </div>
      </div>
    )}
  </div>
)

/**
 * One section of the review
 * @typedef {Object} ReviewSection
 * @property {string} id - Step the section sends back to
 * @property {FieldDefinition[]} fields - Questions of the step
 */

export interface ReviewSection {
  id: string
  fields: FieldDefinition[]
}

export interface IntakeReviewProps {
  sections: ReviewSection[]
  values: FormValues
  outro?: string
  confirmed: boolean
  onConfirm: (confirmed: boolean) => void
  goTo: (id: string) => void
}

// Text an answer shows, none when left blank
const textOf = (field: FieldDefinition, value: FieldValue | undefined): string | null => {
  const labels = field.options
    ?.filter((option) => (Array.isArray(value) ? value : [value]).includes(option.value))
    .map((option) => option.label)
  if (labels) return labels.length > 0 ? labels.join(', ') : null

  return value === undefined || value === null || value === '' ? null : String(value)
}

/**
 * Last step, everything the person typed, a way back to each part, the confirmation
 * @param {IntakeReviewProps} props - Component props
 * @return {JSX.Element}
 */

export const IntakeReview = ({
  sections,
  values,
  outro,
  confirmed,
  onConfirm,
  goTo,
}: IntakeReviewProps) => (
  <div className={UNBAN_PUBLIC_STYLES.stack}>
    {sections.map((section) => (
      <section key={section.id} className={UNBAN_PUBLIC_STYLES.section}>
        <div className={UNBAN_PUBLIC_STYLES.sectionHead}>
          {section.fields.length > 0 && (
            <Button icon="edit" onClick={() => goTo(section.id)}>
              {UNBAN_PUBLIC_COPY.edit}
            </Button>
          )}
        </div>
        {section.fields.map((field) => {
          const text = textOf(field, values[field.name])

          return (
            <div key={field.name} className={UNBAN_PUBLIC_STYLES.answer}>
              <span className={UNBAN_PUBLIC_STYLES.label}>
                {field.rich ? <InlineMarkdown source={field.label} /> : field.label}
              </span>
              <p className={text ? UNBAN_PUBLIC_STYLES.answerText : UNBAN_PUBLIC_STYLES.empty}>
                {text ?? UNBAN_COPY.emptyAnswer}
              </p>
            </div>
          )
        })}
      </section>
    ))}
    {outro && <Markdown source={outro} className={ONBOARDING_STYLES.lead} />}
    <Toggle checked={confirmed} onChange={onConfirm} label={UNBAN_PUBLIC_COPY.confirm} />
  </div>
)
