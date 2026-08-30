'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { Button } from '@/components/elements/actions/Button'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import { AddRow } from '@/components/structures/AddRow'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { EditableDetailGrid, type EditableEntry } from '@/components/structures/EditableDetailGrid'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { FileTabs } from '@/components/structures/FileTabs'
import { useMemberFile } from '@/core/hooks/data/useMemberFile'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { ROUTES } from '@/declarations/navigation'
import { MEMBER_COPY, MEMBER_FIELD_COPY } from '@/declarations/members/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { ACTION_COPY, FIELD_COPY } from '@/declarations/ui/copy'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { RoleBadge } from '@/composites/members/MemberBadges'
import { MemberAccessPanel } from '@/composites/members/MemberAccessPanel'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { MemberOverride } from '@/core/services/members/MemberFileService'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
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
  activity: ActivityEntry[]
  overrides: MemberOverride[]
  inherited: PermissionName[]
  canUpdate: boolean
  canReadNotes: boolean
  canWriteNotes: boolean
  canReadLogs: boolean
  canManageAccess: boolean
}

// Contact fields edited in place, in the order they appear under the section
const CONTACT_FIELD_NAMES = ['discordId', 'email', 'phone', 'birthday', 'languages']

// Assignment fields edited in place, in the order they appear under the section
const ASSIGNMENT_FIELD_NAMES = [
  'youtuberIds',
  'divisionId',
  'primaryFunctionId',
  'secondaryFunctionId',
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
 * Labels of every selected value of a multiselect field
 * @param {FieldDefinition} field - Field carrying the options
 * @param {FieldValue} value - Stored value
 * @return {ReactNode} - Matching option labels, joined
 */

const optionLabels = (field: FieldDefinition, value: FieldValue): ReactNode => {
  if (!Array.isArray(value) || value.length === 0) return null

  const labels = value
    .map((entry) => field.options?.find((option) => option.value === entry)?.label)
    .filter((label): label is string => Boolean(label))

  return labels.length > 0 ? labels.join(', ') : null
}

/**
 * Tabs of one moderator file, each tab guarded by the permission that opens it
 * @param {MemberDetail} detail - File resolved server-side
 * @param {string | null} recruitmentSessionId - Session holding their application, by Discord identifier
 * @param {FieldDefinition[]} memberFields - Declarations of the file form
 * @param {FieldDefinition[]} noteFields - Declarations of the note form
 * @param {FieldDefinition[]} socialFields - Declarations of the social form
 * @param {ActivityEntry[]} activity - Journal entries
 * @param {MemberOverride[]} overrides - Permission overrides
 * @param {PermissionName[]} inherited - Permissions inheritance grants
 * @param {boolean} canUpdate - Member may edit the file
 * @param {boolean} canReadNotes - Member may read private remarks
 * @param {boolean} canWriteNotes - Member may write private remarks
 * @param {boolean} canReadLogs - Member may read the journal
 * @param {boolean} canManageAccess - Member may change permissions
 * @return {JSX.Element}
 */

export const MemberFileTabs = ({
  detail,
  recruitmentSessionId,
  memberFields,
  noteFields,
  socialFields,
  activity,
  overrides,
  inherited,
  canUpdate,
  canReadNotes,
  canWriteNotes,
  canReadLogs,
  canManageAccess,
}: MemberFileTabsProps) => {
  const router = useRouter()
  const file = useMemberFile(detail, overrides)
  const { session } = useAuthContext()
  const { contextMenu } = useMenu()
  const [dialog, setDialog] = useState<'identity' | 'note' | 'socials' | null>(null)
  const [pendingNote, setPendingNote] = useState<string | null>(null)
  const [editingSocial, setEditingSocial] = useState<MemberSocial | null>(null)
  const [pendingSocial, setPendingSocial] = useState<MemberSocial | null>(null)
  // Kept in sync with every inline commit, always sent in full to the PATCH route
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

  // A member always tends their own social rows, a manager tends anyone's
  const canWriteSocials = canUpdate || session?.id === summary.id

  const openSocial = (social: MemberSocial | null) => {
    setEditingSocial(social)
    openDialog('socials')
  }

  // Every PATCH replaces the whole record, so a single field commit still ships the rest untouched
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
      display: identityValues.email ? String(identityValues.email) : null,
    },
    {
      label: FIELD_COPY.phone,
      field: fieldFor('phone'),
      display: identityValues.phone ? String(identityValues.phone) : null,
    },
    {
      label: FIELD_COPY.birthday,
      field: fieldFor('birthday'),
      display:
        typeof identityValues.birthday === 'string' && identityValues.birthday ? (
          <span className="flex flex-wrap items-center gap-2">
            {formatDay(identityValues.birthday)}
            <Badge
              label={
                identityValues.celebrateBirthday
                  ? MEMBER_COPY.birthdayCelebrated
                  : MEMBER_COPY.birthdayQuiet
              }
              tone={identityValues.celebrateBirthday ? 'success' : 'neutral'}
              icon="birthday"
            />
          </span>
        ) : null,
    },
    {
      label: FIELD_COPY.languages,
      field: fieldFor('languages'),
      display: Array.isArray(identityValues.languages) && identityValues.languages.length > 0 && (
        <span className="flex flex-wrap gap-1.5">
          {identityValues.languages.map((language) => (
            <Badge key={language} label={language} tone="neutral" />
          ))}
        </span>
      ),
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
      label: FIELD_COPY.mainFunction,
      field: fieldFor('primaryFunctionId'),
      display: optionLabel(fieldFor('primaryFunctionId'), identityValues.primaryFunctionId),
    },
    {
      label: FIELD_COPY.secondFunction,
      field: fieldFor('secondaryFunctionId'),
      display: optionLabel(fieldFor('secondaryFunctionId'), identityValues.secondaryFunctionId),
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

  const header = (
    <Section title={MEMBER_COPY.identity} padded>
      <div className="flex flex-wrap items-start gap-4">
        <button
          type="button"
          disabled={!canEdit}
          aria-label={ACTION_COPY.edit}
          title={ACTION_COPY.edit}
          onClick={() => openDialog('identity')}
          className="shrink-0 rounded-[var(--radius-sm)] transition-opacity enabled:cursor-pointer enabled:hover:opacity-80 disabled:cursor-default"
        >
          <Avatar name={summary.displayName} src={summary.avatarUrl} size="lg" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex flex-wrap items-center gap-2">
            <RoleBadge member={summary} />
            <Badge
              label={summary.division ? summary.division.label : MEMBER_COPY.noDivision}
              tone="neutral"
            />
            {summary.youtubers.map((youtuber) => (
              <Badge key={youtuber.id} label={youtuber.label} tone="info" icon="youtuber" />
            ))}
            {summary.academyDispositif && (
              <Badge
                label={summary.academyDispositif.label}
                accent={summary.academyDispositif.accent}
                tone={'info'}
              />
            )}
          </span>
        </div>
      </div>
      {isLocked && <p className={`${DETAIL_BLOCK.empty} pt-3`}>{MEMBER_COPY.rootLocked}</p>}
    </Section>
  )

  const identityTab = () => (
    <div className="flex flex-col gap-8">
      <Section title={MEMBER_COPY.contact} padded>
        <EditableDetailGrid
          entries={contactEntries}
          values={identityValues}
          issues={file.issues}
          disabled={!canEdit}
          onCommit={saveField}
        />
      </Section>
      <Section title={MEMBER_COPY.assignment} padded>
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

  const accessTab = () => (
    <MemberAccessPanel
      overrides={file.overrides}
      inherited={inherited}
      isSaving={file.isSaving}
      onSave={file.saveOverrides}
    />
  )

  const notesTab = () => (
    <Section title={MEMBER_COPY.notesTitle} description={MEMBER_COPY.notesLead} bare>
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
        <div className={LIST_STYLES.stack}>
          {file.notes.map((note) => (
            <article
              key={note.id}
              onContextMenu={contextMenu(noteMenu(note.id, note.pinned))}
              className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
            >
              <span className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink-subtle)]">
                {note.pinned && <Badge label={MEMBER_COPY.notePin} tone="warning" icon="star" />}
                {[note.authorName, formatDayTime(note.createdAt)].filter(Boolean).join(' · ')}
              </span>
              <p className="text-sm whitespace-pre-wrap">{note.body}</p>
            </article>
          ))}
          <AddRow
            label={MEMBER_COPY.noteAdd}
            disabled={!canWriteNotes}
            onClick={() => openDialog('note')}
          />
        </div>
      )}
    </Section>
  )

  const absencesTab = () => (
    <Section title={MEMBER_COPY.tabAbsences} bare>
      {detail.absences.length === 0 ? (
        <EmptyState
          figure="absences"
          title={MEMBER_COPY.absencesEmptyTitle}
          description={MEMBER_COPY.absencesEmptyDescription}
          action={<Badge label={MEMBER_COPY.absencesEmptyTitle} tone="neutral" />}
        />
      ) : (
        <div className={LIST_STYLES.stack}>
          {detail.absences.map((absence) => {
            const status = ABSENCE_STATUS_REGISTRY.get(absence.status)

            return (
              <div key={absence.id} className={LIST_STYLES.item}>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-medium">
                    {formatDayRange(absence.startDate, absence.endDate)}
                  </span>
                  {absenceReasonText(absence) && (
                    <span className="truncate text-xs text-[var(--color-ink-subtle)]">
                      {absenceReasonText(absence)}
                    </span>
                  )}
                </span>
                <Badge label={`${absence.dayCount}`} tone="neutral" icon="clock" />
                <Badge label={status.label} accent={status.accent} dot />
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )

  const socialsTab = () => (
    <Section title={MEMBER_COPY.socialsTitle} description={MEMBER_COPY.socialsLead} bare>
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
        <div className={LIST_STYLES.stack}>
          {file.socials.map((social) => (
            <div key={social.id} className={LIST_STYLES.item}>
              <Badge label={social.label} accent={social.accent} tone={'brand'} />
              <span className="min-w-0 flex-1 truncate text-sm">{social.handle}</span>
              {social.url && (
                <a
                  href={social.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-[var(--color-brand-600)] underline"
                >
                  {ACTION_COPY.open}
                </a>
              )}
              <Button
                variant="icon"
                icon="edit"
                aria-label={MEMBER_COPY.socialEdit}
                disabled={!canWriteSocials}
                onClick={() => openSocial(social)}
              />
              <Button
                variant="icon"
                icon="remove"
                aria-label={ACTION_COPY.delete}
                disabled={!canWriteSocials}
                onClick={() => setPendingSocial(social)}
              />
            </div>
          ))}
          <AddRow
            label={MEMBER_COPY.socialAdd}
            disabled={!canWriteSocials}
            onClick={() => openSocial(null)}
          />
        </div>
      )}
    </Section>
  )

  const pathTab = () => (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <MaturityTag maturity="alpha" />
      </div>
      <Section title={MEMBER_COPY.academyFsiTitle} bare>
        {summary.academyJuniorId && summary.academySessionId ? (
          <Button
            variant="primary"
            icon="academy"
            onClick={() =>
              router.push(ROUTES.junior(summary.academySessionId!, summary.academyJuniorId!))
            }
          >
            {MEMBER_COPY.academyFsiOpen}
          </Button>
        ) : (
          <EmptyState
            figure="academy"
            title={MEMBER_COPY.academyFsiNoneTitle}
            description={MEMBER_COPY.academyFsiNoneDescription}
            action={<Badge label={MEMBER_COPY.academyFsiNoneTitle} tone="neutral" />}
          />
        )}
      </Section>

      <Section title={MEMBER_COPY.recruitmentTitle} bare>
        {recruitmentSessionId ? (
          <Button
            variant="primary"
            icon="recruitment"
            onClick={() => router.push(ROUTES.recruitment(recruitmentSessionId))}
          >
            {MEMBER_COPY.recruitmentOpen}
          </Button>
        ) : (
          <EmptyState
            figure="members"
            title={MEMBER_COPY.recruitmentNoneTitle}
            description={MEMBER_COPY.recruitmentNoneDescription}
            action={<Badge label={MEMBER_COPY.recruitmentNoneTitle} tone="neutral" />}
          />
        )}
      </Section>
    </div>
  )

  const logsTab = () => (
    <Section title={MEMBER_COPY.tabLogs} padded={activity.length > 0} bare={activity.length === 0}>
      {activity.length === 0 ? (
        <EmptyState
          figure="notes"
          title={MEMBER_COPY.logsEmptyTitle}
          description={MEMBER_COPY.logsEmptyDescription}
          action={<Badge label={MEMBER_COPY.logsEmptyTitle} tone="neutral" />}
        />
      ) : (
        <ActivityTimeline entries={activity} />
      )}
    </Section>
  )

  return (
    <div className="flex flex-col gap-8">
      {header}

      <FileTabs
        label={MEMBER_COPY.title}
        tabs={[
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
            visible: canManageAccess,
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
            visible: canReadLogs,
            render: logsTab,
          },
        ]}
      />

      <FormDialog
        open={dialog === 'identity'}
        title={`${ACTION_COPY.edit} · ${summary.displayName}`}
        fields={restFields}
        initialValues={identityValues}
        issues={file.issues}
        isSaving={file.isSaving}
        size="lg"
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

      <FormDialog
        open={dialog === 'note'}
        title={MEMBER_COPY.noteAdd}
        fields={noteFields}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={file.addNote}
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={dialog === 'socials'}
        title={editingSocial ? MEMBER_COPY.socialEdit : MEMBER_COPY.socialAdd}
        fields={socialFields}
        initialValues={
          editingSocial
            ? {
                label: editingSocial.label,
                handle: editingSocial.handle,
                url: editingSocial.url,
                accent: editingSocial.accent,
              }
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
