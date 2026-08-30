'use client'

import { useState } from 'react'
import { AppearanceToggle } from '@/components/elements/actions/AppearanceToggle'
import { Button } from '@/components/elements/actions/Button'
import { ColorVisionSelect } from '@/components/elements/actions/ColorVisionSelect'
import { ThemeToggle } from '@/components/elements/actions/ThemeToggle'
import { FieldControl } from '@/components/elements/forms/FieldControl'
import { Badge } from '@/components/elements/display/Badge'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FileTabs } from '@/components/structures/FileTabs'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormRenderer } from '@/components/structures/FormRenderer'
import { Section } from '@/components/structures/Section'
import { useProfile } from '@/core/hooks/data/useProfile'
import { dropOtherSessions } from '@/app/(dashboard)/parametres/actions'
import { MEMBER_STATUS_REGISTRY, ROLE_REGISTRY } from '@/declarations/access/roles'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { ACCOUNT_BLOCK } from '@/declarations/ui/blocks'
import { ACTION_COPY, FIELD_COPY, NAV_COPY } from '@/declarations/ui/copy'
import { LIST_STYLES, PREFERENCE_STYLES, TABS_STYLES } from '@/declarations/ui/variants'

import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import type { AccountSession, ProfileDetail } from '@/types/preferences'
import { formatDay, formatDayTime } from '@/utils/format/dates'

export interface PreferencesPanelProps {
  initialProfile: ProfileDetail
  fields: FieldDefinition[]
  sessions: AccountSession[]
}

/**
 * Personal settings
 * @param {ProfileDetail} initialProfile - File resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the editable fields
 * @param {AccountSession[]} sessions - Open sessions
 * @return {JSX.Element}
 */

