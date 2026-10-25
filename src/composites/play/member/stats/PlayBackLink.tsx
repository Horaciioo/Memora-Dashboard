'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/elements/actions/Button'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_PLAYER } from '@/declarations/ui/variants'

/**
 * Back to the previous page, the Play hub when there is none
 * @return {JSX.Element}
 */

export const PlayBackLink = () => {
  const router = useRouter()
  const BackIcon = ICONS.back

  return (
    <Button
      variant="arcadeGhost"
      className={PLAY_PLAYER.back}
      onClick={() => (window.history.length > 1 ? router.back() : router.push(ROUTES.play))}
    >
      <BackIcon className={PLAY_PLAYER.backIcon} aria-hidden="true" />
      {PLAY_HUB_COPY.back}
    </Button>
  )
}
