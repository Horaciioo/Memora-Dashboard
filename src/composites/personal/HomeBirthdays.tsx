import Link from 'next/link'

import { Section } from '@/components/structures/Section'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_PLAN } from '@/declarations/ui/variants'
import type { HomeBirthday } from '@/types/personal'
import { CalendarLayers } from '@/utils/constants/workflow'

export interface HomeBirthdaysProps {
  birthdays: HomeBirthday[]
}

/**
 * Coming birthdays one after the other, each leading to the calendar with only birthdays on
 * @param {HomeBirthday[]} birthdays - Coming birthdays
 * @return {JSX.Element}
 */

export const HomeBirthdays = ({ birthdays }: HomeBirthdaysProps) => {
  const CakeIcon = ICONS.birthday

  return (
    <Section title={PERSONAL_COPY.birthdaysTitle} bare>
      {birthdays.length === 0 ? (
        <p className={HOME_PLAN.empty}>{PERSONAL_COPY.birthdaysEmpty}</p>
      ) : (
        <div className={HOME_PLAN.list}>
          {birthdays.map((birthday) => (
            <Link
              key={`${birthday.accountId}:${birthday.day}`}
              href={ROUTES.calendarDay(
                birthday.day.slice(0, 10),
                CalendarLayers.Birthdays.toLowerCase()
              )}
              className={HOME_PLAN.row}
            >
              <CakeIcon className={HOME_PLAN.glyph} aria-hidden="true" />
              <span className={HOME_PLAN.birthdayDate}>
                {new Date(birthday.day).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <span className={HOME_PLAN.birthdayName}>{birthday.displayName}</span>
            </Link>
          ))}
        </div>
      )}
    </Section>
  )
}
