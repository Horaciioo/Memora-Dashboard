import { LudoChaosFx } from '@/composites/play/ludo/LudoChaosFx'
import { LudoDuel } from '@/composites/play/ludo/LudoDuel'
import type { LudoMotion } from '@/composites/play/ludo/useLudoMotion'

export interface LudoChaosLayerProps {
  motion: LudoMotion
  players: { accountId: string; corner: number }[]
  names: Record<string, string>
  // View turn
  turns: number
}

/**
 * Chaos scenes over the board: the effect on screen and the duel of dice
 * @param {LudoChaosLayerProps} props - Layer
 * @return {JSX.Element}
 */

export const LudoChaosLayer = ({ motion, players, names, turns }: LudoChaosLayerProps) => {
  const { cue, duel } = motion
  const owner = players.find((player) => player.accountId === cue?.accountId)

  return (
    <>
      {cue && owner && (
        <LudoChaosFx
          key={`${cue.kind}:${cue.key}`}
          cue={cue}
          corner={owner.corner}
          name={names[cue.accountId] ?? ''}
          turns={turns}
        />
      )}
      {duel && <LudoDuel duel={duel} players={players} names={names} turns={turns} />}
    </>
  )
}
