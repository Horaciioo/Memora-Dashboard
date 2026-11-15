'use client'

import { Button } from '@/components/elements/actions/Button'
import { Input } from '@/components/elements/forms/inputs/Input'
import { Textarea } from '@/components/elements/forms/inputs/Textarea'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { addOption, retypeQuestion } from '@/core/lib/unban/formEdit'
import { UNBAN_SETTINGS } from '@/declarations/configurations/settings'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import { UNBAN_QUESTION_TYPE_REGISTRY } from '@/declarations/unban/registries'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import type { UnbanQuestion } from '@/declarations/unban/form'
import { UnbanQuestionTypes } from '@/utils/constants/unban'
import type { UnbanQuestionTypeName } from '@/utils/constants/unban'

// Kinds of question, as a menu
const TYPE_OPTIONS = UNBAN_QUESTION_TYPE_REGISTRY.keys.map((value) => ({
  value,
  label: UNBAN_QUESTION_TYPE_REGISTRY.label(value),
}))

// An option list never drops below two
const MIN_OPTIONS = 2

export interface QuestionCardProps {
  question: UnbanQuestion
  index: number
  // Questions on the same page
  total: number
  // Another question may still go
  canRemove: boolean
  // Pages to send the question to, none when the form has one
  pages: { value: string; label: string }[]
  pageId: string
  isOpen: boolean
  onOpen: () => void
  onChange: (next: UnbanQuestion) => void
  onMove: (delta: number) => void
  onDuplicate: () => void
  onRemove: () => void
  onPage: (pageId: string) => void
}

/**
 * One question of the form, its settings open on the card in use
 * @param {QuestionCardProps} props - Question and the edits it can ask for
 * @return {JSX.Element}
 */

export const QuestionCard = ({
  question,
  index,
  total,
  canRemove,
  pages,
  pageId,
  isOpen,
  onOpen,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
  onPage,
}: QuestionCardProps) => {
  const kind = UNBAN_QUESTION_TYPE_REGISTRY.get(question.type)
  const options = question.options ?? []
  const scale = question.scale

  return (
    <div className={UNBAN_DESK_STYLES.card} onFocusCapture={onOpen} onClick={onOpen}>
      <div className={UNBAN_DESK_STYLES.cardRow}>
        <Input
          aria-label={UNBAN_SCREEN_COPY.formQuestionLabel}
          placeholder={UNBAN_SCREEN_COPY.formQuestionLabel}
          value={question.label}
          onChange={(event) => onChange({ ...question, label: event.target.value })}
        />
        <SelectMenu
          label={UNBAN_SCREEN_COPY.formType}
          options={TYPE_OPTIONS}
          value={question.type}
          onChange={(value) => onChange(retypeQuestion(question, value as UnbanQuestionTypeName))}
        />
      </div>

      {isOpen && (
        <>
          <Textarea
            rows={2}
            aria-label={UNBAN_SCREEN_COPY.formQuestionHint}
            placeholder={UNBAN_SCREEN_COPY.formQuestionHint}
            value={question.hint ?? ''}
            onChange={(event) => onChange({ ...question, hint: event.target.value || undefined })}
          />

          {pages.length > 1 && (
            <SelectMenu
              label={UNBAN_SCREEN_COPY.formPageOf}
              options={pages}
              value={pageId}
              onChange={onPage}
            />
          )}

          {kind.hasOptions && (
            <div className={UNBAN_DESK_STYLES.section}>
              <span className={UNBAN_DESK_STYLES.sectionTitle}>
                {UNBAN_SCREEN_COPY.formOptions}
              </span>
              {options.map((option, position) => (
                <div key={option.id} className={UNBAN_DESK_STYLES.option}>
                  <Input
                    aria-label={UNBAN_SCREEN_COPY.formOptionLabel}
                    placeholder={UNBAN_SCREEN_COPY.formOptionLabel}
                    value={option.label}
                    onChange={(event) =>
                      onChange({
                        ...question,
                        options: options.map((entry, at) =>
                          at === position ? { ...entry, label: event.target.value } : entry
                        ),
                      })
                    }
                  />
                  {kind.fieldKind === 'select' && (
                    <Input
                      aria-label={UNBAN_SCREEN_COPY.formOptionRedirect}
                      placeholder={UNBAN_SCREEN_COPY.formOptionRedirect}
                      value={option.redirectUrl ?? ''}
                      onChange={(event) =>
                        onChange({
                          ...question,
                          options: options.map((entry, at) =>
                            at === position
                              ? { ...entry, redirectUrl: event.target.value || undefined }
                              : entry
                          ),
                        })
                      }
                    />
                  )}
                  <Button
                    variant="icon"
                    icon="close"
                    aria-label={UNBAN_SCREEN_COPY.formRemove}
                    disabled={options.length <= MIN_OPTIONS}
                    onClick={() =>
                      onChange({ ...question, options: options.filter((_, at) => at !== position) })
                    }
                  />
                </div>
              ))}
              {options.length < UNBAN_SETTINGS.maxOptions && (
                <Button icon="add" onClick={() => onChange(addOption(question))}>
                  {UNBAN_SCREEN_COPY.formOptionAdd}
                </Button>
              )}
            </div>
          )}

          {question.type === UnbanQuestionTypes.Scale && scale && (
            <div className={UNBAN_DESK_STYLES.scale}>
              <Input
                type="number"
                aria-label={UNBAN_SCREEN_COPY.formScaleMin}
                value={scale.min}
                onChange={(event) =>
                  onChange({ ...question, scale: { ...scale, min: Number(event.target.value) } })
                }
              />
              <Input
                type="number"
                aria-label={UNBAN_SCREEN_COPY.formScaleMax}
                value={scale.max}
                onChange={(event) =>
                  onChange({ ...question, scale: { ...scale, max: Number(event.target.value) } })
                }
              />
              <Input
                aria-label={UNBAN_SCREEN_COPY.formScaleLow}
                placeholder={UNBAN_SCREEN_COPY.formScaleLow}
                value={scale.lowLabel ?? ''}
                onChange={(event) =>
                  onChange({
                    ...question,
                    scale: { ...scale, lowLabel: event.target.value || undefined },
                  })
                }
              />
              <Input
                aria-label={UNBAN_SCREEN_COPY.formScaleHigh}
                placeholder={UNBAN_SCREEN_COPY.formScaleHigh}
                value={scale.highLabel ?? ''}
                onChange={(event) =>
                  onChange({
                    ...question,
                    scale: { ...scale, highLabel: event.target.value || undefined },
                  })
                }
              />
            </div>
          )}

          <div className={UNBAN_DESK_STYLES.cardHead}>
            <Toggle
              checked={question.required}
              label={UNBAN_SCREEN_COPY.formRequired}
              onChange={(required) => onChange({ ...question, required })}
            />
            <div className={UNBAN_DESK_STYLES.cardTools}>
              <Button
                variant="icon"
                icon="moveUp"
                aria-label={UNBAN_SCREEN_COPY.formMoveUp}
                disabled={index === 0}
                onClick={() => onMove(-1)}
              />
              <Button
                variant="icon"
                icon="moveDown"
                aria-label={UNBAN_SCREEN_COPY.formMoveDown}
                disabled={index === total - 1}
                onClick={() => onMove(1)}
              />
              <Button
                variant="icon"
                icon="duplicate"
                aria-label={UNBAN_SCREEN_COPY.formDuplicate}
                onClick={onDuplicate}
              />
              <Button
                variant="icon"
                icon="remove"
                aria-label={UNBAN_SCREEN_COPY.formRemove}
                disabled={!canRemove}
                onClick={onRemove}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
