import { failure } from '@/core/lib/assistant/scenarios/failure'
import { actionsOf } from '@/core/lib/assistant/scenarios/recap/actions'
import type { RecapChapter } from '@/core/lib/recap/compose'
import { useRecapAgenda } from '@/core/store/recapAgenda'
import { RECAP_TALK_COPY as COPY } from '@/declarations/assistant/scenarios/recapTalk'
import { RECAP_CHAPTERS } from '@/declarations/recap/chapters'
import type { RecapChapterName } from '@/declarations/recap/chapters'
import type { NotificationTargetName } from '@/declarations/notifications/targets'
import type { ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

// One record Memora can settle for the member
interface Todo {
  target: NotificationTargetName
  id: string
  subject: string
}

// Answer of the member who leaves a record as it is
const SKIP = 'skip'

const ASKS: Partial<Record<NotificationTargetName, string>> = {
  task: COPY.askTask,
  calendar: COPY.askCalendar,
  unbanRequest: COPY.askUnban,
}

const DONES: Partial<Record<NotificationTargetName, string>> = {
  task: COPY.didTask,
  calendar: COPY.didCalendar,
  unbanRequest: COPY.didUnban,
}

/**
 * Records of a chapter the member can settle by a gesture, roll-call reports left out
 * @param {RecapChapter} chapter - Chapter told
 * @return {string} - JSON list, empty when nothing waits for the member
 */

export const todosOf = (chapter: RecapChapter): string =>
  JSON.stringify(
    chapter.groups.flatMap((entry) =>
      entry.threads.flatMap((thread): Todo[] =>
        thread.target &&
        thread.targetId &&
        !thread.beats.some((beat) => beat.beat.startsWith('rollCall')) &&
        actionsOf(thread.target, thread.targetId).length > 0
          ? [
              {
                target: thread.target,
                id: thread.targetId,
                subject: thread.subject ?? COPY.thisOne,
              },
            ]
          : []
      )
    )
  )

// Subject struck, the member picks the next one
const wrapUp = async (chapter: RecapChapterName, isSettled: boolean) => {
  if (isSettled) useRecapAgenda.getState().finish(chapter)

  return { say: [], next: 'menu' }
}

/**
 * Asks about the next waiting record, or closes the subject when none is left
 * @return {Promise<ScenarioMove>} - Offer of a gesture, or the end of the subject
 */

export const settle: ScenarioStep = async ({ data }) => {
  const todos: Todo[] = JSON.parse(data.todos || '[]')
  const index = Number(data.todoIndex || 0)
  const todo = todos[index]

  if (!todo) return wrapUp(data.chapter as RecapChapterName, data.kept !== '1')

  const actions = actionsOf(todo.target, todo.id)

  return {
    say: [fillTemplate(ASKS[todo.target] ?? COPY.askTask, { subject: todo.subject })],
    ask: {
      kind: 'choices',
      choices: [
        ...actions.map((action, position) => ({
          value: String(position),
          label: action.label,
          tone: action.tone,
        })),
        { value: SKIP, label: COPY.skip },
      ],
    },
    next: 'settleAnswer',
  }
}

/**
 * Does the gesture the member picked, then moves on to the next record
 * @return {Promise<ScenarioMove>} - Confirmation in one line
 */

export const settleAnswer: ScenarioStep = async ({ data }, answer) => {
  const todos: Todo[] = JSON.parse(data.todos || '[]')
  const index = Number(data.todoIndex || 0)
  const todo = todos[index]
  const onward = { todoIndex: String(index + 1) }

  if (!todo || answer?.value === SKIP) {
    return { say: [COPY.kept], data: { ...onward, kept: '1' }, next: 'settle' }
  }

  try {
    await actionsOf(todo.target, todo.id)[Number(answer?.value)]?.run()

    return {
      say: [fillTemplate(DONES[todo.target] ?? COPY.didTask, { subject: todo.subject })],
      data: onward,
      next: 'settle',
    }
  } catch (error) {
    return { ...failure(error), data: { ...onward, kept: '1' }, next: 'settle' }
  }
}

/**
 * Subjects left to tell, asked as the member's next pick
 * @return {Promise<ScenarioMove>} - The remaining subjects, or the end
 */

export const menu: ScenarioStep = async () => {
  const { chapters, done } = useRecapAgenda.getState()
  const rest = chapters.filter((chapter) => !done.includes(chapter))
  if (rest.length === 0) return { say: [COPY.allDone] }

  return {
    say: [COPY.nextPick],
    ask: {
      kind: 'choices',
      choices: rest.map((chapter) => ({ value: chapter, label: RECAP_CHAPTERS[chapter] })),
    },
    next: 'pick',
  }
}
