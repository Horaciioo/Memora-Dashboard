'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDialog } from '@/components/structures/FormDialog'
import { Section } from '@/components/structures/Section'
import { Tabs } from '@/components/elements/navigation/Tabs'
import { useMemberFile } from '@/core/hooks/data/useMemberFile'
import { ACADEMY_PERIOD_REGISTRY } from '@/declarations/access/roles'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { ABSENCE_STATUS_REGISTRY } from '@/declarations/reference/registries'
import { ACTION_COPY, FIELD_COPY } from '@/declarations/ui/copy'
import { DETAIL_BLOCK, METRIC_BLOCK } from '@/declarations/ui/blocks'
import { LIST_STYLES } from '@/declarations/ui/variants'
import { toTone } from '@/declarations/ui/theme'
import { DivisionBadge, MemberStatusBadge, RoleBadge } from '@/composites/members/MemberBadges'
import { MemberAccessPanel } from '@/composites/members/MemberAccessPanel'
import { useMenu, type MenuItem } from '@/managers/front-end'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { MemberOverride } from '@/core/services/members/MemberFileService'
import type { FieldDefinition } from '@/types/forms'
import type { MemberDetail } from '@/types/members'
import { formatDay, formatDayRange, formatDayTime } from '@/utils/format/dates'

export interface MemberFileTabsProps {
  detail: MemberDetail
  memberFields: FieldDefinition[]
  noteFields: FieldDefinition[]
  pimFields: FieldDefinition[]
  socialFields: FieldDefinition[]
  activity: ActivityEntry[]
  overrides: MemberOverride[]
  canUpdate: boolean
  canReadNotes: boolean
  canWriteNotes: boolean
  canReadPims: boolean
  canWritePims: boolean
  canReadLogs: boolean
  canManageAccess: boolean
}

/**
 * Tabs of one moderator file, each tab guarded by the permission that opens it
 * @param {MemberDetail} detail - File resolved server-side
 * @param {FieldDefinition[]} memberFields - Declarations of the file form
 * @param {FieldDefinition[]} noteFields - Declarations of the note form
 * @param {FieldDefinition[]} pimFields - Declarations of the review form
 * @param {FieldDefinition[]} socialFields - Declarations of the social form
 * @param {ActivityEntry[]} activity - Journal entries
 * @param {MemberOverride[]} overrides - Permission overrides
 * @param {boolean} canUpdate - Member may edit the file
 * @param {boolean} canReadNotes - Member may read private remarks
 * @param {boolean} canWriteNotes - Member may write private remarks
 * @param {boolean} canReadPims - Member may read reviews
 * @param {boolean} canWritePims - Member may record reviews
 * @param {boolean} canReadLogs - Member may read the journal
 * @param {boolean} canManageAccess - Member may change permissions
 * @return {JSX.Element}
 */

