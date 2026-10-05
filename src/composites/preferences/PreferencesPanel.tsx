'use client'

import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { RoleGlyph } from '@/composites/members/MemberBadges'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { FileTabs } from '@/components/structures/FileTabs'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { FormRenderer } from '@/components/structures/FormRenderer'
import { ActionRow } from '@/components/structures/ActionRow'
import { Section } from '@/components/structures/Section'
import { SealedValue } from '@/components/structures/SealedValue'
import { ProfileCard } from '@/composites/preferences/ProfileCard'
import { DisplayPreferences } from '@/composites/preferences/DisplayPreferences'
import { PlatformLinksSection } from '@/composites/preferences/PlatformLinksSection'
import { TwoFactorSection } from '@/composites/security/TwoFactorSection'
import { useProfile } from '@/core/hooks/data/useProfile'
import { dropOtherSessions, replayGuides } from '@/app/(dashboard)/parametres/actions'
import { SENSITIVE_FIELD_REGISTRY, isSensitiveField } from '@/declarations/access/sensitive'
import type { SensitiveFieldName } from '@/declarations/access/sensitive'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { DETAIL_BLOCK, SECURITY_LIST } from '@/declarations/ui/blocks'
import { ACTION_COPY, FIELD_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { ACTION_ROW, PREFERENCE_STYLES, TABS_STYLES } from '@/declarations/ui/variants'

import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import type { AccountSession, ProfileDetail } from '@/types/preferences'
import type { PlatformLinkView } from '@/types/platforms'
import { formatDay, formatDayTime } from '@/utils/format/dates'
import { readDevice } from '@/utils/format/device'

export interface PreferencesPanelProps {
  initialProfile: ProfileDetail
  fields: FieldDefinition[]
  sessions: AccountSession[]
  platformLinks: PlatformLinkView[]
  twitchAvailable: boolean
}

/**
 * Personal settings
 * @param {ProfileDetail} initialProfile - File resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the editable fields
 * @param {AccountSession[]} sessions - Open sessions
 * @param {PlatformLinkView[]} platformLinks - Linked platform accounts
 * @param {boolean} twitchAvailable - Twitch link offered
 * @return {JSX.Element}
 */

export const PreferencesPanel = ({
  initialProfile,
  fields,
  sessions,
  platformLinks,
  twitchAvailable,
}: PreferencesPanelProps) => {
  const { profile, isSaving, issues, save, eraseDetails, download } = useProfile(initialProfile)
  const { factor } = useSeal()
  const [isErasing, setErasing] = useState(false)
  const [draft, setDraft] = useState<FormValues>(initialProfile.values)

  const change = (name: string, value: FieldValue) =>
    setDraft((current) => ({ ...current, [name]: value }))

  const others = sessions.filter((entry) => !entry.isCurrent)

  // A sealed value never reaches the form engine
  const isSealed = !factor.seal.isUnsealed
  const ownedFields = fields.filter((field) => !(isSealed && isSensitiveField(field.name)))
  const sealedNames = isSealed
    ? fields
        .map((field) => field.name)
        .filter((name): name is SensitiveFieldName => isSensitiveField(name))
    : []

  const informationTab = () => (
    <div className={TABS_STYLES.panel}>
      <div className={PREFERENCE_STYLES.stack}>
        <Section
          title={PREFERENCES_COPY.informationTitle}
          description={PREFERENCES_COPY.informationLead}
          padded
        >
          {sealedNames.length > 0 && (
            <dl className={`${DETAIL_BLOCK.grid} mb-6`}>
              {sealedNames.map((name) => (
                <div key={name} className={DETAIL_BLOCK.entry}>
                  <dt className={DETAIL_BLOCK.label}>{SENSITIVE_FIELD_REGISTRY.label(name)}</dt>
                  <dd className={DETAIL_BLOCK.value}>
                    <SealedValue field={name} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
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
              className="w-full"
              disabled={isSaving}
              onClick={() => void save(draft)}
            >
              {isSaving ? ACTION_COPY.saving : ACTION_COPY.save}
            </Button>
          </div>
        </Section>

        <Section title={PREFERENCES_COPY.dataTitle} padded>
          <div className={ACTION_ROW.list}>
            <ActionRow
              title={PREFERENCES_COPY.exportTitle}
              description={PREFERENCES_COPY.exportLead}
            >
              <Button
                variant="secondary"
                icon="sheet"
                disabled={isSaving}
                onClick={() => void download()}
              >
                {isSaving ? PREFERENCES_COPY.exportPending : PREFERENCES_COPY.exportAction}
              </Button>
            </ActionRow>
            <ActionRow
              title={PREFERENCES_COPY.privacyTitle}
              description={PREFERENCES_COPY.privacyLead}
            >
              <Button
                variant="danger"
                icon="remove"
                disabled={isSaving}
                onClick={() => setErasing(true)}
              >
                {PREFERENCES_COPY.eraseDetails}
              </Button>
            </ActionRow>
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
      <div className={PREFERENCE_STYLES.stack}>
        <DisplayPreferences>
          <ActionRow title={PREFERENCES_COPY.guidesTitle} description={PREFERENCES_COPY.guidesLead}>
            <form action={replayGuides}>
              <Button type="submit" variant="secondary" icon="refresh">
                {PREFERENCES_COPY.guidesAction}
              </Button>
            </form>
          </ActionRow>
        </DisplayPreferences>
      </div>
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
              { label: FIELD_COPY.role, value: <RoleGlyph role={profile.role} /> },
            ]}
          />
        </Section>

        <TwoFactorSection />

        <PlatformLinksSection links={platformLinks} twitchAvailable={twitchAvailable} />

        <Section
          title={PREFERENCES_COPY.sessionsTitle}
          description={PREFERENCES_COPY.sessionsLead}
          action={<MaturityTag maturity="beta" />}
          padded
        >
          <ul className={SECURITY_LIST.list}>
            {sessions.map((entry) => {
              const device = readDevice(entry.userAgent)
              const Glyph = ICONS[device.icon]
              const kind = device.isMobile
                ? PREFERENCES_COPY.mobileDevice
                : PREFERENCES_COPY.desktopDevice

              return (
                <li key={entry.id} className={SECURITY_LIST.row}>
                  <Glyph className={SECURITY_LIST.glyph} />
                  <div className={SECURITY_LIST.body}>
                    <p className={SECURITY_LIST.title}>
                      {device.browser ?? PREFERENCES_COPY.unknownDevice}
                      {entry.isCurrent && (
                        <span className={SECURITY_LIST.current}>
                          {PREFERENCES_COPY.currentSession}
                        </span>
                      )}
                    </p>
                    <p className={SECURITY_LIST.meta}>
                      <span>{device.system ?? kind}</span>
                      <span>· {kind}</span>
                    </p>
                  </div>
                  <span className={SECURITY_LIST.time}>{formatDayTime(entry.lastUsedAt)}</span>
                </li>
              )
            })}
          </ul>
          <div className={SECURITY_LIST.footer}>
            {others.length === 0 ? (
              <p className={PREFERENCE_STYLES.notice}>{PREFERENCES_COPY.onlySession}</p>
            ) : (
              <form action={dropOtherSessions}>
                <Button type="submit" variant="danger" className="w-full">
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
    <div className={PREFERENCE_STYLES.layout}>
      <ProfileCard profile={profile} />
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
