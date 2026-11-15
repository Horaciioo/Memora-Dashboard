import { UNBAN_QUESTION_TYPE_REGISTRY } from '@/declarations/unban/registries'
import { UnbanQuestionTypes } from '@/utils/constants/unban'
import type {
  UnbanFormSnapshot,
  UnbanOption,
  UnbanPage,
  UnbanQuestion,
} from '@/declarations/unban/form'
import type { UnbanQuestionTypeName } from '@/utils/constants/unban'

// Bounds a new scale starts with
const DEFAULT_SCALE = { min: 1, max: 5 } as const

/**
 * Option nobody has written yet
 * @return {UnbanOption} - Blank option
 */

const blankOption = (): UnbanOption => ({ id: crypto.randomUUID(), label: '' })

/**
 * Question that asks nothing yet
 * @return {UnbanQuestion} - Blank short text question
 */

export const blankQuestion = (): UnbanQuestion => ({
  id: crypto.randomUUID(),
  type: UnbanQuestionTypes.ShortText,
  label: '',
  required: false,
})

/**
 * Question turned into another kind, what the new kind cannot hold is dropped
 * @param {UnbanQuestion} question - Question
 * @param {UnbanQuestionTypeName} type - New kind
 * @return {UnbanQuestion} - Question of that kind
 */

export const retypeQuestion = (
  question: UnbanQuestion,
  type: UnbanQuestionTypeName
): UnbanQuestion => {
  const { options, scale, ...rest } = question
  const kind = UNBAN_QUESTION_TYPE_REGISTRY.get(type)

  return {
    ...rest,
    type,
    ...(kind.hasOptions
      ? { options: options?.length ? options : [blankOption(), blankOption()] }
      : {}),
    ...(type === UnbanQuestionTypes.Scale ? { scale: scale ?? { ...DEFAULT_SCALE } } : {}),
  }
}

/**
 * Item moved by some places, kept in place when it would leave the list
 * @param {T[]} list - Items
 * @param {number} index - Item moved
 * @param {number} delta - Places, negative goes up
 * @return {T[]} - New list
 */

export const moveItem = <T>(list: T[], index: number, delta: number): T[] => {
  const target = index + delta
  if (target < 0 || target >= list.length) return list

  const next = [...list]
  next.splice(target, 0, ...next.splice(index, 1))

  return next
}

/**
 * Questions replaced by a new list
 * @param {UnbanFormSnapshot} snapshot - Form
 * @param {UnbanQuestion[]} questions - New questions
 * @return {UnbanFormSnapshot} - Form
 */

export const withQuestions = (
  snapshot: UnbanFormSnapshot,
  questions: UnbanQuestion[]
): UnbanFormSnapshot => ({ ...snapshot, questions })

/**
 * One question changed
 * @param {UnbanFormSnapshot} snapshot - Form
 * @param {string} id - Question identifier
 * @param {UnbanQuestion} next - Question as it becomes
 * @return {UnbanFormSnapshot} - Form
 */

export const replaceQuestion = (
  snapshot: UnbanFormSnapshot,
  id: string,
  next: UnbanQuestion
): UnbanFormSnapshot =>
  withQuestions(
    snapshot,
    snapshot.questions.map((question) => (question.id === id ? next : question))
  )

/**
 * Copy of a question right after it, every identifier fresh
 * @param {UnbanFormSnapshot} snapshot - Form
 * @param {string} id - Question copied
 * @return {UnbanFormSnapshot} - Form
 */

export const duplicateQuestion = (snapshot: UnbanFormSnapshot, id: string): UnbanFormSnapshot => {
  const index = snapshot.questions.findIndex((question) => question.id === id)
  if (index < 0) return snapshot

  const source = snapshot.questions[index]
  const copy: UnbanQuestion = {
    ...source,
    id: crypto.randomUUID(),
    ...(source.options
      ? { options: source.options.map((option) => ({ ...option, id: crypto.randomUUID() })) }
      : {}),
  }

  return withQuestions(snapshot, snapshot.questions.toSpliced(index + 1, 0, copy))
}

/**
 * Option appended to a question
 * @param {UnbanQuestion} question - Question
 * @return {UnbanQuestion} - Question with one more option
 */

export const addOption = (question: UnbanQuestion): UnbanQuestion => ({
  ...question,
  options: [...(question.options ?? []), blankOption()],
})

/**
 * Pages of a form, one implicit page when none is declared
 * @param {UnbanFormSnapshot} snapshot - Form
 * @return {UnbanPage[]} - Pages
 */

export const pagesOf = (snapshot: UnbanFormSnapshot): UnbanPage[] =>
  snapshot.pages?.length ? snapshot.pages : [{ id: 'main' }]

