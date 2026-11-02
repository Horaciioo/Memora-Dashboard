'use client'

import { useState } from 'react'

import { CONCEPT_CLIPS } from '@/composites/play/hub/concept/conceptClips'
import { PLAY_CONCEPT, PLAY_CONCEPT_COPY } from '@/declarations/play/concept'
import { GOLF_POWERS } from '@/declarations/play/golf/powers'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_CONCEPT_UI } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Golf powers, one card each
 * @return {JSX.Element}
 */

const GolfPowerList = () => (
  <section className={PLAY_CONCEPT_UI.powers}>
    <h3 className={PLAY_CONCEPT_UI.powersTitle}>{PLAY_CONCEPT_COPY.powers}</h3>
    <ul className={PLAY_CONCEPT_UI.powerGrid}>
      {GOLF_POWERS.keys.map((key) => {
        const power = GOLF_POWERS.get(key)
        const Icon = ICONS[power.icon]

        return (
          <li key={key} className={PLAY_CONCEPT_UI.power}>
            <span
              className={cn(
                PLAY_CONCEPT_UI.powerIcon,
                power.isBonus ? PLAY_CONCEPT_UI.bonus : PLAY_CONCEPT_UI.malus
              )}
            >
              <Icon className={PLAY_CONCEPT_UI.glyph} aria-hidden="true" />
            </span>
            <span className={PLAY_CONCEPT_UI.powerText}>
              <span className={PLAY_CONCEPT_UI.powerHead}>
                <span className={PLAY_CONCEPT_UI.powerName}>{power.label}</span>
                <span
                  className={power.isBonus ? PLAY_CONCEPT_UI.kindBonus : PLAY_CONCEPT_UI.kindMalus}
                >
                  {power.isBonus ? PLAY_CONCEPT_COPY.bonus : PLAY_CONCEPT_COPY.malus}
                </span>
              </span>
              <span className={PLAY_CONCEPT_UI.powerEffect}>{power.effect}</span>
            </span>
          </li>
        )
      })}
    </ul>
  </section>
)

/**
 * How a game plays: short looping clips step by step, the golf powers after
 * @param {Object} props - Concept
 * @param {PlayGameName} props.game - Game
 * @return {JSX.Element}
 */

export const PlayConcept = ({ game }: { game: PlayGameName }) => {
  const steps = PLAY_CONCEPT[game]
  const [index, setIndex] = useState(0)
  const step = steps[index]
  const Clip = CONCEPT_CLIPS[step.clip]

  return (
    <div className={PLAY_CONCEPT_UI.root}>
      <figure className={PLAY_CONCEPT_UI.player}>
        {/* Keyed so each step replays from the start */}
        <div key={step.clip} className={PLAY_CONCEPT_UI.screen} aria-hidden="true">
          <Clip />
        </div>
        <div className={PLAY_CONCEPT_UI.bar} aria-hidden="true">
          <span className={PLAY_CONCEPT_UI.barPlay} />
          <span className={PLAY_CONCEPT_UI.track}>
            <span key={step.clip} className={PLAY_CONCEPT_UI.progress} />
          </span>
        </div>
        <figcaption className={PLAY_CONCEPT_UI.caption}>
          <span className={PLAY_CONCEPT_UI.stepTitle}>{step.title}</span>
          <span className={PLAY_CONCEPT_UI.stepText}>{step.text}</span>
        </figcaption>
      </figure>

      <nav className={PLAY_CONCEPT_UI.steps} aria-label={PLAY_CONCEPT_COPY.steps}>
        {steps.map((entry, at) => (
          <button
            key={entry.clip}
            type="button"
            className={cn(PLAY_CONCEPT_UI.stepKey, at === index && PLAY_CONCEPT_UI.stepKeyOn)}
            aria-current={at === index}
            onClick={() => setIndex(at)}
          >
            <span className={PLAY_CONCEPT_UI.stepNumber}>{at + 1}</span>
            {entry.title}
          </button>
        ))}
      </nav>

      {game === PlayGames.Golf && <GolfPowerList />}
    </div>
  )
}
