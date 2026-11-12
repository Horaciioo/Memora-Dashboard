'use client'

import { useState } from 'react'

import { InfoHint } from '@/components/elements/feedback/InfoHint'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { navalSettingsOf } from '@/core/lib/play/naval/settings'
import type { NavalGameSettings } from '@/core/lib/play/naval/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_RULE_COPY, NAVAL_SETUP_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import type { NavalRuleName } from '@/declarations/play/naval/settings'
import { FIELD_STYLES } from '@/declarations/ui/variants'
import { NAVAL_SETUP } from '@/declarations/ui/variants/games/naval'

// Tabs of the drawer
const TABS = [{ value: 'game', label: NAVAL_SETUP_COPY.tabGame, icon: 'playPawn' as const }]

// Mode, map and hit replay are voted at launch, spaced ships stay here
const RULE: NavalRuleName = 'spacedShips'

/**
 * Choices made before a naval battle opens
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const NavalSetupDrawer = ({
  open,
  isSaving,
  onClose,
  onSubmit,
  current,
}: PlaySetupProps) => {
  const [settings, setSettings] = useState<NavalGameSettings>(() =>
    navalSettingsOf(current?.settings ?? null)
  )
  const set =
    <K extends keyof NavalGameSettings>(key: K) =>
    (value: NavalGameSettings[K]) =>
      setSettings((held) => ({ ...held, [key]: value }))
  const setRule = (name: NavalRuleName) => (value: boolean) =>
    setSettings((held) => ({ ...held, rules: { ...held.rules, [name]: value } }))
  const steps = { less: NAVAL_SETUP_COPY.less, more: NAVAL_SETUP_COPY.more }

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit
      copy={NAVAL_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {() => (
        <div className={NAVAL_SETUP.body}>
          <SetupSection
            styles={NAVAL_SETUP}
            title={NAVAL_SETUP_COPY.turn}
            hint={NAVAL_SETUP_COPY.turnHint}
          >
            <SetupStepper
              styles={NAVAL_SETUP}
              value={settings.turnSeconds}
              range={NAVAL_SETTINGS.turnSeconds}
              step={5}
              display={fillPlayMessage(NAVAL_SETUP_COPY.seconds, {
                seconds: settings.turnSeconds,
              })}
              onChange={set('turnSeconds')}
              labels={steps}
            />
          </SetupSection>
          <SetupSection
            styles={NAVAL_SETUP}
            title={NAVAL_SETUP_COPY.placement}
            hint={NAVAL_SETUP_COPY.placementHint}
          >
            <SetupStepper
              styles={NAVAL_SETUP}
              value={settings.placementSeconds}
              range={NAVAL_SETTINGS.placementSeconds}
              step={15}
              display={fillPlayMessage(NAVAL_SETUP_COPY.seconds, {
                seconds: settings.placementSeconds,
              })}
              onChange={set('placementSeconds')}
              labels={steps}
            />
          </SetupSection>
          <div className={NAVAL_SETUP.switchRow}>
            <span className={FIELD_STYLES.labelRow}>
              <span className={NAVAL_SETUP.switchLabel}>{NAVAL_RULE_COPY[RULE].label}</span>
              <InfoHint text={NAVAL_RULE_COPY[RULE].hint} align="start" />
            </span>
            <Toggle
              bare
              checked={settings.rules[RULE]}
              onChange={setRule(RULE)}
              label={NAVAL_RULE_COPY[RULE].label}
            />
          </div>
        </div>
      )}
    </PlaySetupDrawer>
  )
}
