'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { MemberModerationView } from '@/composites/lives/MemberModerationView'
import { MEMBER_MODERATION_COPY } from '@/declarations/lives/moderation'
import { MEMBER_MODERATION } from '@/declarations/ui/variants'
import type { MemberModerationView as MemberModerationViewData } from '@/types/lives'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { NetworkLogo, hasNetworkLogo } from '@/components/elements/display/NetworkLogo'
import { Status } from '@/components/elements/display/Status'
import { RevealMark } from '@/components/elements/display/RevealMark'
import { OptionMark } from '@/components/elements/forms/OptionMark'
import { Button } from '@/components/elements/actions/Button'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EditableDetailGrid, type EditableEntry } from '@/components/structures/EditableDetailGrid'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { Section } from '@/components/structures/Section'
import { FileTabs } from '@/components/structures/FileTabs'
import { useMemberFile } from '@/core/hooks/data/useMemberFile'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { ACCESS_EDITABLE } from '@/declarations/access/editing'
import { ROUTES } from '@/declarations/navigation'
import { MEMBER_COPY, MEMBER_FIELD_COPY } from '@/declarations/members/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { ACTION_COPY, FIELD_COPY } from '@/declarations/ui/copy'
import { MEMBER_BLOCK, MEMBER_FILE } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_STYLES, RECORD_ROW } from '@/declarations/ui/variants'
import { MemberJourney } from '@/composites/members/MemberJourney'
import { MemberOverview } from '@/composites/members/MemberOverview'
import { MemberRail } from '@/composites/members/MemberRail'
import { sealedDisplay } from '@/components/structures/SealedValue'
import { SensitiveFields } from '@/declarations/access/sensitive'
import { MemberAccessPanel } from '@/composites/members/MemberAccessPanel'
import { cn } from '@/utils/classnames'
import { useEditGestures } from '@/core/hooks/interaction/useEditGestures'
import { useMenu, type MenuItem } from '@/managers/front-end'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { PermissionLayers } from '@/core/lib/permissions'
import type { FieldDefinition, FieldOption, FieldValue, FormValues } from '@/types/forms'
import { ErasedValue } from '@/composites/members/ErasedValue'
import type { MemberDetail, MemberSocial } from '@/types/members'
import type { PermissionName } from '@/utils/constants/permissions'
import { absenceReasonText } from '@/utils/format/absences'
import { formatDay, formatDayRange, formatDayTime } from '@/utils/format/dates'

export interface MemberFileTabsProps {
  detail: MemberDetail
  recruitmentSessionId: string | null
  memberFields: FieldDefinition[]
  noteFields: FieldDefinition[]
  socialFields: FieldDefinition[]
  absenceFields: FieldDefinition[]
  activity: ActivityEntry[]
  overrides: PermissionLayers
  inherited: Record<string, PermissionName[]>
  canUpdate: boolean
  canReadNotes: boolean
  canWriteNotes: boolean
  canReadLogs: boolean
  canManageAccess: boolean
  canPostAbsence: boolean
  // Moderation history
  moderation?: MemberModerationViewData | null
  canOpenReports: boolean
}

// Contact fields edited in place
const ExternalIcon = ICONS.forward
const CalendarIcon = ICONS.meetings

const CONTACT_FIELD_NAMES = ['discordId', 'email', 'phone', 'birthday', 'languages']

// Assignment fields edited in place
const ASSIGNMENT_FIELD_NAMES = [
  'youtuberIds',
  'divisionId',
  'primaryFunctionIds',
  'secondaryFunctionIds',
  'joinedAt',
  'leftAt',
]

/**
 * Label of a select value
 * @param {FieldDefinition} field - Field carrying the options
 * @param {FieldValue} value - Stored value
 * @return {ReactNode} - Matching option label
 */

const optionLabel = (field: FieldDefinition, value: FieldValue): ReactNode => {
  if (typeof value !== 'string' || value === '') return null

  return field.options?.find((option) => option.value === value)?.label ?? null
}

/**
 * Label of one stored entry
 * @param {FieldDefinition} field - Field carrying the options
 * @param {string} value - Stored entry
 * @return {string} - Matching option label
 */

const optionText = (field: FieldDefinition, value: string): string =>
  field.options?.find((option) => option.value === value)?.label ?? value

/**
 * Labels of every selected value of a multiselect field
 * @param {FieldDefinition} field - Field carrying the options
 * @param {FieldValue} value - Stored value
 * @return {ReactNode} - Matching option labels
 */

