'use client'

import { useState } from 'react'
import { CopyValue } from '@/components/elements/actions/CopyValue'
import { Button } from '@/components/elements/actions/Button'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { RoleGlyph } from '@/composites/members/MemberBadges'
import { DetailGrid } from '@/components/structures/data/DetailGrid'
import { FileTabs } from '@/components/structures/page/FileTabs'
import { FormRenderer } from '@/components/structures/data/FormRenderer'
import { Section } from '@/components/structures/page/Section'
import { SealedValue } from '@/components/structures/inline/SealedValue'
import { AccountsSection } from '@/composites/preferences/AccountsSection'
import { ProfileCard } from '@/composites/preferences/ProfileCard'
import { ColorVisionPreferences } from '@/composites/preferences/ColorVisionPreferences'
import { DisplayPreferences } from '@/composites/preferences/DisplayPreferences'
import { useProfile } from '@/core/hooks/data/people/useProfile'
import { replayGuides } from '@/app/(dashboard)/parametres/actions'
import { SENSITIVE_FIELD_REGISTRY, isSensitiveField } from '@/declarations/access/sensitive'
import type { SensitiveFieldName } from '@/declarations/access/sensitive'
import { useSeal } from '@/managers/infrastructure/Security/SealManager'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { ACTION_COPY, FIELD_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { GUIDES_CARD, PREFERENCE_STYLES, TABS_STYLES } from '@/declarations/ui/variants'

import type { FieldDefinition, FieldValue, FormValues } from '@/types/forms'
import type { PlatformLinkView } from '@/types/platforms'
import type { ProfileDetail } from '@/types/preferences'
import type { LivePlatformName } from '@/utils/constants/lives'

export interface PreferencesPanelProps {
  initialProfile: ProfileDetail
  fields: FieldDefinition[]
  links: PlatformLinkView[]
  available: Record<LivePlatformName, boolean>
  returned: { platform: LivePlatformName; result: string } | null
}

/**
 * Personal settings
 * @param {ProfileDetail} initialProfile - File resolved server-side
 * @param {FieldDefinition[]} fields - Declarations of the editable fields
 * @param {PlatformLinkView[]} links - Linked platform accounts
 * @param {Record<LivePlatformName, boolean>} available - Platforms that can be linked here
 * @param {{ platform: LivePlatformName, result: string } | null} returned - Link just ended
 * @return {JSX.Element}
 */

export const PreferencesPanel = ({
  initialProfile,
  fields,
  links,
  available,
  returned,
}: PreferencesPanelProps) => {
  const { profile, isSaving, issues, save } = useProfile(initialProfile)
  const { factor } = useSeal()
  const [draft, setDraft] = useState<FormValues>(initialProfile.values)

  const change = (name: string, value: FieldValue) =>
    setDraft((current) => ({ ...current, [name]: value }))

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
      </div>
    </div>
  )

  const displayTab = () => (
    <div className={TABS_STYLES.panel}>
      <div className={PREFERENCE_STYLES.stack}>
        <DisplayPreferences />
        <ColorVisionPreferences />
        <Section title={PREFERENCES_COPY.guidesSection} padded>
          <div className={GUIDES_CARD.card}>
            <ICONS.bell className={GUIDES_CARD.glyph} aria-hidden="true" />
            <div className={GUIDES_CARD.body}>
              <p className={GUIDES_CARD.title}>
                {PREFERENCES_COPY.guidesTitle} <MaturityTag maturity="beta" />
              </p>
              <p className={GUIDES_CARD.lead}>{PREFERENCES_COPY.guidesLead}</p>
              <p className={GUIDES_CARD.hint}>{PREFERENCES_COPY.guidesHint}</p>
            </div>
            <form action={replayGuides}>
              <Button type="submit" variant="secondary" icon="refresh">
                {PREFERENCES_COPY.guidesAction}
              </Button>
            </form>
          </div>
        </Section>
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
              { label: FIELD_COPY.discordId, value: <CopyValue value={profile.discordId} /> },
              { label: FIELD_COPY.role, value: <RoleGlyph role={profile.role} /> },
            ]}
          />
        </Section>
        <AccountsSection
          discord={{ id: profile.discordId }}
          links={links}
          available={available}
          returned={returned}
        />
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
