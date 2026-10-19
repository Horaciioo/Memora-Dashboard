import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { TASK_STEPPER } from '@/declarations/ui/variants'

export interface HomeFact {
  icon: IconName
  text: string
}

export interface HomeFactsProps {
  title: string
  facts: HomeFact[]
}

/**
 * Titled list of facts, one glyph dot each, read from the left
 * @param {string} title - Heading of the list
 * @param {HomeFact[]} facts - Glyph and text of each line
 * @return {JSX.Element}
 */

export const HomeFacts = ({ title, facts }: HomeFactsProps) => (
  <section className={TASK_STEPPER.infosGroup}>
    <h3 className={TASK_STEPPER.infos}>{title}</h3>
    <ul className={TASK_STEPPER.facts}>
      {facts.map((fact) => {
        const Glyph = ICONS[fact.icon]

        return (
          <li key={fact.text} className={TASK_STEPPER.fact}>
            <Glyph className={TASK_STEPPER.factGlyph} aria-hidden="true" />
            {fact.text}
          </li>
        )
      })}
    </ul>
  </section>
)