const optionLabels = (field: FieldDefinition, value: FieldValue): ReactNode => {
  if (!Array.isArray(value) || value.length === 0) return null

  const labels = value
    .map((entry) => field.options?.find((option) => option.value === entry)?.label)
    .filter((label): label is string => Boolean(label))

  return labels.length > 0 ? labels.join(', ') : null
}

/**
 * Every selected option of a multiselect field
 * @param {FieldDefinition} field - Field carrying the options
 * @param {FieldValue} value - Stored value
 * @return {ReactNode} - Marked labels
 */

const optionMarks = (field: FieldDefinition, value: FieldValue): ReactNode => {
  if (!Array.isArray(value)) return null

  const options = value
    .map((entry) => field.options?.find((option) => option.value === entry))
    .filter((option): option is FieldOption => option !== undefined)

  if (options.length === 0) return null

  return (
    <span className={MEMBER_BLOCK.marks}>
      {options.map((option) => (
        <span key={option.value} className={MEMBER_BLOCK.mark}>
          <OptionMark mark="glyph" option={option} />
          {option.label}
        </span>
      ))}
    </span>
  )
}

/**
 * Tabs of one moderator file
 * @param {MemberDetail} detail - File resolved server-side
 * @param {string | null} recruitmentSessionId - Session holding their application
 * @param {FieldDefinition[]} memberFields - Declarations of the file form
 * @param {FieldDefinition[]} noteFields - Declarations of the note form
 * @param {FieldDefinition[]} socialFields - Declarations of the social form
 * @param {FieldDefinition[]} absenceFields - Declarations of the absence form
 * @param {ActivityEntry[]} activity - Journal entries
 * @param {PermissionLayers} overrides - Permission overwrites
 * @param {Record<string, PermissionName[]>} inherited - Permissions inheritance grants
 * @param {boolean} canUpdate - Member may edit the file
 * @param {boolean} canReadNotes - Member may read private remarks
 * @param {boolean} canWriteNotes - Member may write private remarks
 * @param {boolean} canReadLogs - Member may read the journal
 * @param {boolean} canManageAccess - Member may change permissions
 * @param {boolean} canPostAbsence - Viewer may post an absence for them
 * @return {JSX.Element}
 */

