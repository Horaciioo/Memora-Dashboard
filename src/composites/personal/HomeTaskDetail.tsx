import { Markdown } from '@/components/elements/display/Markdown'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import { DEPARTURE_TASK, TASK_LIST } from '@/declarations/ui/variants'
import type { HomeTask } from '@/types/personal'
import { formatDay } from '@/utils/format/dates'

/**
 * Reading of one task
 * @param {Object} props - Task
 * @param {HomeTask} props.task - Task computed server-side
 * @return {JSX.Element}
 */

export const HomeTaskDetail = ({ task }: { task: HomeTask }) => (
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
