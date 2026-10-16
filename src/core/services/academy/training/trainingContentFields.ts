import { toOptions } from '@/core/lib/forms/options'
import { TRAINING_CONTENT_FIELD_COPY } from '@/declarations/academy/copy'
import { TRAINING_BLOCK_KIND_REGISTRY } from '@/declarations/academy/registries'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FieldDefinition } from '@/types/forms'
import { TrainingBlockKinds } from '@/utils/constants/hierarchy'

/**
 * Build the chapter form declarations
 * @return {FieldDefinition[]} - Field declarations
 */

export const chapterFields = (): FieldDefinition[] => [
  {
    name: 'title',
    kind: 'text',
    label: TRAINING_CONTENT_FIELD_COPY.chapterTitle,
    required: true,
    maxLength: FORM_SETTINGS.titleMaxLength,
  },
]

/**
 * Build the block form declarations
 * @return {FieldDefinition[]} - Field declarations
 */

export const blockFields = (): FieldDefinition[] => [
  {
    name: 'kind',
    kind: 'select',
    label: TRAINING_CONTENT_FIELD_COPY.blockKind,
    required: true,
    options: toOptions(TRAINING_BLOCK_KIND_REGISTRY),
    mark: 'dot',
  },
  {
    name: 'body',
    kind: 'markdown',
    label: TRAINING_CONTENT_FIELD_COPY.blockBody,
    required: true,
    maxLength: FORM_SETTINGS.markdownMaxLength,
    visibleWhen: { field: 'kind', equals: TrainingBlockKinds.Text },
  },
]

/**
 * Build the question form declarations
 * @return {FieldDefinition[]} - Field declarations
 */

export const questionFields = (): FieldDefinition[] => [
  {
    name: 'prompt',
    kind: 'text',
    label: TRAINING_CONTENT_FIELD_COPY.questionPrompt,
    required: true,
    maxLength: FORM_SETTINGS.titleMaxLength,
  },
  {
    name: 'multiple',
    kind: 'toggle',
    label: TRAINING_CONTENT_FIELD_COPY.questionMultiple,
  },
]

/**
 * Build the choice form declarations
 * @return {FieldDefinition[]} - Field declarations
 */

export const choiceFields = (): FieldDefinition[] => [
  {
    name: 'label',
    kind: 'text',
    label: TRAINING_CONTENT_FIELD_COPY.choiceLabel,
    required: true,
    maxLength: FORM_SETTINGS.titleMaxLength,
  },
  {
    name: 'correct',
    kind: 'toggle',
    label: TRAINING_CONTENT_FIELD_COPY.choiceCorrect,
  },
]
