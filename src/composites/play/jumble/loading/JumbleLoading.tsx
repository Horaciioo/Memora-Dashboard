'use client'

import { JumbleLoadScene } from '@/composites/play/jumble/loading/JumbleLoadScene'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { JUMBLE_LOADING_TIPS } from '@/declarations/play/jumble/loadingTips'

/**
 * Jumble loading: its scene and its tips on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const JumbleLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={JumbleLoadScene} tips={JUMBLE_LOADING_TIPS} />
)
