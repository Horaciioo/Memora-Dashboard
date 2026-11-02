import { ShowcaseReveal } from '@/composites/changelog/showcase/ShowcaseReveal'
import { SHOWCASE_COPY, SHOWCASE_STEPS } from '@/declarations/changelog/showcase'
import { PAGE_SHARE_COPY } from '@/declarations/pages/copy'
import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcaseShareProps {
  step: number
}

// Delay between two people
const PERSON_DELAY_MS = 220

/**
 * The share card, people joining one by one
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcaseShare = ({ step }: ShowcaseShareProps) => (
  <ShowcaseReveal isOn={step >= SHOWCASE_STEPS.share} className={SHOWCASE.share}>
    <p className={SHOWCASE.shareTitle}>{PAGE_SHARE_COPY.title}</p>
    <p className={SHOWCASE.shareInput}>{PAGE_SHARE_COPY.invitePlaceholder}</p>
    {SHOWCASE_COPY.people.map((person, index) => (
      <ShowcaseReveal
        key={person.name}
        isOn={step >= SHOWCASE_STEPS.people}
        delayMs={index * PERSON_DELAY_MS}
        className={SHOWCASE.person}
      >
        <span className={cn(SHOWCASE.avatar, SHOWCASE.avatarTones[index])}>{person.name[0]}</span>
        {person.name}
        <span className={SHOWCASE.personLevel}>{person.level}</span>
      </ShowcaseReveal>
    ))}
  </ShowcaseReveal>
)
