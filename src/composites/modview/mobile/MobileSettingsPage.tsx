'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import type { PageOption } from '@/components/structures/page/PageOptions'
import { EndLiveButton } from '@/composites/modview/EndLiveButton'
import { MobileActionsPanel } from '@/composites/modview/mobile/MobileActionsPanel'
import { PageOrderPanel } from '@/composites/modview/mobile/PageOrderPanel'
import { MobileUnbanDesk } from '@/composites/modview/mobile/MobileUnbanDesk'
import { PreferencesPanel } from '@/composites/modview/actions/PreferencesPanel'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useOwnLiveFigures } from '@/core/hooks/data/lives/useOwnLiveFigures'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import { LIVE_HUB_METRICS } from '@/declarations/lives/hub'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import { LIVE_HUB_STYLES, MODVIEW_MOBILE, MODVIEW_SETTINGS } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ModViewState } from '@/types/modview'
import { roughDuration } from '@/utils/format/time/hours'
import { cn } from '@/utils/classnames'

type SettingsSection = 'preferences' | 'actions' | 'windows' | 'pages' | 'unban'

// Entries of the home list, same pages as the desktop box
const SECTIONS: { key: SettingsSection; label: string; icon: IconName }[] = [
  { key: 'preferences', label: MODVIEW_ACTION_COPY.preferences, icon: 'settingsLine' },
  { key: 'actions', label: MODVIEW_ACTION_COPY.actionsPage, icon: 'modActions' },
  { key: 'windows', label: MODVIEW_ACTION_COPY.windowsPage, icon: 'maximize' },
  { key: 'pages', label: COPY.pagesSection, icon: 'drag' },
  { key: 'unban', label: COPY.unbanPage, icon: 'unbanRequest' },
]

export interface MobileSettingsPageProps {
  // Gestures of the page options, the window switches stay on the desktop
  options: PageOption[]
  endLiveId?: string
  // Live the unban requests are read on
  liveId: string | null
  state: ModViewState
  gate: GateCheck
  onAct: ActRunner
}

/**
 * What can be tuned from a phone: chat display, stream and the page gestures
 * @param {MobileSettingsPageProps} props - Page props
 * @return {JSX.Element}
 */

export const MobileSettingsPage = ({
  options,
  endLiveId,
  liveId,
  state,
  gate,
  onAct,
}: MobileSettingsPageProps) => {
  const { preferences, preview, commit, discard } = useModPreferences()
  const { session } = useAuthContext()
  const figures = useOwnLiveFigures()
  const [section, setSection] = useState<SettingsSection | null>(null)
  const BackIcon = ICONS.back
  const NextIcon = ICONS.next
  const gestures = options.flatMap((option) =>
    'onSelect' in option && option.id !== 'reset'
      ? [{ id: option.id, label: option.label, onSelect: option.onSelect }]
      : []
  )

  return (
    <div className={MODVIEW_MOBILE.pageBody}>
      <div className={MODVIEW_MOBILE.settings}>
        {session && section !== 'unban' && (
          <div className={MODVIEW_MOBILE.profileGroup}>
            <div className={MODVIEW_MOBILE.profile}>
              <Avatar
                name={session.displayName}
                src={session.avatarUrl}
                size="md"
                className={MODVIEW_MOBILE.profileAvatar}
              />
              <p className={MODVIEW_MOBILE.profileName}>{session.displayName}</p>
            </div>
            {figures && (
              <dl className={MODVIEW_MOBILE.profileStats}>
                {(Object.keys(LIVE_HUB_METRICS) as (keyof typeof LIVE_HUB_METRICS)[]).map((key) => {
                  const metric = LIVE_HUB_METRICS[key]
                  const Icon = ICONS[metric.icon]

                  return (
                    <div key={key} className={LIVE_HUB_STYLES.timelineChip}>
                      <Icon className={LIVE_HUB_STYLES.metricIcon} aria-hidden="true" />
                      <dd className={LIVE_HUB_STYLES.timelineValue}>
                        {key === 'time' && figures[key] > 0
                          ? roughDuration(figures[key] / 60)
                          : String(figures[key])}
                      </dd>
                      <dt className={LIVE_HUB_STYLES.timelineLabel}>{metric.label}</dt>
                    </div>
                  )
                })}
              </dl>
            )}
          </div>
        )}
        {section === null ? (
          <ul className={cn(MODVIEW_SETTINGS.list, 'my-auto')}>
            {SECTIONS.map(({ key, label, icon }) => {
              const Icon = ICONS[icon]

              return (
                <li key={key}>
                  <button
                    type="button"
                    className={MODVIEW_MOBILE.settingsEntry}
                    onClick={() => setSection(key)}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{label}</span>
                    <NextIcon className="size-4 shrink-0" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <>
            <button
              type="button"
              className={MODVIEW_MOBILE.settingsBack}
              onClick={() => setSection(null)}
            >
              <BackIcon className="size-4" aria-hidden="true" />
              {SECTIONS.find((entry) => entry.key === section)?.label}
            </button>
            {section === 'preferences' && (
              <>
                <ul className={MODVIEW_SETTINGS.list}>
                  <li className={MODVIEW_SETTINGS.row}>
                    <span>{COPY.showStream}</span>
                    <Toggle
                      bare
                      label={COPY.showStream}
                      checked={preferences.showStream}
                      onChange={(showStream) => preview({ showStream })}
                    />
                  </li>
                </ul>
                <PreferencesPanel />
              </>
            )}
            {section === 'actions' && <MobileActionsPanel />}
            {section === 'pages' && <PageOrderPanel />}
            {section === 'unban' && (
              <MobileUnbanDesk
                requests={state.unbanRequests}
                liveId={liveId}
                messages={state.messages}
                gate={gate}
                onAct={onAct}
              />
            )}
            {section === 'windows' && (
              <>
                {(gestures.length > 0 || endLiveId) && (
                  <ul className={MODVIEW_SETTINGS.list} aria-label={COPY.gestures}>
                    {gestures.map((option) => (
                      <li key={option.id}>
                        <button
                          type="button"
                          className={MODVIEW_SETTINGS.gesture}
                          onClick={option.onSelect}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                    {endLiveId && (
                      <li>
                        <EndLiveButton liveId={endLiveId} />
                      </li>
                    )}
                  </ul>
                )}
              </>
            )}
          </>
        )}
      </div>
      {section !== null && section !== 'unban' && (
        <div className={MODVIEW_MOBILE.settingsFoot}>
          <Button variant="secondary" onClick={discard}>
            {MODVIEW_ACTION_COPY.cancel}
          </Button>
          <Button variant="primary" onClick={commit}>
            {MODVIEW_ACTION_COPY.save}
          </Button>
        </div>
      )}
    </div>
  )
}
