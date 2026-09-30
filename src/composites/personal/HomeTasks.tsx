'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { Drawer } from '@/components/structures/Drawer'
import { Markdown } from '@/components/elements/display/Markdown'
import { Section } from '@/components/structures/Section'
import { HOME_SETTINGS } from '@/declarations/configurations/settings'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_STYLES, TASK_LIST } from '@/declarations/ui/variants'
import type { HomeTask } from '@/types/personal'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface HomeTasksProps {
  items: HomeTask[]
}

/**
 * Everything waiting on the member, each task opening its own walkthrough before leading to
 * the page where it gets done
 * @param {HomeTask[]} items - Tasks computed server-side
 * @return {JSX.Element}
 */

export const HomeTasks = ({ items }: HomeTasksProps) => {
  const [opened, setOpened] = useState<HomeTask | null>(null)
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? items : items.slice(0, HOME_SETTINGS.taskMax)
  const Chevron = ICONS.next

  return (
    <Section title={PERSONAL_TASK_COPY.title} bare>
      {items.length === 0 ? (
        <p className={HOME_STYLES.quiet}>{PERSONAL_TASK_COPY.empty}</p>
      ) : (
        <>
          <ul className={HOME_STYLES.rows}>
            {shown.map((task) => {
              const Icon = ICONS[task.icon]

              return (
                <li key={task.key}>
                  <button
                    type="button"
                    className={cn(HOME_STYLES.line, HOME_STYLES.lineLink)}
                    onClick={() => setOpened(task)}
                  >
                    <span className={HOME_STYLES.chip}>
                      <Icon className={HOME_STYLES.chipIcon} aria-hidden="true" />
                    </span>
                    <span className={TASK_LIST.body}>
                      <span className={TASK_LIST.title}>{task.title}</span>
                      <span className={TASK_LIST.meta}>
                        {[task.context, task.dueAt ? formatDay(task.dueAt) : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    <Chevron className={TASK_LIST.chevron} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
          {items.length > HOME_SETTINGS.taskMax && (
            <button
              type="button"
              className={HOME_STYLES.more}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? PERSONAL_TASK_COPY.showLess : PERSONAL_TASK_COPY.showAll}
            </button>
          )}
        </>
      )}

      {opened && (
        <Drawer
          open
          onClose={() => setOpened(null)}
          title={opened.title}
          icon={opened.icon}
          subheader={opened.context}
          footer={
            <Link href={opened.href}>
              <Button variant="primary" icon="forward">
                {opened.destinationLabel ? PERSONAL_TASK_COPY.go : PERSONAL_TASK_COPY.goPlain}
              </Button>
            </Link>
          }
        >
          <div className={TASK_LIST.drawer}>
            <DetailGrid
              entries={[
                { label: PERSONAL_TASK_COPY.what, value: opened.description },
                { label: PERSONAL_TASK_COPY.where, value: opened.destinationLabel },
                {
                  label: PERSONAL_TASK_COPY.due,
                  value: opened.dueAt ? formatDay(opened.dueAt) : undefined,
                },
              ]}
            />
            {opened.guide && (
              <div className="flex flex-col gap-2">
                <span className={TASK_LIST.group}>{PERSONAL_TASK_COPY.guideTitle}</span>
                <Markdown source={opened.guide} />
              </div>
            )}
          </div>
        </Drawer>
      )}
    </Section>
  )
}
