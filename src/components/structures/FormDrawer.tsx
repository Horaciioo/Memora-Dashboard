'use client'

import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { useState } from 'react'
import { Tabs } from '@/components/elements/navigation/Tabs'
import { Drawer } from '@/components/structures/Drawer'
import { FormRenderer } from '@/components/structures/FormRenderer'
import {
  FORM_GROUP_ICONS,
  collectMissingRequired,
  groupFields,
  presetValues,
} from '@/core/lib/forms'
import type { PresetContext } from '@/core/lib/forms'
import { ACTION_COPY, DRAWER_COPY, FORM_COPY } from '@/declarations/ui/copy'
import type { FormSubject } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { DRAWER_ACTIONS, DRAWER_STYLES } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { FieldDefinition, FieldIssue, FieldValue, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { toDayKey, toFieldValue } from '@/utils/format/calendar'
import { aimedPhrase } from '@/utils/format/grammar'

export interface FormDrawerProps {
  open: boolean
  // Action carried
  title: string
  // Record written
  subject: FormSubject
  description?: string
  // Visible context line shown above the fields
  note?: string
  fields: FieldDefinition[]
  initialValues?: FormValues
  issues: FieldIssue[]
  isSaving: boolean
  // Verb of the confirming line
  submitVerb?: string
  // Settings rows
  layout?: 'grid' | 'rows'
  // Record being edited
  recordId?: string | null
  onSubmit: (values: FormValues) => Promise<boolean>
  onClose: () => void
}

/**
 * Actor and clock a blank form presets from
 * @param {string | null} actorId - Signed-in member
 * @return {PresetContext} - Preset context
 */

const presetContext = (actorId: string | null): PresetContext => {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)

  return { actorId, today: toDayKey(now), now: toFieldValue(nextHour) }
}

