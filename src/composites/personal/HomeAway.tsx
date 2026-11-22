import Link from '@/components/elements/navigation/AppLink'

import { Section } from '@/components/structures/page/Section'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_PLAN } from '@/declarations/ui/variants'
import type { HomeAway as HomeAwayEntry } from '@/types/personal'

export interface HomeAwayProps {
  away: HomeAwayEntry[]
}

/**
 * Members absent today, each leading to the absences page
 * @param {HomeAwayEntry[]} away - Approved absences covering today
 * @return {JSX.Element}
 */

export const HomeAway = ({ away }: HomeAwayProps) => {
  const AbsenceIcon = ICONS.absences

  return (
    <Section title={PERSONAL_COPY.awayTitle} bare>
      {away.length === 0 ? (
        <p className={HOME_PLAN.empty}>{PERSONAL_COPY.awayEmpty}</p>
      ) : (
        <div className={HOME_PLAN.list}>
          {away.map((entry) => (
            <Link key={entry.accountId} href={ROUTES.absences} className={HOME_PLAN.row}>
              <AbsenceIcon className={HOME_PLAN.glyph} aria-hidden="true" />
              <span className={HOME_PLAN.birthdayName}>{entry.displayName}</span>
              <span className={HOME_PLAN.awayUntil}>
                {PERSONAL_COPY.awayUntil.replace(
                  '{day}',
                  new Date(entry.until).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'UTC',
                  })
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Section>
  )
}