export const PreferencesPanel = ({ initialProfile, fields, sessions }: PreferencesPanelProps) => {
  const { profile, isSaving, issues, save, eraseDetails, download } = useProfile(initialProfile)
  const [isErasing, setErasing] = useState(false)
  const [draft, setDraft] = useState<FormValues>(initialProfile.values)

  const change = (name: string, value: FieldValue) =>
    setDraft((current) => ({ ...current, [name]: value }))

  const role = ROLE_REGISTRY.get(profile.role)
  const status = MEMBER_STATUS_REGISTRY.get(profile.status)
  const others = sessions.filter((entry) => !entry.isCurrent)

  // The portrait travels on its own
  const portraitField = fields.find((field) => field.name === 'avatarUrl')
  const ownedFields = fields.filter((field) => field.name !== 'avatarUrl')

  // A new portrait is written straight away
  const changePortrait = (value: FieldValue) => {
    change('avatarUrl', value)
    void save({ ...draft, avatarUrl: value })
  }

  const informationTab = () => (
    <div className={TABS_STYLES.panel}>
      <div className={PREFERENCE_STYLES.stack}>
        <Section title={PREFERENCES_COPY.fileTitle} description={PREFERENCES_COPY.fileLead} padded>
          <div className={PREFERENCE_STYLES.identity}>
            {portraitField && (
              <FieldControl
                id="profile-avatarUrl"
                field={portraitField}
                value={typeof draft.avatarUrl === 'string' ? draft.avatarUrl : null}
                disabled={isSaving}
                onChange={changePortrait}
              />
            )}
            <div className="flex min-w-0 flex-col gap-1">
              <p className={ACCOUNT_BLOCK.name}>{profile.displayName}</p>
              <p className={ACCOUNT_BLOCK.meta}>{profile.discordId}</p>
              <span className="flex flex-wrap gap-1.5">
                <Badge label={role.label} accent={role.accent} tone={'brand'} dot />
                <Badge label={status.label} accent={status.accent} tone={'neutral'} dot />
              </span>
            </div>
          </div>
          <DetailGrid
            entries={[
              { label: FIELD_COPY.division, value: profile.division },
              {
                label: FIELD_COPY.youtuber,
                value: profile.youtubers.length > 0 ? profile.youtubers.join(', ') : null,
              },
              { label: FIELD_COPY.mainFunction, value: profile.primaryFunction },
              { label: FIELD_COPY.secondFunction, value: profile.secondaryFunction },
              {
                label: FIELD_COPY.joinedAt,
                value: formatDay(profile.joinedAt),
              },
              {
                label: PREFERENCES_COPY.academyDispositif,
                value: profile.academyDispositif ?? undefined,
              },
            ]}
          />
        </Section>

        <Section
          title={PREFERENCES_COPY.informationTitle}
          description={PREFERENCES_COPY.informationLead}
          padded
        >
          <FormRenderer
            fields={ownedFields}
            values={draft}
            issues={issues}
            onChange={change}
            disabled={isSaving}
            idPrefix="profile"
          />
          <div className={PREFERENCE_STYLES.footer}>
            <Button
              variant="primary"
              icon="confirm"
              disabled={isSaving}
              onClick={() => void save(draft)}
            >
              {isSaving ? ACTION_COPY.saving : ACTION_COPY.save}
            </Button>
          </div>
        </Section>

        <Section
          title={PREFERENCES_COPY.privacyTitle}
          description={PREFERENCES_COPY.privacyLead}
          padded
        >
          <div className={PREFERENCE_STYLES.footer}>
            <Button
              variant="danger"
              icon="remove"
              disabled={isSaving}
              onClick={() => setErasing(true)}
            >
              {PREFERENCES_COPY.eraseDetails}
            </Button>
          </div>
        </Section>

        <Section
          title={PREFERENCES_COPY.exportTitle}
          description={PREFERENCES_COPY.exportLead}
          padded
        >
          <div className={PREFERENCE_STYLES.footer}>
            <Button
              variant="secondary"
              icon="sheet"
              disabled={isSaving}
              onClick={() => void download()}
            >
              {isSaving ? PREFERENCES_COPY.exportPending : PREFERENCES_COPY.exportAction}
            </Button>
          </div>
        </Section>
      </div>

      <ConfirmDialog
        open={isErasing}
        title={PREFERENCES_COPY.eraseConfirmTitle}
        description={PREFERENCES_COPY.eraseConfirmDescription}
        confirmLabel={PREFERENCES_COPY.eraseDetails}
        tone="danger"
        onCancel={() => setErasing(false)}
        onConfirm={() => {
          setErasing(false)
          void eraseDetails()
        }}
      />
    </div>
  )

  const displayTab = () => (
    <div className={TABS_STYLES.panel}>
      <Section
        title={PREFERENCES_COPY.displayTitle}
        description={PREFERENCES_COPY.displayLead}
        padded
      >
        <div className={PREFERENCE_STYLES.rows}>
          <div className={PREFERENCE_STYLES.row}>
            <span className={PREFERENCE_STYLES.label}>{NAV_COPY.theme}</span>
            <ThemeToggle />
          </div>
          <div className={PREFERENCE_STYLES.row}>
            <span className="flex flex-wrap items-center gap-2">
              <span className={PREFERENCE_STYLES.label}>{NAV_COPY.textSize}</span>
              <MaturityTag maturity="beta" />
            </span>
            <AppearanceToggle />
          </div>
          <div className={PREFERENCE_STYLES.row}>
            <span className="flex flex-wrap items-center gap-2">
              <span className={PREFERENCE_STYLES.label}>{NAV_COPY.colorVision}</span>
              <MaturityTag maturity="beta" />
            </span>
            <ColorVisionSelect />
          </div>
        </div>
        <p className={PREFERENCE_STYLES.notice}>{PREFERENCES_COPY.storageNotice}</p>
      </Section>
    </div>
  )

  const securityTab = () => (
    <div className={TABS_STYLES.panel}>
      <div className={PREFERENCE_STYLES.stack}>
        <Section
          title={PREFERENCES_COPY.signInTitle}
          description={PREFERENCES_COPY.signInLead}
          padded
        >
          <DetailGrid
            entries={[
              { label: FIELD_COPY.discordId, value: profile.discordId },
              { label: FIELD_COPY.role, value: role.label },
            ]}
          />
        </Section>

        <Section
          title={PREFERENCES_COPY.sessionsTitle}
          description={PREFERENCES_COPY.sessionsLead}
          action={<MaturityTag maturity="beta" />}
          padded
        >
          <div className={LIST_STYLES.stack}>
            {sessions.map((entry) => (
              <div key={entry.id} className={LIST_STYLES.item}>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {entry.userAgent ?? PREFERENCES_COPY.unknownDevice}
                </span>
                <span className={PREFERENCE_STYLES.notice}>
                  {`${PREFERENCES_COPY.lastUsedAt} ${formatDayTime(entry.lastUsedAt)}`}
                </span>
                {entry.isCurrent && (
                  <Badge label={PREFERENCES_COPY.currentSession} tone="success" dot />
                )}
              </div>
            ))}
          </div>
          <div className={PREFERENCE_STYLES.footer}>
            {others.length === 0 ? (
              <p className={PREFERENCE_STYLES.notice}>{PREFERENCES_COPY.onlySession}</p>
            ) : (
              <form action={dropOtherSessions}>
                <Button type="submit" variant="danger">
                  {PREFERENCES_COPY.closeOthers}
                </Button>
              </form>
            )}
          </div>
        </Section>
      </div>
    </div>
  )

  return (
    <div className={PREFERENCE_STYLES.stack}>
      <FileTabs
        label={PREFERENCES_COPY.title}
        tabs={[
          {
            value: 'information',
            label: PREFERENCES_COPY.tabInformation,
            icon: 'sheet',
            render: informationTab,
          },
          {
            value: 'display',
            label: PREFERENCES_COPY.tabDisplay,
            icon: 'light',
            render: displayTab,
          },
          {
            value: 'security',
            label: PREFERENCES_COPY.tabSecurity,
            icon: 'shield',
            render: securityTab,
          },
        ]}
      />
    </div>
  )
}
