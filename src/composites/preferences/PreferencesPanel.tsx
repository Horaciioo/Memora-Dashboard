'use client'

import { useState } from 'react'

import { FileTabs } from '@/components/structures/page/FileTabs'
import { PlayStatsBoard } from '@/composites/play/member/PlayStatsBoard'
import { ProfileCard } from '@/composites/preferences/ProfileCard'
import type { AccountsSectionProps } from '@/composites/preferences/AccountsSection'
import { AppearanceTab } from '@/composites/preferences/tabs/AppearanceTab'
import { ConnectionsTab } from '@/composites/preferences/tabs/ConnectionsTab'
import { NotificationsTab } from '@/composites/preferences/tabs/NotificationsTab'
import { PreferencesTab } from '@/composites/preferences/tabs/PreferencesTab'
import { PrivacyTab } from '@/composites/preferences/tabs/PrivacyTab'
import { ProfileTab } from '@/composites/preferences/tabs/ProfileTab'
import { SecurityTab } from '@/composites/preferences/tabs/SecurityTab'
import { useProfile } from '@/core/hooks/data/people/useProfile'
import type { NavigationItem } from '@/declarations/navigation'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { SETTINGS_TABS } from '@/declarations/preferences/settings'
import type { SettingsTabName } from '@/declarations/preferences/settings'
import { TABS_STYLES, PREFERENCE_STYLES } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { PlayProfileView } from '@/types/play'
import type { ProfileDetail, AccountSession } from '@/types/preferences'
import type { PushSettingsView } from '@/types/push'

export interface PreferencesPanelProps extends Omit<AccountsSectionProps, 'discord'> {
  initialProfile: ProfileDetail
  fields: FieldDefinition[]
  // Memora Play stats, for members it opens to
  play: PlayProfileView | null
  push: { publicKey: string | null; settings: PushSettingsView }
  dock: { candidates: NavigationItem[]; saved: string[] }
  sessions: AccountSession[]
}

/**
 * Personal settings: the identity box beside seven tabs
 * @param {PreferencesPanelProps} props - Everything the page resolved server-side
 * @return {JSX.Element}
 */

export const PreferencesPanel = ({
  initialProfile,
  fields,
  links,
  available,
  returned,
  play,
  push,
  dock,
  sessions,
}: PreferencesPanelProps) => {
  const state = useProfile(initialProfile)
  const { profile } = state
  const [tab, setTab] = useState<string>('information')

  // One tab of the strip, its panel framed the same way
  const entry = (name: SettingsTabName, render: () => React.ReactNode) => ({
    value: name,
    label: SETTINGS_TABS[name].label,
    icon: SETTINGS_TABS[name].icon,
    render: () => <div className={TABS_STYLES.panel}>{render()}</div>,
  })

  return (
    <div className={PREFERENCE_STYLES.layout}>
      {/* On a phone the identity box belongs to the first tab alone */}
      <div className={tab === 'information' ? 'contents' : 'hidden md:contents'}>
        <ProfileCard profile={profile} />
      </div>
      <FileTabs
        label={PREFERENCES_COPY.title}
        value={tab}
        onChange={setTab}
        tabs={[
          entry('information', () => (
            <ProfileTab state={state} fields={fields} initialValues={initialProfile.values} />
          )),
          entry('appearance', () => <AppearanceTab />),
          entry('preferences', () => <PreferencesTab dock={dock} />),
          entry('notifications', () => <NotificationsTab push={push} />),
          entry('connections', () => (
            <ConnectionsTab
              profile={profile}
              links={links}
              available={available}
              returned={returned}
            />
          )),
          entry('security', () => <SecurityTab sessions={sessions} links={links} />),
          entry('privacy', () => <PrivacyTab state={state} />),
          ...(play
            ? [
                {
                  value: 'play',
                  label: PREFERENCES_COPY.tabPlay,
                  icon: 'play' as const,
                  render: () => (
                    <div className={TABS_STYLES.panel}>
                      <PlayStatsBoard
                        state={play}
                        player={{ name: profile.displayName, avatarUrl: profile.avatarUrl }}
                      />
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
    </div>
  )
}
