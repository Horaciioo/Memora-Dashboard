import { Markdown } from '@/components/elements/display/Markdown'
import { HomeFacts } from '@/composites/personal/HomeFacts'
import { DetailGrid } from '@/components/structures/data/DetailGrid'
import { PERSONAL_COPY, PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import { CONTEXT_SEPARATOR, PIM_FACT_ICONS, TASK_GROUPS } from '@/declarations/personal/groups'
import { DEPARTURE_TASK, TASK_LIST } from '@/declarations/ui/variants'
import type { HomeTask } from '@/types/personal'
import { formatDay } from '@/utils/format/dates'

/**
 * Reading of one task
 * @param {Object} props - Task
 * @param {HomeTask} props.task - Task computed server-side
 * @return {JSX.Element}
 */

export const HomeTaskDetail = ({ task }: { task: HomeTask }) => {
  // A PIM step reads as its facts, with glyph dots
  if (TASK_GROUPS[task.kind]?.pim) {
    const parts = task.context.split(CONTEXT_SEPARATOR).filter(Boolean)

    return (
      <div className={TASK_LIST.drawer}>
        <HomeFacts
          title={PERSONAL_COPY.pimInfos}
          facts={parts.map((part, index) => ({
            icon: parts.length === 1 ? 'academy' : (PIM_FACT_ICONS[index] ?? 'academy'),
            text: part,
          }))}
        />
        {task.guide && <Markdown source={task.guide} />}
      </div>
    )
  }

  return (
    <div className={TASK_LIST.drawer}>
      <DetailGrid
        entries={[
          { label: PERSONAL_TASK_COPY.what, value: task.description },
          // An announcement is done here
          ...(task.announcement
            ? []
            : [
                { label: PERSONAL_TASK_COPY.where, value: task.destinationLabel },
                {
                  label: PERSONAL_TASK_COPY.due,
                  value: task.dueAt ? formatDay(task.dueAt) : undefined,
                },
              ]),
        ]}
      />
      {task.announcement && <pre className={DEPARTURE_TASK.body}>{task.announcement.body}</pre>}
      {task.guide && (
        <div className="flex flex-col gap-2">
          <span className={TASK_LIST.group}>{PERSONAL_TASK_COPY.guideTitle}</span>
          <Markdown source={task.guide} />
        </div>
      )}
    </div>
  )
}
