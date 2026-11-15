'use client'

import { GolfLoadScene } from '@/composites/play/golf/loading/GolfLoadScene'
import { PlayLoadingScreen } from '@/composites/play/loading/PlayLoadingScreen'
import type { PlayLoadingProps } from '@/composites/play/loading/PlayLoadingScreen'
import { GOLF_LOADING_TIPS } from '@/declarations/play/golf/loadingTips'

/**
 * Golf loading: its scene and its tips on the shared frame
 * @param {PlayLoadingProps} props - Placement and progress
 * @return {JSX.Element}
 */

export const GolfLoading = (props: PlayLoadingProps) => (
  <PlayLoadingScreen {...props} Scene={GolfLoadScene} tips={GOLF_LOADING_TIPS} />
)
