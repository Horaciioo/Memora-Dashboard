import Link from '@/components/elements/navigation/AppLink'

import { HOME_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { BOARD_TASK_KINDS, TASK_GROUPS } from '@/declarations/personal/groups'
import { cn } from '@/utils/classnames'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_TASKS } from '@/declarations/ui/variants'
import type { HomeEntry } from '@/types/personal'

export interface HomeTaskGroupsProps {
  entries: HomeEntry[]
  // Entries already treated, kept on the list struck through
  doneKeys: Set<string>
  // Opens the window walking one group
  onWalk: (group: string) => void
}

/**
 * One line per kind of task: "Tu as 3 absences à voir". A lone task leading only to a page
 * goes straight there, anything else opens a window to treat them in bulk
 * @param {HomeEntry[]} entries - Whole queue, treated ones included
 * @param {Set<string>} doneKeys - Treated entries
 * @param {(group: string) => void} onWalk - Opens one group
 * @return {JSX.Element}
 */

export const HomeTaskGroups = ({ entries, doneKeys, onWalk }: HomeTaskGroupsProps) => {
  const ChevronIcon = ICONS.next
  const CheckIcon = ICONS.picked
  const groups = Object.entries(Object.groupBy(entries, (entry) => entry.group))
  // Too many on the board: the rest is read there, on the tasks of the member
  const onBoard = entries.filter(
    (entry) =>
      !doneKeys.has(entry.key) && (BOARD_TASK_KINDS as readonly string[]).includes(entry.group)
  ).length

  return (
    <div className={HOME_TASKS.list}>
      {groups.map(([key, items = []]) => {
        const option = TASK_GROUPS[key]
        if (!option) return null

        const pending = items.filter((item) => !doneKeys.has(item.key))
        const isDone = pending.length === 0
        const Icon = isDone ? CheckIcon : ICONS[option.icon]
        const count = isDone ? items.length : pending.length
        const sentence = (count === 1 ? option.one : option.other).split('{n}')
        const direct =
          pending.length === 1 && pending[0]?.actions.length === 1 ? pending[0].actions[0] : null
        const href = direct?.href

        const body = (
          <>
            <Icon className={HOME_TASKS.glyph} aria-hidden="true" />
            <span className={HOME_TASKS.body}>
              <span className={cn(HOME_TASKS.sentence, isDone && HOME_TASKS.sentenceDone)}>
                {sentence[0]}
                <strong className={HOME_TASKS.number}>{count}</strong>
                {sentence[1]}
              </span>
            </span>
            {!isDone && <ChevronIcon className={HOME_TASKS.chevron} aria-hidden="true" />}
          </>
        )

        if (isDone) {
          return (
            <div key={key} className={HOME_TASKS.row}>
              {body}
            </div>
          )
        }

        return href ? (
          <Link key={key} href={href} className={HOME_TASKS.row}>
            {body}
          </Link>
        ) : (
          <button key={key} type="button" className={HOME_TASKS.row} onClick={() => onWalk(key)}>
            {body}
          </button>
        )
      })}
      {onBoard > HOME_SETTINGS.taskMax && (
        <Link href={`${ROUTES.tasks}?owner=me`} className={HOME_TASKS.row}>
          <span className={HOME_TASKS.body}>
            <span className={HOME_TASKS.sentence}>
              {PERSONAL_COPY.allTasks.replace('{n}', String(onBoard))}
            </span>
          </span>
          <ChevronIcon className={HOME_TASKS.chevron} aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
