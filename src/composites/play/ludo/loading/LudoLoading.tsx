'use client'

import { LudoLoadScene } from '@/composites/play/ludo/loading/LudoLoadScene'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { LUDO_LOADING_TIPS } from '@/declarations/play/ludo/loadingTips'

/**
 * Ludo loading: its scene and its tips on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const LudoLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={LudoLoadScene} tips={LUDO_LOADING_TIPS} />
)