/**
 * Form engine in a page drawer
 * @param {boolean} open - Drawer is mounted
 * @param {string} title - Action carried
 * @param {FormSubject} subject - Record written
 * @param {string} [description] - Screen reader only
 * @param {string} [note] - Visible context line above the fields
 * @param {FieldDefinition[]} fields - Field declarations
 * @param {FormValues} [initialValues] - Known values
 * @param {FieldIssue[]} issues - Rejections returned by the server
 * @param {boolean} isSaving - Submission in flight
 * @param {string} [submitVerb] - Confirming verb
 * @param {'grid' | 'rows'} [layout] - Field layout
 * @param {string | null} [recordId] - Record being edited
 * @param {(values: FormValues) => Promise<boolean>} onSubmit - Submission handler
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const FormDrawer = ({
  open,
  title,
  subject,
  description,
  note,
  fields,
  initialValues,
  issues,
  isSaving,
  submitVerb = DRAWER_COPY.save,
  layout,
  recordId,
  onSubmit,
  onClose,
}: FormDrawerProps) => {
  const { session } = useAuthContext()
  const actorId = session?.id ?? null

  // Presets fill only what the caller left out
  const startValues = () => presetValues(fields, presetContext(actorId), initialValues)

  const [draft, setDraft] = useState(() => ({
    open,
    values: startValues(),
    missing: [] as FieldIssue[],
  }))

  // Reopening always starts from the record being edited
  if (draft.open !== open) {
    setDraft({ open, values: open ? startValues() : draft.values, missing: [] })
  }

  const values = draft.values
  const shownIssues = [...issues, ...draft.missing]

  // A touched field drops its local flag
  const change = (name: string, value: FieldValue) =>
    setDraft((current) => ({
      ...current,
      values: { ...current.values, [name]: value },
      missing: current.missing.filter((issue) => issue.field !== name),
    }))

  const groups = groupFields(fields, values)

  const tabs = groups.map((group) => ({
    value: group.name,
    label: group.name,
    icon: FORM_GROUP_ICONS[group.name],
    flagged: group.fields.some((field) => shownIssues.some((issue) => issue.field === field.name)),
  }))

  const [trail, setTrail] = useState({ issues, open, group: groups[0]?.name ?? '' })

  // Reopening starts on the first section
  if (trail.issues !== issues || trail.open !== open) {
    const flagged = tabs.find((tab) => tab.flagged)
    setTrail({
      issues,
      open,
      group: flagged?.value ?? (trail.open === open ? trail.group : (groups[0]?.name ?? '')),
    })
  }

  const index = Math.max(
    groups.findIndex((group) => group.name === trail.group),
    0
  )
  const current = groups[index]
  const next = groups[index + 1]
  const previous = index > 0 ? groups[index - 1] : undefined

  const goTo = (group: string) => setTrail({ issues, open, group })

  // Required fields of the section hold the arrow
  const advance = () => {
    if (!current || !next) return

    const missing = collectMissingRequired(current.fields, values).map((field) => ({
      field,
      message: FORM_COPY.required,
    }))

    if (missing.length > 0) {
      setDraft((state) => ({ ...state, missing }))
      return
    }

    goTo(next.name)
  }

  const submit = async () => {
    const accepted = await onSubmit(values)
    if (accepted) onClose()
  }

  const NextIcon = ICONS.next
  const SaveIcon = ICONS.confirm
  const CancelIcon = ICONS.close
  const BackIcon = ICONS.back

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      icon={subject.icon}
      description={description}
      subheader={
        groups.length > 1 && (
          <Tabs
            items={tabs}
            value={current?.name ?? ''}
            label={FORM_COPY.categories}
            emphasis
            onChange={goTo}
          />
        )
      }
      footer={
        <div className={DRAWER_ACTIONS.stack}>
          {(previous || next) && (
            <div className={DRAWER_ACTIONS.steps}>
              {previous && (
                <button
                  type="button"
                  onClick={() => goTo(previous.name)}
                  className={cn(DRAWER_ACTIONS.step, DRAWER_ACTIONS.stepBack)}
                >
                  <BackIcon className={DRAWER_ACTIONS.stepIcon} aria-hidden="true" />
                  <span className={DRAWER_ACTIONS.stepLabel}>{previous.name}</span>
                </button>
              )}
              {next && (
                <button
                  type="button"
                  onClick={advance}
                  className={cn(DRAWER_ACTIONS.step, DRAWER_ACTIONS.stepNext)}
                >
                  <span className={DRAWER_ACTIONS.stepLabel}>{next.name}</span>
                  <NextIcon className={DRAWER_ACTIONS.stepIcon} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          {!next && (
            <>
              <button
                type="button"
                onClick={submit}
                disabled={isSaving}
                className={cn(DRAWER_ACTIONS.line, DRAWER_ACTIONS.save)}
              >
                {isSaving ? (
                  <BrandLoader variant="inline" />
                ) : (
                  <SaveIcon className={DRAWER_ACTIONS.icon} aria-hidden="true" />
                )}
                {isSaving
                  ? ACTION_COPY.saving
                  : aimedPhrase(submitVerb, subject.label, subject.gender)}
              </button>
              <span className={DRAWER_ACTIONS.divider} aria-hidden="true" />
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className={cn(DRAWER_ACTIONS.line, DRAWER_ACTIONS.cancel)}
              >
                <CancelIcon className={DRAWER_ACTIONS.icon} aria-hidden="true" />
                {aimedPhrase(DRAWER_COPY.cancel, subject.label, subject.gender)}
              </button>
            </>
          )}
        </div>
      }
    >
      <div key={current?.name} className={DRAWER_STYLES.section}>
        {note && <p className={DRAWER_ACTIONS.note}>{note}</p>}
        <FormRenderer
          fields={current?.fields ?? []}
          values={values}
          issues={shownIssues}
          onChange={change}
          disabled={isSaving}
          layout={layout}
          recordId={recordId}
          single
        />
      </div>
    </Drawer>
  )
}
