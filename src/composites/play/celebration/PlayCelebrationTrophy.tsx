import type { PlayCelebrationItem } from '@/core/store/play/playCelebration'
import { PLAY_CELEBRATION_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_CELEBRATION_UI, PLAY_SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

type Trophy = Extract<PlayCelebrationItem, { kind: 'trophy' }>

/**
 * Trophy unlocked: rays turn, the medal drops in and catches the light
 * @param {Trophy} props - Trophy
 * @return {JSX.Element}
 */

export const PlayCelebrationTrophy = ({ label, goal, icon, rarity }: Trophy) => {
  const Icon = ICONS[icon]

  return (
    <div className={cn(PLAY_CELEBRATION_UI.scene, PLAY_SHOWCASE[rarity])}>
      <div className={PLAY_CELEBRATION_UI.stage}>
        <i className={PLAY_CELEBRATION_UI.rays} />
        <span className={PLAY_CELEBRATION_UI.medal}>
          <Icon className={PLAY_CELEBRATION_UI.medalGlyph} aria-hidden="true" />
          <i className={PLAY_CELEBRATION_UI.shine} />
        </span>
      </div>
      <span className={PLAY_CELEBRATION_UI.kicker}>{PLAY_CELEBRATION_COPY.trophy}</span>
      <span className={PLAY_CELEBRATION_UI.name}>{label}</span>
      <span className={PLAY_CELEBRATION_UI.sub}>{goal}</span>
    </div>
  )
}
