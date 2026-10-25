'use client'

import { useState } from 'react'

import { InfoHint } from '@/components/elements/feedback/InfoHint'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { clockLabel } from '@/composites/play/baccalaureat/clockLabel'
import { PlaySetupDrawer } from '@/composites/play/setup/PlaySetupDrawer'
import {
  SetupChips,
  SetupLetters,
  SetupSection,
  SetupStepper,
} from '@/composites/play/setup/PlaySetupFields'
import { BAC_SETUP_COPY, BACCALAUREAT_SETTINGS, fillPlayMessage } from '@/declarations/play'
import { BAC_SETUP, FIELD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Choice meaning a single game
const NO_TOURNAMENT = 0

// Tabs of the drawer
const TABS = [
  { value: 'letters', label: BAC_SETUP_COPY.tabLetters, icon: 'playLetters' as const },
  { value: 'rounds', label: BAC_SETUP_COPY.tabRounds, icon: 'playRounds' as const },
  { value: 'tournament', label: BAC_SETUP_COPY.tabTournament, icon: 'playBracket' as const },
]

// Clock presets as chips
const CLOCKS = BACCALAUREAT_SETTINGS.roundPresets.map((preset) => ({
  value: preset,
  label: clockLabel(preset),
}))

/**
 * Body sent to open the game
 * @typedef {Object} BacSetup
 */

export interface BacSetup {
  settings: {
    letters: string[]
    stop: boolean
    autoStop: boolean
    roundSeconds: number
    rounds: number
  }
  games?: number
}

export interface BacSetupDrawerProps {
  open: boolean
  isSaving: boolean
  onClose: () => void
  onCreate: (setup: BacSetup) => void
}

/**
 * Rules picked before a Baccalaureat game opens, one tab per theme
 * @param {BacSetupDrawerProps} props - Drawer state and handlers
 * @return {JSX.Element}
 */

export const BacSetupDrawer = ({ open, isSaving, onClose, onCreate }: BacSetupDrawerProps) => {
  const { alphabet, rounds: range, tournament } = BACCALAUREAT_SETTINGS
  const [letters, setLetters] = useState<string[]>(BACCALAUREAT_SETTINGS.letters)
  const [stop, setStop] = useState(BACCALAUREAT_SETTINGS.stop.enabled)
  const [autoStop, setAutoStop] = useState(false)
  const [seconds, setSeconds] = useState(BACCALAUREAT_SETTINGS.roundSeconds.initial)
  const [rounds, setRounds] = useState(range.initial)
  const [games, setGames] = useState(NO_TOURNAMENT)

  const isTournament = games !== NO_TOURNAMENT
  const played = isTournament ? tournament.rounds : rounds
  const isShort = letters.length < played
  const create = () =>
    onCreate({
      settings: {
        letters,
        stop,
        autoStop: stop && autoStop,
        roundSeconds: seconds,
        rounds: played,
      },
      ...(isTournament && { games }),
    })
  const tournaments = [
    {
      games: NO_TOURNAMENT,
      title: BAC_SETUP_COPY.tournamentNone,
      note: BAC_SETUP_COPY.tournamentNoneNote,
    },
    ...tournament.games.map((count) => ({
      games: count,
      title: fillPlayMessage(BAC_SETUP_COPY.tournamentGames, { games: count }),
      note: fillPlayMessage(BAC_SETUP_COPY.tournamentNote, { rounds: tournament.rounds }),
    })),
  ]

  return (
    <PlaySetupDrawer
      open={open}
      isSaving={isSaving}
      canCreate={!isShort}
      copy={BAC_SETUP_COPY}
      tabs={TABS}
      onClose={onClose}
      onCreate={create}
    >
      {(tab) => (
        <div className={BAC_SETUP.body}>
          {tab === 'letters' && (
            <SetupSection
              styles={BAC_SETUP}
              title={BAC_SETUP_COPY.letters}
              aside={
                <span className={BAC_SETUP.count}>
                  {fillPlayMessage(BAC_SETUP_COPY.lettersCount, {
                    count: letters.length,
                    total: alphabet.length,
                  })}
                </span>
              }
            >
              <SetupLetters
                styles={BAC_SETUP}
                alphabet={alphabet}
                value={letters}
                onChange={setLetters}
                labels={{ all: BAC_SETUP_COPY.lettersAll, none: BAC_SETUP_COPY.lettersNone }}
              />
              {isShort && (
                <p className={FIELD_STYLES.error}>
                  {fillPlayMessage(BAC_SETUP_COPY.tooFewLetters, { count: played })}
                </p>
              )}
            </SetupSection>
          )}

          {tab === 'rounds' && (
            <>
              <SetupSection
                styles={BAC_SETUP}
                title={BAC_SETUP_COPY.rounds}
                hint={
                  isTournament
                    ? fillPlayMessage(BAC_SETUP_COPY.roundsLocked, { rounds: tournament.rounds })
                    : BAC_SETUP_COPY.roundsHint
                }
              >
                <SetupStepper
                  styles={BAC_SETUP}
                  value={played}
                  range={range}
                  disabled={isTournament}
                  onChange={setRounds}
                  labels={BAC_SETUP_COPY}
                />
              </SetupSection>

              <SetupSection
                styles={BAC_SETUP}
                title={BAC_SETUP_COPY.roundSeconds}
                hint={BAC_SETUP_COPY.roundSecondsHint}
              >
                <SetupChips
                  styles={BAC_SETUP}
                  options={CLOCKS}
                  value={seconds}
                  onChange={setSeconds}
                />
              </SetupSection>

              <SetupSection
                styles={BAC_SETUP}
                title={BAC_SETUP_COPY.stop}
                hint={BAC_SETUP_COPY.stopHint}
              >
                <div className={BAC_SETUP.switchRow}>
                  <span className={BAC_SETUP.switchLabel}>{BAC_SETUP_COPY.stopEnable}</span>
                  <Toggle
                    bare
                    checked={stop}
                    onChange={setStop}
                    label={BAC_SETUP_COPY.stopEnable}
                  />
                </div>
                {stop && (
                  <div className={BAC_SETUP.switchRow}>
                    <span className={FIELD_STYLES.labelRow}>
                      <span className={BAC_SETUP.switchLabel}>{BAC_SETUP_COPY.autoStop}</span>
                      <InfoHint text={BAC_SETUP_COPY.autoStopHint} align="start" />
                    </span>
                    <Toggle
                      bare
                      checked={autoStop}
                      onChange={setAutoStop}
                      label={BAC_SETUP_COPY.autoStop}
                    />
                  </div>
                )}
              </SetupSection>
            </>
          )}

          {tab === 'tournament' && (
            <SetupSection
              styles={BAC_SETUP}
              title={BAC_SETUP_COPY.tournament}
              hint={BAC_SETUP_COPY.tournamentHint}
            >
              <div className={BAC_SETUP.cards}>
                {tournaments.map((entry) => (
                  <button
                    key={entry.games}
                    type="button"
                    aria-pressed={entry.games === games}
                    className={cn(BAC_SETUP.card, entry.games === games && BAC_SETUP.cardOn)}
                    onClick={() => setGames(entry.games)}
                  >
                    <span className={BAC_SETUP.cardTitle}>{entry.title}</span>
                    <span className={BAC_SETUP.cardNote}>{entry.note}</span>
                  </button>
                ))}
              </div>
            </SetupSection>
          )}
        </div>
      )}
    </PlaySetupDrawer>
  )
}
