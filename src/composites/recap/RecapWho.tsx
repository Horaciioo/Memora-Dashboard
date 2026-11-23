import { Avatar } from '@/components/elements/display/Avatar'
import { Tip } from '@/components/elements/feedback/Tip'
import { RECAP_COPY } from '@/declarations/recap/copy'
import { RECAP_STYLES } from '@/declarations/ui/variants'
import type { RecapPerson } from '@/types/recap'

export interface RecapWhoProps {
  people: RecapPerson[]
}

/**
 * Who acted, every portrait, name on hover
 * @param {RecapPerson[]} people - Members shown
 * @return {JSX.Element}
 */

export const RecapWho = ({ people }: RecapWhoProps) => {
  if (people.length === 0) return <span className={RECAP_STYLES.whoName}>{RECAP_COPY.system}</span>

  return (
    <span className={RECAP_STYLES.who}>
      <span className={RECAP_STYLES.whoStack}>
        {people.map((person) => (
          <Tip key={person.id} label={person.name} floating className={RECAP_STYLES.whoTip}>
            <Avatar
              name={person.name}
              src={person.avatar}
              size="sm"
              title=""
              className={RECAP_STYLES.whoAvatar}
            />
          </Tip>
        ))}
      </span>
      <span className="sr-only">{people.map((person) => person.name).join(', ')}</span>
    </span>
  )
}