export const MemberFileTabs = ({
  detail,
  memberFields,
  noteFields,
  pimFields,
  socialFields,
  activity,
  overrides,
  canUpdate,
  canReadNotes,
  canWriteNotes,
  canReadPims,
  canWritePims,
  canReadLogs,
  canManageAccess,
}: MemberFileTabsProps) => {
  const router = useRouter()
  const file = useMemberFile(detail, overrides)
  const { contextMenu } = useMenu()
  const [tab, setTab] = useState('identity')
  const [dialog, setDialog] = useState<'identity' | 'note' | 'pim' | 'socials' | null>(null)
  const [pendingNote, setPendingNote] = useState<string | null>(null)

  const { summary } = detail
  const isLocked = summary.isRoot

  const openDialog = (next: typeof dialog) => {
    file.clearIssues()
    setDialog(next)
  }

  const tabs = [
    { value: 'identity', label: MEMBER_COPY.tabIdentity, icon: 'sheet' as const },
    ...(canReadNotes
      ? [{ value: 'notes', label: MEMBER_COPY.tabNotes, icon: 'note' as const, count: file.notes.length }]
      : []),
    { value: 'absences', label: MEMBER_COPY.tabAbsences, icon: 'absences' as const, count: detail.absences.length },
    { value: 'socials', label: MEMBER_COPY.tabSocials, icon: 'link' as const, count: file.socials.length },
    { value: 'academy', label: MEMBER_COPY.tabAcademy, icon: 'academy' as const },
    ...(canReadLogs ? [{ value: 'logs', label: MEMBER_COPY.tabLogs, icon: 'history' as const }] : []),
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

  return (
    <div className="flex flex-col gap-8">
      <Section title={MEMBER_COPY.identity} padded>
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={summary.displayName} src={summary.avatarUrl} size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h2 className="text-xl font-extrabold tracking-tight">{summary.displayName}</h2>
            <span className="flex flex-wrap items-center gap-2">
              <RoleBadge member={summary} />
              <DivisionBadge division={summary.division} />
              <MemberStatusBadge member={summary} />
              {summary.youtuber && (
                <Badge label={summary.youtuber.label} tone="info" icon="youtuber" />
              )}
            </span>
            <span className={METRIC_BLOCK.row}>
              <span className={METRIC_BLOCK.entry}>
                <span className={METRIC_BLOCK.value}>{detail.projectCount}</span>
                <span className={METRIC_BLOCK.label}>{MEMBER_COPY.projects}</span>
              </span>
              <span className={METRIC_BLOCK.entry}>
                <span className={METRIC_BLOCK.value}>{detail.taskCount}</span>
                <span className={METRIC_BLOCK.label}>{MEMBER_COPY.tasks}</span>
              </span>
              <span className={METRIC_BLOCK.entry}>
                <span className={METRIC_BLOCK.value}>{detail.meetingCount}</span>
                <span className={METRIC_BLOCK.label}>{MEMBER_COPY.meetings}</span>
              </span>
            </span>
          </div>
          <Button
            variant="primary"
            icon="edit"
            disabled={!canUpdate || isLocked}
            onClick={() => openDialog('identity')}
          >
            {ACTION_COPY.edit}
          </Button>
        </div>
        {isLocked && <p className={`${DETAIL_BLOCK.empty} pt-3`}>{MEMBER_COPY.rootLocked}</p>}
      </Section>

      <Tabs items={tabs} value={tab} onChange={setTab} label={MEMBER_COPY.title} />

      {tab === 'identity' && (
        <div className="flex flex-col gap-8">
          <Section title={MEMBER_COPY.contact} padded>
            <DetailGrid
              entries={[
                { label: FIELD_COPY.discordId, value: summary.discordId },
                { label: FIELD_COPY.email, value: detail.email },
                { label: FIELD_COPY.phone, value: detail.phone },
                {
                  label: FIELD_COPY.birthday,
                  value: detail.birthday ? (
                    <span className="flex flex-wrap items-center gap-2">
                      {formatDay(detail.birthday)}
                      <Badge
                        label={
                          detail.celebrateBirthday
                            ? MEMBER_COPY.birthdayCelebrated
                            : MEMBER_COPY.birthdayQuiet
                        }
                        tone={detail.celebrateBirthday ? 'success' : 'neutral'}
                        icon="birthday"
                      />
                    </span>
                  ) : null,
                },
                {
                  label: FIELD_COPY.languages,
                  value:
                    detail.languages.length > 0 ? (
                      <span className="flex flex-wrap gap-1.5">
                        {detail.languages.map((language) => (
                          <Badge key={language} label={language} tone="neutral" />
                        ))}
                      </span>
                    ) : null,
                },
              ]}
            />
          </Section>
          <Section title={MEMBER_COPY.assignment} padded>
            <DetailGrid
              entries={[
                { label: FIELD_COPY.youtuber, value: summary.youtuber?.label },
                { label: FIELD_COPY.division, value: summary.division?.label },
                { label: FIELD_COPY.mainFunction, value: summary.primaryFunction?.label },
                { label: FIELD_COPY.secondFunction, value: summary.secondaryFunction?.label },
                { label: FIELD_COPY.joinedAt, value: formatDay(summary.joinedAt) },
                { label: FIELD_COPY.leftAt, value: detail.leftAt ? formatDay(detail.leftAt) : null },
                {
                  label: FIELD_COPY.team,
                  value: detail.teams.length > 0 ? detail.teams.join(', ') : null,
                },
              ]}
            />
          </Section>
          {canReadPims && (
            <Section
              title={MEMBER_COPY.pimsTitle}
              description={MEMBER_COPY.pimsLead}
              action={
                file.pims.length > 0 && canWritePims ? (
                  <Button icon="add" onClick={() => openDialog('pim')}>
                    {MEMBER_COPY.pimAdd}
                  </Button>
                ) : undefined
              }
              padded={file.pims.length > 0}
            >
              {file.pims.length === 0 ? (
                <EmptyState
                  figure="notes"
                  title={MEMBER_COPY.pimsEmptyTitle}
                  description={MEMBER_COPY.pimsEmptyDescription}
                  action={
                    <Button
                      variant="primary"
                      icon="add"
                      disabled={!canWritePims}
                      onClick={() => openDialog('pim')}
                    >
                      {MEMBER_COPY.pimAdd}
                    </Button>
                  }
                />
              ) : (
                <div className="flex flex-col gap-4">
                  {file.pims.map((pim) => (
                    <article key={pim.id} className="flex flex-col gap-2">
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge label={formatDay(pim.heldAt)} tone="brand" icon="clock" />
                        {pim.authorName && (
                          <span className="text-xs text-[var(--color-ink-subtle)]">
                            {pim.authorName}
                          </span>
                        )}
                        <Button
                          variant="icon"
                          icon="remove"
                          className="ml-auto"
                          aria-label={ACTION_COPY.delete}
                          disabled={!canWritePims}
                          onClick={() => void file.removePim(pim.id)}
                        />
                      </span>
                      {pim.sheet.trim().length > 0 && <Markdown source={pim.sheet} />}
                    </article>
                  ))}
                </div>
              )}
            </Section>
          )}
          {canManageAccess && (
            <MemberAccessPanel
              overrides={file.overrides}
              isSaving={file.isSaving}
              onSave={file.saveOverrides}
            />
          )}
        </div>
      )}

      {tab === 'notes' && canReadNotes && (
        <Section
          title={MEMBER_COPY.notesTitle}
          description={MEMBER_COPY.notesLead}
          action={
            file.notes.length > 0 && canWriteNotes ? (
              <Button icon="add" onClick={() => openDialog('note')}>
                {MEMBER_COPY.noteAdd}
              </Button>
            ) : undefined
          }
          bare
        >
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
            </div>
          )}
        </Section>
      )}

      {tab === 'absences' && (
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
                      {absence.reason && (
                        <span className="truncate text-xs text-[var(--color-ink-subtle)]">
                          {absence.reason}
                        </span>
                      )}
                    </span>
                    <Badge label={`${absence.dayCount}`} tone="neutral" icon="clock" />
                    <Badge label={status.label} tone={toTone(status.accent)} dot />
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      )}

      {tab === 'socials' && (
        <Section
          title={MEMBER_COPY.socialsTitle}
          description={MEMBER_COPY.socialsLead}
          action={
            file.socials.length > 0 && canUpdate ? (
              <Button icon="edit" onClick={() => openDialog('socials')}>
                {MEMBER_COPY.socialsEdit}
              </Button>
            ) : undefined
          }
          bare
        >
          {file.socials.length === 0 ? (
            <EmptyState
              figure="settings"
              title={MEMBER_COPY.socialsEmptyTitle}
              description={
                socialFields.length === 0
                  ? MEMBER_COPY.socialsMissing
                  : MEMBER_COPY.socialsEmptyDescription
              }
              action={
                <Button
                  variant="primary"
                  icon="edit"
                  disabled={!canUpdate || socialFields.length === 0}
                  onClick={() => openDialog('socials')}
                >
                  {MEMBER_COPY.socialsEdit}
                </Button>
              }
            />
          ) : (
            <div className={LIST_STYLES.stack}>
              {file.socials.map((social) => (
                <div key={social.id} className={LIST_STYLES.item}>
                  <Badge label={social.networkName} tone={toTone(social.accent, 'brand')} />
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
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === 'academy' && (
        <Section title={MEMBER_COPY.tabAcademy} bare>
          {detail.trainings.length === 0 ? (
            <EmptyState
              figure="academy"
              title={MEMBER_COPY.academyEmptyTitle}
              description={MEMBER_COPY.academyEmptyDescription}
              action={<Badge label={MEMBER_COPY.academyEmptyTitle} tone="neutral" />}
            />
          ) : (
            <div className={LIST_STYLES.stack}>
              {detail.trainings.map((training) => (
                <div key={training.id} className={LIST_STYLES.item}>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-medium">{training.name}</span>
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {[
                        training.period ? ACADEMY_PERIOD_REGISTRY.label(training.period) : null,
                        training.validatorName,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  {training.mandatory && <Badge label={MEMBER_COPY.tabAcademy} tone="brand" />}
                  <Badge
                    label={training.completedAt ? formatDay(training.completedAt) : ACTION_COPY.none}
                    tone={training.completedAt ? 'success' : 'neutral'}
                    icon={training.completedAt ? 'success' : 'clock'}
                  />
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {tab === 'logs' && canReadLogs && (
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
      )}

      <FormDialog
        open={dialog === 'identity'}
        title={`${ACTION_COPY.edit} · ${summary.displayName}`}
        fields={memberFields}
        initialValues={detail.values}
        issues={file.issues}
        isSaving={file.isSaving}
        wide
        onSubmit={async (values) => {
          const saved = await file.saveIdentity(values)
          if (saved) router.refresh()

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
        open={dialog === 'pim'}
        title={MEMBER_COPY.pimAdd}
        fields={pimFields}
        issues={file.issues}
        isSaving={file.isSaving}
        wide
        onSubmit={file.addPim}
        onClose={() => setDialog(null)}
      />

      <FormDialog
        open={dialog === 'socials'}
        title={MEMBER_COPY.socialsEdit}
        fields={socialFields}
        initialValues={Object.fromEntries(
          file.socials.map((social) => [social.networkId, social.handle])
        )}
        issues={file.issues}
        isSaving={file.isSaving}
        onSubmit={file.saveSocials}
        onClose={() => setDialog(null)}
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
