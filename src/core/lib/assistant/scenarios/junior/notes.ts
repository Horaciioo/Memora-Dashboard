import { apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { failure } from '@/core/lib/assistant/scenarios/failure'
import { excerpt, readDossier, readNotes } from '@/core/lib/assistant/scenarios/junior/data'
import { JUNIOR_SCENARIO_COPY as COPY } from '@/declarations/assistant/scenarios/junior'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { ScenarioChoice, ScenarioMove, ScenarioStep } from '@/types/scenario'
import { fillTemplate } from '@/utils/format/strings'

/**
 * Notes of the junior: put one down, or change one
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Choices, a note to add goes straight on when none exist
 */

export const noteMenu: ScenarioStep = async (context) => {
  const notes = await readNotes(context.data.juniorId)
  if (notes.length === 0) return { say: [], next: 'noteStart' }

  return {
    say: [COPY.noteAsk],
    ask: {
      kind: 'choices',
      choices: [
        { value: 'add', label: COPY.noteAdd },
        { value: 'edit', label: COPY.noteEdit },
        { value: 'back', label: COPY.done },
      ],
    },
    next: 'noteMenuAnswer',
  }
}

export const noteMenuAnswer: ScenarioStep = async (context, answer) => {
  if (answer?.value === 'add') return { say: [], next: 'noteStart' }
  if (answer?.value !== 'edit') return { say: [], next: 'hubAgain' }

  const notes = (await readNotes(context.data.juniorId)).slice(0, ASSISTANT_SETTINGS.maxChoices)
  const dossier = await readDossier(context.data.juniorId)
  const kinds = dossier.noteFields.find((field) => field.name === 'kind')?.options ?? []
  const choices: ScenarioChoice[] = notes.map((note) => ({
    value: note.id,
    label: `${kinds.find((kind) => kind.value === note.kind)?.label ?? note.kind}, ${new Date(
      note.createdAt
    ).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`,
    hint: excerpt(note.body),
  }))

  return { say: [COPY.noteWhich], ask: { kind: 'choices', choices }, next: 'noteEditPick' }
}

export const noteAdd: ScenarioStep = async () => ({ say: [], next: 'noteStart' })

/**
 * Ask the kind of a new note
 * @param {ScenarioContext} context - Member and data
 * @return {Promise<ScenarioMove>} - Kinds
 */

export const noteStart: ScenarioStep = async (context) => {
  const dossier = await readDossier(context.data.juniorId)
  const kinds = dossier.noteFields.find((field) => field.name === 'kind')?.options ?? []

  return {
    say: [COPY.noteKindAsk],
    ask: {
      kind: 'choices',
      choices: kinds.map((option) => ({ value: option.value, label: option.label })),
    },
    next: 'noteKind',
  }
}

export const noteKind: ScenarioStep = async (context, answer) => ({
  say: [COPY.noteBodyAsk],
  ask: { kind: 'text' },
  next: 'noteBody',
  data: { noteKind: answer?.value ?? '' },
})

/**
 * Write the note on the file, at the stage the junior stands in
 * @param {ScenarioContext} context - Member and data
 * @param {ScenarioAnswer | null} answer - Words typed
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

export const noteBody: ScenarioStep = async (context, answer) => {
  const body = (answer?.value ?? '').trim()
  const max = FORM_SETTINGS.noteMaxLength

  if (body.length > max) {
    return {
      say: [fillTemplate(COPY.noteTooLong, { max: String(max) })],
      ask: { kind: 'text' },
      next: 'noteBody',
    }
  }

  const { junior } = await readDossier(context.data.juniorId)

  try {
    await apiPost(API_ROUTES.juniorNotes(junior.id), {
      stage: junior.stage,
      kind: context.data.noteKind,
      body,
    })
  } catch (error) {
    return { ...failure(error), next: 'hubAgain' }
  }

  return { say: [fillTemplate(COPY.noteDone, { name: context.data.name })], next: 'hubAgain' }
}

export const noteEditPick: ScenarioStep = async (context, answer) => ({
  say: [COPY.noteWhat],
  ask: {
    kind: 'choices',
    choices: [
      { value: 'body', label: COPY.noteWhatBody },
      { value: 'kind', label: COPY.noteWhatKind },
    ],
  },
  next: 'noteEditWhat',
  data: { noteId: answer?.value ?? '' },
})

export const noteEditWhat: ScenarioStep = async (context, answer) => {
  if (answer?.value === 'kind') {
    const dossier = await readDossier(context.data.juniorId)
    const kinds = dossier.noteFields.find((field) => field.name === 'kind')?.options ?? []

    return {
      say: [COPY.noteNewKind],
      ask: {
        kind: 'choices',
        choices: kinds.map((option) => ({ value: option.value, label: option.label })),
      },
      next: 'noteEditKind',
    }
  }

  return { say: [COPY.noteNewBody], ask: { kind: 'text' }, next: 'noteEditBody' }
}

/**
 * Write the change, the form replaces the three values so the others are sent back as they are
 * @param {ScenarioContext} context - Member and data
 * @param {Record<string, string>} change - Value replaced
 * @return {Promise<ScenarioMove>} - Done, or why not
 */

const saveNote = async (
  context: { data: Record<string, string> },
  change: Record<string, string>
): Promise<ScenarioMove> => {
  const note = (await readNotes(context.data.juniorId)).find(
    (entry) => entry.id === context.data.noteId
  )
  if (!note) return { say: [], next: 'hubAgain' }

  try {
    await apiPatch(API_ROUTES.juniorNote(note.id), {
      stage: note.stage,
      kind: note.kind,
      body: note.body,
      ...change,
    })
  } catch (error) {
    return { ...failure(error), next: 'hubAgain' }
  }

  return { say: [fillTemplate(COPY.noteEdited, { name: context.data.name })], next: 'hubAgain' }
}

export const noteEditBody: ScenarioStep = async (context, answer) => {
  const body = (answer?.value ?? '').trim()
  const max = FORM_SETTINGS.noteMaxLength

  if (body.length > max) {
    return {
      say: [fillTemplate(COPY.noteTooLong, { max: String(max) })],
      ask: { kind: 'text' },
      next: 'noteEditBody',
    }
  }

  return saveNote(context, { body })
}

export const noteEditKind: ScenarioStep = async (context, answer) =>
  saveNote(context, { kind: answer?.value ?? '' })
