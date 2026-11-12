import type { CSSProperties, ReactNode } from 'react'

import { LudoChaosGlyph } from '@/composites/play/ludo/LudoChaosGlyph'
import { LudoFxDie } from '@/composites/play/ludo/LudoFxDie'
import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import type { LudoCue } from '@/composites/play/ludo/chaosMotion'
import { pawnPoint, turnPoint } from '@/core/lib/play/ludo'
import type { LudoMap } from '@/core/lib/play/ludo'
import { fillPlayMessage } from '@/declarations/play/copy'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import type { LudoCornerName } from '@/declarations/play/ludo/board'
import { LUDO_CHAOS } from '@/declarations/play/ludo/chaos'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'
import { LUDO_CHAOS_COPY, LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { LUDO_FX } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Small things drawn around a spot
const range = (count: number) => Array.from({ length: count }, (_, index) => index)
const WISPS = range(10)
const STREAKS = range(14)
const SPARKS = range(12)
const SHARDS = range(7)
const PUFFS = range(5)
const ZEES = range(3)
const ORBITS = range(4)

// Pseudo random in [0, 1) from an index, so a scene never changes between renders
const noise = (index: number, salt: number): number =>
  Math.abs((Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453) % 1)

/**
 * Value of a custom property
 * @param {Record<string, string | number>} vars - Variables
 * @return {CSSProperties} - Style
 */

const vars = (values: Record<string, string | number>): CSSProperties => values as CSSProperties

// Turns each timed effect lasts
const EFFECT_TURNS: Partial<Record<LudoEffectName, number>> = {
  ghost: LUDO_CHAOS.ghostTurns,
  chameleon: LUDO_CHAOS.chameleonTurns,
  faulty: LUDO_CHAOS.faultyTurns,
  blind: LUDO_CHAOS.blindTurns,
}

export interface LudoChaosFxProps {
  map: LudoMap
  cue: LudoCue
  // Colour of the player who triggered it, and name
  corner: number
  name: string
  // View turn
  turns: number
}

// Scene of each effect, played over the board
const SCENES: Record<LudoEffectName, (colour: LudoCornerName) => ReactNode> = {
  ghost: (colour) => (
    <>
      <span className={LUDO_FX.veil} />
      <span className={LUDO_FX.ring} />
      <span className={cn(LUDO_FX.ghostPawn, 'ludo-fx-ghost-a')}>
        <LudoPawn colour={colour} />
      </span>
      <span className={cn(LUDO_FX.ghostPawn, 'ludo-fx-ghost-b')}>
        <LudoPawn colour={colour} />
      </span>
      {WISPS.map((wisp) => (
        <span
          key={wisp}
          className={LUDO_FX.wisp}
          style={vars({ '--wx': noise(wisp, 1) * 2 - 1, '--wd': noise(wisp, 2) * 0.9 + 0.1 })}
        />
      ))}
    </>
  ),
  double: () => (
    <>
      <span className={cn(LUDO_FX.flyDie, 'ludo-fx-fly-left')}>
        <LudoFxDie value={4} />
      </span>
      <span className={cn(LUDO_FX.flyDie, 'ludo-fx-fly-right')}>
        <LudoFxDie value={2} />
      </span>
      <span className={LUDO_FX.clash} />
    </>
  ),
  boost: () => (
    <>
      {STREAKS.map((streak) => (
        <span
          key={streak}
          className={LUDO_FX.streak}
          style={vars({
            '--sy': streak / STREAKS.length,
            '--sw': 30 + noise(streak, 3) * 40,
            '--sd': noise(streak, 4) * 0.5,
          })}
        />
      ))}
      <span className={LUDO_FX.chevrons} />
    </>
  ),
  chameleon: () => (
    <>
      <span className={LUDO_FX.wash} />
      <span className={LUDO_FX.prism} />
    </>
  ),
  duel: () => (
    <>
      <span className={LUDO_FX.veil} />
      <span className={LUDO_FX.bolt}>
        <LudoChaosGlyph name="duel" />
      </span>
    </>
  ),
  faulty: () => (
    <>
      <span className={LUDO_FX.broken}>
        <LudoFxDie value={3} />
        <span className={cn(LUDO_FX.half, 'ludo-fx-half-a')}>
          <LudoFxDie value={3} />
        </span>
        <span className={cn(LUDO_FX.half, 'ludo-fx-half-b')}>
          <LudoFxDie value={3} />
        </span>
      </span>
      {SPARKS.map((spark) => (
        <span
          key={spark}
          className={LUDO_FX.spark}
          style={vars({
            '--angle': `${(spark * 360) / SPARKS.length}deg`,
            '--sd': noise(spark, 5) * 0.3,
          })}
        />
      ))}
      <span className={LUDO_FX.range}>
        {fillPlayMessage('1 – {max}', { max: LUDO_CHAOS.faultyMax })}
      </span>
    </>
  ),
  stall: () => (
    <>
      <span className={LUDO_FX.dim} />
      <span className={LUDO_FX.sleeper}>
        <LudoFxDie value={1} />
      </span>
      {PUFFS.map((puff) => (
        <span
          key={puff}
          className={LUDO_FX.smoke}
          style={vars({ '--px': (noise(puff, 6) - 0.5) * 3, '--pd': puff * 0.18 })}
        />
      ))}
      {ZEES.map((zee) => (
        <span
          key={zee}
          className={LUDO_FX.zzz}
          style={vars({ '--zd': zee * 0.35, '--zs': 1 + zee * 0.4 })}
        >
          z
        </span>
      ))}
    </>
  ),
  blind: () => (
    <>
      <span className={LUDO_FX.iris} />
      {ORBITS.map((orbit) => (
        <span key={orbit} className={LUDO_FX.orbit} style={vars({ '--start': `${orbit * 90}deg` })}>
          ?
        </span>
      ))}
    </>
  ),
}

/**
 * Scene of a joker blocking a malus: the shield breaks the malus glyph
 * @param {LudoEffectName} effect - Malus blocked
 * @return {JSX.Element}
 */

const JokerScene = ({ effect }: { effect: LudoEffectName }) => (
  <>
    <span className={LUDO_FX.shield} />
    <span className={LUDO_FX.shard}>
      <LudoChaosGlyph name={effect} />
    </span>
    {SHARDS.map((shard) => (
      <span
        key={shard}
        className={cn(LUDO_FX.spark, LUDO_FX.faded)}
        style={vars({ '--angle': `${(shard * 360) / SHARDS.length}deg`, '--sd': 0.35 })}
      />
    ))}
  </>
)

/**
 * Chaos effect played over the board: its own scene on the pawn's square or the middle, and a card telling what it does
 * @param {LudoChaosFxProps} props - Effect
 * @return {JSX.Element}
 */

export const LudoChaosFx = ({ map, cue, corner, name, turns }: LudoChaosFxProps) => {
  const [y, x] =
    cue.pawn !== null && cue.to !== null
      ? turnPoint(map, pawnPoint(map, corner, cue.to, cue.pawn), turns)
      : [map.size / 2, map.size / 2]
  const copy = LUDO_CHAOS_COPY[cue.effect]
  const isJoker = cue.kind === 'joker'
  const isEnd = cue.kind === 'end'
  const label = isJoker
    ? LUDO_CHAOS_UI.saved
    : isEnd
      ? LUDO_CHAOS_UI.expired
      : cue.kind === 'bonus'
        ? LUDO_CHAOS_UI.bonus
        : LUDO_CHAOS_UI.malus
  const text = fillPlayMessage(copy.text, {
    turns: EFFECT_TURNS[cue.effect] ?? 0,
    min: LUDO_CHAOS.boostMin,
    max: LUDO_CHAOS.faultyMax,
  })

  return (
    <div
      className={LUDO_FX.layer}
      data-kind={isJoker ? 'joker' : cue.kind}
      style={vars({
        '--x': x,
        '--y': y,
        '--cells': map.size,
        '--fx-ms': `${LUDO_CHAOS.effectMs}ms`,
        '--pawn-tone': `var(--play-ludo-${LUDO_CORNERS[corner]})`,
      })}
      aria-hidden="true"
    >
      {!isEnd && (
        <span className={LUDO_FX.spot}>
          {isJoker ? <JokerScene effect={cue.effect} /> : SCENES[cue.effect](LUDO_CORNERS[corner])}
        </span>
      )}
      <div
        className={cn(
          LUDO_FX.card,
          isJoker
            ? LUDO_FX.cardJoker
            : isEnd
              ? LUDO_FX.cardEnd
              : cue.kind === 'bonus'
                ? LUDO_FX.cardBonus
                : LUDO_FX.cardMalus
        )}
      >
        <span className={LUDO_FX.glyph}>
          <LudoChaosGlyph name={isJoker ? 'joker' : cue.effect} />
        </span>
        <span className={LUDO_FX.tag}>{`${label} · ${name}`}</span>
        <span className={LUDO_FX.name}>{copy.name}</span>
        {!isEnd && !isJoker && <span className={LUDO_FX.text}>{text}</span>}
      </div>
    </div>
  )
}