/**
 * Questions of one page, a question tied to no page belongs to the first
 * @param {UnbanFormSnapshot} snapshot - Form
 * @param {string} pageId - Page identifier
 * @return {UnbanQuestion[]} - Questions in order
 */

export const questionsOfPage = (snapshot: UnbanFormSnapshot, pageId: string): UnbanQuestion[] => {
  const pages = pagesOf(snapshot)

  return snapshot.questions.filter((question) => {
    const known = pages.some((page) => page.id === question.pageId)

    return known ? question.pageId === pageId : pages[0].id === pageId
  })
}

/**
 * Form with the questions of every page set in order, each tied to its page
 * @param {UnbanFormSnapshot} snapshot - Form
 * @param {UnbanPage[]} pages - Pages in order
 * @param {(page: UnbanPage) => UnbanQuestion[]} questionsOf - Questions of a page
 * @return {UnbanFormSnapshot} - Form
 */

const assemble = (
  snapshot: UnbanFormSnapshot,
  pages: UnbanPage[],
  questionsOf: (page: UnbanPage) => UnbanQuestion[]
): UnbanFormSnapshot => {
  const isSingle = pages.length < 2

  return {
    questions: pages.flatMap((page) =>
      questionsOf(page).map((question) => ({
        ...question,
        pageId: isSingle ? undefined : page.id,
      }))
    ),
    ...(isSingle ? {} : { pages }),
    ...(snapshot.intro !== undefined ? { intro: snapshot.intro } : {}),
    ...(snapshot.outro !== undefined ? { outro: snapshot.outro } : {}),
  }
}

/**
 * Questions of one page replaced
 * @param {UnbanFormSnapshot} snapshot - Form
 * @param {string} pageId - Page identifier
 * @param {UnbanQuestion[]} questions - New questions of the page
 * @return {UnbanFormSnapshot} - Form
 */

export const withPageQuestions = (
  snapshot: UnbanFormSnapshot,
  pageId: string,
  questions: UnbanQuestion[]
): UnbanFormSnapshot =>
  assemble(snapshot, pagesOf(snapshot), (page) =>
    page.id === pageId ? questions : questionsOfPage(snapshot, page.id)
  )

/**
 * Page added at the end, the first one is born holding every question
 * @param {UnbanFormSnapshot} snapshot - Form
 * @return {UnbanFormSnapshot} - Form
 */

export const addPage = (snapshot: UnbanFormSnapshot): UnbanFormSnapshot => {
  const pages = [...pagesOf(snapshot), { id: crypto.randomUUID() }]
  const own = pagesOf(snapshot)

  return assemble(snapshot, pages, (page) =>
    own.some((entry) => entry.id === page.id) ? questionsOfPage(snapshot, page.id) : []
  )
}

/**
 * Page renamed
 * @param {UnbanFormSnapshot} snapshot - Form
 * @param {string} pageId - Page identifier
 * @param {string} title - New title, blank clears it
 * @return {UnbanFormSnapshot} - Form
 */

export const renamePage = (
  snapshot: UnbanFormSnapshot,
  pageId: string,
  title: string
): UnbanFormSnapshot => ({
  ...snapshot,
  pages: pagesOf(snapshot).map((page) =>
    page.id === pageId ? { id: page.id, ...(title ? { title } : {}) } : page
  ),
})

/**
 * Page removed, its questions join the page before it
 * @param {UnbanFormSnapshot} snapshot - Form
 * @param {string} pageId - Page identifier
 * @return {UnbanFormSnapshot} - Form
 */

export const removePage = (snapshot: UnbanFormSnapshot, pageId: string): UnbanFormSnapshot => {
  const pages = pagesOf(snapshot)
  const index = pages.findIndex((page) => page.id === pageId)
  if (index < 0 || pages.length < 2) return snapshot

  const heir = pages[index === 0 ? 1 : index - 1].id

  return assemble(
    snapshot,
    pages.filter((page) => page.id !== pageId),
    (page) => [
      ...questionsOfPage(snapshot, page.id),
      ...(page.id === heir ? questionsOfPage(snapshot, pageId) : []),
    ]
  )
}

/**
 * Question sent to the end of another page
 * @param {UnbanFormSnapshot} snapshot - Form
 * @param {string} id - Question identifier
 * @param {string} pageId - Target page identifier
 * @return {UnbanFormSnapshot} - Form
 */

export const moveToPage = (
  snapshot: UnbanFormSnapshot,
  id: string,
  pageId: string
): UnbanFormSnapshot => {
  const moved = snapshot.questions.find((question) => question.id === id)
  if (!moved) return snapshot

  return assemble(snapshot, pagesOf(snapshot), (page) => [
    ...questionsOfPage(snapshot, page.id).filter((question) => question.id !== id),
    ...(page.id === pageId ? [moved] : []),
  ])
}
