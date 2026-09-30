import { Avatar } from '@/components/elements/display/Avatar'
import { Section } from '@/components/structures/Section'
import { DayStamp } from '@/composites/personal/DayStamp'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_STYLES } from '@/declarations/ui/variants'
import type { HomeBirthday } from '@/types/personal'
import { cn } from '@/utils/classnames'
import { formatRelativeDay } from '@/utils/format/dates'
import { isSameDay, parseDay } from '@/utils/format/days'

export interface HomeBirthdaysProps {
  items: HomeBirthday[]
}

/**
 * Coming birthdays, only the ones their owner agreed to celebrate
 * @param {HomeBirthday[]} items - Coming birthdays, soonest first
 * @return {JSX.Element}
 */

export const HomeBirthdays = ({ items }: HomeBirthdaysProps) => {
  const Cake = ICONS.birthday
  const today = new Date()

  return (
    <Section title={PERSONAL_COPY.birthdaysTitle}>
      {items.length === 0 ? (
        <p className={HOME_STYLES.empty}>{PERSONAL_COPY.birthdaysEmpty}</p>
      ) : (
        <ul className={HOME_STYLES.list}>
          {items.map((item) => {
            const isToday = isSameDay(parseDay(item.day), today)

            return (
              <li
                key={`${item.accountId}:${item.day}`}
                className={cn(HOME_STYLES.row, isToday && HOME_STYLES.rowToday)}
              >
                <DayStamp date={item.day} />
                <Avatar name={item.displayName} src={item.avatarUrl} size="sm" />
                <span className={HOME_STYLES.rowBody}>
                  <span className={HOME_STYLES.rowTitle}>{item.displayName}</span>
                  <span className={HOME_STYLES.rowMeta}>
                    {isToday ? PERSONAL_COPY.birthdayToday : formatRelativeDay(item.day)}
                  </span>
                </span>
                {isToday && <Cake className={HOME_STYLES.markerIcon} aria-hidden="true" />}
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
