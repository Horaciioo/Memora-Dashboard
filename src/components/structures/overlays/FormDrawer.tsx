'use client'

import { BrandLoader } from '@/components/elements/feedback/BrandLoader'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Tabs } from '@/components/elements/navigation/Tabs'
import { Drawer } from '@/components/structures/overlays/Drawer'
import { FormRenderer } from '@/components/structures/data/FormRenderer'
import {
  FORM_GROUP_ICONS,
  collectMissingRequired,
  groupFields,
  settleFollowers,
  settleOwned,
  presetValues,
} from '@/core/lib/forms'
import { toInstantValues } from '@/core/lib/forms'
import type { PresetContext } from '@/core/lib/forms'
import { ACTION_COPY, DRAWER_COPY, FORM_COPY } from '@/declarations/ui/copy'
import type { FormSubject } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { DRAWER_ACTIONS, DRAWER_STYLES, FIELD_STYLES } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { FieldDefinition, FieldIssue, FieldValue, FormValues } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { toDayKey, toFieldValue } from '@/utils/format/calendar'
import { aimedPhrase } from '@/utils/format/grammar'
import { shiftToZone } from '@/utils/format/zone'

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
  // Live result shown beside the fields
  aside?: { label: string; render: (values: FormValues) => ReactNode }
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
  // The clock reads in the member's zone
  const now = shiftToZone(new Date())
  now.setSeconds(0, 0)

  return { actorId, today: toDayKey(now), now: toFieldValue(now) }
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
 * @param {{ label: string, render: (values: FormValues) => ReactNode }} [aside] - Live result beside the fields
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
  aside,
  recordId,
  onSubmit,
  onClose,
}: FormDrawerProps) => {
  const { session } = useAuthContext()
  const actorId = session?.id ?? null

  // Presets fill only what the caller left out
  const startValues = () =>
    toInstantValues(fields, presetValues(fields, presetContext(actorId), initialValues))

  const [draft, setDraft] = useState(() => ({
    open,
    values: startValues(),
    missing: [] as FieldIssue[],
  }))

  // Phone shows the result in place of the fields
  const [showAside, setShowAside] = useState(false)

  // Reopening always starts from the record being edited
  if (draft.open !== open) {
    setShowAside(false)
    setDraft({ open, values: open ? startValues() : draft.values, missing: [] })
  }

  const values = draft.values
  const shownIssues = [...issues, ...draft.missing]

  // A touched field drops its local flag
  const change = (name: string, value: FieldValue) =>
    setDraft((current) => ({
      ...current,
      values: settleFollowers(
        fields,
        current.values,
        settleOwned(fields, { ...current.values, [name]: value }, name),
        name
      ),
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

  // A form with a live result needs the width, its actions shrink to glyphs
  const isSlim = Boolean(aside)

  const NextIcon = ICONS.forward
  const SaveIcon = ICONS.confirm
  const CancelIcon = ICONS.close
  const BackIcon = ICONS.back

  const section = (
    <div key={current?.name} className={cn(DRAWER_STYLES.section, aside && 'flex flex-1 flex-col')}>
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
        fill={Boolean(aside)}
      />
    </div>
  )

  return (
    <Drawer
      open={open}
      onClose={onClose}
      isWide={Boolean(aside)}
      title={title}
      icon={subject.icon}
      description={description}
      subheader={
        (groups.length > 1 || aside) && (
          <div className={DRAWER_STYLES.subheaderRow}>
            {groups.length > 1 && (
              <div className={DRAWER_STYLES.subheaderTabs}>
                <Tabs
                  items={tabs}
                  value={current?.name ?? ''}
                  label={FORM_COPY.categories}
                  emphasis
                  onChange={(group) => {
                    setShowAside(false)
                    goTo(group)
                  }}
                />
              </div>
            )}
            {aside && (
              <button
                type="button"
                aria-pressed={showAside}
                onClick={() => setShowAside(!showAside)}
                className={cn(DRAWER_STYLES.asideToggle, showAside && DRAWER_STYLES.asideToggleOn)}
              >
                {aside.label}
              </button>
            )}
          </div>
        )
      }
      footer={
        <div className={isSlim ? DRAWER_ACTIONS.slimStack : DRAWER_ACTIONS.stack}>
          {(previous || next) && (
            <div className={isSlim ? DRAWER_ACTIONS.slimSteps : DRAWER_ACTIONS.steps}>
              {previous && (
                <button
                  type="button"
                  onClick={() => goTo(previous.name)}
                  aria-label={previous.name}
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
                  aria-label={next.name}
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
                aria-label={aimedPhrase(submitVerb, subject.label, subject.gender)}
                className={cn(
                  isSlim ? DRAWER_ACTIONS.slimLine : DRAWER_ACTIONS.line,
                  DRAWER_ACTIONS.save
                )}
              >
                {isSaving ? (
                  <BrandLoader variant="inline" />
                ) : (
                  <SaveIcon
                    className={isSlim ? DRAWER_ACTIONS.slimIcon : DRAWER_ACTIONS.icon}
                    aria-hidden="true"
                  />
                )}
                {!isSlim && (
                  <span className={DRAWER_ACTIONS.lineLabel}>
                    {isSaving
                      ? ACTION_COPY.saving
                      : aimedPhrase(submitVerb, subject.label, subject.gender)}
                  </span>
                )}
              </button>
              {!isSlim && <span className={DRAWER_ACTIONS.divider} aria-hidden="true" />}
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                aria-label={aimedPhrase(DRAWER_COPY.cancel, subject.label, subject.gender)}
                className={cn(
                  isSlim ? DRAWER_ACTIONS.slimLine : DRAWER_ACTIONS.line,
                  DRAWER_ACTIONS.cancel
                )}
              >
                <CancelIcon
                  className={isSlim ? DRAWER_ACTIONS.slimIcon : DRAWER_ACTIONS.icon}
                  aria-hidden="true"
                />
                {!isSlim && (
                  <span className={DRAWER_ACTIONS.lineLabel}>
                    {aimedPhrase(DRAWER_COPY.cancel, subject.label, subject.gender)}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      }
    >
      {aside ? (
        <div className={DRAWER_STYLES.split}>
          <div className={cn('flex-1 flex-col', showAside ? 'hidden md:flex' : 'flex')}>
            {section}
          </div>
          <div className={DRAWER_STYLES.splitDivider} aria-hidden="true" />
          <div className={cn('flex-1 flex-col', showAside ? 'flex' : 'hidden md:flex')}>
            <div className={cn(FIELD_STYLES.wrapper, 'flex-1')}>
              <span className={FIELD_STYLES.labelRow}>
                <span className={FIELD_STYLES.label}>{aside.label}</span>
              </span>
              {aside.render(values)}
            </div>
          </div>
        </div>
      ) : (
        section
      )}
    </Drawer>
  )
}
