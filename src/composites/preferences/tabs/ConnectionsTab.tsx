'use client'

import { CopyValue } from '@/components/elements/actions/CopyValue'
import { DetailGrid } from '@/components/structures/data/DetailGrid'
import { RoleGlyph } from '@/composites/members/MemberBadges'
import { AccountsSection } from '@/composites/preferences/AccountsSection'
import type { AccountsSectionProps } from '@/composites/preferences/AccountsSection'
import { SettingsGroup } from '@/composites/preferences/SettingsGroup'
import { MEMBER_FIELD_COPY } from '@/declarations/members/copy'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'
import type { ProfileDetail } from '@/types/preferences'

export interface ConnectionsTabProps extends Omit<AccountsSectionProps, 'discord'> {
  profile: ProfileDetail
}

/**
 * Accounts: how Memora knows you, then the platforms linked to it
 * @param {ConnectionsTabProps} props - Profile and linked platforms
 * @return {JSX.Element}
 */

export const ConnectionsTab = ({ profile, ...accounts }: ConnectionsTabProps) => (
  <div className={PREFERENCE_STYLES.stack}>
    <SettingsGroup title={PREFERENCES_COPY.signInTitle} lead={PREFERENCES_COPY.signInLead}>
      <DetailGrid
        entries={[
          { label: MEMBER_FIELD_COPY.memoraId, value: <CopyValue value={profile.id} /> },
          { label: FIELD_COPY.role, value: <RoleGlyph role={profile.role} /> },
        ]}
      />
    </SettingsGroup>
    <AccountsSection
      {...accounts}
      discord={{ id: profile.discordId, username: profile.discordUsername ?? profile.displayName }}
    />
  </div>
)
