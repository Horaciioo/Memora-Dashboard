'use client'

import { useState } from 'react'

import { InfoHint } from '@/components/elements/feedback/InfoHint'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupChips, SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { navalSettingsOf } from '@/core/lib/play/naval/settings'
import type { NavalGameSettings } from '@/core/lib/play/naval/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_MODE_COPY, NAVAL_RULE_COPY, NAVAL_SETUP_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'
import type { NavalFormatName, NavalRuleName } from '@/declarations/play/naval/settings'
import { FIELD_STYLES } from '@/declarations/ui/variants'
import { NAVAL_SETUP } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'
import { NavalModes } from '@/utils/constants/play'

// Tabs of the drawer
const TABS = [
  { value: 'game', label: NAVAL_SETUP_COPY.tabGame, icon: 'playPawn' as const },
  { value: 'rules', label: NAVAL_SETUP_COPY.tabRules, icon: 'playRules' as const },
]

// Formats as chips
const FORMATS = (Object.keys(NAVAL_SETTINGS.formats) as NavalFormatName[]).map((value) => ({
  value,
  label: NAVAL_SETUP_COPY[value],
}))

// House rules, in reading order
const RULES = Object.keys(NAVAL_RULE_COPY) as NavalRuleName[]

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
      {(tab) => (
        <div className={NAVAL_SETUP.body}>
          {tab === 'game' && (
            <>
              <SetupSection styles={NAVAL_SETUP} title={NAVAL_SETUP_COPY.mode}>
                <div className={NAVAL_SETUP.cards}>
                  {Object.values(NavalModes).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={settings.mode === mode}
                      className={cn(NAVAL_SETUP.card, settings.mode === mode && NAVAL_SETUP.cardOn)}
                      onClick={() => set('mode')(mode)}
                    >
                      <span className={NAVAL_SETUP.cardTitle}>{NAVAL_MODE_COPY[mode].title}</span>
                      <span className={NAVAL_SETUP.cardNote}>{NAVAL_MODE_COPY[mode].note}</span>
                    </button>
                  ))}
                </div>
              </SetupSection>
              <SetupSection styles={NAVAL_SETUP} title={NAVAL_SETUP_COPY.format}>
                <SetupChips
                  styles={NAVAL_SETUP}
                  options={FORMATS}
                  value={settings.format}
                  onChange={set('format')}
                />
              </SetupSection>
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
            </>
          )}
          {tab === 'rules' &&
            RULES.map((name) => (
              <div key={name} className={NAVAL_SETUP.switchRow}>
                <span className={FIELD_STYLES.labelRow}>
                  <span className={NAVAL_SETUP.switchLabel}>{NAVAL_RULE_COPY[name].label}</span>
                  <InfoHint text={NAVAL_RULE_COPY[name].hint} align="start" />
                </span>
                <Toggle
                  bare
                  checked={settings.rules[name]}
                  onChange={setRule(name)}
                  label={NAVAL_RULE_COPY[name].label}
                />
              </div>
            ))}
        </div>
      )}
    </PlaySetupDrawer>
  )
}