export const MemberFileTabs = ({
  detail,
  recruitmentSessionId,
  memberFields,
  noteFields,
  socialFields,
  absenceFields,
  activity,
  overrides,
  inherited,
  canUpdate,
  canReadNotes,
  canWriteNotes,
  canReadLogs,
  canManageAccess,
  canPostAbsence,
  moderation,
  canOpenReports,
}: MemberFileTabsProps) => {
  const router = useRouter()
  const file = useMemberFile(detail, overrides)
  const { session, isAdmin } = useAuthContext()
  const { contextMenu } = useMenu()
  const gestures = useEditGestures()
  const { factor, promptUnlock } = useSeal()
  const [tab, setTab] = useState('overview')
  const [logView, setLogView] = useState<'activity' | 'moderation'>('moderation')
  const [dialog, setDialog] = useState<'identity' | 'note' | 'socials' | 'absence' | null>(null)
  const [pendingNote, setPendingNote] = useState<string | null>(null)
  const [editingSocial, setEditingSocial] = useState<MemberSocial | null>(null)
  const [pendingSocial, setPendingSocial] = useState<MemberSocial | null>(null)
  // Kept in sync with every inline commit
  const [identityValues, setIdentityValues] = useState<FormValues>(detail.values)

  const { summary } = detail
  const isLocked = summary.isRoot
  const canEdit = canUpdate && !isLocked

  const fieldByName = new Map(memberFields.map((field) => [field.name, field]))
  const fieldFor = (name: string): FieldDefinition => fieldByName.get(name)!

  // Everything not already edited in place lands behind the portrait
  const inlineNames = new Set([...CONTACT_FIELD_NAMES, ...ASSIGNMENT_FIELD_NAMES])
  const restFields = memberFields.filter((field) => !inlineNames.has(field.name))

  const openDialog = (next: typeof dialog) => {
    file.clearIssues()
    setDialog(next)
  }

  // A member always tends their own social rows
  const canWriteSocials = canUpdate || session?.id === summary.id

  const openSocial = (social: MemberSocial | null) => {
    setEditingSocial(social)
    openDialog('socials')
  }

  // Every PATCH replaces the whole record
  const saveField = async (name: string, value: FieldValue): Promise<boolean> => {
    const next = { ...identityValues, [name]: value }
    const saved = await file.saveIdentity(next)

    if (saved) {
      setIdentityValues(next)
      router.refresh()
    }

    return saved
  }

  const contactEntries: EditableEntry[] = [
    {
      label: FIELD_COPY.discordId,
      field: fieldFor('discordId'),
      display: identityValues.discordId ? String(identityValues.discordId) : null,
    },
    {
      label: FIELD_COPY.email,
      field: fieldFor('email'),
      display: sealedDisplay(
        SensitiveFields.Email,
        identityValues.email ? String(identityValues.email) : null,
        factor.seal.isUnsealed
      ),
    },
    {
      label: FIELD_COPY.phone,
      field: fieldFor('phone'),
      display: sealedDisplay(
        SensitiveFields.Phone,
        identityValues.phone ? String(identityValues.phone) : null,
        factor.seal.isUnsealed
      ),
    },
    {
      label: FIELD_COPY.birthday,
      field: fieldFor('birthday'),
      display:
        typeof identityValues.birthday === 'string' && identityValues.birthday ? (
          <span className="flex flex-wrap items-center gap-3">
            {formatDay(identityValues.birthday)}
            <RevealMark
              icon={identityValues.celebrateBirthday ? 'success' : 'failure'}
              tone={identityValues.celebrateBirthday ? 'success' : 'danger'}
              label={
                identityValues.celebrateBirthday
                  ? MEMBER_COPY.birthdayCelebrated
                  : MEMBER_COPY.birthdayQuiet
              }
            />
          </span>
        ) : null,
    },
    {
      label: FIELD_COPY.languages,
      field: fieldFor('languages'),
      display:
        Array.isArray(identityValues.languages) && identityValues.languages.length > 0
          ? identityValues.languages
              .map((language) => optionText(fieldFor('languages'), language))
              .join(', ')
          : null,
    },
  ]

  const assignmentEntries: EditableEntry[] = [
    {
      label: MEMBER_FIELD_COPY.youtuber,
      field: fieldFor('youtuberIds'),
      display: optionLabels(fieldFor('youtuberIds'), identityValues.youtuberIds),
    },
    {
      label: FIELD_COPY.division,
      field: fieldFor('divisionId'),
      display: optionLabel(fieldFor('divisionId'), identityValues.divisionId),
    },
    {
      label: MEMBER_FIELD_COPY.dispositif,
      display: summary.academyDispositif?.label ?? null,
    },
    {
      label: MEMBER_FIELD_COPY.primaryFunctions,
      field: fieldFor('primaryFunctionIds'),
      display: optionMarks(fieldFor('primaryFunctionIds'), identityValues.primaryFunctionIds),
    },
    {
      label: MEMBER_FIELD_COPY.secondaryFunctions,
      field: fieldFor('secondaryFunctionIds'),
      display: optionMarks(fieldFor('secondaryFunctionIds'), identityValues.secondaryFunctionIds),
    },
    {
      label: FIELD_COPY.joinedAt,
      field: fieldFor('joinedAt'),
      display:
        typeof identityValues.joinedAt === 'string' && identityValues.joinedAt
          ? formatDay(identityValues.joinedAt)
          : null,
    },
    {
      label: FIELD_COPY.leftAt,
      field: fieldFor('leftAt'),
      display:
        typeof identityValues.leftAt === 'string' && identityValues.leftAt
          ? formatDay(identityValues.leftAt)
          : null,
    },
    {
      label: FIELD_COPY.team,
      display: detail.teams.length > 0 ? detail.teams.join(', ') : null,
    },
  ]

  const noteMenu = (noteId: string, pinned: boolean): MenuItem[] => [
    {
      id: 'pin',
      label: pinned ? MEMBER_COPY.noteUnpin : MEMBER_COPY.notePin,
      icon: 'star',
      disabled: !canWriteNotes,
      onSelect: () => void file.pinNote(noteId, !pinned),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !canWriteNotes,
      onSelect: () => setPendingNote(noteId),
    },
  ]

  // Contact kept beside the portrait
  const RAIL_FIELDS = ['discordId', 'email', 'birthday']

  // Erased personal data never comes back
  const ERASED_FIELDS = ['email', 'phone', 'birthday', 'languages']
  const sealErased = (entry: EditableEntry): EditableEntry =>
    detail.erased && entry.field && ERASED_FIELDS.includes(entry.field.name)
      ? { label: entry.label, display: <ErasedValue /> }
      : entry

  const railEntries = contactEntries
    .filter((entry) => entry.field && RAIL_FIELDS.includes(entry.field.name))
    .map(sealErased)
  const fileContactEntries = contactEntries
    .filter((entry) => !entry.field || !RAIL_FIELDS.includes(entry.field.name))
    .map(sealErased)

  const identityTab = () => (
    <div className={MEMBER_FILE.main}>
      <Section title={MEMBER_COPY.railContact} raised>
        <EditableDetailGrid
          entries={fileContactEntries}
          values={identityValues}
          issues={file.issues}
          disabled={!canEdit}
          onCommit={saveField}
        />
      </Section>
      <Section title={MEMBER_COPY.railAssignment} raised>
        <EditableDetailGrid
          entries={assignmentEntries}
          values={identityValues}
          issues={file.issues}
          disabled={!canEdit}
          onCommit={saveField}
        />
      </Section>
    </div>
  )

  const pinnedNotes = file.notes.filter((note) => note.pinned)

  const rail = (
    <MemberRail
      summary={summary}
      canEdit={canEdit}
      isLocked={isLocked}
      onEditPortrait={() => openDialog('identity')}
    >
      <EditableDetailGrid
        stacked
        entries={railEntries}
        values={identityValues}
        issues={file.issues}
        disabled={!canEdit}
        onCommit={saveField}
      />
      {canReadNotes && pinnedNotes.length > 0 && (
        <div className={MEMBER_FILE.pinned}>
          <span className={MEMBER_FILE.pinnedLabel}>{MEMBER_COPY.railPinned}</span>
          {pinnedNotes.map((note) => (
            <article key={note.id} className={MEMBER_FILE.note}>
              <span className={MEMBER_FILE.noteHead}>
                {[note.authorName, formatDayTime(note.createdAt)].filter(Boolean).join(' · ')}
              </span>
              <p className={MEMBER_FILE.noteBody}>{note.body}</p>
            </article>
          ))}
        </div>
      )}
    </MemberRail>
  )

  const overviewTab = () => (
    <MemberOverview
      absences={file.absences}
      activity={activity}
      canReadLogs={canReadLogs}
      onNavigate={setTab}
    />
  )

  const accessTab = () => (
    <MemberAccessPanel
      overrides={file.overrides}
      inherited={inherited}
      youtubers={summary.youtubers}
      sealed={!isAdmin && !factor.seal.isUnsealed}
      isSaving={file.isSaving}
      onSave={file.saveOverrides}
      onSealed={promptUnlock}
    />
  )

  const notesTab = () => {
    // Pinned first
    const ordered = [...file.notes].sort(
      (left, right) => Number(right.pinned) - Number(left.pinned)
    )

    return (
      <Section title={MEMBER_COPY.notesTitle} bare>
        {file.notes.length === 0 ? (
          <EmptyState
            figure="notes"
            title={MEMBER_COPY.notesEmptyTitle}
            description={MEMBER_COPY.notesEmptyDescription}
            action={
              <Button
                variant="primary"
                icon="add"
                disabled={!canWriteNotes}
                onClick={() => openDialog('note')}
              >
                {MEMBER_COPY.noteAdd}
              </Button>
            }
          />
        ) : (
          <div className={MEMBER_FILE.notesGrid}>
            {ordered.map((note) => (
              <article
                key={note.id}
                onContextMenu={contextMenu(noteMenu(note.id, note.pinned))}
                className={cn(MEMBER_FILE.note, note.pinned && MEMBER_FILE.notePinned)}
              >
                <span className={MEMBER_FILE.noteHead}>
                  {note.pinned && <Status label={MEMBER_COPY.notePin} tone="warning" icon="star" />}
                  {[note.authorName, formatDayTime(note.createdAt)].filter(Boolean).join(' · ')}
                </span>
                <p className={MEMBER_FILE.noteBody}>{note.body}</p>
              </article>
            ))}
            <AddRow
              tile
              label={MEMBER_COPY.noteAdd}
              disabled={!canWriteNotes}
              onClick={() => openDialog('note')}
            />
          </div>
        )}
      </Section>
    )
  }

  const absencesTab = () => (
    <Section
      title={MEMBER_COPY.tabAbsences}
      raised={file.absences.length > 0}
      bare={file.absences.length === 0}
    >
      {file.absences.length === 0 ? (
        <EmptyState
          figure="absences"
          title={MEMBER_COPY.absencesEmptyTitle}
          description={MEMBER_COPY.absencesEmptyDescription}
          action={
            canPostAbsence ? (
              <Button variant="primary" icon="add" onClick={() => openDialog('absence')}>
                {MEMBER_COPY.absenceAdd}
              </Button>
            ) : (
              <Status label={MEMBER_COPY.absencesEmptyTitle} tone="neutral" />
            )
          }
        />
      ) : (
        <>
          <ul className={HOME_STYLES.rows}>
            {file.absences.map((absence) => {
              const status = ABSENCE_STATUS_REGISTRY.get(absence.status)

              return (
                <li key={absence.id} className={cn(HOME_STYLES.line, HOME_STYLES.item)}>
                  <CalendarIcon className={HOME_STYLES.rowGlyph} aria-hidden="true" />
                  <span className={HOME_STYLES.rowBody}>
                    <span className={HOME_STYLES.rowTitle}>
                      {formatDayRange(absence.startDate, absence.endDate)}
                    </span>
                    {absenceReasonText(absence) && (
                      <span className={HOME_STYLES.rowMeta}>{absenceReasonText(absence)}</span>
                    )}
                  </span>
                  <Status label={status.label} accent={status.accent} />
                </li>
              )
            })}
          </ul>
          {canPostAbsence && (
            <AddRow label={MEMBER_COPY.absenceAdd} onClick={() => openDialog('absence')} />
          )}
        </>
      )}
    </Section>
  )

  const socialsTab = () => (
    <Section title={MEMBER_COPY.socialsTitle} bare>
      {file.socials.length === 0 ? (
        <EmptyState
          figure="settings"
          title={MEMBER_COPY.socialsEmptyTitle}
          description={MEMBER_COPY.socialsEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!canWriteSocials}
              onClick={() => openSocial(null)}
            >
              {MEMBER_COPY.socialAdd}
            </Button>
          }
        />
      ) : (
        <div className={MEMBER_FILE.socialsGrid}>
          {file.socials.map((social) => (
            <div
              key={social.id}
              className={cn(MEMBER_FILE.social, canWriteSocials && 'cursor-pointer')}
              {...gestures({
                canEdit: canWriteSocials,
                label: social.label,
                onEdit: () => openSocial(social),
                onRemove: () => setPendingSocial(social),
              })}
            >
              {hasNetworkLogo(social.label) ? (
                <span className={MEMBER_FILE.socialLogo}>
                  <NetworkLogo network={social.label} className="h-6 w-6" />
                </span>
              ) : (
                <Avatar name={social.label} size="md" />
              )}
              <span className={RECORD_ROW.body}>
                <span className={RECORD_ROW.title}>{social.label}</span>
                <span className={RECORD_ROW.meta}>{social.handle}</span>
              </span>
              {social.url && (
                <a
                  href={social.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={ACTION_COPY.open}
                  title={ACTION_COPY.open}
                  className={RECORD_ROW.link}
                >
                  <ExternalIcon className="h-5 w-5" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
          <AddRow
            className={MEMBER_FILE.socialAdd}
            label={MEMBER_COPY.socialAdd}
            disabled={!canWriteSocials}
            onClick={() => openSocial(null)}
          />
        </div>
      )}
    </Section>
  )

  const pathTab = () => (
    <MemberJourney
      summary={summary}
      onOpen={(href) => router.push(href)}
      hrefs={{
        recruitment: recruitmentSessionId ? ROUTES.recruitment(recruitmentSessionId) : null,
        academy:
          summary.academyJuniorId && summary.academySessionId
            ? ROUTES.junior(summary.academySessionId, summary.academyJuniorId)
            : null,
        legacy: summary.legacyTrackId ? ROUTES.legacyTrack(summary.legacyTrackId) : null,
      }}
    />
  )

  const activityLog = () => (
    <Section title={MEMBER_COPY.tabLogs} raised={activity.length > 0} bare={activity.length === 0}>
      {activity.length === 0 ? (
        <EmptyState
          figure="notes"
          title={MEMBER_COPY.logsEmptyTitle}
          description={MEMBER_COPY.logsEmptyDescription}
          action={<Status label={MEMBER_COPY.logsEmptyTitle} tone="neutral" />}
        />
      ) : (
        <ActivityTimeline entries={activity} />
      )}
    </Section>
  )

  // Activity and moderation are two views of the same tab
  const logsTab = () =>
    moderation === undefined ? (
      activityLog()
    ) : (
      <div className={MEMBER_MODERATION.stack}>
        {canReadLogs && (
          <div className={MEMBER_MODERATION.switch}>
            <SegmentedControl
              label={MEMBER_MODERATION_COPY.views}
              value={logView}
              onChange={setLogView}
              options={[
                { value: 'activity', label: MEMBER_MODERATION_COPY.viewActivity },
                { value: 'moderation', label: MEMBER_MODERATION_COPY.viewModeration },
              ]}
            />
          </div>
        )}
        {canReadLogs && logView === 'activity' ? (
          activityLog()
        ) : (
          <MemberModerationView view={moderation} canOpenReports={canOpenReports} />
        )}
      </div>
    )

  return (
    <div className={MEMBER_FILE.layout}>
      {rail}

      <div className={MEMBER_FILE.main}>
        <FileTabs
          label={MEMBER_COPY.title}
          value={tab}
          onChange={setTab}
          tabs={[
            {
              value: 'overview',
              label: MEMBER_COPY.tabOverview,
              icon: 'dashboard',
              render: overviewTab,
            },
            {
              value: 'identity',
              label: MEMBER_COPY.tabIdentity,
              icon: 'sheet',
              render: identityTab,
            },
            {
              value: 'notes',
              label: MEMBER_COPY.tabNotes,
              icon: 'note',
              visible: canReadNotes,
              render: notesTab,
            },
            {
              value: 'absences',
              label: MEMBER_COPY.tabAbsences,
              icon: 'absences',
              render: absencesTab,
            },
            {
              value: 'socials',
              label: MEMBER_COPY.tabSocials,
              icon: 'link',
              render: socialsTab,
            },
            {
              value: 'access',
              label: MEMBER_COPY.tabAccess,
              icon: 'shield',
              visible: canManageAccess && ACCESS_EDITABLE,
              render: accessTab,
            },
            {
              value: 'path',
              label: MEMBER_COPY.tabPath,
              icon: 'recruitment',
              render: pathTab,
            },
            {
              value: 'logs',
              label: MEMBER_COPY.tabLogs,
              icon: 'history',
              visible: canReadLogs || moderation !== undefined,
              render: logsTab,
            },
          ]}
        />
      </div>

      <FormDrawer
        subject={FORM_SUBJECTS.member}
        open={dialog === 'identity'}
        title={`${ACTION_COPY.edit} · ${summary.displayName}`}
        fields={restFields}
        initialValues={identityValues}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={async (values) => {
          const next = { ...identityValues, ...values }
          const saved = await file.saveIdentity(next)

          if (saved) {
            setIdentityValues(next)
            router.refresh()
          }

          return saved
        }}
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.note}
        open={dialog === 'note'}
        title={MEMBER_COPY.noteAdd}
        fields={noteFields}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={file.addNote}
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.absence}
        open={dialog === 'absence'}
        title={MEMBER_COPY.absenceAdd}
        fields={absenceFields}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={file.addAbsence}
        onClose={() => setDialog(null)}
      />

      <FormDrawer
        subject={FORM_SUBJECTS.social}
        open={dialog === 'socials'}
        title={editingSocial ? MEMBER_COPY.socialEdit : MEMBER_COPY.socialAdd}
        fields={socialFields}
        initialValues={
          editingSocial
            ? { networkId: editingSocial.networkId, handle: editingSocial.handle }
            : undefined
        }
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={(values) =>
          editingSocial ? file.updateSocial(editingSocial.id, values) : file.addSocial(values)
        }
        onClose={() => setDialog(null)}
      />

      <ConfirmDialog
        open={pendingSocial !== null}
        title={MEMBER_COPY.socialDeleteTitle}
        description={MEMBER_COPY.socialDeleteDescription}
        pending={file.isSaving}
        onCancel={() => setPendingSocial(null)}
        onConfirm={async () => {
          await file.removeSocial(pendingSocial!.id)
          setPendingSocial(null)
        }}
      />

      <ConfirmDialog
        open={pendingNote !== null}
        title={ACTION_COPY.delete}
        description={MEMBER_COPY.notesLead}
        pending={file.isSaving}
        onCancel={() => setPendingNote(null)}
        onConfirm={async () => {
          await file.removeNote(pendingNote!)
          setPendingNote(null)
        }}
      />
    </div>
  )
}
