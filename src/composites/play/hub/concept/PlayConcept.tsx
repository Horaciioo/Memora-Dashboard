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
 * How a game plays, numbered steps then the golf powers
 * @param {Object} props - Concept
 * @param {PlayGameName} props.game - Game
 * @return {JSX.Element}
 */

export const PlayConcept = ({ game }: { game: PlayGameName }) => (
  <div className={PLAY_CONCEPT_UI.root}>
    <ol className={PLAY_CONCEPT_UI.list}>
      {PLAY_CONCEPT[game].map((step, at) => (
        <li key={step.title} className={PLAY_CONCEPT_UI.step}>
          <span className={PLAY_CONCEPT_UI.stepNumber}>{at + 1}</span>
          <span className={PLAY_CONCEPT_UI.stepBody}>
            <span className={PLAY_CONCEPT_UI.stepTitle}>{step.title}</span>
            <span className={PLAY_CONCEPT_UI.stepText}>{step.text}</span>
          </span>
        </li>
      ))}
    </ol>

    {game === PlayGames.Golf && <GolfPowerList />}
  </div>
)
