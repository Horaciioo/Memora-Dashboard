import AppLink from '@/components/elements/navigation/AppLink'
import { LIVE_HUB_COPY } from '@/declarations/lives/hub'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_HUB_STYLES } from '@/declarations/ui/variants'
import { accentVars } from '@/declarations/ui/theme'
import type { LiveView } from '@/types/lives'
import { LiveStatuses } from '@/utils/constants/lives'

export interface ModViewDockProps {
  creatorId: string
  // Stored colour of the creator
  accent: string | null
  // Banner blurred behind the button
  backdrop: string | null
  isOnAir: boolean
  lives: LiveView[]
}

/**
 * Glass button floating bottom right, Memora's slot on the Lives page
 * @param {ModViewDockProps} props - Creator shown and the open lives
 * @return {JSX.Element}
 */

export const ModViewDock = ({ creatorId, accent, backdrop, isOnAir, lives }: ModViewDockProps) => {
  const Icon = ICONS.modActions
  const own = lives.filter((live) => live.youtuber.id === creatorId)
  // The running live first, else one open to enter
  const target =
    own.find((live) => live.status === LiveStatuses.Live) ??
    own.find((live) => live.access === 'open')

  return (
    <AppLink
      href={target ? ROUTES.live(target.id) : ROUTES.modView}
      className={LIVE_HUB_STYLES.modDock}
      style={accent ? accentVars(accent) : undefined}
    >
      <span className={LIVE_HUB_STYLES.modBackdrop} aria-hidden="true">
        {backdrop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backdrop} alt="" className={LIVE_HUB_STYLES.modBackdropImage} />
        )}
        <span className={LIVE_HUB_STYLES.modWash} />
      </span>
      {isOnAir && (
        <span className={LIVE_HUB_STYLES.modRays} aria-hidden="true">
          <span className={LIVE_HUB_STYLES.modWave} />
        </span>
      )}
      <Icon className={LIVE_HUB_STYLES.modDockIcon} aria-hidden="true" />
      {LIVE_HUB_COPY.modView}
    </AppLink>
  )
}
