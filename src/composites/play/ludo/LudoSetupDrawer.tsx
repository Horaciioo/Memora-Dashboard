'use client'

import { useState } from 'react'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { InfoHint } from '@/components/elements/feedback/InfoHint'
import type { PlaySetupProps } from '@/composites/play/registry'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import { SetupChips, SetupSection, SetupStepper } from '@/composites/play/setup/PlaySetupFields'
import { ludoSettingsOf } from '@/core/lib/play/ludo/settings'
import type { LudoGameSettings } from '@/core/lib/play/ludo/settings'
import { fillPlayMessage } from '@/declarations/play/copy'
import { LUDO_RULE_COPY, LUDO_SETUP_COPY } from '@/declarations/play/ludo/copy'
import { LUDO_SETTINGS, LudoEndings } from '@/declarations/play/ludo/settings'
import type { LudoExitRule, LudoRuleName } from '@/declarations/play/ludo/settings'
import { FIELD_STYLES, LUDO_SETUP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Tabs of the drawer
const TABS = [
  { value: 'game', label: LUDO_SETUP_COPY.tabGame, icon: 'playPawn' as const },
  { value: 'rules', label: LUDO_SETUP_COPY.tabRules, icon: 'playRules' as const },
]

// Exit rules as chips
const EXITS = (Object.keys(LUDO_SETTINGS.exits) as LudoExitRule[]).map((value) => ({
  value,
  label: LUDO_SETUP_COPY[value],
}))

// Endings as cards
const ENDINGS = [
  { value: LudoEndings.Podium, title: LUDO_SETUP_COPY.podium, note: LUDO_SETUP_COPY.podiumNote },
  { value: LudoEndings.First, title: LUDO_SETUP_COPY.first, note: LUDO_SETUP_COPY.firstNote },
]

// House rules, in reading order
const RULES = Object.keys(LUDO_RULE_COPY) as LudoRuleName[]

/**
 * Rules picked before a Ludo game opens
 * @param {PlaySetupProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const LudoSetupDrawer = ({ open, isSaving, onClose, onSubmit, current }: PlaySetupProps) => {
  const [settings, setSettings] = useState<LudoGameSettings>(() =>
    ludoSettingsOf(current?.settings ?? null)
  )
  const set =
    <K extends keyof LudoGameSettings>(key: K) =>
    (value: LudoGameSettings[K]) =>
      setSettings((current) => ({ ...current, [key]: value }))
  const setRule = (name: LudoRuleName) => (value: boolean) =>
    setSettings((current) => ({ ...current, rules: { ...current.rules, [name]: value } }))
  const steps = { less: LUDO_SETUP_COPY.less, more: LUDO_SETUP_COPY.more }

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      isEditing={Boolean(current)}
      canSubmit
      copy={LUDO_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onSubmit={() => onSubmit({ settings })}
    >
      {(tab) => (
        <div className={LUDO_SETUP.body}>
          {tab === 'game' && (
            <>
              <SetupSection
                styles={LUDO_SETUP}
                title={LUDO_SETUP_COPY.pawns}
                hint={LUDO_SETUP_COPY.pawnsHint}
              >
                <SetupStepper
                  styles={LUDO_SETUP}
                  value={settings.pawns}
                  range={LUDO_SETTINGS.pawns}
                  onChange={set('pawns')}
                  labels={steps}
                />
              </SetupSection>
              <SetupSection
                styles={LUDO_SETUP}
                title={LUDO_SETUP_COPY.turn}
                hint={LUDO_SETUP_COPY.turnHint}
              >
                <SetupStepper
                  styles={LUDO_SETUP}
                  value={settings.turnSeconds}
                  range={LUDO_SETTINGS.turnSeconds}
                  step={LUDO_SETTINGS.turnStep}
                  display={fillPlayMessage(LUDO_SETUP_COPY.seconds, {
                    seconds: settings.turnSeconds,
                  })}
                  onChange={set('turnSeconds')}
                  labels={steps}
                />
              </SetupSection>
              <SetupSection
                styles={LUDO_SETUP}
                title={LUDO_SETUP_COPY.exit}
                hint={LUDO_SETUP_COPY.exitHint}
              >
                <SetupChips
                  styles={LUDO_SETUP}
                  options={EXITS}
                  value={settings.exit}
                  onChange={set('exit')}
                />
              </SetupSection>
              <SetupSection styles={LUDO_SETUP} title={LUDO_SETUP_COPY.ending}>
                <div className={LUDO_SETUP.cards}>
                  {ENDINGS.map((ending) => (
                    <button
                      key={ending.value}
                      type="button"
                      aria-pressed={settings.ending === ending.value}
                      className={cn(
                        LUDO_SETUP.card,
                        settings.ending === ending.value && LUDO_SETUP.cardOn
                      )}
                      onClick={() => set('ending')(ending.value)}
                    >
                      <span className={LUDO_SETUP.cardTitle}>{ending.title}</span>
                      <span className={LUDO_SETUP.cardNote}>{ending.note}</span>
                    </button>
                  ))}
                </div>
              </SetupSection>
            </>
          )}

          {tab === 'rules' &&
            RULES.map((name) => (
              <div key={name} className={LUDO_SETUP.switchRow}>
                <span className={FIELD_STYLES.labelRow}>
                  <span className={LUDO_SETUP.switchLabel}>{LUDO_RULE_COPY[name].label}</span>
                  <InfoHint text={LUDO_RULE_COPY[name].hint} align="start" />
                </span>
                <Toggle
                  bare
                  checked={settings.rules[name]}
                  onChange={setRule(name)}
                  label={LUDO_RULE_COPY[name].label}
                />
              </div>
            ))}
        </div>
      )}
    </PlaySetupDrawer>
  )
}
