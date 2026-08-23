'use client'

import { useState } from 'react'
import { AppearanceToggle } from '@/components/elements/actions/AppearanceToggle'
import { Button } from '@/components/elements/actions/Button'
import { ColorVisionSelect } from '@/components/elements/actions/ColorVisionSelect'
import { ThemeToggle } from '@/components/elements/actions/ThemeToggle'
import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FileTabs } from '@/components/structures/FileTabs'
import { FormRenderer } from '@/components/structures/FormRenderer'
import { Section } from '@/components/structures/Section'
import { LogoutButton } from '@/composites/auth/LogoutButton'
import { useProfile } from '@/core/hooks/data/useProfile'
import { dropOtherSessions } from '@/app/(dashboard)/parametres/actions'
import {
  ACADEMY_PERIOD_REGISTRY,
  MEMBER_STATUS_REGISTRY,
  ROLE_REGISTRY,
} from '@/declarations/access/roles'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { ACCOUNT_BLOCK } from '@/declarations/ui/blocks'
import { ACTION_COPY, FIELD_COPY, NAV_COPY } from '@/declarations/ui/copy'
import { LIST_STYLES, PREFERENCE_STYLES, TABS_STYLES } from '@/declarations/ui/variants'
import { toTone } from '@/declarations/ui/theme'
import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import type { AccountSession, ProfileDetail } from '@/types/preferences'
import { formatDay, formatDayTime } from '@/utils/format/dates'

export interface PreferencesPanelProps {
  initialProfile: ProfileDetail
  fields: FieldDefinition[]
  sessions: AccountSession[]
  avatarUrl: string | null
}

/**
 * Personal settings — the file a member owns, the display they chose, and the sessions
 * currently signed in as them
 * @param {ProfileDetail} initialProfile - File resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the editable fields
 * @param {AccountSession[]} sessions - Open sessions
 * @param {string | null} avatarUrl - Portrait of the signed-in member
 * @return {JSX.Element}
 */

export const PreferencesPanel = ({
  initialProfile,
  fields,
  sessions,
  avatarUrl,
}: PreferencesPanelProps) => {
  const { profile, isSaving, issues, save } = useProfile(initialProfile)
  const [draft, setDraft] = useState<FormValues>(initialProfile.values)

  const change = (name: string, value: FieldValue) =>
    setDraft((current) => ({ ...current, [name]: value }))

  const role = ROLE_REGISTRY.get(profile.role)
  const status = MEMBER_STATUS_REGISTRY.get(profile.status)
  const others = sessions.filter((entry) => !entry.isCurrent)

  const informationTab = () => (
    <div className={TABS_STYLES.panel}>
      <div className={PREFERENCE_STYLES.stack}>
        <Section
          title={PREFERENCES_COPY.informationTitle}
          description={PREFERENCES_COPY.informationLead}
          padded
        >
          <FormRenderer
            fields={fields}
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

        <Section title={PREFERENCES_COPY.fileTitle} description={PREFERENCES_COPY.fileLead} padded>
          <div className={PREFERENCE_STYLES.identity}>
            <Avatar name={profile.displayName} src={avatarUrl} size="lg" />
            <div className="flex min-w-0 flex-col gap-1">
              <p className={ACCOUNT_BLOCK.name}>{profile.displayName}</p>
              <p className={ACCOUNT_BLOCK.meta}>{profile.discordId}</p>
              <span className="flex flex-wrap gap-1.5">
                <Badge label={role.label} tone={toTone(role.accent, 'brand')} dot />
                <Badge label={status.label} tone={toTone(status.accent, 'neutral')} dot />
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
                label: PREFERENCES_COPY.academyPeriod,
                value: profile.academyPeriod
                  ? ACADEMY_PERIOD_REGISTRY.label(profile.academyPeriod)
                  : undefined,
              },
            ]}
          />
        </Section>
      </div>
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
            <span className={PREFERENCE_STYLES.label}>{NAV_COPY.textSize}</span>
            <AppearanceToggle />
          </div>
          <div className={PREFERENCE_STYLES.row}>
            <span className={PREFERENCE_STYLES.label}>{NAV_COPY.colorVision}</span>
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
          padded
        >
          <div className={LIST_STYLES.stack}>
            {sessions.map((entry) => (
              <div key={entry.id} className={LIST_STYLES.item}>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {entry.userAgent ?? PREFERENCES_COPY.unknownDevice}
                </span>
                <span className={PREFERENCE_STYLES.notice}>
                  {`${PREFERENCES_COPY.openedAt} ${formatDayTime(entry.createdAt)}`}
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

        <Section
          title={PREFERENCES_COPY.leaveTitle}
          description={PREFERENCES_COPY.leaveLead}
          padded
        >
          <div className="flex justify-end">
            <LogoutButton />
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
