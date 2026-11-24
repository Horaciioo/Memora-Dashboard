'use client'

import { ASSISTANT_STYLES } from '@/declarations/ui/variants'
import type { ScenarioGroup } from '@/types/scenario'
import { cn } from '@/utils/classnames'

export interface PeopleGroupsProps {
  groups: ScenarioGroup[]
}

/**
 * People Memora lists, one coloured title per answer they gave
 * @param {ScenarioGroup[]} groups - Groups listed
 * @return {JSX.Element}
 */

export const PeopleGroups = ({ groups }: PeopleGroupsProps) => (
  <div className={ASSISTANT_STYLES.groups}>
    {groups.map((group) => (
      <section key={group.title} className={ASSISTANT_STYLES.group}>
        <h4 className={cn(ASSISTANT_STYLES.groupTitle, ASSISTANT_STYLES.groupTones[group.tone])}>
          {group.title}
        </h4>
        <ul className={ASSISTANT_STYLES.groupItems}>
          {group.items.map((item) => (
            <li key={item} className={ASSISTANT_STYLES.groupItem}>
              {item}
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
)
